// companyController.js

import Company from '../Models/Company.js';
import MESSAGES from '../Utils/messages.js';

const companyController = {
  // Şirket listesini sadece Admin yetkisine ayarlamıştık (Router'da `roleMiddleware(['ADMIN'])` var)
  getCompanies: async (req, res) => {
    try {
      const companies = await Company.find();
      res.status(200).json({ success: true, data: companies });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Şirketler getirilirken hata oluştu.', error: error.message });
    }
  },

  // Sadece ilgili yöneticinin kendi şirketini görmesi istenebilir (Auth Token içerisinden user.companyId okunur)
  getMyCompany: async (req, res) => {
    try {
      const companyId = req.user.companyId;
      if (!companyId) {
        return res.status(403).json({ success: false, message: 'Herhangi bir şirkete bağlı değilsiniz.' });
      }

      const company = await Company.findById(companyId);
      if (!company) {
        return res.status(404).json({ success: false, message: MESSAGES.CONTROLLERS.OWNER.COMPANY_NOT_FOUND });
      }

      res.status(200).json({ success: true, data: company });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Şirket verisi getirilirken hata oluştu.', error: error.message });
    }
  }
};

export default companyController;