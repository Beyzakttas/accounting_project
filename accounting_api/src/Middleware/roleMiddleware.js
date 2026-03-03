// roleMiddleware.js

import MESSAGES from '../Utils/messages.js';

// Updated roleMiddleware to check user roles
const roleMiddleware = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: MESSAGES.AUTH.ACCESS_DENIED });
    }
    next();
  };
};

export default roleMiddleware;