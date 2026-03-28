// ownerController.js

import * as ownerService from '../Services/ownerService.js';
import { successResponse } from '../Utils/apiResponse.js';
import STATUS_CODES from '../Utils/statusCodes.js';
import MESSAGES from '../Utils/messages.js';

const ownerController = {
  // 1. Personel hesabı oluştur
  createStaff: async (req, res, next) => {
    try {
      const ownerCompanyId = req.user.companyId;
      const staff = await ownerService.createStaff(req.body, ownerCompanyId);
      return successResponse(res, staff, MESSAGES.CONTROLLERS.OWNER.STAFF_CREATED, STATUS_CODES.CREATED);
    } catch (error) {
      next(error);
    }
  },

  // 2. Şirketteki personelleri listele
  getCompanyStaff: async (req, res, next) => {
    try {
      const ownerCompanyId = req.user.companyId;
      const staffList = await ownerService.getCompanyStaff(ownerCompanyId);
      return successResponse(res, staffList);
    } catch (error) {
      next(error);
    }
  },

  // 3. Personel güncelle
  updateStaff: async (req, res, next) => {
    try {
      const ownerCompanyId = req.user.companyId;
      const { id } = req.params;
      const staff = await ownerService.updateStaff(id, req.body, ownerCompanyId);
      return successResponse(res, staff, 'Personel bilgileri güncellendi.');
    } catch (error) {
      next(error);
    }
  },

  // 4. Personel sil
  deleteStaff: async (req, res, next) => {
    try {
      const ownerCompanyId = req.user.companyId;
      const { id } = req.params;
      await ownerService.deleteStaff(id, ownerCompanyId);
      return successResponse(res, null, 'Personel başarıyla silindi.');
    } catch (error) {
      next(error);
    }
  },

  // 3. Şirket ayarlarını güncelle
  updateSettings: async (req, res, next) => {
    try {
      const ownerCompanyId = req.user.companyId;
      const { settings } = req.body;
      const updatedSettings = await ownerService.updateCompanySettings(ownerCompanyId, settings);
      return successResponse(res, updatedSettings, MESSAGES.CONTROLLERS.OWNER.SETTINGS_UPDATED);
    } catch (error) {
      next(error);
    }
  },

  // ... (getCompanyInvoices, createCategory, getCategories will be refactored similarly if needed, but focused on Staff for now)
  // 4. Şirkete ait tüm faturaları listele
  getCompanyInvoices: async (req, res, next) => {
    // Bu kısım için invoiceService de kullanılabilir ama şimdilik burada kalsın veya hızlıca refaktör edelim
    try {
      const { default: Invoice } = await import('../Models/Invoice.js');
      const ownerCompanyId = req.user.companyId;
      const filter = { companyId: ownerCompanyId };
      if (req.user.role === 'USER') filter.uploadedBy = req.user._id;

      const invoices = await Invoice.find(filter).populate('uploadedBy', 'fullname email').sort({ createdAt: -1 });
      return successResponse(res, invoices);
    } catch (error) {
      next(error);
    }
  },

  // 5. Yeni kategori oluştur
  createCategory: async (req, res, next) => {
    try {
      const { companyId } = req.user;
      const category = await ownerService.createCategory(req.body, companyId);
      return successResponse(res, category, MESSAGES.CONTROLLERS.OWNER.CATEGORY_CREATED, STATUS_CODES.CREATED);
    } catch (error) {
      next(error);
    }
  },

  // 6. Kategorileri listele
  getCategories: async (req, res, next) => {
    try {
      const { companyId } = req.user;
      const categories = await ownerService.getCategories(companyId);
      return successResponse(res, categories);
    } catch (error) {
      next(error);
    }
  }
};

export default ownerController;
