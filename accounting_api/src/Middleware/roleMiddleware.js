// roleMiddleware.js

import MESSAGES from '../Utils/messages.js';

// Updated roleMiddleware to check user roles
const roleMiddleware = (roles) => {
  return (req, res, next) => {
    // req.user'ın varlığını garantiye alalım
    if (!req.user) {
      return res.status(401).json({ message: "Kullanıcı bilgisi bulunamadı, lütfen tekrar giriş yapın." });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: MESSAGES.AUTH.ACCESS_DENIED });
    }

    // Her şey yolundaysa bir sonraki adıma (Controller'a) geç
    next();
  };
};

export default roleMiddleware;