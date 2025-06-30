import Joi from 'joi';

export const loginValidation = Joi.object({
  username: Joi.string()
    .min(3)
    .max(50)
    .required()
    .messages({
      'string.min': 'Username harus minimal 3 karakter',
      'string.max': 'Username tidak boleh lebih dari 50 karakter', 
      'any.required': 'Username wajib diisi'
    }),
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'Password harus minimal 6 karakter',
      'any.required': 'Password wajib diisi'
    })
});

export const registerValidation = Joi.object({
  username: Joi.string()
    .min(3)
    .max(50)
    .alphanum()
    .required()
    .messages({
      'string.min': 'Username harus minimal 3 karakter',
      'string.max': 'Username tidak boleh lebih dari 50 karakter',
      'string.alphanum': 'Username hanya boleh mengandung huruf dan angka',
      'any.required': 'Username wajib diisi'
    }),
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Format email tidak valid',
      'any.required': 'Email wajib diisi'
    }),
  password: Joi.string()
    .min(8)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])'))
    .required()
    .messages({
      'string.min': 'Password harus minimal 8 karakter',
      'string.pattern.base': 'Password harus mengandung minimal 1 huruf kecil, 1 huruf besar, dan 1 angka',
      'any.required': 'Password wajib diisi'
    }),
  fullName: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'Nama lengkap harus minimal 2 karakter',
      'string.max': 'Nama lengkap tidak boleh lebih dari 100 karakter',
      'any.required': 'Nama lengkap wajib diisi'
    }),
  phoneNumber: Joi.string()
    .pattern(/^(\+62|62|0)[0-9]{9,13}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Format nomor telepon tidak valid (contoh: +6281234567890)'
    }),
  npsn: Joi.string()
    .length(8)
    .pattern(/^[0-9]+$/)
    .required()
    .messages({
      'string.length': 'NPSN harus 8 digit',
      'string.pattern.base': 'NPSN hanya boleh berisi angka',
      'any.required': 'NPSN sekolah wajib diisi'
    })
});

export const updateProfileValidation = Joi.object({
  fullName: Joi.string()
    .min(2)
    .max(100)
    .optional()
    .messages({
      'string.min': 'Nama lengkap harus minimal 2 karakter',
      'string.max': 'Nama lengkap tidak boleh lebih dari 100 karakter'
    }),
  phoneNumber: Joi.string()
    .pattern(/^(\+62|62|0)[0-9]{9,13}$/)
    .optional()
    .allow('')
    .messages({
      'string.pattern.base': 'Format nomor telepon tidak valid (contoh: +6281234567890)'
    }),
  profilePicture: Joi.string()
    .uri()
    .optional()
    .allow('')
    .messages({
      'string.uri': 'URL foto profil tidak valid'
    })
});

export const changePasswordValidation = Joi.object({
  current_password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password saat ini wajib diisi'
    }),
  new_password: Joi.string()
    .min(8)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])'))
    .required()
    .messages({
      'string.min': 'Password baru harus minimal 8 karakter',
      'string.pattern.base': 'Password baru harus mengandung minimal 1 huruf kecil, 1 huruf besar, dan 1 angka',
      'any.required': 'Password baru wajib diisi'
    }),
  confirm_password: Joi.string()
    .valid(Joi.ref('new_password'))
    .required()
    .messages({
      'any.only': 'Konfirmasi password tidak sesuai',
      'any.required': 'Konfirmasi password wajib diisi'
    })
});