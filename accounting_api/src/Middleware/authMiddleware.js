// authMiddleware.js

import jwt from 'jsonwebtoken';
import User from '../Models/User.js';
import Company from '../Models/Company.js';
import MESSAGES from '../Utils/messages.js';
import STATUS_CODES from '../Utils/statusCodes.js';

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    const error = new Error(MESSAGES.AUTH.NO_TOKEN);
    error.statusCode = STATUS_CODES.UNAUTHORIZED;
    return next(error);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');

    // Kullanıcıyı bul
    const user = await User.findById(decoded.id);
    if (!user) {
      const error = new Error(MESSAGES.AUTH.INVALID_TOKEN_USER);
      error.statusCode = STATUS_CODES.UNAUTHORIZED;
      return next(error);
    }

    // Aktiflik kontrolü (Kullanıcı)
    if (user.isActive === false) {
      const error = new Error(MESSAGES.AUTH.ACCOUNT_SUSPENDED);
      error.statusCode = STATUS_CODES.FORBIDDEN;
      return next(error);
    }

    req.user = user;
    next();
  } catch (err) {
    // Hata yönetimini merkezi middleware'e bırakıyoruz
    err.statusCode = STATUS_CODES.UNAUTHORIZED;
    next(err);
  }
};

export default authMiddleware;