// ownerController.js

import * as ownerService from '../Services/ownerService.js';
import { successResponse } from '../Utils/apiResponse.js';
import STATUS_CODES from '../Utils/statusCodes.js';
import MESSAGES from '../Utils/messages.js';

const ownerController = {
  // 1. Personel hesabı oluştur
  createStaff: async (req, res, next) => {
    try {
      const staff = await ownerService.createStaff(req.body);
      return successResponse(res, staff, MESSAGES.CONTROLLERS.OWNER.STAFF_CREATED, STATUS_CODES.CREATED);
    } catch (error) {
      next(error);
    }
  },

  // 2. Şirketteki personelleri listele
  getCompanyStaff: async (req, res, next) => {
    try {
      const staffList = await ownerService.getCompanyStaff();
      return successResponse(res, staffList);
    } catch (error) {
      next(error);
    }
  },

  // 3. Personel güncelle
  updateStaff: async (req, res, next) => {
    try {
      const { id } = req.params;
      const staff = await ownerService.updateStaff(id, req.body);
      return successResponse(res, staff, 'Personel bilgileri güncellendi.');
    } catch (error) {
      next(error);
    }
  },

  // 4. Personel sil
  deleteStaff: async (req, res, next) => {
    try {
      const { id } = req.params;
      await ownerService.deleteStaff(id);
      return successResponse(res, null, 'Personel başarıyla silindi.');
    } catch (error) {
      next(error);
    }
  },

  // 3. Şirket ayarlarını güncelle
  updateSettings: async (req, res, next) => {
    try {
      const { settings } = req.body;
      const updatedSettings = await ownerService.updateCompanySettings(settings);
      return successResponse(res, updatedSettings, MESSAGES.CONTROLLERS.OWNER.SETTINGS_UPDATED);
    } catch (error) {
      next(error);
    }
  },

  // 4. Şirkete ait tüm faturaları listele
  getCompanyInvoices: async (req, res, next) => {
    try {
      const { _id: userId, role } = req.user;
      const invoices = await ownerService.getCompanyInvoices(userId, role);
      return successResponse(res, invoices);
    } catch (error) {
      next(error);
    }
  },

  // 5. Yeni kategori oluştur
  createCategory: async (req, res, next) => {
    try {
      const category = await ownerService.createCategory(req.body);
      return successResponse(res, category, MESSAGES.CONTROLLERS.OWNER.CATEGORY_CREATED, STATUS_CODES.CREATED);
    } catch (error) {
      next(error);
    }
  },

  // 6. Kategorileri listele
  getCategories: async (req, res, next) => {
    try {
      const categories = await ownerService.getCategories();
      return successResponse(res, categories);
    } catch (error) {
      next(error);
    }
  }
};

export default ownerController;
