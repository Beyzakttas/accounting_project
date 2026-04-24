// invoiceController.js

import * as invoiceService from '../Services/invoiceService.js';
import { successResponse } from '../Utils/apiResponse.js';
import STATUS_CODES from '../Utils/statusCodes.js';

const invoiceController = {
  // 1. Fatura oluştur
  createInvoice: async (req, res, next) => {
    try {
      const { companyId, _id: userId } = req.user;
      const invoiceData = { ...req.body };

      // Eğer resim yüklendiyse yolunu ekle
      if (req.file) {
        invoiceData.imageUrl = `/uploads/invoices/${req.file.filename}`;
      }

      const invoice = await invoiceService.createInvoice(invoiceData, userId, companyId);
      return successResponse(res, invoice, 'Fatura başarıyla oluşturuldu.', STATUS_CODES.CREATED);
    } catch (error) {
      next(error);
    }
  },

  // 2. Faturaları listele (Yetkiye göre)
  getAllInvoices: async (req, res, next) => {
    try {
      const { companyId, _id: userId, role } = req.user;
      const filter = { companyId };

      // USER rolü sadece kendi yüklediklerini görsün
      if (role === 'USER') filter.uploadedBy = userId;

      const invoices = await invoiceService.getInvoices(filter);
      return successResponse(res, invoices);
    } catch (error) {
      next(error);
    }
  },

  // 3. Fatura güncelle
  updateInvoice: async (req, res, next) => {
    try {
      const { _id: userId, role } = req.user;
      const invoice = await invoiceService.updateInvoice(req.params.id, req.body, userId, role);
      return successResponse(res, invoice, 'Fatura başarıyla güncellendi.');
    } catch (error) {
      next(error);
    }
  },

  // 4. Fatura sil
  deleteInvoice: async (req, res, next) => {
    try {
      const { _id: userId, role } = req.user;
      await invoiceService.deleteInvoice(req.params.id, userId, role);
      return successResponse(res, null, 'Fatura başarıyla silindi.');
    } catch (error) {
      next(error);
    }
  },

  // 5. İstatistikleri getir
  getInvoiceStats: async (req, res, next) => {
    try {
      const { companyId } = req.user;
      const stats = await invoiceService.getInvoiceStats(companyId);
      return successResponse(res, stats, 'İstatistikler başarıyla getirildi.');
    } catch (error) {
      next(error);
    }
  }
};

export default invoiceController;