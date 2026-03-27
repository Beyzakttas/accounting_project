// companyController.js

import * as companyService from '../Services/companyService.js';
import { successResponse } from '../Utils/apiResponse.js';

const companyController = {
  // Şirket listesini getir (Sadece Admin)
  getCompanies: async (req, res, next) => {
    try {
      const companies = await companyService.getAllCompanies();
      return successResponse(res, companies, 'Şirketler başarıyla getirildi.');
    } catch (error) {
      next(error);
    }
  },

  // Giriş yapmış kullanıcının kendi şirketini getir
  getMyCompany: async (req, res, next) => {
    try {
      const companyId = req.user.companyId;
      const company = await companyService.getCompanyById(companyId);
      return successResponse(res, company);
    } catch (error) {
      next(error);
    }
  }
};

export default companyController;