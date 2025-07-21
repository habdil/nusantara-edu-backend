"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getKPIStatisticsValidation = exports.kpiIdValidation = exports.exportKPIReportValidation = exports.updateKPIValidation = exports.createKPIValidation = exports.getKPIsByPriorityValidation = exports.getKPIsByCategoryValidation = exports.getKPIsValidation = void 0;
const joi_1 = __importDefault(require("joi"));
// Validation for getting KPIs with filters
exports.getKPIsValidation = joi_1.default.object({
    academicYear: joi_1.default.string()
        .pattern(/^\d{4}$/)
        .optional()
        .messages({
        'string.pattern.base': 'Format tahun akademik tidak valid (contoh: 2024)'
    }),
    period: joi_1.default.string()
        .valid('Semester 1', 'Semester 2', 'Tahunan')
        .optional()
        .messages({
        'any.only': 'Period harus Semester 1, Semester 2, atau Tahunan'
    }),
    kpiCategory: joi_1.default.string()
        .valid('Academic', 'Operational', 'Financial', 'Resource')
        .optional()
        .messages({
        'any.only': 'Kategori KPI harus Academic, Operational, Financial, atau Resource'
    }),
    priority: joi_1.default.number()
        .integer()
        .min(1)
        .max(5)
        .optional()
        .messages({
        'number.base': 'Priority harus berupa angka',
        'number.integer': 'Priority harus berupa bilangan bulat',
        'number.min': 'Priority minimal 1',
        'number.max': 'Priority maksimal 5'
    }),
    trend: joi_1.default.string()
        .valid('increasing', 'stable', 'decreasing')
        .optional()
        .messages({
        'any.only': 'Trend harus increasing, stable, atau decreasing'
    })
});
// Validation for getting KPIs by category
exports.getKPIsByCategoryValidation = joi_1.default.object({
    category: joi_1.default.string()
        .valid('Academic', 'Operational', 'Financial', 'Resource')
        .required()
        .messages({
        'any.only': 'Kategori KPI harus Academic, Operational, Financial, atau Resource',
        'any.required': 'Kategori KPI wajib diisi'
    })
});
// Validation for getting KPIs by priority
exports.getKPIsByPriorityValidation = joi_1.default.object({
    priority: joi_1.default.number()
        .integer()
        .min(1)
        .max(5)
        .required()
        .messages({
        'number.base': 'Priority harus berupa angka',
        'number.integer': 'Priority harus berupa bilangan bulat',
        'number.min': 'Priority minimal 1',
        'number.max': 'Priority maksimal 5',
        'any.required': 'Priority wajib diisi'
    })
});
// Validation for creating KPI
exports.createKPIValidation = joi_1.default.object({
    kpiCategory: joi_1.default.string()
        .valid('Academic', 'Operational', 'Financial', 'Resource')
        .required()
        .messages({
        'any.only': 'Kategori KPI harus Academic, Operational, Financial, atau Resource',
        'any.required': 'Kategori KPI wajib diisi'
    }),
    kpiName: joi_1.default.string()
        .min(3)
        .max(200)
        .required()
        .messages({
        'string.min': 'Nama KPI minimal 3 karakter',
        'string.max': 'Nama KPI maksimal 200 karakter',
        'any.required': 'Nama KPI wajib diisi'
    }),
    academicYear: joi_1.default.string()
        .pattern(/^\d{4}$/)
        .required()
        .messages({
        'string.pattern.base': 'Format tahun akademik tidak valid (contoh: 2024)',
        'any.required': 'Tahun akademik wajib diisi'
    }),
    period: joi_1.default.string()
        .valid('Semester 1', 'Semester 2', 'Tahunan')
        .required()
        .messages({
        'any.only': 'Period harus Semester 1, Semester 2, atau Tahunan',
        'any.required': 'Period wajib diisi'
    }),
    targetValue: joi_1.default.number()
        .min(0)
        .max(1000)
        .required()
        .messages({
        'number.base': 'Target value harus berupa angka',
        'number.min': 'Target value minimal 0',
        'number.max': 'Target value maksimal 1000',
        'any.required': 'Target value wajib diisi'
    }),
    achievedValue: joi_1.default.number()
        .min(0)
        .max(1000)
        .optional()
        .messages({
        'number.base': 'Achieved value harus berupa angka',
        'number.min': 'Achieved value minimal 0',
        'number.max': 'Achieved value maksimal 1000'
    }),
    achievementPercentage: joi_1.default.number()
        .min(0)
        .max(200)
        .optional()
        .messages({
        'number.base': 'Achievement percentage harus berupa angka',
        'number.min': 'Achievement percentage minimal 0',
        'number.max': 'Achievement percentage maksimal 200'
    }),
    trend: joi_1.default.string()
        .valid('increasing', 'stable', 'decreasing')
        .optional()
        .messages({
        'any.only': 'Trend harus increasing, stable, atau decreasing'
    }),
    priority: joi_1.default.number()
        .integer()
        .min(1)
        .max(5)
        .optional()
        .default(3)
        .messages({
        'number.base': 'Priority harus berupa angka',
        'number.integer': 'Priority harus berupa bilangan bulat',
        'number.min': 'Priority minimal 1',
        'number.max': 'Priority maksimal 5'
    }),
    analysis: joi_1.default.string()
        .max(1000)
        .optional()
        .allow('')
        .messages({
        'string.max': 'Analisis maksimal 1000 karakter'
    })
});
// Validation for updating KPI
exports.updateKPIValidation = joi_1.default.object({
    kpiCategory: joi_1.default.string()
        .valid('Academic', 'Operational', 'Financial', 'Resource')
        .optional()
        .messages({
        'any.only': 'Kategori KPI harus Academic, Operational, Financial, atau Resource'
    }),
    kpiName: joi_1.default.string()
        .min(3)
        .max(200)
        .optional()
        .messages({
        'string.min': 'Nama KPI minimal 3 karakter',
        'string.max': 'Nama KPI maksimal 200 karakter'
    }),
    targetValue: joi_1.default.number()
        .min(0)
        .max(1000)
        .optional()
        .messages({
        'number.base': 'Target value harus berupa angka',
        'number.min': 'Target value minimal 0',
        'number.max': 'Target value maksimal 1000'
    }),
    achievedValue: joi_1.default.number()
        .min(0)
        .max(1000)
        .optional()
        .messages({
        'number.base': 'Achieved value harus berupa angka',
        'number.min': 'Achieved value minimal 0',
        'number.max': 'Achieved value maksimal 1000'
    }),
    achievementPercentage: joi_1.default.number()
        .min(0)
        .max(200)
        .optional()
        .messages({
        'number.base': 'Achievement percentage harus berupa angka',
        'number.min': 'Achievement percentage minimal 0',
        'number.max': 'Achievement percentage maksimal 200'
    }),
    trend: joi_1.default.string()
        .valid('increasing', 'stable', 'decreasing')
        .optional()
        .messages({
        'any.only': 'Trend harus increasing, stable, atau decreasing'
    }),
    priority: joi_1.default.number()
        .integer()
        .min(1)
        .max(5)
        .optional()
        .messages({
        'number.base': 'Priority harus berupa angka',
        'number.integer': 'Priority harus berupa bilangan bulat',
        'number.min': 'Priority minimal 1',
        'number.max': 'Priority maksimal 5'
    }),
    analysis: joi_1.default.string()
        .max(1000)
        .optional()
        .allow('')
        .messages({
        'string.max': 'Analisis maksimal 1000 karakter'
    })
});
// Validation for export report
exports.exportKPIReportValidation = joi_1.default.object({
    academicYear: joi_1.default.string()
        .pattern(/^\d{4}$/)
        .required()
        .messages({
        'string.pattern.base': 'Format tahun akademik tidak valid (contoh: 2024)',
        'any.required': 'Tahun akademik wajib diisi'
    }),
    period: joi_1.default.string()
        .valid('Semester 1', 'Semester 2', 'Tahunan')
        .required()
        .messages({
        'any.only': 'Period harus Semester 1, Semester 2, atau Tahunan',
        'any.required': 'Period wajib diisi'
    }),
    format: joi_1.default.string()
        .valid('csv', 'excel', 'pdf')
        .optional()
        .default('csv')
        .messages({
        'any.only': 'Format export harus csv, excel, atau pdf'
    }),
    categories: joi_1.default.array()
        .items(joi_1.default.string().valid('Academic', 'Operational', 'Financial', 'Resource'))
        .optional()
        .messages({
        'array.base': 'Categories harus berupa array',
        'any.only': 'Kategori harus Academic, Operational, Financial, atau Resource'
    })
});
// Validation for KPI ID parameter
exports.kpiIdValidation = joi_1.default.object({
    id: joi_1.default.number()
        .integer()
        .positive()
        .required()
        .messages({
        'number.base': 'KPI ID harus berupa angka',
        'number.integer': 'KPI ID harus berupa bilangan bulat',
        'number.positive': 'KPI ID harus positif',
        'any.required': 'KPI ID wajib diisi'
    })
});
// Validation for statistics filters
exports.getKPIStatisticsValidation = joi_1.default.object({
    academicYear: joi_1.default.string()
        .pattern(/^\d{4}$/)
        .optional()
        .messages({
        'string.pattern.base': 'Format tahun akademik tidak valid (contoh: 2024)'
    }),
    period: joi_1.default.string()
        .valid('Semester 1', 'Semester 2', 'Tahunan')
        .optional()
        .messages({
        'any.only': 'Period harus Semester 1, Semester 2, atau Tahunan'
    }),
    includeAnalysis: joi_1.default.boolean()
        .optional()
        .default(false)
        .messages({
        'boolean.base': 'Include analysis harus berupa boolean'
    })
});
