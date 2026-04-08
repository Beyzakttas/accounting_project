import * as authService from '../Services/authService.js';
import { successResponse } from '../Utils/apiResponse.js';
import MESSAGES from '../Utils/messages.js';
import STATUS_CODES from '../Utils/statusCodes.js';

const authController = {
  login: async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
      const error = new Error('Lütfen e-posta ve şifrenizi girin.');
      error.statusCode = STATUS_CODES.BAD_REQUEST;
      return next(error);
    }

    try {
      const result = await authService.login(email, password);
      return successResponse(res, result, 'Giriş başarılı.');
    } catch (error) {
      next(error);
    }
  },

  register: async (req, res, next) => {
    const { fullname, email, password, role, companyId, department } = req.body;

    if (!fullname || !email || !password) {
      const error = new Error('İsim, e-posta ve şifre zorunludur.');
      error.statusCode = STATUS_CODES.BAD_REQUEST;
      return next(error);
    }
    try {
      const result = await authService.register({ fullname, email, password, role, companyId, department });
      return successResponse(res, result, MESSAGES.CONTROLLERS.AUTH.REGISTER_SUCCESS, STATUS_CODES.CREATED);
    } catch (error) {
      next(error);
    }
  },

  registerWithCompany: async (req, res, next) => {
    try {
      const result = await authService.registerWithCompany(req.body);
      return successResponse(res, result, MESSAGES.CONTROLLERS.AUTH.REGISTER_SUCCESS, STATUS_CODES.CREATED);
    } catch (error) {
      next(error);
    }
  },



  forgotPassword: async (req, res, next) => {
    const { email } = req.body;

    try {
      await authService.forgotPassword(email);
      return successResponse(res, null, MESSAGES.CONTROLLERS.AUTH.RESET_LINK_SENT);
    } catch (error) {
      next(error);
    }
  },

  resetPassword: async (req, res, next) => {
    const { password } = req.body;
    const { token } = req.params;

    try {
      await authService.resetPassword(token, password);
      return successResponse(res, null, MESSAGES.CONTROLLERS.AUTH.PASSWORD_RESET_SUCCESS);
    } catch (error) {
      next(error);
    }
  },

  refreshToken: async (req, res, next) => {
    try {
      const { refreshToken: providedToken } = req.body;
      const result = await authService.refreshToken(providedToken);
      return successResponse(res, result, MESSAGES.CONTROLLERS.AUTH.REFRESH_TOKEN_SUCCESS);
    } catch (error) {
      next(error);
    }
  }
};

export default authController;