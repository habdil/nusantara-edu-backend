"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDevelopmentProgramValidation = exports.createDevelopmentProgramValidation = exports.getDevelopmentProgramsValidation = exports.updateEvaluationValidation = exports.createEvaluationValidation = exports.getEvaluationsValidation = void 0;
const joi_1 = __importDefault(require("joi"));
// Validation for getting evaluations with filters
exports.getEvaluationsValidation = joi_1.default.object({
    academicYear: joi_1.default.string()
        .pattern(/^\d{4}\/\d{4}$/)
        .optional()
        .messages({
        'string.pattern.base': 'Format tahun akademik tidak valid (contoh: 2024/2025)'
    }),
    evaluationPeriod: joi_1.default.string()
        .valid('Semester 1', 'Semester 2', 'Tahunan')
        .optional()
        .messages({
        'any.only': 'Periode evaluasi harus Semester 1, Semester 2, atau Tahunan'
    }),
    subjectArea: joi_1.default.string()
        .optional()
        .messages({
        'string.base': 'Area mata pelajaran harus berupa string'
    }),
    status: joi_1.default.string()
        .valid('draft', 'completed', 'reviewed', 'approved')
        .optional()
        .messages({
        'any.only': 'Status harus draft, completed, reviewed, atau approved'
    }),
    search: joi_1.default.string()
        .optional()
        .allow('')
        .messages({
        'string.base': 'Search query harus berupa string'
    }),
    page: joi_1.default.number()
        .integer()
        .min(1)
        .optional()
        .default(1)
        .messages({
        'number.base': 'Page harus berupa angka',
        'number.integer': 'Page harus berupa bilangan bulat',
        'number.min': 'Page minimal 1'
    }),
    limit: joi_1.default.number()
        .integer()
        .min(1)
        .max(100)
        .optional()
        .default(10)
        .messages({
        'number.base': 'Limit harus berupa angka',
        'number.integer': 'Limit harus berupa bilangan bulat',
        'number.min': 'Limit minimal 1',
        'number.max': 'Limit maksimal 100'
    })
});
// Validation for creating teacher evaluation
exports.createEvaluationValidation = joi_1.default.object({
    teacherId: joi_1.default.number()
        .integer()
        .positive()
        .required()
        .messages({
        'number.base': 'Teacher ID harus berupa angka',
        'number.integer': 'Teacher ID harus berupa bilangan bulat',
        'number.positive': 'Teacher ID harus positif',
        'any.required': 'Teacher ID wajib diisi'
    }),
    evaluationPeriod: joi_1.default.string()
        .valid('Semester 1', 'Semester 2', 'Tahunan')
        .required()
        .messages({
        'any.only': 'Periode evaluasi harus Semester 1, Semester 2, atau Tahunan',
        'any.required': 'Periode evaluasi wajib diisi'
    }),
    academicYear: joi_1.default.string()
        .pattern(/^\d{4}\/\d{4}$/)
        .required()
        .messages({
        'string.pattern.base': 'Format tahun akademik tidak valid (contoh: 2024/2025)',
        'any.required': 'Tahun akademik wajib diisi'
    }),
    teachingQuality: joi_1.default.number()
        .min(1)
        .max(5)
        .precision(1)
        .required()
        .messages({
        'number.base': 'Kualitas mengajar harus berupa angka',
        'number.min': 'Kualitas mengajar minimal 1',
        'number.max': 'Kualitas mengajar maksimal 5',
        'any.required': 'Kualitas mengajar wajib diisi'
    }),
    classroomManagement: joi_1.default.number()
        .min(1)
        .max(5)
        .precision(1)
        .required()
        .messages({
        'number.base': 'Manajemen kelas harus berupa angka',
        'number.min': 'Manajemen kelas minimal 1',
        'number.max': 'Manajemen kelas maksimal 5',
        'any.required': 'Manajemen kelas wajib diisi'
    }),
    studentEngagement: joi_1.default.number()
        .min(1)
        .max(5)
        .precision(1)
        .required()
        .messages({
        'number.base': 'Engagement siswa harus berupa angka',
        'number.min': 'Engagement siswa minimal 1',
        'number.max': 'Engagement siswa maksimal 5',
        'any.required': 'Engagement siswa wajib diisi'
    }),
    professionalDevelopment: joi_1.default.number()
        .min(1)
        .max(5)
        .precision(1)
        .required()
        .messages({
        'number.base': 'Pengembangan profesional harus berupa angka',
        'number.min': 'Pengembangan profesional minimal 1',
        'number.max': 'Pengembangan profesional maksimal 5',
        'any.required': 'Pengembangan profesional wajib diisi'
    }),
    collaboration: joi_1.default.number()
        .min(1)
        .max(5)
        .precision(1)
        .required()
        .messages({
        'number.base': 'Kolaborasi harus berupa angka',
        'number.min': 'Kolaborasi minimal 1',
        'number.max': 'Kolaborasi maksimal 5',
        'any.required': 'Kolaborasi wajib diisi'
    }),
    punctuality: joi_1.default.number()
        .min(1)
        .max(5)
        .precision(1)
        .required()
        .messages({
        'number.base': 'Ketepatan waktu harus berupa angka',
        'number.min': 'Ketepatan waktu minimal 1',
        'number.max': 'Ketepatan waktu maksimal 5',
        'any.required': 'Ketepatan waktu wajib diisi'
    }),
    notes: joi_1.default.string()
        .max(1000)
        .optional()
        .allow('')
        .messages({
        'string.max': 'Catatan maksimal 1000 karakter'
    }),
    recommendations: joi_1.default.array()
        .items(joi_1.default.string().max(500))
        .max(10)
        .optional()
        .default([])
        .messages({
        'array.base': 'Rekomendasi harus berupa array',
        'array.max': 'Maksimal 10 rekomendasi',
        'string.max': 'Setiap rekomendasi maksimal 500 karakter'
    }),
    developmentGoals: joi_1.default.array()
        .items(joi_1.default.string().max(500))
        .max(10)
        .optional()
        .default([])
        .messages({
        'array.base': 'Tujuan pengembangan harus berupa array',
        'array.max': 'Maksimal 10 tujuan pengembangan',
        'string.max': 'Setiap tujuan pengembangan maksimal 500 karakter'
    }),
    status: joi_1.default.string()
        .valid('draft', 'completed', 'reviewed', 'approved')
        .optional()
        .default('draft')
        .messages({
        'any.only': 'Status harus draft, completed, reviewed, atau approved'
    })
});
// Validation for updating teacher evaluation
exports.updateEvaluationValidation = joi_1.default.object({
    teachingQuality: joi_1.default.number()
        .min(1)
        .max(5)
        .precision(1)
        .optional()
        .messages({
        'number.base': 'Kualitas mengajar harus berupa angka',
        'number.min': 'Kualitas mengajar minimal 1',
        'number.max': 'Kualitas mengajar maksimal 5'
    }),
    classroomManagement: joi_1.default.number()
        .min(1)
        .max(5)
        .precision(1)
        .optional()
        .messages({
        'number.base': 'Manajemen kelas harus berupa angka',
        'number.min': 'Manajemen kelas minimal 1',
        'number.max': 'Manajemen kelas maksimal 5'
    }),
    studentEngagement: joi_1.default.number()
        .min(1)
        .max(5)
        .precision(1)
        .optional()
        .messages({
        'number.base': 'Engagement siswa harus berupa angka',
        'number.min': 'Engagement siswa minimal 1',
        'number.max': 'Engagement siswa maksimal 5'
    }),
    professionalDevelopment: joi_1.default.number()
        .min(1)
        .max(5)
        .precision(1)
        .optional()
        .messages({
        'number.base': 'Pengembangan profesional harus berupa angka',
        'number.min': 'Pengembangan profesional minimal 1',
        'number.max': 'Pengembangan profesional maksimal 5'
    }),
    collaboration: joi_1.default.number()
        .min(1)
        .max(5)
        .precision(1)
        .optional()
        .messages({
        'number.base': 'Kolaborasi harus berupa angka',
        'number.min': 'Kolaborasi minimal 1',
        'number.max': 'Kolaborasi maksimal 5'
    }),
    punctuality: joi_1.default.number()
        .min(1)
        .max(5)
        .precision(1)
        .optional()
        .messages({
        'number.base': 'Ketepatan waktu harus berupa angka',
        'number.min': 'Ketepatan waktu minimal 1',
        'number.max': 'Ketepatan waktu maksimal 5'
    }),
    notes: joi_1.default.string()
        .max(1000)
        .optional()
        .allow('')
        .messages({
        'string.max': 'Catatan maksimal 1000 karakter'
    }),
    recommendations: joi_1.default.array()
        .items(joi_1.default.string().max(500))
        .max(10)
        .optional()
        .messages({
        'array.base': 'Rekomendasi harus berupa array',
        'array.max': 'Maksimal 10 rekomendasi',
        'string.max': 'Setiap rekomendasi maksimal 500 karakter'
    }),
    developmentGoals: joi_1.default.array()
        .items(joi_1.default.string().max(500))
        .max(10)
        .optional()
        .messages({
        'array.base': 'Tujuan pengembangan harus berupa array',
        'array.max': 'Maksimal 10 tujuan pengembangan',
        'string.max': 'Setiap tujuan pengembangan maksimal 500 karakter'
    }),
    status: joi_1.default.string()
        .valid('draft', 'completed', 'reviewed', 'approved')
        .optional()
        .messages({
        'any.only': 'Status harus draft, completed, reviewed, atau approved'
    })
});
// Validation for getting development programs
exports.getDevelopmentProgramsValidation = joi_1.default.object({
    teacherId: joi_1.default.number()
        .integer()
        .positive()
        .optional()
        .messages({
        'number.base': 'Teacher ID harus berupa angka',
        'number.integer': 'Teacher ID harus berupa bilangan bulat',
        'number.positive': 'Teacher ID harus positif'
    }),
    programType: joi_1.default.string()
        .valid('workshop', 'training', 'certification', 'seminar')
        .optional()
        .messages({
        'any.only': 'Tipe program harus workshop, training, certification, atau seminar'
    }),
    status: joi_1.default.string()
        .valid('planned', 'ongoing', 'completed', 'cancelled')
        .optional()
        .messages({
        'any.only': 'Status harus planned, ongoing, completed, atau cancelled'
    }),
    year: joi_1.default.number()
        .integer()
        .min(2020)
        .max(2030)
        .optional()
        .messages({
        'number.base': 'Tahun harus berupa angka',
        'number.integer': 'Tahun harus berupa bilangan bulat',
        'number.min': 'Tahun minimal 2020',
        'number.max': 'Tahun maksimal 2030'
    })
});
// Validation for creating development program
exports.createDevelopmentProgramValidation = joi_1.default.object({
    teacherId: joi_1.default.number()
        .integer()
        .positive()
        .required()
        .messages({
        'number.base': 'Teacher ID harus berupa angka',
        'number.integer': 'Teacher ID harus berupa bilangan bulat',
        'number.positive': 'Teacher ID harus positif',
        'any.required': 'Teacher ID wajib diisi'
    }),
    programName: joi_1.default.string()
        .min(3)
        .max(200)
        .required()
        .messages({
        'string.base': 'Nama program harus berupa string',
        'string.min': 'Nama program minimal 3 karakter',
        'string.max': 'Nama program maksimal 200 karakter',
        'any.required': 'Nama program wajib diisi'
    }),
    programType: joi_1.default.string()
        .valid('workshop', 'training', 'certification', 'seminar')
        .required()
        .messages({
        'any.only': 'Tipe program harus workshop, training, certification, atau seminar',
        'any.required': 'Tipe program wajib diisi'
    }),
    startDate: joi_1.default.date()
        .iso()
        .required()
        .messages({
        'date.base': 'Tanggal mulai tidak valid',
        'date.format': 'Format tanggal harus ISO (YYYY-MM-DD)',
        'any.required': 'Tanggal mulai wajib diisi'
    }),
    endDate: joi_1.default.date()
        .iso()
        .min(joi_1.default.ref('startDate'))
        .required()
        .messages({
        'date.base': 'Tanggal selesai tidak valid',
        'date.format': 'Format tanggal harus ISO (YYYY-MM-DD)',
        'date.min': 'Tanggal selesai harus setelah tanggal mulai',
        'any.required': 'Tanggal selesai wajib diisi'
    }),
    hours: joi_1.default.number()
        .integer()
        .min(1)
        .max(1000)
        .required()
        .messages({
        'number.base': 'Jam harus berupa angka',
        'number.integer': 'Jam harus berupa bilangan bulat',
        'number.min': 'Jam minimal 1',
        'number.max': 'Jam maksimal 1000',
        'any.required': 'Jam wajib diisi'
    }),
    provider: joi_1.default.string()
        .min(3)
        .max(200)
        .required()
        .messages({
        'string.base': 'Penyelenggara harus berupa string',
        'string.min': 'Penyelenggara minimal 3 karakter',
        'string.max': 'Penyelenggara maksimal 200 karakter',
        'any.required': 'Penyelenggara wajib diisi'
    }),
    cost: joi_1.default.number()
        .min(0)
        .required()
        .messages({
        'number.base': 'Biaya harus berupa angka',
        'number.min': 'Biaya minimal 0',
        'any.required': 'Biaya wajib diisi'
    }),
    status: joi_1.default.string()
        .valid('planned', 'ongoing', 'completed', 'cancelled')
        .optional()
        .default('planned')
        .messages({
        'any.only': 'Status harus planned, ongoing, completed, atau cancelled'
    }),
    certificateUrl: joi_1.default.string()
        .uri()
        .optional()
        .allow('')
        .messages({
        'string.uri': 'URL sertifikat harus berupa URL yang valid'
    }),
    description: joi_1.default.string()
        .max(1000)
        .optional()
        .allow('')
        .messages({
        'string.max': 'Deskripsi maksimal 1000 karakter'
    })
});
// Validation for updating development program
exports.updateDevelopmentProgramValidation = joi_1.default.object({
    programName: joi_1.default.string()
        .min(3)
        .max(200)
        .optional()
        .messages({
        'string.base': 'Nama program harus berupa string',
        'string.min': 'Nama program minimal 3 karakter',
        'string.max': 'Nama program maksimal 200 karakter'
    }),
    programType: joi_1.default.string()
        .valid('workshop', 'training', 'certification', 'seminar')
        .optional()
        .messages({
        'any.only': 'Tipe program harus workshop, training, certification, atau seminar'
    }),
    startDate: joi_1.default.date()
        .iso()
        .optional()
        .messages({
        'date.base': 'Tanggal mulai tidak valid',
        'date.format': 'Format tanggal harus ISO (YYYY-MM-DD)'
    }),
    endDate: joi_1.default.date()
        .iso()
        .optional()
        .when('startDate', {
        is: joi_1.default.exist(),
        then: joi_1.default.date().min(joi_1.default.ref('startDate')),
        otherwise: joi_1.default.date()
    })
        .messages({
        'date.base': 'Tanggal selesai tidak valid',
        'date.format': 'Format tanggal harus ISO (YYYY-MM-DD)',
        'date.min': 'Tanggal selesai harus setelah tanggal mulai'
    }),
    hours: joi_1.default.number()
        .integer()
        .min(1)
        .max(1000)
        .optional()
        .messages({
        'number.base': 'Jam harus berupa angka',
        'number.integer': 'Jam harus berupa bilangan bulat',
        'number.min': 'Jam minimal 1',
        'number.max': 'Jam maksimal 1000'
    }),
    provider: joi_1.default.string()
        .min(3)
        .max(200)
        .optional()
        .messages({
        'string.base': 'Penyelenggara harus berupa string',
        'string.min': 'Penyelenggara minimal 3 karakter',
        'string.max': 'Penyelenggara maksimal 200 karakter'
    }),
    cost: joi_1.default.number()
        .min(0)
        .optional()
        .messages({
        'number.base': 'Biaya harus berupa angka',
        'number.min': 'Biaya minimal 0'
    }),
    status: joi_1.default.string()
        .valid('planned', 'ongoing', 'completed', 'cancelled')
        .optional()
        .messages({
        'any.only': 'Status harus planned, ongoing, completed, atau cancelled'
    }),
    certificateUrl: joi_1.default.string()
        .uri()
        .optional()
        .allow('')
        .messages({
        'string.uri': 'URL sertifikat harus berupa URL yang valid'
    }),
    description: joi_1.default.string()
        .max(1000)
        .optional()
        .allow('')
        .messages({
        'string.max': 'Deskripsi maksimal 1000 karakter'
    })
});
