// roleMiddleware.js

import MESSAGES from '../Utils/messages.js';

// Updated roleMiddleware to check user roles
const roleMiddleware = (roles) => {
  return (req, res, next) => {
    // 1. Kullanıcı varlık kontrolü
    if (!req.user) {
      return res.status(401).json({ message: "Kullanıcı bilgisi bulunamadı, lütfen tekrar giriş yapın." });
    }

    // 2. Rolleri standardize et
    const userRole = (req.user.role || '').toString().toUpperCase().trim();
    
    // 3. KRİTİK: ADMIN her zaman tam yetkilidir (Bypass)
    if (userRole === 'ADMIN') {
      return next();
    }

    // 4. İzin verilen rolleri diziye çevir ve kontrol et
    const rolesArray = Array.isArray(roles) ? roles : [roles];
    const sanitizedAllowedRoles = rolesArray.map(r => r.toString().toUpperCase().trim());

    if (!sanitizedAllowedRoles.includes(userRole)) {
      return res.status(403).json({ success: false, message: 'Bu işlem için yetkiniz bulunmamaktadır.' });
    }

    // Her şey yolundaysa bir sonraki adıma (Controller'a) geç
    next();
  };
};

export default roleMiddleware;