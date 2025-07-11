import Joi from 'joi';

// Validation for getting KPIs with filters
export const getKPIsValidation = Joi.object({
  academicYear: Joi.string()
    .pattern(/^\d{4}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Format tahun akademik tidak valid (contoh: 2024)'
    }),
  period: Joi.string()
    .valid('Semester 1', 'Semester 2', 'Tahunan')
    .optional()
    .messages({
      'any.only': 'Period harus Semester 1, Semester 2, atau Tahunan'
    }),
  kpiCategory: Joi.string()
    .valid('Academic', 'Operational', 'Financial', 'Resource')
    .optional()
    .messages({
      'any.only': 'Kategori KPI harus Academic, Operational, Financial, atau Resource'
    }),
  priority: Joi.number()
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
  trend: Joi.string()
    .valid('increasing', 'stable', 'decreasing')
    .optional()
    .messages({
      'any.only': 'Trend harus increasing, stable, atau decreasing'
    })
});

// Validation for getting KPIs by category
export const getKPIsByCategoryValidation = Joi.object({
  category: Joi.string()
    .valid('Academic', 'Operational', 'Financial', 'Resource')
    .required()
    .messages({
      'any.only': 'Kategori KPI harus Academic, Operational, Financial, atau Resource',
      'any.required': 'Kategori KPI wajib diisi'
    })
});

// Validation for getting KPIs by priority
export const getKPIsByPriorityValidation = Joi.object({
  priority: Joi.number()
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
export const createKPIValidation = Joi.object({
  kpiCategory: Joi.string()
    .valid('Academic', 'Operational', 'Financial', 'Resource')
    .required()
    .messages({
      'any.only': 'Kategori KPI harus Academic, Operational, Financial, atau Resource',
      'any.required': 'Kategori KPI wajib diisi'
    }),
  kpiName: Joi.string()
    .min(3)
    .max(200)
    .required()
    .messages({
      'string.min': 'Nama KPI minimal 3 karakter',
      'string.max': 'Nama KPI maksimal 200 karakter',
      'any.required': 'Nama KPI wajib diisi'
    }),
  academicYear: Joi.string()
    .pattern(/^\d{4}$/)
    .required()
    .messages({
      'string.pattern.base': 'Format tahun akademik tidak valid (contoh: 2024)',
      'any.required': 'Tahun akademik wajib diisi'
    }),
  period: Joi.string()
    .valid('Semester 1', 'Semester 2', 'Tahunan')
    .required()
    .messages({
      'any.only': 'Period harus Semester 1, Semester 2, atau Tahunan',
      'any.required': 'Period wajib diisi'
    }),
  targetValue: Joi.number()
    .min(0)
    .max(1000)
    .required()
    .messages({
      'number.base': 'Target value harus berupa angka',
      'number.min': 'Target value minimal 0',
      'number.max': 'Target value maksimal 1000',
      'any.required': 'Target value wajib diisi'
    }),
  achievedValue: Joi.number()
    .min(0)
    .max(1000)
    .optional()
    .messages({
      'number.base': 'Achieved value harus berupa angka',
      'number.min': 'Achieved value minimal 0',
      'number.max': 'Achieved value maksimal 1000'
    }),
  achievementPercentage: Joi.number()
    .min(0)
    .max(200)
    .optional()
    .messages({
      'number.base': 'Achievement percentage harus berupa angka',
      'number.min': 'Achievement percentage minimal 0',
      'number.max': 'Achievement percentage maksimal 200'
    }),
  trend: Joi.string()
    .valid('increasing', 'stable', 'decreasing')
    .optional()
    .messages({
      'any.only': 'Trend harus increasing, stable, atau decreasing'
    }),
  priority: Joi.number()
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
  analysis: Joi.string()
    .max(1000)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Analisis maksimal 1000 karakter'
    })
});

// Validation for updating KPI
export const updateKPIValidation = Joi.object({
  kpiCategory: Joi.string()
    .valid('Academic', 'Operational', 'Financial', 'Resource')
    .optional()
    .messages({
      'any.only': 'Kategori KPI harus Academic, Operational, Financial, atau Resource'
    }),
  kpiName: Joi.string()
    .min(3)
    .max(200)
    .optional()
    .messages({
      'string.min': 'Nama KPI minimal 3 karakter',
      'string.max': 'Nama KPI maksimal 200 karakter'
    }),
  targetValue: Joi.number()
    .min(0)
    .max(1000)
    .optional()
    .messages({
      'number.base': 'Target value harus berupa angka',
      'number.min': 'Target value minimal 0',
      'number.max': 'Target value maksimal 1000'
    }),
  achievedValue: Joi.number()
    .min(0)
    .max(1000)
    .optional()
    .messages({
      'number.base': 'Achieved value harus berupa angka',
      'number.min': 'Achieved value minimal 0',
      'number.max': 'Achieved value maksimal 1000'
    }),
  achievementPercentage: Joi.number()
    .min(0)
    .max(200)
    .optional()
    .messages({
      'number.base': 'Achievement percentage harus berupa angka',
      'number.min': 'Achievement percentage minimal 0',
      'number.max': 'Achievement percentage maksimal 200'
    }),
  trend: Joi.string()
    .valid('increasing', 'stable', 'decreasing')
    .optional()
    .messages({
      'any.only': 'Trend harus increasing, stable, atau decreasing'
    }),
  priority: Joi.number()
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
  analysis: Joi.string()
    .max(1000)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Analisis maksimal 1000 karakter'
    })
});

// Validation for export report
export const exportKPIReportValidation = Joi.object({
  academicYear: Joi.string()
    .pattern(/^\d{4}$/)
    .required()
    .messages({
      'string.pattern.base': 'Format tahun akademik tidak valid (contoh: 2024)',
      'any.required': 'Tahun akademik wajib diisi'
    }),
  period: Joi.string()
    .valid('Semester 1', 'Semester 2', 'Tahunan')
    .required()
    .messages({
      'any.only': 'Period harus Semester 1, Semester 2, atau Tahunan',
      'any.required': 'Period wajib diisi'
    }),
  format: Joi.string()
    .valid('csv', 'excel', 'pdf')
    .optional()
    .default('csv')
    .messages({
      'any.only': 'Format export harus csv, excel, atau pdf'
    }),
  categories: Joi.array()
    .items(Joi.string().valid('Academic', 'Operational', 'Financial', 'Resource'))
    .optional()
    .messages({
      'array.base': 'Categories harus berupa array',
      'any.only': 'Kategori harus Academic, Operational, Financial, atau Resource'
    })
});

// Validation for KPI ID parameter
export const kpiIdValidation = Joi.object({
  id: Joi.number()
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
export const getKPIStatisticsValidation = Joi.object({
  academicYear: Joi.string()
    .pattern(/^\d{4}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Format tahun akademik tidak valid (contoh: 2024)'
    }),
  period: Joi.string()
    .valid('Semester 1', 'Semester 2', 'Tahunan')
    .optional()
    .messages({
      'any.only': 'Period harus Semester 1, Semester 2, atau Tahunan'
    }),
  includeAnalysis: Joi.boolean()
    .optional()
    .default(false)
    .messages({
      'boolean.base': 'Include analysis harus berupa boolean'
    })
});