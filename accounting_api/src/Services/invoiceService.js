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
