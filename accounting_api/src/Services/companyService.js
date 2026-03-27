import Company from '../Models/Company.js';
import MESSAGES from '../Utils/messages.js';
import STATUS_CODES from '../Utils/statusCodes.js';

/**
 * Tüm şirketleri getirir (Sadece Admin yetkisi için)
 */
export const getAllCompanies = async () => {
  return await Company.find();
};

/**
 * ID'ye göre şirket bulur
 */
export const getCompanyById = async (companyId) => {
  if (!companyId) {
    const error = new Error('Şirket ID bilgisi eksik.');
    error.statusCode = STATUS_CODES.BAD_REQUEST;
    throw error;
  }

  const company = await Company.findById(companyId);
  if (!company) {
    const error = new Error(MESSAGES.CONTROLLERS.OWNER.COMPANY_NOT_FOUND);
    error.statusCode = STATUS_CODES.NOT_FOUND;
    throw error;
  }

  return company;
};
