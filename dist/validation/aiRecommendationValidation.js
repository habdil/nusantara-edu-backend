"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.recommendationExportValidation = exports.recommendationAnalyticsValidation = exports.recommendationFiltersValidation = exports.createRecommendationValidation = exports.bulkUpdateValidation = exports.updateRecommendationValidation = exports.getRecommendationsValidation = void 0;
// src/validation/aiRecommendationValidation.ts
const joi_1 = __importDefault(require("joi"));
// Validation for getting recommendations with filters
exports.getRecommendationsValidation = joi_1.default.object({
    category: joi_1.default.string()
        .valid('academic', 'financial', 'asset', 'teacher', 'attendance')
        .optional()
        .messages({
        'any.only': 'Category harus salah satu dari: academic, financial, asset, teacher, attendance'
    }),
    implementationStatus: joi_1.default.string()
        .valid('pending', 'in_progress', 'approved', 'completed', 'rejected')
        .optional()
        .messages({
        'any.only': 'Implementation status harus salah satu dari: pending, in_progress, approved, completed, rejected'
    }),
    urgencyLevel: joi_1.default.string()
        .valid('low', 'medium', 'high', 'critical')
        .optional()
        .messages({
        'any.only': 'Urgency level harus salah satu dari: low, medium, high, critical'
    }),
    dateFrom: joi_1.default.date()
        .iso()
        .optional()
        .messages({
        'date.base': 'Tanggal dari tidak valid',
        'date.format': 'Format tanggal harus ISO (YYYY-MM-DD)'
    }),
    dateTo: joi_1.default.date()
        .iso()
        .optional()
        .min(joi_1.default.ref('dateFrom'))
        .messages({
        'date.base': 'Tanggal sampai tidak valid',
        'date.format': 'Format tanggal harus ISO (YYYY-MM-DD)',
        'date.min': 'Tanggal sampai harus setelah tanggal dari'
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
    }),
    confidenceThreshold: joi_1.default.number()
        .min(0)
        .max(1)
        .optional()
        .messages({
        'number.base': 'Confidence threshold harus berupa angka',
        'number.min': 'Confidence threshold minimal 0',
        'number.max': 'Confidence threshold maksimal 1'
    })
});
// Validation for updating recommendation
exports.updateRecommendationValidation = joi_1.default.object({
    implementationStatus: joi_1.default.string()
        .valid('pending', 'in_progress', 'approved', 'completed', 'rejected')
        .optional()
        .messages({
        'any.only': 'Implementation status harus salah satu dari: pending, in_progress, approved, completed, rejected'
    }),
    principalFeedback: joi_1.default.string()
        .max(1000)
        .optional()
        .allow('')
        .messages({
        'string.max': 'Feedback maksimal 1000 karakter'
    })
}).min(1).messages({
    'object.min': 'Minimal satu field harus diisi'
});
// Validation for bulk update status
exports.bulkUpdateValidation = joi_1.default.object({
    ids: joi_1.default.array()
        .items(joi_1.default.number()
        .integer()
        .positive()
        .required())
        .min(1)
        .max(50)
        .required()
        .messages({
        'array.base': 'IDs harus berupa array',
        'array.min': 'Minimal 1 ID harus dipilih',
        'array.max': 'Maksimal 50 ID dapat diupdate sekaligus',
        'any.required': 'IDs wajib diisi'
    }),
    status: joi_1.default.string()
        .valid('pending', 'in_progress', 'approved', 'completed', 'rejected')
        .required()
        .messages({
        'any.only': 'Status harus salah satu dari: pending, in_progress, approved, completed, rejected',
        'any.required': 'Status wajib diisi'
    })
});
// Validation for creating recommendation (untuk internal use)
exports.createRecommendationValidation = joi_1.default.object({
    schoolId: joi_1.default.number()
        .integer()
        .positive()
        .required()
        .messages({
        'number.base': 'School ID harus berupa angka',
        'number.integer': 'School ID harus berupa bilangan bulat',
        'number.positive': 'School ID harus positif',
        'any.required': 'School ID wajib diisi'
    }),
    category: joi_1.default.string()
        .valid('academic', 'financial', 'asset', 'teacher', 'attendance')
        .required()
        .messages({
        'any.only': 'Category harus salah satu dari: academic, financial, asset, teacher, attendance',
        'any.required': 'Category wajib diisi'
    }),
    title: joi_1.default.string()
        .min(5)
        .max(200)
        .required()
        .messages({
        'string.min': 'Title minimal 5 karakter',
        'string.max': 'Title maksimal 200 karakter',
        'any.required': 'Title wajib diisi'
    }),
    description: joi_1.default.string()
        .min(20)
        .max(2000)
        .required()
        .messages({
        'string.min': 'Description minimal 20 karakter',
        'string.max': 'Description maksimal 2000 karakter',
        'any.required': 'Description wajib diisi'
    }),
    supportingData: joi_1.default.object()
        .optional()
        .messages({
        'object.base': 'Supporting data harus berupa object'
    }),
    confidenceLevel: joi_1.default.number()
        .min(0)
        .max(1)
        .required()
        .messages({
        'number.base': 'Confidence level harus berupa angka',
        'number.min': 'Confidence level minimal 0',
        'number.max': 'Confidence level maksimal 1',
        'any.required': 'Confidence level wajib diisi'
    }),
    predictedImpact: joi_1.default.string()
        .max(500)
        .optional()
        .allow('')
        .messages({
        'string.max': 'Predicted impact maksimal 500 karakter'
    }),
    implementationStatus: joi_1.default.string()
        .valid('pending', 'in_progress', 'approved', 'completed', 'rejected')
        .optional()
        .default('pending')
        .messages({
        'any.only': 'Implementation status harus salah satu dari: pending, in_progress, approved, completed, rejected'
    }),
    principalFeedback: joi_1.default.string()
        .max(1000)
        .optional()
        .allow('')
        .messages({
        'string.max': 'Principal feedback maksimal 1000 karakter'
    })
});
// Validation for recommendation filters (frontend specific)
exports.recommendationFiltersValidation = joi_1.default.object({
    search: joi_1.default.string()
        .max(100)
        .optional()
        .allow('')
        .messages({
        'string.max': 'Search query maksimal 100 karakter'
    }),
    sortBy: joi_1.default.string()
        .valid('generatedDate', 'confidenceLevel', 'title', 'category', 'implementationStatus')
        .optional()
        .default('generatedDate')
        .messages({
        'any.only': 'Sort by harus salah satu dari: generatedDate, confidenceLevel, title, category, implementationStatus'
    }),
    sortOrder: joi_1.default.string()
        .valid('asc', 'desc')
        .optional()
        .default('desc')
        .messages({
        'any.only': 'Sort order harus asc atau desc'
    }),
    showCompleted: joi_1.default.boolean()
        .optional()
        .default(false)
        .messages({
        'boolean.base': 'Show completed harus berupa boolean'
    }),
    minConfidence: joi_1.default.number()
        .min(0)
        .max(1)
        .optional()
        .messages({
        'number.base': 'Min confidence harus berupa angka',
        'number.min': 'Min confidence minimal 0',
        'number.max': 'Min confidence maksimal 1'
    })
});
// Validation for recommendation analytics
exports.recommendationAnalyticsValidation = joi_1.default.object({
    period: joi_1.default.string()
        .valid('7d', '30d', '90d', '1y')
        .optional()
        .default('30d')
        .messages({
        'any.only': 'Period harus salah satu dari: 7d, 30d, 90d, 1y'
    }),
    groupBy: joi_1.default.string()
        .valid('category', 'status', 'urgency', 'confidence', 'date')
        .optional()
        .default('category')
        .messages({
        'any.only': 'Group by harus salah satu dari: category, status, urgency, confidence, date'
    }),
    includeDetails: joi_1.default.boolean()
        .optional()
        .default(false)
        .messages({
        'boolean.base': 'Include details harus berupa boolean'
    })
});
// Validation for recommendation export
exports.recommendationExportValidation = joi_1.default.object({
    format: joi_1.default.string()
        .valid('json', 'csv', 'excel', 'pdf')
        .optional()
        .default('json')
        .messages({
        'any.only': 'Format harus salah satu dari: json, csv, excel, pdf'
    }),
    includeMetadata: joi_1.default.boolean()
        .optional()
        .default(true)
        .messages({
        'boolean.base': 'Include metadata harus berupa boolean'
    }),
    dateRange: joi_1.default.object({
        from: joi_1.default.date().iso().required(),
        to: joi_1.default.date().iso().min(joi_1.default.ref('from')).required()
    })
        .optional()
        .messages({
        'object.base': 'Date range harus berupa object dengan from dan to'
    }),
    categories: joi_1.default.array()
        .items(joi_1.default.string().valid('academic', 'financial', 'asset', 'teacher', 'attendance'))
        .optional()
        .messages({
        'array.base': 'Categories harus berupa array'
    })
});
exports.default = {
    getRecommendationsValidation: exports.getRecommendationsValidation,
    updateRecommendationValidation: exports.updateRecommendationValidation,
    bulkUpdateValidation: exports.bulkUpdateValidation,
    createRecommendationValidation: exports.createRecommendationValidation,
    recommendationFiltersValidation: exports.recommendationFiltersValidation,
    recommendationAnalyticsValidation: exports.recommendationAnalyticsValidation,
    recommendationExportValidation: exports.recommendationExportValidation
};
