import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../Models/User.js';
import MESSAGES from '../Utils/messages.js';
import TokenService from '../Services/tokenService.js';
import emailService from '../Services/emailService.js';

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

      // TokenService kullanarak tokenları oluştur
      const tokenPayload = {
        id: user._id
      };

      const token = TokenService.generateToken(tokenPayload);
      const refreshToken = TokenService.generateRefreshToken({ id: user._id });

      // Refresh token'ı veritabanına kaydet
      user.refreshToken = refreshToken;
      await user.save();

      // Başarılı giriş yanıtı. Şifreyi yanıtın içinden zaten .select('+password') ile aldık ama modele geri yazılmasın diye undefined yapıyoruz
      user.password = undefined;

      res.status(200).json({
        success: true,
        token,
        refreshToken,
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

      // 3. Kayıt olur olmaz otomatik giriş yaptırmak istersek, TokenService çağır
      const tokenPayload = {
        id: newUser._id
      };

      const token = TokenService.generateToken(tokenPayload);
      const refreshToken = TokenService.generateRefreshToken({ id: newUser._id });

      // Refresh token'ı kaydet
      const userToUpdate = await User.findById(newUser._id);
      userToUpdate.refreshToken = refreshToken;
      await userToUpdate.save();

      res.status(201).json({
        success: true,
        message: MESSAGES.CONTROLLERS.AUTH.REGISTER_SUCCESS,
        token,
        refreshToken,
        data: {
          user: newUser
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: MESSAGES.CONTROLLERS.AUTH.SERVER_ERROR, error: error.message });
    }
  },

  refreshToken: async (req, res) => {
    const refreshToken = req.body.refreshToken || req.headers['x-refresh-token'];

    if (!refreshToken) {
      return res.status(400).json({ success: false, message: 'Refresh token gereklidir.' });
    }

    try {
      // 1. Token'ı doğrula
      const decoded = TokenService.verifyRefreshToken(refreshToken);
      if (!decoded) {
        return res.status(401).json({ success: false, message: 'Geçersiz veya süresi dolmuş refresh token.' });
      }

      // 2. Veritabanında bu user ve token eşleşiyor mu bak
      const user = await User.findById(decoded.id).select('+refreshToken');
      if (!user || user.refreshToken !== refreshToken) {
        return res.status(401).json({ success: false, message: 'Refresh token eşleşmiyor veya kullanıcı bulunamadı.' });
      }

      // 3. Yeni bir access token oluştur
      const newToken = TokenService.generateToken({
        id: user._id
      });

      res.status(200).json({
        success: true,
        token: newToken
      });
    } catch (error) {
      res.status(500).json({ success: false, message: MESSAGES.CONTROLLERS.AUTH.SERVER_ERROR, error: error.message });
    }
  },

  forgotPassword: async (req, res) => {
    const { email } = req.body;

    try {
      // 1. Kullanıcıyı bul
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ success: false, message: MESSAGES.CONTROLLERS.AUTH.EMAIL_NOT_FOUND });
      }

      // 2. Rastgele bir reset token oluştur
      const resetToken = crypto.randomBytes(32).toString('hex');

      // 3. Token'ı hash'leyip DB'ye kaydet (güvenlik için)
      user.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

      // 4. Token süresi (örn. 10 dakika)
      user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;

      await user.save({ validateBeforeSave: false });

      // 5. URL'yi oluştur ve e-posta gönder
      // Frontend URL'si (Port 3000)
      const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;

      const message = `Şifrenizi sıfırlamak için şu bağlantıya tıklayın: \n\n ${resetUrl}\n\nEğer bu isteği siz yapmadıysanız lütfen bu e-postayı dikkate almayın.`;

      try {
        await emailService.sendEmail({
          email: user.email,
          subject: 'Şifre Sıfırlama İsteği',
          message
        });

        res.status(200).json({
          success: true,
          message: MESSAGES.CONTROLLERS.AUTH.RESET_LINK_SENT
        });
      } catch (err) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return res.status(500).json({ success: false, message: 'E-posta gönderilirken bir hata oluştu. Lütfen tekrar deneyin.', error: err.message });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: MESSAGES.CONTROLLERS.AUTH.SERVER_ERROR, error: error.message });
    }
  },

  resetPassword: async (req, res) => {
    try {
      // 1. Gelen token'ı sha256 ile hash'le (DB'dekilerle karşılaştırmak için)
      const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

      // 2. Token geçerli mi ve süresi dolmamış mı kontrol et
      const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() }
      });

      if (!user) {
        return res.status(400).json({ success: false, message: MESSAGES.CONTROLLERS.AUTH.INVALID_RESET_TOKEN });
      }

      // 3. Şifreyi güncelle ve token alanlarını temizle
      user.password = req.body.password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;

      await user.save();

      res.status(200).json({
        success: true,
        message: MESSAGES.CONTROLLERS.AUTH.PASSWORD_RESET_SUCCESS
      });
    } catch (error) {
      res.status(500).json({ success: false, message: MESSAGES.CONTROLLERS.AUTH.SERVER_ERROR, error: error.message });
    }
  },
};

export default authController;