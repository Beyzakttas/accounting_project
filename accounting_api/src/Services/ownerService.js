// ownerService.js

import User from '../Models/User.js';
import Company from '../Models/Company.js';
import Category from '../Models/Category.js';
import MESSAGES from '../Utils/messages.js';
import STATUS_CODES from '../Utils/statusCodes.js';

/**
 * Yeni personel hesabı oluşturur
 */
export const createStaff = async (staffData, ownerCompanyId) => {
  const { fullname, email, password, department } = staffData;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error(MESSAGES.CONTROLLERS.OWNER.EMAIL_EXISTS);
    error.statusCode = STATUS_CODES.BAD_REQUEST;
    throw error;
  }

  const newStaff = new User({
    fullname,
    email,
    password,
    role: 'USER',
    companyId: ownerCompanyId,
    department: department || 'Diğer',
    isActive: true
  });

  await newStaff.save();
  return { id: newStaff._id, fullname: newStaff.fullname, email: newStaff.email };
};

/**
 * Şirketteki tüm personelleri listeler
 */
export const getCompanyStaff = async (companyId) => {
  return await User.find({ companyId, role: 'USER' }).select('-password');
};

/**
 * Personel bilgilerini günceller
 */
export const updateStaff = async (staffId, updateData, ownerCompanyId) => {
  const { fullname, department, isActive } = updateData;

  const staff = await User.findOne({ _id: staffId, companyId: ownerCompanyId });
  if (!staff) {
    const error = new Error('Personel bulunamadı');
    error.statusCode = STATUS_CODES.NOT_FOUND;
    throw error;
  }

  if (fullname) staff.fullname = fullname;
  if (department) staff.department = department;
  if (typeof isActive !== 'undefined') staff.isActive = isActive;

  await staff.save();
  return staff;
};

/**
 * Personel hesabını siler
 */
export const deleteStaff = async (staffId, ownerCompanyId) => {
  const result = await User.deleteOne({ _id: staffId, companyId: ownerCompanyId });
  if (result.deletedCount === 0) {
    const error = new Error('Personel bulunamadı veya silinemedi');
    error.statusCode = STATUS_CODES.NOT_FOUND;
    throw error;
  }
  return true;
};

/**
 * Şirket ayarlarını günceller
 */
export const updateCompanySettings = async (companyId, settings) => {
  const company = await Company.findById(companyId);
  if (!company) {
    const error = new Error(MESSAGES.CONTROLLERS.OWNER.COMPANY_NOT_FOUND);
    error.statusCode = STATUS_CODES.NOT_FOUND;
    throw error;
  }

  company.settings = { ...company.settings, ...settings };
  await company.save();
  return company.settings;
};

/**
 * Yeni kategori oluşturur
 */
export const createCategory = async (categoryData, companyId) => {
  const { name } = categoryData;
  const existingCategory = await Category.findOne({ name, companyId });
  if (existingCategory) {
    const error = new Error(MESSAGES.CONTROLLERS.OWNER.CATEGORY_EXISTS);
    error.statusCode = STATUS_CODES.BAD_REQUEST;
    throw error;
  }

  const newCategory = new Category({ name, companyId });
  return await newCategory.save();
};

/**
 * Şirkete ait tüm faturaları listeler
 */
export const getCompanyInvoices = async (companyId, userId, role) => {
  const filter = { companyId };
  // USER rolü sadece kendi yüklediklerini görsün
  if (role === 'USER') filter.uploadedBy = userId;

  return await User.model('Invoice').find(filter)
    .populate('uploadedBy', 'fullname email')
    .sort({ createdAt: -1 });
};

/**
 * Şirkete ait kategorileri listeler
 */
export const getCategories = async (companyId) => {
  return await Category.find({ companyId });
};
