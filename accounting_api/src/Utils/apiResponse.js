// apiResponse.js

import STATUS_CODES from './statusCodes.js';

/**
 * Başarı durumları için standart format
 */
export const successResponse = (res, data, message = "İşlem başarılı", statusCode = STATUS_CODES.OK) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

/**
 * Hata durumları için standart format
 */
export const errorResponse = (res, message = "Bir hata oluştu", statusCode = STATUS_CODES.INTERNAL_SERVER_ERROR, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors
  });
};
