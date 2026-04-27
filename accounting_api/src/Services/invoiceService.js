import mongoose from 'mongoose';
import Invoice from '../Models/Invoice.js';
import STATUS_CODES from '../Utils/statusCodes.js';

/**
 * Yeni fatura oluşturur
 */
export const createInvoice = async (invoiceData, userId, companyId) => {
  const { invoiceNumber, amount, date, vendor } = invoiceData;

  // 1. Fatura Numarası ile Kontrol (Eğer numara varsa)
  if (invoiceNumber && invoiceNumber.trim()) {
    const trimmedNumber = invoiceNumber.trim();
    const existingByNo = await Invoice.findOne({
      companyId: companyId,
      invoiceNumber: { $regex: new RegExp(`^${trimmedNumber}$`, 'i') }
    });

    if (existingByNo) {
      const error = new Error('Bu fatura numarası daha önce sisteme kaydedilmiş. Lütfen farklı bir numara girin.');
      error.statusCode = STATUS_CODES.BAD_REQUEST;
      error.data = { existingId: existingByNo._id, type: 'DUPLICATE_NUMBER' };
      throw error;
    }
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
    .populate('uploadedBy', 'fullname email')
    .sort({ createdAt: -1 });
};

/**
 * Fatura güncelleme
 */
export const updateInvoice = async (invoiceId, updateData, userId, role) => {
  // MANAGER ve ADMIN her zaman güncelleyebilir, USER sadece kendi faturasını
  const query = { _id: invoiceId };
  if (role === 'USER') {
    query.uploadedBy = userId;
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
export const getInvoiceStats = async (companyIdStr) => {
  const companyId = new mongoose.Types.ObjectId(companyIdStr);

  const results = await Invoice.aggregate([
    { $match: { companyId: companyId } },
    {
      $facet: {
        // 1. Genel Özet
        summary: [
          {
            $group: {
              _id: null,
              totalIncome: { $sum: { $cond: [{ $eq: ['$type', 'INCOME'] }, { $convert: { input: '$amount', to: 'double', onError: 0, onNull: 0 } }, 0] } },
              totalExpense: { $sum: { $cond: [{ $eq: ['$type', 'EXPENSE'] }, { $convert: { input: '$amount', to: 'double', onError: 0, onNull: 0 } }, 0] } },
              pendingCount: { $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] } }
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
              income: { $sum: { $cond: [{ $eq: ['$type', 'INCOME'] }, { $convert: { input: '$amount', to: 'double', onError: 0, onNull: 0 } }, 0] } },
              expense: { $sum: { $cond: [{ $eq: ['$type', 'EXPENSE'] }, { $convert: { input: '$amount', to: 'double', onError: 0, onNull: 0 } }, 0] } }
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
              _id: { categoryId: '$categoryObjId', type: '$type' },
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
              type: '$_id.type',
              value: '$total'
            }
          }
        ]
      }
    }
  ]);

  const facet = results[0];
  const summary = facet.summary[0] || { totalIncome: 0, totalExpense: 0, pendingCount: 0 };

  const formattedDailyData = facet.dailyData
    .map(item => ({
      dateStr: `${String(item._id.day).padStart(2, '0')}/${String(item._id.month).padStart(2, '0')}`,
      income: item.income,
      expense: item.expense,
      date: new Date(item._id.year, item._id.month - 1, item._id.day),
      sortKey: item._id.year * 10000 + item._id.month * 100 + item._id.day
    }))
    .sort((a, b) => a.sortKey - b.sortKey);

  return {
    ...summary,
    dailyData: formattedDailyData,
    categoryData: facet.categoryData
  };
};
