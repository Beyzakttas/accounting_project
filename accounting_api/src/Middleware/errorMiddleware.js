// errorMiddleware.js

import STATUS_CODES from '../Utils/statusCodes.js';

const errorMiddleware = (err, req, res, next) => {
  console.error("HATA:", err.stack);

  let statusCode = err.statusCode || STATUS_CODES.INTERNAL_SERVER_ERROR;
  let message = err.message || "Sunucu hatası oluştu.";

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = STATUS_CODES.BAD_REQUEST;
    message = Object.values(err.errors).map(val => val.message).join(', ');
  }

  // Mongoose Cast Error (Invalid ID)
  if (err.name === 'CastError') {
    statusCode = STATUS_CODES.NOT_FOUND;
    message = `Kaynak bulunamadı. Geçersiz ID: ${err.value}`;
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    statusCode = STATUS_CODES.BAD_REQUEST;
    message = "Bu veri zaten mevcut (duplicate key error).";
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = STATUS_CODES.UNAUTHORIZED;
    message = "Geçersiz token. Lütfen tekrar giriş yapın.";
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = STATUS_CODES.UNAUTHORIZED;
    message = "Oturum süresi doldu. Lütfen tekrar giriş yapın.";
  }

  res.status(statusCode).json({
    success: false,
    message,
    // Sadece development ortamında stack trace gönderilebilir
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

export default errorMiddleware;
