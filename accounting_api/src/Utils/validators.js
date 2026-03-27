// authValidator.js

import Joi from 'joi';

export const registerSchema = Joi.object({
  fullname: Joi.string().min(3).max(50).required().messages({
    'string.empty': 'Ad soyad alanı boş bırakılamaz.',
    'string.min': 'Ad soyad en az 3 karakter olmalıdır.'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Geçerli bir e-posta adresi giriniz.',
    'string.empty': 'E-posta alanı boş bırakılamaz.'
  }),
  password: Joi.string().min(8).required().pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-=[\\]{};\':"\\\\|,.<>/?])')).messages({
    'string.min': 'Şifre en az 8 karakter olmalıdır.',
    'string.pattern.base': 'Şifre en az bir büyük harf, bir küçük harf, bir rakam ve bir özel karakter içermelidir.'
  }),
  role: Joi.string().valid('ADMIN', 'MANAGER', 'USER').default('USER'),
  companyId: Joi.string().optional(),
  department: Joi.string().optional()
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Geçerli bir e-posta adresi giriniz.'
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Şifre alanı boş bırakılamaz.'
  })
});
