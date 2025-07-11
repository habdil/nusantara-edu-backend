// src/validation/aiRecommendationValidation.ts
import Joi from 'joi';

// Validation for getting recommendations with filters
export const getRecommendationsValidation = Joi.object({
  category: Joi.string()
    .valid('academic', 'financial', 'asset', 'teacher', 'attendance')
    .optional()
    .messages({
      'any.only': 'Category harus salah satu dari: academic, financial, asset, teacher, attendance'
    }),

  implementationStatus: Joi.string()
    .valid('pending', 'in_progress', 'approved', 'completed', 'rejected')
    .optional()
    .messages({
      'any.only': 'Implementation status harus salah satu dari: pending, in_progress, approved, completed, rejected'
    }),

  urgencyLevel: Joi.string()
    .valid('low', 'medium', 'high', 'critical')
    .optional()
    .messages({
      'any.only': 'Urgency level harus salah satu dari: low, medium, high, critical'
    }),

  dateFrom: Joi.date()
    .iso()
    .optional()
    .messages({
      'date.base': 'Tanggal dari tidak valid',
      'date.format': 'Format tanggal harus ISO (YYYY-MM-DD)'
    }),

  dateTo: Joi.date()
    .iso()
    .optional()
    .min(Joi.ref('dateFrom'))
    .messages({
      'date.base': 'Tanggal sampai tidak valid',
      'date.format': 'Format tanggal harus ISO (YYYY-MM-DD)',
      'date.min': 'Tanggal sampai harus setelah tanggal dari'
    }),

  page: Joi.number()
    .integer()
    .min(1)
    .optional()
    .default(1)
    .messages({
      'number.base': 'Page harus berupa angka',
      'number.integer': 'Page harus berupa bilangan bulat',
      'number.min': 'Page minimal 1'
    }),

  limit: Joi.number()
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

  confidenceThreshold: Joi.number()
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
export const updateRecommendationValidation = Joi.object({
  implementationStatus: Joi.string()
    .valid('pending', 'in_progress', 'approved', 'completed', 'rejected')
    .optional()
    .messages({
      'any.only': 'Implementation status harus salah satu dari: pending, in_progress, approved, completed, rejected'
    }),

  principalFeedback: Joi.string()
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
export const bulkUpdateValidation = Joi.object({
  ids: Joi.array()
    .items(
      Joi.number()
        .integer()
        .positive()
        .required()
    )
    .min(1)
    .max(50)
    .required()
    .messages({
      'array.base': 'IDs harus berupa array',
      'array.min': 'Minimal 1 ID harus dipilih',
      'array.max': 'Maksimal 50 ID dapat diupdate sekaligus',
      'any.required': 'IDs wajib diisi'
    }),

  status: Joi.string()
    .valid('pending', 'in_progress', 'approved', 'completed', 'rejected')
    .required()
    .messages({
      'any.only': 'Status harus salah satu dari: pending, in_progress, approved, completed, rejected',
      'any.required': 'Status wajib diisi'
    })
});

// Validation for creating recommendation (untuk internal use)
export const createRecommendationValidation = Joi.object({
  schoolId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'School ID harus berupa angka',
      'number.integer': 'School ID harus berupa bilangan bulat',
      'number.positive': 'School ID harus positif',
      'any.required': 'School ID wajib diisi'
    }),

  category: Joi.string()
    .valid('academic', 'financial', 'asset', 'teacher', 'attendance')
    .required()
    .messages({
      'any.only': 'Category harus salah satu dari: academic, financial, asset, teacher, attendance',
      'any.required': 'Category wajib diisi'
    }),

  title: Joi.string()
    .min(5)
    .max(200)
    .required()
    .messages({
      'string.min': 'Title minimal 5 karakter',
      'string.max': 'Title maksimal 200 karakter',
      'any.required': 'Title wajib diisi'
    }),

  description: Joi.string()
    .min(20)
    .max(2000)
    .required()
    .messages({
      'string.min': 'Description minimal 20 karakter',
      'string.max': 'Description maksimal 2000 karakter',
      'any.required': 'Description wajib diisi'
    }),

  supportingData: Joi.object()
    .optional()
    .messages({
      'object.base': 'Supporting data harus berupa object'
    }),

  confidenceLevel: Joi.number()
    .min(0)
    .max(1)
    .required()
    .messages({
      'number.base': 'Confidence level harus berupa angka',
      'number.min': 'Confidence level minimal 0',
      'number.max': 'Confidence level maksimal 1',
      'any.required': 'Confidence level wajib diisi'
    }),

  predictedImpact: Joi.string()
    .max(500)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Predicted impact maksimal 500 karakter'
    }),

  implementationStatus: Joi.string()
    .valid('pending', 'in_progress', 'approved', 'completed', 'rejected')
    .optional()
    .default('pending')
    .messages({
      'any.only': 'Implementation status harus salah satu dari: pending, in_progress, approved, completed, rejected'
    }),

  principalFeedback: Joi.string()
    .max(1000)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Principal feedback maksimal 1000 karakter'
    })
});

// Validation for recommendation filters (frontend specific)
export const recommendationFiltersValidation = Joi.object({
  search: Joi.string()
    .max(100)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Search query maksimal 100 karakter'
    }),

  sortBy: Joi.string()
    .valid('generatedDate', 'confidenceLevel', 'title', 'category', 'implementationStatus')
    .optional()
    .default('generatedDate')
    .messages({
      'any.only': 'Sort by harus salah satu dari: generatedDate, confidenceLevel, title, category, implementationStatus'
    }),

  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .optional()
    .default('desc')
    .messages({
      'any.only': 'Sort order harus asc atau desc'
    }),

  showCompleted: Joi.boolean()
    .optional()
    .default(false)
    .messages({
      'boolean.base': 'Show completed harus berupa boolean'
    }),

  minConfidence: Joi.number()
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
export const recommendationAnalyticsValidation = Joi.object({
  period: Joi.string()
    .valid('7d', '30d', '90d', '1y')
    .optional()
    .default('30d')
    .messages({
      'any.only': 'Period harus salah satu dari: 7d, 30d, 90d, 1y'
    }),

  groupBy: Joi.string()
    .valid('category', 'status', 'urgency', 'confidence', 'date')
    .optional()
    .default('category')
    .messages({
      'any.only': 'Group by harus salah satu dari: category, status, urgency, confidence, date'
    }),

  includeDetails: Joi.boolean()
    .optional()
    .default(false)
    .messages({
      'boolean.base': 'Include details harus berupa boolean'
    })
});

// Validation for recommendation export
export const recommendationExportValidation = Joi.object({
  format: Joi.string()
    .valid('json', 'csv', 'excel', 'pdf')
    .optional()
    .default('json')
    .messages({
      'any.only': 'Format harus salah satu dari: json, csv, excel, pdf'
    }),

  includeMetadata: Joi.boolean()
    .optional()
    .default(true)
    .messages({
      'boolean.base': 'Include metadata harus berupa boolean'
    }),

  dateRange: Joi.object({
    from: Joi.date().iso().required(),
    to: Joi.date().iso().min(Joi.ref('from')).required()
  })
    .optional()
    .messages({
      'object.base': 'Date range harus berupa object dengan from dan to'
    }),

  categories: Joi.array()
    .items(
      Joi.string().valid('academic', 'financial', 'asset', 'teacher', 'attendance')
    )
    .optional()
    .messages({
      'array.base': 'Categories harus berupa array'
    })
});

export default {
  getRecommendationsValidation,
  updateRecommendationValidation,
  bulkUpdateValidation,
  createRecommendationValidation,
  recommendationFiltersValidation,
  recommendationAnalyticsValidation,
  recommendationExportValidation
};