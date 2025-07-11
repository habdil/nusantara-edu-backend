import Joi from 'joi';

// ===== ASSET VALIDATIONS =====

// Validation for getting assets with query parameters
export const getAssetsValidation = Joi.object({
  category: Joi.string()
    .optional()
    .messages({
      'string.base': 'Kategori aset harus berupa string'
    }),
  condition: Joi.string()
    .valid('good', 'minor_damage', 'major_damage', 'under_repair')
    .optional()
    .messages({
      'any.only': 'Kondisi harus salah satu dari: good, minor_damage, major_damage, under_repair'
    }),
  location: Joi.string()
    .optional()
    .messages({
      'string.base': 'Lokasi harus berupa string'
    }),
  search: Joi.string()
    .optional()
    .allow('')
    .messages({
      'string.base': 'Search query harus berupa string'
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
    })
});

// Validation for creating new asset
export const createAssetValidation = Joi.object({
  assetCode: Joi.string()
    .required()
    .max(50)
    .messages({
      'string.base': 'Kode aset harus berupa string',
      'string.max': 'Kode aset maksimal 50 karakter',
      'any.required': 'Kode aset wajib diisi'
    }),
  assetName: Joi.string()
    .required()
    .max(200)
    .messages({
      'string.base': 'Nama aset harus berupa string',
      'string.max': 'Nama aset maksimal 200 karakter',
      'any.required': 'Nama aset wajib diisi'
    }),
  assetCategory: Joi.string()
    .required()
    .max(100)
    .messages({
      'string.base': 'Kategori aset harus berupa string',
      'string.max': 'Kategori aset maksimal 100 karakter',
      'any.required': 'Kategori aset wajib diisi'
    }),
  description: Joi.string()
    .optional()
    .allow('')
    .max(500)
    .messages({
      'string.base': 'Deskripsi harus berupa string',
      'string.max': 'Deskripsi maksimal 500 karakter'
    }),
  acquisitionDate: Joi.date()
    .required()
    .messages({
      'date.base': 'Tanggal akuisisi tidak valid',
      'any.required': 'Tanggal akuisisi wajib diisi'
    }),
  acquisitionValue: Joi.number()
    .positive()
    .required()
    .messages({
      'number.base': 'Nilai akuisisi harus berupa angka',
      'number.positive': 'Nilai akuisisi harus positif',
      'any.required': 'Nilai akuisisi wajib diisi'
    }),
  usefulLife: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Masa manfaat harus berupa angka',
      'number.integer': 'Masa manfaat harus berupa bilangan bulat',
      'number.positive': 'Masa manfaat harus positif'
    }),
  condition: Joi.string()
    .valid('good', 'minor_damage', 'major_damage', 'under_repair')
    .required()
    .messages({
      'any.only': 'Kondisi harus salah satu dari: good, minor_damage, major_damage, under_repair',
      'any.required': 'Kondisi wajib diisi'
    }),
  location: Joi.string()
    .optional()
    .allow('')
    .max(200)
    .messages({
      'string.base': 'Lokasi harus berupa string',
      'string.max': 'Lokasi maksimal 200 karakter'
    }),
  notes: Joi.string()
    .optional()
    .allow('')
    .max(500)
    .messages({
      'string.base': 'Catatan harus berupa string',
      'string.max': 'Catatan maksimal 500 karakter'
    }),
  qrCode: Joi.string()
    .optional()
    .allow('')
    .max(100)
    .messages({
      'string.base': 'QR Code harus berupa string',
      'string.max': 'QR Code maksimal 100 karakter'
    }),
  assetPhoto: Joi.string()
    .optional()
    .allow('')
    .max(500)
    .messages({
      'string.base': 'Foto aset harus berupa string',
      'string.max': 'Foto aset maksimal 500 karakter'
    })
});

// Validation for updating asset
export const updateAssetValidation = Joi.object({
  assetName: Joi.string()
    .optional()
    .max(200)
    .messages({
      'string.base': 'Nama aset harus berupa string',
      'string.max': 'Nama aset maksimal 200 karakter'
    }),
  assetCategory: Joi.string()
    .optional()
    .max(100)
    .messages({
      'string.base': 'Kategori aset harus berupa string',
      'string.max': 'Kategori aset maksimal 100 karakter'
    }),
  description: Joi.string()
    .optional()
    .allow('')
    .max(500)
    .messages({
      'string.base': 'Deskripsi harus berupa string',
      'string.max': 'Deskripsi maksimal 500 karakter'
    }),
  condition: Joi.string()
    .valid('good', 'minor_damage', 'major_damage', 'under_repair')
    .optional()
    .messages({
      'any.only': 'Kondisi harus salah satu dari: good, minor_damage, major_damage, under_repair'
    }),
  location: Joi.string()
    .optional()
    .allow('')
    .max(200)
    .messages({
      'string.base': 'Lokasi harus berupa string',
      'string.max': 'Lokasi maksimal 200 karakter'
    }),
  notes: Joi.string()
    .optional()
    .allow('')
    .max(500)
    .messages({
      'string.base': 'Catatan harus berupa string',
      'string.max': 'Catatan maksimal 500 karakter'
    }),
  assetPhoto: Joi.string()
    .optional()
    .allow('')
    .max(500)
    .messages({
      'string.base': 'Foto aset harus berupa string',
      'string.max': 'Foto aset maksimal 500 karakter'
    })
});

// ===== ASSET MAINTENANCE VALIDATIONS =====

// Validation for getting asset maintenance records
export const getMaintenanceValidation = Joi.object({
  assetId: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Asset ID harus berupa angka',
      'number.integer': 'Asset ID harus berupa bilangan bulat',
      'number.positive': 'Asset ID harus positif'
    }),
  maintenanceType: Joi.string()
    .optional()
    .messages({
      'string.base': 'Tipe maintenance harus berupa string'
    }),
  dateFrom: Joi.date()
    .optional()
    .messages({
      'date.base': 'Tanggal dari tidak valid'
    }),
  dateTo: Joi.date()
    .optional()
    .min(Joi.ref('dateFrom'))
    .messages({
      'date.base': 'Tanggal sampai tidak valid',
      'date.min': 'Tanggal sampai harus setelah tanggal dari'
    })
});

// Validation for creating asset maintenance
export const createMaintenanceValidation = Joi.object({
  assetId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Asset ID harus berupa angka',
      'number.integer': 'Asset ID harus berupa bilangan bulat',
      'number.positive': 'Asset ID harus positif',
      'any.required': 'Asset ID wajib diisi'
    }),
  maintenanceDate: Joi.date()
    .required()
    .messages({
      'date.base': 'Tanggal maintenance tidak valid',
      'any.required': 'Tanggal maintenance wajib diisi'
    }),
  maintenanceType: Joi.string()
    .required()
    .max(100)
    .messages({
      'string.base': 'Tipe maintenance harus berupa string',
      'string.max': 'Tipe maintenance maksimal 100 karakter',
      'any.required': 'Tipe maintenance wajib diisi'
    }),
  description: Joi.string()
    .optional()
    .allow('')
    .max(500)
    .messages({
      'string.base': 'Deskripsi harus berupa string',
      'string.max': 'Deskripsi maksimal 500 karakter'
    }),
  cost: Joi.number()
    .positive()
    .optional()
    .messages({
      'number.base': 'Biaya harus berupa angka',
      'number.positive': 'Biaya harus positif'
    }),
  technician: Joi.string()
    .optional()
    .allow('')
    .max(200)
    .messages({
      'string.base': 'Teknisi harus berupa string',
      'string.max': 'Teknisi maksimal 200 karakter'
    }),
  maintenanceResult: Joi.string()
    .optional()
    .allow('')
    .max(500)
    .messages({
      'string.base': 'Hasil maintenance harus berupa string',
      'string.max': 'Hasil maintenance maksimal 500 karakter'
    }),
  nextMaintenanceDate: Joi.date()
    .optional()
    .greater(Joi.ref('maintenanceDate'))
    .messages({
      'date.base': 'Tanggal maintenance selanjutnya tidak valid',
      'date.greater': 'Tanggal maintenance selanjutnya harus setelah tanggal maintenance'
    })
});

// ===== FACILITY VALIDATIONS =====

// Validation for getting facilities
export const getFacilitiesValidation = Joi.object({
  facilityType: Joi.string()
    .optional()
    .messages({
      'string.base': 'Tipe fasilitas harus berupa string'
    }),
  condition: Joi.string()
    .valid('good', 'minor_damage', 'major_damage', 'under_repair')
    .optional()
    .messages({
      'any.only': 'Kondisi harus salah satu dari: good, minor_damage, major_damage, under_repair'
    }),
  search: Joi.string()
    .optional()
    .allow('')
    .messages({
      'string.base': 'Search query harus berupa string'
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
    })
});

// Validation for creating facility
export const createFacilityValidation = Joi.object({
  facilityName: Joi.string()
    .required()
    .max(200)
    .messages({
      'string.base': 'Nama fasilitas harus berupa string',
      'string.max': 'Nama fasilitas maksimal 200 karakter',
      'any.required': 'Nama fasilitas wajib diisi'
    }),
  facilityType: Joi.string()
    .required()
    .max(100)
    .messages({
      'string.base': 'Tipe fasilitas harus berupa string',
      'string.max': 'Tipe fasilitas maksimal 100 karakter',
      'any.required': 'Tipe fasilitas wajib diisi'
    }),
  capacity: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Kapasitas harus berupa angka',
      'number.integer': 'Kapasitas harus berupa bilangan bulat',
      'number.positive': 'Kapasitas harus positif'
    }),
  location: Joi.string()
    .optional()
    .allow('')
    .max(200)
    .messages({
      'string.base': 'Lokasi harus berupa string',
      'string.max': 'Lokasi maksimal 200 karakter'
    }),
  condition: Joi.string()
    .valid('good', 'minor_damage', 'major_damage', 'under_repair')
    .optional()
    .messages({
      'any.only': 'Kondisi harus salah satu dari: good, minor_damage, major_damage, under_repair'
    }),
  notes: Joi.string()
    .optional()
    .allow('')
    .max(500)
    .messages({
      'string.base': 'Catatan harus berupa string',
      'string.max': 'Catatan maksimal 500 karakter'
    }),
  facilityPhoto: Joi.string()
    .optional()
    .allow('')
    .max(500)
    .messages({
      'string.base': 'Foto fasilitas harus berupa string',
      'string.max': 'Foto fasilitas maksimal 500 karakter'
    })
});

// Validation for updating facility
export const updateFacilityValidation = Joi.object({
  facilityName: Joi.string()
    .optional()
    .max(200)
    .messages({
      'string.base': 'Nama fasilitas harus berupa string',
      'string.max': 'Nama fasilitas maksimal 200 karakter'
    }),
  facilityType: Joi.string()
    .optional()
    .max(100)
    .messages({
      'string.base': 'Tipe fasilitas harus berupa string',
      'string.max': 'Tipe fasilitas maksimal 100 karakter'
    }),
  capacity: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Kapasitas harus berupa angka',
      'number.integer': 'Kapasitas harus berupa bilangan bulat',
      'number.positive': 'Kapasitas harus positif'
    }),
  location: Joi.string()
    .optional()
    .allow('')
    .max(200)
    .messages({
      'string.base': 'Lokasi harus berupa string',
      'string.max': 'Lokasi maksimal 200 karakter'
    }),
  condition: Joi.string()
    .valid('good', 'minor_damage', 'major_damage', 'under_repair')
    .optional()
    .messages({
      'any.only': 'Kondisi harus salah satu dari: good, minor_damage, major_damage, under_repair'
    }),
  notes: Joi.string()
    .optional()
    .allow('')
    .max(500)
    .messages({
      'string.base': 'Catatan harus berupa string',
      'string.max': 'Catatan maksimal 500 karakter'
    }),
  facilityPhoto: Joi.string()
    .optional()
    .allow('')
    .max(500)
    .messages({
      'string.base': 'Foto fasilitas harus berupa string',
      'string.max': 'Foto fasilitas maksimal 500 karakter'
    })
});

// ===== FINANCE VALIDATIONS =====

// Validation for getting budgets/school finances
export const getBudgetsValidation = Joi.object({
  budgetYear: Joi.string()
    .pattern(/^\d{4}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Format tahun anggaran tidak valid (contoh: 2024)'
    }),
  period: Joi.string()
    .optional()
    .messages({
      'string.base': 'Periode harus berupa string'
    }),
  budgetCategory: Joi.string()
    .optional()
    .messages({
      'string.base': 'Kategori anggaran harus berupa string'
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
    })
});

// Validation for creating budget
export const createBudgetValidation = Joi.object({
  budgetYear: Joi.string()
    .pattern(/^\d{4}$/)
    .required()
    .messages({
      'string.pattern.base': 'Format tahun anggaran tidak valid (contoh: 2024)',
      'any.required': 'Tahun anggaran wajib diisi'
    }),
  period: Joi.string()
    .required()
    .max(50)
    .messages({
      'string.base': 'Periode harus berupa string',
      'string.max': 'Periode maksimal 50 karakter',
      'any.required': 'Periode wajib diisi'
    }),
  budgetCategory: Joi.string()
    .required()
    .max(100)
    .messages({
      'string.base': 'Kategori anggaran harus berupa string',
      'string.max': 'Kategori anggaran maksimal 100 karakter',
      'any.required': 'Kategori anggaran wajib diisi'
    }),
  budgetAmount: Joi.number()
    .positive()
    .required()
    .messages({
      'number.base': 'Jumlah anggaran harus berupa angka',
      'number.positive': 'Jumlah anggaran harus positif',
      'any.required': 'Jumlah anggaran wajib diisi'
    }),
  notes: Joi.string()
    .optional()
    .allow('')
    .max(500)
    .messages({
      'string.base': 'Catatan harus berupa string',
      'string.max': 'Catatan maksimal 500 karakter'
    })
});

// Validation for updating budget
export const updateBudgetValidation = Joi.object({
  budgetAmount: Joi.number()
    .positive()
    .optional()
    .messages({
      'number.base': 'Jumlah anggaran harus berupa angka',
      'number.positive': 'Jumlah anggaran harus positif'
    }),
  notes: Joi.string()
    .optional()
    .allow('')
    .max(500)
    .messages({
      'string.base': 'Catatan harus berupa string',
      'string.max': 'Catatan maksimal 500 karakter'
    })
});

// ===== FINANCIAL TRANSACTION VALIDATIONS =====

// Validation for getting financial transactions
export const getTransactionsValidation = Joi.object({
  schoolFinanceId: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'School Finance ID harus berupa angka',
      'number.integer': 'School Finance ID harus berupa bilangan bulat',
      'number.positive': 'School Finance ID harus positif'
    }),
  transactionType: Joi.string()
    .valid('income', 'expense')
    .optional()
    .messages({
      'any.only': 'Tipe transaksi harus income atau expense'
    }),
  dateFrom: Joi.date()
    .optional()
    .messages({
      'date.base': 'Tanggal dari tidak valid'
    }),
  dateTo: Joi.date()
    .optional()
    .min(Joi.ref('dateFrom'))
    .messages({
      'date.base': 'Tanggal sampai tidak valid',
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
    })
});

// Validation for creating financial transaction
export const createTransactionValidation = Joi.object({
  schoolFinanceId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'School Finance ID harus berupa angka',
      'number.integer': 'School Finance ID harus berupa bilangan bulat',
      'number.positive': 'School Finance ID harus positif',
      'any.required': 'School Finance ID wajib diisi'
    }),
  transactionDate: Joi.date()
    .required()
    .messages({
      'date.base': 'Tanggal transaksi tidak valid',
      'any.required': 'Tanggal transaksi wajib diisi'
    }),
  transactionType: Joi.string()
    .valid('income', 'expense')
    .required()
    .messages({
      'any.only': 'Tipe transaksi harus income atau expense',
      'any.required': 'Tipe transaksi wajib diisi'
    }),
  amount: Joi.number()
    .positive()
    .required()
    .messages({
      'number.base': 'Jumlah harus berupa angka',
      'number.positive': 'Jumlah harus positif',
      'any.required': 'Jumlah wajib diisi'
    }),
  description: Joi.string()
    .required()
    .max(500)
    .messages({
      'string.base': 'Deskripsi harus berupa string',
      'string.max': 'Deskripsi maksimal 500 karakter',
      'any.required': 'Deskripsi wajib diisi'
    }),
  transactionCategory: Joi.string()
    .optional()
    .allow('')
    .max(100)
    .messages({
      'string.base': 'Kategori transaksi harus berupa string',
      'string.max': 'Kategori transaksi maksimal 100 karakter'
    }),
  transactionProof: Joi.string()
    .optional()
    .allow('')
    .max(500)
    .messages({
      'string.base': 'Bukti transaksi harus berupa string',
      'string.max': 'Bukti transaksi maksimal 500 karakter'
    })
});