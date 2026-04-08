// invoiceService.js

import Invoice from '../Models/Invoice.js';
import STATUS_CODES from '../Utils/statusCodes.js';

/**
 * Yeni fatura oluşturur
 */
export const createInvoice = async (invoiceData, userId, companyId) => {
  const newInvoice = new Invoice({
    ...invoiceData,
    uploadedBy: userId,
    companyId: companyId
  });

  return await newInvoice.save();
};

/**
 * Şirket veya kullanıcı bazlı faturaları listeler
 */
export const getInvoices = async (filter) => {
  return await Invoice.find(filter)
    .populate('uploadedBy', 'fullname email')
    .sort({ createdAt: -1 })
    .lean(); // Faster read-only query
};

/**
 * Faturayı siler
 */
export const deleteInvoice = async (invoiceId, userId, role) => {
  const invoice = await Invoice.findById(invoiceId);
  if (!invoice) {
    const error = new Error('Fatura bulunamadı.');
    error.statusCode = STATUS_CODES.NOT_FOUND;
    throw error;
  }

  // Yetki kontrolü: Sadece yükleyen veya MANAGER silebilir
  if (role !== 'MANAGER' && invoice.uploadedBy.toString() !== userId.toString()) {
    const error = new Error('Bu faturayı silme yetkiniz yok.');
    error.statusCode = STATUS_CODES.FORBIDDEN;
    throw error;
  }

  await invoice.remove();
  return true;
};

/**
 * Faturayı günceller
 */
export const updateInvoice = async (invoiceId, updateData, userId, role) => {
  const invoice = await Invoice.findById(invoiceId);
  if (!invoice) {
    const error = new Error('Fatura bulunamadı.');
    error.statusCode = STATUS_CODES.NOT_FOUND;
    throw error;
  }

  // Yetki kontrolü: Sadece yükleyen veya MANAGER güncelleyebilir
  if (role !== 'MANAGER' && invoice.uploadedBy.toString() !== userId.toString()) {
    const error = new Error('Bu faturayı güncelleme yetkiniz yok.');
    error.statusCode = STATUS_CODES.FORBIDDEN;
    throw error;
  }

  return await Invoice.findByIdAndUpdate(invoiceId, updateData, { new: true, runValidators: true });
};

export const getInvoiceStats = async (companyId) => {
  const stats = await Invoice.aggregate([
    { $match: { companyId: companyId } },
    {
      $group: {
        _id: null,
        totalIncome: {
          $sum: { $cond: [{ $eq: ['$type', 'INCOME'] }, '$amount', 0] }
        },
        totalExpense: {
          $sum: { $cond: [{ $eq: ['$type', 'EXPENSE'] }, '$amount', 0] }
        },
        pendingCount: {
          $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] }
        }
      }
    }
  ]);

  const dailyStats = await Invoice.aggregate([
    { $match: { companyId: companyId, date: { $type: 'date' } } },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' },
          day: { $dayOfMonth: '$date' }
        },
        income: {
          $sum: { $cond: [{ $eq: ['$type', 'INCOME'] }, '$amount', 0] }
        },
        expense: {
          $sum: { $cond: [{ $eq: ['$type', 'EXPENSE'] }, '$amount', 0] }
        }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    { $limit: 30 } // Son 30 faturalı gün
  ]);

  const formattedDailyData = dailyStats.map(item => ({
    dateStr: `${String(item._id.day).padStart(2, '0')}/${String(item._id.month).padStart(2, '0')}`,
    income: item.income,
    expense: item.expense
  }));

  const result = stats[0] || { totalIncome: 0, totalExpense: 0, pendingCount: 0 };
  result.dailyData = formattedDailyData;
  return result;
};
