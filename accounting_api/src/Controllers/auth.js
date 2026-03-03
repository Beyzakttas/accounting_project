// authController.js

import jwt from 'jsonwebtoken';
import User from '../Models/User.js';
import MESSAGES from '../Utils/messages.js';

const generateToken = (id, role, companyId) => {
  return jwt.sign({ id, role, companyId }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '1d',
  });
};

const authController = {
  login: async (req, res) => {
    const { email, password } = req.body;

    // Alanların dolu olduğunu kontrol et
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Lütfen e-posta ve şifrenizi girin.' });
    }

    try {
      // Şifreyi de getirmek için .select('+password') kullandık
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(404).json({ success: false, message: MESSAGES.CONTROLLERS.AUTH.USER_NOT_FOUND });
      }

      // Şifre doğrulama
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: MESSAGES.CONTROLLERS.AUTH.INVALID_CREDENTIALS });
      }

      // Aktiflik kontrolü vb. de eklenebilir
      if (!user.isActive) {
        return res.status(403).json({ success: false, message: MESSAGES.AUTH.ACCOUNT_SUSPENDED });
      }

      // Token oluştur
      const token = generateToken(user._id, user.role, user.companyId);

      // Başarılı giriş yanıtı. Şifreyi yanıttan çıkar!
      user.password = undefined;

      res.status(200).json({
        success: true,
        token,
        data: {
          user
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: MESSAGES.CONTROLLERS.AUTH.SERVER_ERROR, error: error.message });
    }
  },

  register: async (req, res) => {
    // Model şemasındaki 'fullname' kullanılıyor, req.body'den buna uygun alan istenir
    const { fullname, email, password, role, companyId, department } = req.body;

    if (!fullname || !email || !password) {
      return res.status(400).json({ success: false, message: 'İsim, e-posta ve şifre zorunludur.' });
    }

    try {
      // 1. Kullanıcı zaten var mı kontrol et
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Bu e-posta adresi ile zaten bir hesap mevcut.' });
      }

      // 2. Yeni kullanıcıyı oluştur (şifre User modelindeki pre-save kancasıyla hash'lenecek)
      const newUser = await User.create({
        fullname,
        email,
        password,
        role,
        companyId,
        department
      });

      // Şifreyi güvenlik nedeniyle yanıttan kaldır
      newUser.password = undefined;

      // 3. Kayıt olur olmaz otomatik giriş yaptırmak istersek (opsiyonel), token dönebiliriz
      const token = generateToken(newUser._id, newUser.role, newUser.companyId);

      res.status(201).json({
        success: true,
        message: MESSAGES.CONTROLLERS.AUTH.REGISTER_SUCCESS,
        token,
        data: {
          user: newUser
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: MESSAGES.CONTROLLERS.AUTH.SERVER_ERROR, error: error.message });
    }
  },
};

export default authController;