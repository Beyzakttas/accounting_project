// authMiddleware.js

import jwt from 'jsonwebtoken';
import User from '../Models/User.js';
import Company from '../Models/Company.js';
import MESSAGES from '../Utils/messages.js';

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: MESSAGES.AUTH.NO_TOKEN });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // JWT içindeki id ile gerçek kullanıcıyı veritabanından bul
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: MESSAGES.AUTH.INVALID_TOKEN_USER });
    }

    // Kullanıcı hesabı dondurulmuş (pasif) ise erişimi engelle
    if (user.isActive === false) {
      return res.status(403).json({ message: MESSAGES.AUTH.ACCOUNT_SUSPENDED });
    }

    // Eğer kullanıcı bir şirkete bağlıysa (Admin olmayanlar) şirketin aktifliğini de kontrol et
    if (user.companyId) {
      const company = await Company.findById(user.companyId);
      if (!company || company.isActive === false) {
        return res.status(403).json({ message: MESSAGES.AUTH.COMPANY_INACTIVE });
      }
    }

    // Doğrulanmış ve aktif kullanıcıyı request objesine ekle
    req.user = user;
    next();
    // authMiddleware.js içindeki catch kısmını böyle yap:
  } catch (error) {
    console.error("Auth Middleware Hatası:", error.message);
    return res.status(401).json({ message: MESSAGES.AUTH.INVALID_TOKEN });
  }
};

export default authMiddleware;