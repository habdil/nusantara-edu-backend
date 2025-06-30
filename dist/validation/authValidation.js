"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordValidation = exports.updateProfileValidation = exports.registerValidation = exports.loginValidation = void 0;
const joi_1 = __importDefault(require("joi"));
exports.loginValidation = joi_1.default.object({
    username: joi_1.default.string()
        .min(3)
        .max(50)
        .required()
        .messages({
        'string.min': 'Username harus minimal 3 karakter',
        'string.max': 'Username tidak boleh lebih dari 50 karakter',
        'any.required': 'Username wajib diisi'
    }),
    password: joi_1.default.string()
        .min(6)
        .required()
        .messages({
        'string.min': 'Password harus minimal 6 karakter',
        'any.required': 'Password wajib diisi'
    })
});
exports.registerValidation = joi_1.default.object({
    username: joi_1.default.string()
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
    email: joi_1.default.string()
        .email()
        .required()
        .messages({
        'string.email': 'Format email tidak valid',
        'any.required': 'Email wajib diisi'
    }),
    password: joi_1.default.string()
        .min(8)
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])'))
        .required()
        .messages({
        'string.min': 'Password harus minimal 8 karakter',
        'string.pattern.base': 'Password harus mengandung minimal 1 huruf kecil, 1 huruf besar, dan 1 angka',
        'any.required': 'Password wajib diisi'
    }),
    fullName: joi_1.default.string()
        .min(2)
        .max(100)
        .required()
        .messages({
        'string.min': 'Nama lengkap harus minimal 2 karakter',
        'string.max': 'Nama lengkap tidak boleh lebih dari 100 karakter',
        'any.required': 'Nama lengkap wajib diisi'
    }),
    phoneNumber: joi_1.default.string()
        .pattern(/^(\+62|62|0)[0-9]{9,13}$/)
        .optional()
        .messages({
        'string.pattern.base': 'Format nomor telepon tidak valid (contoh: +6281234567890)'
    }),
    npsn: joi_1.default.string()
        .length(8)
        .pattern(/^[0-9]+$/)
        .required()
        .messages({
        'string.length': 'NPSN harus 8 digit',
        'string.pattern.base': 'NPSN hanya boleh berisi angka',
        'any.required': 'NPSN sekolah wajib diisi'
    })
});
exports.updateProfileValidation = joi_1.default.object({
    fullName: joi_1.default.string()
        .min(2)
        .max(100)
        .optional()
        .messages({
        'string.min': 'Nama lengkap harus minimal 2 karakter',
        'string.max': 'Nama lengkap tidak boleh lebih dari 100 karakter'
    }),
    phoneNumber: joi_1.default.string()
        .pattern(/^(\+62|62|0)[0-9]{9,13}$/)
        .optional()
        .allow('')
        .messages({
        'string.pattern.base': 'Format nomor telepon tidak valid (contoh: +6281234567890)'
    }),
    profilePicture: joi_1.default.string()
        .uri()
        .optional()
        .allow('')
        .messages({
        'string.uri': 'URL foto profil tidak valid'
    })
});
exports.changePasswordValidation = joi_1.default.object({
    current_password: joi_1.default.string()
        .required()
        .messages({
        'any.required': 'Password saat ini wajib diisi'
    }),
    new_password: joi_1.default.string()
        .min(8)
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])'))
        .required()
        .messages({
        'string.min': 'Password baru harus minimal 8 karakter',
        'string.pattern.base': 'Password baru harus mengandung minimal 1 huruf kecil, 1 huruf besar, dan 1 angka',
        'any.required': 'Password baru wajib diisi'
    }),
    confirm_password: joi_1.default.string()
        .valid(joi_1.default.ref('new_password'))
        .required()
        .messages({
        'any.only': 'Konfirmasi password tidak sesuai',
        'any.required': 'Konfirmasi password wajib diisi'
    })
});
