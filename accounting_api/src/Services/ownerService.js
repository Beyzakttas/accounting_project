// ownerService.js

import User from '../Models/User.js';
import Company from '../Models/Company.js';
import Category from '../Models/Category.js';
import MESSAGES from '../Utils/messages.js';
import STATUS_CODES from '../Utils/statusCodes.js';

/**
 * Yeni personel hesabı oluşturur
 */
export const createStaff = async (staffData) => {
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
    department: department || 'Diğer',
    isActive: true
  });

  await newStaff.save();
  return { id: newStaff._id, fullname: newStaff.fullname, email: newStaff.email };
};

/**
 * Şirketteki tüm personelleri listeler
 */
export const getCompanyStaff = async () => {
  return await User.find({ role: 'USER' }).select('-password');
};

/**
 * Personel bilgilerini günceller
 */
export const updateStaff = async (staffId, updateData) => {
  const { fullname, department, isActive } = updateData;

  const staff = await User.findById(staffId);
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
export const deleteStaff = async (staffId) => {
  const result = await User.deleteOne({ _id: staffId });
  if (result.deletedCount === 0) {
    const error = new Error('Personel kaydı bulunamadı veya işlem sırasında bir sorun oluştu.');
    error.statusCode = STATUS_CODES.NOT_FOUND;
    throw error;
  }
  return true;
};

/**
 * Şirket ayarlarını günceller
 */
export const updateCompanySettings = async (settings) => {
  let company = await Company.findOne();
  if (!company) {
    // Hiç şirket yoksa varsayılan bir tane oluştur
    company = await Company.create({
      name: 'Varsayılan Şirket',
      taxNumber: '0000000000',
      address: 'Sistem tarafından otomatik oluşturuldu',
      phone: '000-000-0000',
      email: 'default@company.com'
    });
  }

  company.settings = { ...company.settings, ...settings };
  await company.save();
  return company.settings;
};

/**
 * Yeni kategori oluşturur
 */
export const createCategory = async (categoryData) => {
  const { name } = categoryData;
  const existingCategory = await Category.findOne({ name });
  if (existingCategory) {
    const error = new Error(MESSAGES.CONTROLLERS.OWNER.CATEGORY_EXISTS);
    error.statusCode = STATUS_CODES.BAD_REQUEST;
    throw error;
  }

  const newCategory = new Category({ name });
  return await newCategory.save();
};

/**
 * Şirkete ait tüm faturaları listeler
 */
export const getCompanyInvoices = async (userId, role) => {
  const filter = {};
  // USER rolü sadece kendi yüklediklerini görsün
  if (role === 'USER') filter.uploadedBy = userId;

  return await User.model('Invoice').find(filter)
    .populate('uploadedBy', 'fullname email')
    .sort({ createdAt: -1 });
};

/**
 * Şirkete ait kategorileri listeler
 */
export const getCategories = async () => {
  return await Category.find();
};
