import crypto from 'crypto';
import User from '../Models/User.js';
import MESSAGES from '../Utils/messages.js';
import TokenService from './tokenService.js';
import emailService from './emailService.js';
import STATUS_CODES from '../Utils/statusCodes.js';

/**
 * Kullanıcı girişi yapar ve tokenları döner
 */
export const login = async (email, password) => {
  console.log(`Giriş denemesi: ${email}`);
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    console.log(`Hata: Kullanıcı bulunamadı (${email})`);
    const error = new Error(MESSAGES.CONTROLLERS.AUTH.USER_NOT_FOUND);
    error.statusCode = STATUS_CODES.NOT_FOUND;
    throw error;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    console.log(`Hata: Geçersiz şifre (${email})`);
    const error = new Error(MESSAGES.CONTROLLERS.AUTH.INVALID_CREDENTIALS);
    error.statusCode = STATUS_CODES.UNAUTHORIZED;
    throw error;
  }

  if (user.isActive === false) {
    console.log(`Hata: Hesap askıda (${email})`);
    const error = new Error(MESSAGES.AUTH.ACCOUNT_SUSPENDED);
    error.statusCode = STATUS_CODES.FORBIDDEN;
    throw error;
  }

  const token = TokenService.generateToken({ id: user._id });
  const refreshToken = TokenService.generateRefreshToken({ id: user._id });

  user.refreshToken = refreshToken;
  await user.save();

  user.password = undefined;
  return { user, token, refreshToken };
};

/**
 * Yeni kullanıcı kaydı oluşturur
 */
export const register = async (userData) => {
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    const error = new Error(MESSAGES.OWNER.EMAIL_EXISTS);
    error.statusCode = STATUS_CODES.BAD_REQUEST;
    throw error;
  }

  // Şirket otomasyonu: Eğer companyId yoksa ilk şirketi ata veya varsayılan oluştur
  if (!userData.companyId) {
    const Company = (await import('../Models/Company.js')).default;
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
    userData.companyId = company._id;
    userData.role = userData.role || 'MANAGER'; // İlk kayıt olanı genelde yönetici yaparız
  }

  const newUser = await User.create(userData);
  
  const token = TokenService.generateToken({ id: newUser._id });
  const refreshToken = TokenService.generateRefreshToken({ id: newUser._id });

  newUser.refreshToken = refreshToken;
  await newUser.save();

  newUser.password = undefined;
  return { user: newUser, token, refreshToken };
};


/**
 * Yeni şirket ve o şirkete ait yönetici hesabı oluşturur (SaaS Kayıt)
 */
export const registerWithCompany = async (registrationData) => {
  const { 
    fullname, email, password, // User details
    companyName, taxNumber, address, phone, companyEmail // Company details
  } = registrationData;

  // 1. Üyelik kontrolü
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error(MESSAGES.OWNER.EMAIL_EXISTS);
    error.statusCode = STATUS_CODES.BAD_REQUEST;
    throw error;
  }

  // 2. Şirket kontrolü
  const Company = (await import('../Models/Company.js')).default;
  const existingCompany = await Company.findOne({ $or: [{ name: companyName }, { taxNumber }] });
  if (existingCompany) {
    const error = new Error(MESSAGES.ADMIN.COMPANY_EXISTS);
    error.statusCode = STATUS_CODES.BAD_REQUEST;
    throw error;
  }

  // 3. Şirketi oluştur
  const newCompany = await Company.create({
    name: companyName,
    taxNumber,
    address: address || 'Belirtilmemiş',
    phone: phone || 'Belirtilmemiş',
    email: companyEmail || email // Varsayılan olarak kullanıcının emaili
  });

  // 4. Kullanıcıyı oluştur (Şirkete bağlı MANAGER olarak)
  const newUser = await User.create({
    fullname,
    email,
    password,
    role: 'MANAGER',
    companyId: newCompany._id,
    department: 'Yönetim'
  });

  const token = TokenService.generateToken({ id: newUser._id });
  const refreshToken = TokenService.generateRefreshToken({ id: newUser._id });

  newUser.refreshToken = refreshToken;
  await newUser.save();

  newUser.password = undefined;
  return { user: newUser, token, refreshToken, company: newCompany };
};


/**
 * Şifre sıfırlama e-postası gönderir
 */
export const forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error(MESSAGES.CONTROLLERS.AUTH.EMAIL_NOT_FOUND);
    error.statusCode = STATUS_CODES.NOT_FOUND;
    throw error;
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;

  await user.save({ validateBeforeSave: false });

  const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;
  const message = `Şifrenizi sıfırlamak için şu bağlantıya tıklayın: \n\n ${resetUrl}\n\nEğer bu isteği siz yapmadıysanız lütfen bu e-postayı dikkate almayın.`;

  try {
    await emailService.sendEmail({
      email: user.email,
      subject: 'Şifre Sıfırlama İsteği',
      message
    });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save({ validateBeforeSave: false });
    const error = new Error('Personel kaydı bulunamadı veya işlem sırasında bir sorun oluştu.');
  }
};

/**
 * Şifreyi sıfırlar
 */
export const resetPassword = async (token, newPassword) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    const error = new Error(MESSAGES.CONTROLLERS.AUTH.INVALID_RESET_TOKEN);
    error.statusCode = STATUS_CODES.BAD_REQUEST;
    throw error;
  }

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
};

/**
 * Yeni access token üretir
 */
export const refreshToken = async (providedRefreshToken) => {
  if (!providedRefreshToken) {
    const error = new Error(MESSAGES.CONTROLLERS.AUTH.INVALID_REFRESH_TOKEN);
    error.statusCode = STATUS_CODES.BAD_REQUEST;
    throw error;
  }

  const decoded = TokenService.verifyRefreshToken(providedRefreshToken);
  if (!decoded) {
    const error = new Error(MESSAGES.CONTROLLERS.AUTH.INVALID_REFRESH_TOKEN);
    error.statusCode = STATUS_CODES.UNAUTHORIZED;
    throw error;
  }

  const user = await User.findOne({ _id: decoded.id, refreshToken: providedRefreshToken });
  if (!user) {
    const error = new Error(MESSAGES.CONTROLLERS.AUTH.INVALID_REFRESH_TOKEN);
    error.statusCode = STATUS_CODES.UNAUTHORIZED;
    throw error;
  }

  const newToken = TokenService.generateToken({ id: user._id });
  const newRefreshToken = TokenService.generateRefreshToken({ id: user._id });

  user.refreshToken = newRefreshToken;
  await user.save();

  return { token: newToken, refreshToken: newRefreshToken };
};
