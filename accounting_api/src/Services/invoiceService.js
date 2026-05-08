import mongoose from 'mongoose';
import Invoice from '../Models/Invoice.js';
import STATUS_CODES from '../Utils/statusCodes.js';

/**
 * Yeni fatura oluşturur
 */
export const createInvoice = async (invoiceData, userId, companyId) => {
  const { invoiceNumber, amount, date, vendor } = invoiceData;

  // Fatura no boş ise otomatik benzersiz numara üret
  let finalInvoiceNumber = invoiceNumber;
  if (!finalInvoiceNumber || !finalInvoiceNumber.trim()) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const random = Math.floor(1000 + Math.random() * 9000);
    finalInvoiceNumber = `FT-${yyyy}${mm}${dd}-${random}`;
  } else {
    finalInvoiceNumber = finalInvoiceNumber.trim();
  }

  // 1. Fatura Numarası ile Kontrol (Benzersiz olmalıdır)
  const existingByNo = await Invoice.findOne({
    companyId: companyId,
    invoiceNumber: { $regex: new RegExp(`^${finalInvoiceNumber}$`, 'i') }
  });

  if (existingByNo) {
    const error = new Error('Bu fatura numarası daha önce sisteme kaydedilmiş. Lütfen farklı bir numara girin.');
    error.statusCode = STATUS_CODES.BAD_REQUEST;
    error.data = { existingId: existingByNo._id, type: 'DUPLICATE_NUMBER' };
    throw error;
  }

  // 2. Metadata ile Kontrol (Tutar + Tarih + Satıcı) - Numara yoksa veya farklıysa bile yakalar
  if (amount && date && vendor) {
    // Gelen tarihin sadece gününü kullanalım (saat farkını elemek için)
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const existingByMeta = await Invoice.findOne({
      companyId: companyId,
      amount: amount,
      vendor: { $regex: new RegExp(`^${vendor.trim()}$`, 'i') },
      date: { $gte: startDate, $lte: endDate }
    });

    if (existingByMeta) {
      const error = new Error(`Bu satıcıdan (${vendor}) bu tarihte (${new Date(date).toLocaleDateString()}) bu tutarda bir fatura zaten mevcut.`);
      error.statusCode = STATUS_CODES.BAD_REQUEST;
      error.data = { existingId: existingByMeta._id, type: 'DUPLICATE_METADATA' };
      throw error;
    }
  }

  const newInvoice = new Invoice({
    ...invoiceData,
    type: 'EXPENSE',
    invoiceNumber: finalInvoiceNumber,
    uploadedBy: userId,
    companyId: companyId
  });

  return await newInvoice.save();
};

/**
 * Tüm faturaları getirir (Filtreye göre)
 */
export const getInvoices = async (filter) => {
  return await Invoice.find(filter)
    .populate('uploadedBy', 'fullname email role department')
    .sort({ createdAt: -1 });
};

/**
 * Fatura güncelleme
 */
export const updateInvoice = async (invoiceId, updateData, userId, role, department) => {
  // MANAGER ve ADMIN her zaman güncelleyebilir, USER kendi yüklediklerini veya kendi departmanına atanan faturaları
  const query = { _id: invoiceId };
  if (role === 'USER') {
    query.$or = [
      { uploadedBy: userId },
      { department: department || 'Diger' }
    ];
  }

  const invoice = await Invoice.findOne(query);
  if (!invoice) {
    const error = new Error('İşlem yapmak istediğiniz fatura bulunamadı veya bu işlem için yetkiniz yetersiz.');
    error.statusCode = STATUS_CODES.NOT_FOUND;
    throw error;
  }

  return await Invoice.findByIdAndUpdate(invoiceId, updateData, { new: true, runValidators: true });
};

/**
 * Fatura silme
 */
export const deleteInvoice = async (invoiceId, userId, role) => {
  const query = { _id: invoiceId };
  if (role === 'USER') {
    query.uploadedBy = userId;
  }

  const invoice = await Invoice.findOne(query);
  if (!invoice) {
    const error = new Error('Silmek istediğiniz fatura bulunamadı veya bu işlem için yetkiniz yetersiz.');
    error.statusCode = STATUS_CODES.NOT_FOUND;
    throw error;
  }

  return await Invoice.findByIdAndDelete(invoiceId);
};

/**
 * İstatistikleri getirir (Gelişmiş Raporlar İçin)
 */
export const getInvoiceStats = async (companyIdStr, userIdStr = null, role = null, department = null) => {
  const companyId = new mongoose.Types.ObjectId(companyIdStr);

  const matchFilter = { companyId: companyId };

  if (role === 'USER' && userIdStr) {
    const userId = new mongoose.Types.ObjectId(userIdStr);
    matchFilter.$or = [
      { uploadedBy: userId },
      { assignedTo: userId },
      { department: department || 'Diger' }
    ];
  }

  const results = await Invoice.aggregate([
    { $match: matchFilter },
    {
      $facet: {
        // 1. Genel Özet
        summary: [
          {
            $group: {
              _id: null,
              pendingCount: { $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] } },
              pendingAmount: { $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, { $convert: { input: '$amount', to: 'double', onError: 0, onNull: 0 } }, 0] } },
              paidCount: { $sum: { $cond: [{ $eq: ['$status', 'Processed'] }, 1, 0] } },
              paidAmount: { $sum: { $cond: [{ $eq: ['$status', 'Processed'] }, { $convert: { input: '$amount', to: 'double', onError: 0, onNull: 0 } }, 0] } }
            }
          }
        ],
        // 2. Günlük Veriler (Zaman Serisi)
        dailyData: [
          {
            $group: {
              _id: {
                year: { $year: { $toDate: '$date' } },
                month: { $month: { $toDate: '$date' } },
                day: { $dayOfMonth: { $toDate: '$date' } }
              },
              pending: { $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, { $convert: { input: '$amount', to: 'double', onError: 0, onNull: 0 } }, 0] } },
              paid: { $sum: { $cond: [{ $eq: ['$status', 'Processed'] }, { $convert: { input: '$amount', to: 'double', onError: 0, onNull: 0 } }, 0] } }
            }
          },
          { $sort: { '_id.year': -1, '_id.month': -1, '_id.day': -1 } },
          { $limit: 60 }
        ],
        // 3. Kategori Dağılımı
        categoryData: [
          {
            $addFields: {
              categoryObjId: {
                $convert: {
                  input: '$category',
                  to: 'objectId',
                  onError: null,
                  onNull: null
                }
              }
            }
          },
          {
            $group: {
              _id: { categoryId: '$categoryObjId', status: '$status' },
              total: { $sum: { $convert: { input: '$amount', to: 'double', onError: 0, onNull: 0 } } }
            }
          },
          {
            $lookup: {
              from: 'categories',
              localField: '_id.categoryId',
              foreignField: '_id',
              as: 'categoryInfo'
            }
          },
          {
            $project: {
              name: { $ifNull: [{ $arrayElemAt: ['$categoryInfo.name', 0] }, 'Kategorisiz'] },
              type: { $cond: [{ $eq: ['$_id.status', 'Processed'] }, 'INCOME', 'EXPENSE'] },
              status: '$_id.status',
              value: '$total'
            }
          }
        ],
        // 4. Aylık Veriler (Yıllık Analiz İçin)
        monthlyData: [
          {
            $group: {
              _id: {
                year: { $year: { $toDate: '$date' } },
                month: { $month: { $toDate: '$date' } }
              },
              pending: { $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, { $convert: { input: '$amount', to: 'double', onError: 0, onNull: 0 } }, 0] } },
              paid: { $sum: { $cond: [{ $eq: ['$status', 'Processed'] }, { $convert: { input: '$amount', to: 'double', onError: 0, onNull: 0 } }, 0] } }
            }
          },
          { $sort: { '_id.year': -1, '_id.month': -1 } },
          { $limit: 12 }
        ]
      }
    }
  ]);

  const facet = results[0];
  const summary = facet.summary[0] || { pendingCount: 0, pendingAmount: 0, paidCount: 0, paidAmount: 0 };

  // Geriye dönük uyumluluk alanları
  const totalIncome = summary.paidAmount || 0; // Ödenenler
  const totalExpense = summary.pendingAmount || 0; // Bekleyenler

  const formattedDailyData = facet.dailyData
    .map(item => ({
      dateStr: `${String(item._id.day).padStart(2, '0')}/${String(item._id.month).padStart(2, '0')}`,
      income: item.paid,
      expense: item.pending,
      paid: item.paid,
      pending: item.pending,
      date: new Date(item._id.year, item._id.month - 1, item._id.day),
      sortKey: item._id.year * 10000 + item._id.month * 100 + item._id.day
    }))
    .sort((a, b) => a.sortKey - b.sortKey);

  const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
  const formattedMonthlyData = facet.monthlyData
    .map(item => ({
      monthStr: months[item._id.month - 1],
      income: item.paid,
      expense: item.pending,
      paid: item.paid,
      pending: item.pending,
      year: item._id.year,
      month: item._id.month,
      sortKey: item._id.year * 100 + item._id.month
    }))
    .sort((a, b) => a.sortKey - b.sortKey);

  return {
    ...summary,
    totalIncome,
    totalExpense,
    pendingCount: summary.pendingCount,
    dailyData: formattedDailyData,
    monthlyData: formattedMonthlyData,
    categoryData: facet.categoryData
  };
};

/**
 * Faturayı ödenmiş (Processed) olarak işaretler
 */
export const payInvoice = async (invoiceId, userId, role, department) => {
  const query = { _id: invoiceId };
  if (role === 'USER') {
    query.$or = [
      { uploadedBy: userId },
      { assignedTo: userId },
      { department: department || 'Diger' }
    ];
  }

  const invoice = await Invoice.findOne(query);
  if (!invoice) {
    const error = new Error('İşlem yapmak istediğiniz fatura bulunamadı veya bu işlem için yetkiniz yetersiz.');
    error.statusCode = STATUS_CODES.NOT_FOUND;
    throw error;
  }

  invoice.status = 'Processed';
  return await invoice.save();
};
