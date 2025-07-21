"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTransactionValidation = exports.getTransactionsValidation = exports.updateBudgetValidation = exports.createBudgetValidation = exports.getBudgetsValidation = exports.updateFacilityValidation = exports.createFacilityValidation = exports.getFacilitiesValidation = exports.createMaintenanceValidation = exports.getMaintenanceValidation = exports.updateAssetValidation = exports.createAssetValidation = exports.getAssetsValidation = void 0;
const joi_1 = __importDefault(require("joi"));
// ===== ASSET VALIDATIONS =====
// Validation for getting assets with query parameters
exports.getAssetsValidation = joi_1.default.object({
    category: joi_1.default.string()
        .optional()
        .messages({
        'string.base': 'Kategori aset harus berupa string'
    }),
    condition: joi_1.default.string()
        .valid('good', 'minor_damage', 'major_damage', 'under_repair')
        .optional()
        .messages({
        'any.only': 'Kondisi harus salah satu dari: good, minor_damage, major_damage, under_repair'
    }),
    location: joi_1.default.string()
        .optional()
        .messages({
        'string.base': 'Lokasi harus berupa string'
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
// Validation for creating new asset
exports.createAssetValidation = joi_1.default.object({
    assetCode: joi_1.default.string()
        .required()
        .max(50)
        .messages({
        'string.base': 'Kode aset harus berupa string',
        'string.max': 'Kode aset maksimal 50 karakter',
        'any.required': 'Kode aset wajib diisi'
    }),
    assetName: joi_1.default.string()
        .required()
        .max(200)
        .messages({
        'string.base': 'Nama aset harus berupa string',
        'string.max': 'Nama aset maksimal 200 karakter',
        'any.required': 'Nama aset wajib diisi'
    }),
    assetCategory: joi_1.default.string()
        .required()
        .max(100)
        .messages({
        'string.base': 'Kategori aset harus berupa string',
        'string.max': 'Kategori aset maksimal 100 karakter',
        'any.required': 'Kategori aset wajib diisi'
    }),
    description: joi_1.default.string()
        .optional()
        .allow('')
        .max(500)
        .messages({
        'string.base': 'Deskripsi harus berupa string',
        'string.max': 'Deskripsi maksimal 500 karakter'
    }),
    acquisitionDate: joi_1.default.date()
        .required()
        .messages({
        'date.base': 'Tanggal akuisisi tidak valid',
        'any.required': 'Tanggal akuisisi wajib diisi'
    }),
    acquisitionValue: joi_1.default.number()
        .positive()
        .required()
        .messages({
        'number.base': 'Nilai akuisisi harus berupa angka',
        'number.positive': 'Nilai akuisisi harus positif',
        'any.required': 'Nilai akuisisi wajib diisi'
    }),
    usefulLife: joi_1.default.number()
        .integer()
        .positive()
        .optional()
        .messages({
        'number.base': 'Masa manfaat harus berupa angka',
        'number.integer': 'Masa manfaat harus berupa bilangan bulat',
        'number.positive': 'Masa manfaat harus positif'
    }),
    condition: joi_1.default.string()
        .valid('good', 'minor_damage', 'major_damage', 'under_repair')
        .required()
        .messages({
        'any.only': 'Kondisi harus salah satu dari: good, minor_damage, major_damage, under_repair',
        'any.required': 'Kondisi wajib diisi'
    }),
    location: joi_1.default.string()
        .optional()
        .allow('')
        .max(200)
        .messages({
        'string.base': 'Lokasi harus berupa string',
        'string.max': 'Lokasi maksimal 200 karakter'
    }),
    notes: joi_1.default.string()
        .optional()
        .allow('')
        .max(500)
        .messages({
        'string.base': 'Catatan harus berupa string',
        'string.max': 'Catatan maksimal 500 karakter'
    }),
    qrCode: joi_1.default.string()
        .optional()
        .allow('')
        .max(100)
        .messages({
        'string.base': 'QR Code harus berupa string',
        'string.max': 'QR Code maksimal 100 karakter'
    }),
    assetPhoto: joi_1.default.string()
        .optional()
        .allow('')
        .max(500)
        .messages({
        'string.base': 'Foto aset harus berupa string',
        'string.max': 'Foto aset maksimal 500 karakter'
    })
});
// Validation for updating asset
exports.updateAssetValidation = joi_1.default.object({
    assetName: joi_1.default.string()
        .optional()
        .max(200)
        .messages({
        'string.base': 'Nama aset harus berupa string',
        'string.max': 'Nama aset maksimal 200 karakter'
    }),
    assetCategory: joi_1.default.string()
        .optional()
        .max(100)
        .messages({
        'string.base': 'Kategori aset harus berupa string',
        'string.max': 'Kategori aset maksimal 100 karakter'
    }),
    description: joi_1.default.string()
        .optional()
        .allow('')
        .max(500)
        .messages({
        'string.base': 'Deskripsi harus berupa string',
        'string.max': 'Deskripsi maksimal 500 karakter'
    }),
    condition: joi_1.default.string()
        .valid('good', 'minor_damage', 'major_damage', 'under_repair')
        .optional()
        .messages({
        'any.only': 'Kondisi harus salah satu dari: good, minor_damage, major_damage, under_repair'
    }),
    location: joi_1.default.string()
        .optional()
        .allow('')
        .max(200)
        .messages({
        'string.base': 'Lokasi harus berupa string',
        'string.max': 'Lokasi maksimal 200 karakter'
    }),
    notes: joi_1.default.string()
        .optional()
        .allow('')
        .max(500)
        .messages({
        'string.base': 'Catatan harus berupa string',
        'string.max': 'Catatan maksimal 500 karakter'
    }),
    assetPhoto: joi_1.default.string()
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
exports.getMaintenanceValidation = joi_1.default.object({
    assetId: joi_1.default.number()
        .integer()
        .positive()
        .optional()
        .messages({
        'number.base': 'Asset ID harus berupa angka',
        'number.integer': 'Asset ID harus berupa bilangan bulat',
        'number.positive': 'Asset ID harus positif'
    }),
    maintenanceType: joi_1.default.string()
        .optional()
        .messages({
        'string.base': 'Tipe maintenance harus berupa string'
    }),
    dateFrom: joi_1.default.date()
        .optional()
        .messages({
        'date.base': 'Tanggal dari tidak valid'
    }),
    dateTo: joi_1.default.date()
        .optional()
        .min(joi_1.default.ref('dateFrom'))
        .messages({
        'date.base': 'Tanggal sampai tidak valid',
        'date.min': 'Tanggal sampai harus setelah tanggal dari'
    })
});
// Validation for creating asset maintenance
exports.createMaintenanceValidation = joi_1.default.object({
    assetId: joi_1.default.number()
        .integer()
        .positive()
        .required()
        .messages({
        'number.base': 'Asset ID harus berupa angka',
        'number.integer': 'Asset ID harus berupa bilangan bulat',
        'number.positive': 'Asset ID harus positif',
        'any.required': 'Asset ID wajib diisi'
    }),
    maintenanceDate: joi_1.default.date()
        .required()
        .messages({
        'date.base': 'Tanggal maintenance tidak valid',
        'any.required': 'Tanggal maintenance wajib diisi'
    }),
    maintenanceType: joi_1.default.string()
        .required()
        .max(100)
        .messages({
        'string.base': 'Tipe maintenance harus berupa string',
        'string.max': 'Tipe maintenance maksimal 100 karakter',
        'any.required': 'Tipe maintenance wajib diisi'
    }),
    description: joi_1.default.string()
        .optional()
        .allow('')
        .max(500)
        .messages({
        'string.base': 'Deskripsi harus berupa string',
        'string.max': 'Deskripsi maksimal 500 karakter'
    }),
    cost: joi_1.default.number()
        .positive()
        .optional()
        .messages({
        'number.base': 'Biaya harus berupa angka',
        'number.positive': 'Biaya harus positif'
    }),
    technician: joi_1.default.string()
        .optional()
        .allow('')
        .max(200)
        .messages({
        'string.base': 'Teknisi harus berupa string',
        'string.max': 'Teknisi maksimal 200 karakter'
    }),
    maintenanceResult: joi_1.default.string()
        .optional()
        .allow('')
        .max(500)
        .messages({
        'string.base': 'Hasil maintenance harus berupa string',
        'string.max': 'Hasil maintenance maksimal 500 karakter'
    }),
    nextMaintenanceDate: joi_1.default.date()
        .optional()
        .greater(joi_1.default.ref('maintenanceDate'))
        .messages({
        'date.base': 'Tanggal maintenance selanjutnya tidak valid',
        'date.greater': 'Tanggal maintenance selanjutnya harus setelah tanggal maintenance'
    })
});
// ===== FACILITY VALIDATIONS =====
// Validation for getting facilities
exports.getFacilitiesValidation = joi_1.default.object({
    facilityType: joi_1.default.string()
        .optional()
        .messages({
        'string.base': 'Tipe fasilitas harus berupa string'
    }),
    condition: joi_1.default.string()
        .valid('good', 'minor_damage', 'major_damage', 'under_repair')
        .optional()
        .messages({
        'any.only': 'Kondisi harus salah satu dari: good, minor_damage, major_damage, under_repair'
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
// Validation for creating facility
exports.createFacilityValidation = joi_1.default.object({
    facilityName: joi_1.default.string()
        .required()
        .max(200)
        .messages({
        'string.base': 'Nama fasilitas harus berupa string',
        'string.max': 'Nama fasilitas maksimal 200 karakter',
        'any.required': 'Nama fasilitas wajib diisi'
    }),
    facilityType: joi_1.default.string()
        .required()
        .max(100)
        .messages({
        'string.base': 'Tipe fasilitas harus berupa string',
        'string.max': 'Tipe fasilitas maksimal 100 karakter',
        'any.required': 'Tipe fasilitas wajib diisi'
    }),
    capacity: joi_1.default.number()
        .integer()
        .positive()
        .optional()
        .messages({
        'number.base': 'Kapasitas harus berupa angka',
        'number.integer': 'Kapasitas harus berupa bilangan bulat',
        'number.positive': 'Kapasitas harus positif'
    }),
    location: joi_1.default.string()
        .optional()
        .allow('')
        .max(200)
        .messages({
        'string.base': 'Lokasi harus berupa string',
        'string.max': 'Lokasi maksimal 200 karakter'
    }),
    condition: joi_1.default.string()
        .valid('good', 'minor_damage', 'major_damage', 'under_repair')
        .optional()
        .messages({
        'any.only': 'Kondisi harus salah satu dari: good, minor_damage, major_damage, under_repair'
    }),
    notes: joi_1.default.string()
        .optional()
        .allow('')
        .max(500)
        .messages({
        'string.base': 'Catatan harus berupa string',
        'string.max': 'Catatan maksimal 500 karakter'
    }),
    facilityPhoto: joi_1.default.string()
        .optional()
        .allow('')
        .max(500)
        .messages({
        'string.base': 'Foto fasilitas harus berupa string',
        'string.max': 'Foto fasilitas maksimal 500 karakter'
    })
});
// Validation for updating facility
exports.updateFacilityValidation = joi_1.default.object({
    facilityName: joi_1.default.string()
        .optional()
        .max(200)
        .messages({
        'string.base': 'Nama fasilitas harus berupa string',
        'string.max': 'Nama fasilitas maksimal 200 karakter'
    }),
    facilityType: joi_1.default.string()
        .optional()
        .max(100)
        .messages({
        'string.base': 'Tipe fasilitas harus berupa string',
        'string.max': 'Tipe fasilitas maksimal 100 karakter'
    }),
    capacity: joi_1.default.number()
        .integer()
        .positive()
        .optional()
        .messages({
        'number.base': 'Kapasitas harus berupa angka',
        'number.integer': 'Kapasitas harus berupa bilangan bulat',
        'number.positive': 'Kapasitas harus positif'
    }),
    location: joi_1.default.string()
        .optional()
        .allow('')
        .max(200)
        .messages({
        'string.base': 'Lokasi harus berupa string',
        'string.max': 'Lokasi maksimal 200 karakter'
    }),
    condition: joi_1.default.string()
        .valid('good', 'minor_damage', 'major_damage', 'under_repair')
        .optional()
        .messages({
        'any.only': 'Kondisi harus salah satu dari: good, minor_damage, major_damage, under_repair'
    }),
    notes: joi_1.default.string()
        .optional()
        .allow('')
        .max(500)
        .messages({
        'string.base': 'Catatan harus berupa string',
        'string.max': 'Catatan maksimal 500 karakter'
    }),
    facilityPhoto: joi_1.default.string()
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
exports.getBudgetsValidation = joi_1.default.object({
    budgetYear: joi_1.default.string()
        .pattern(/^\d{4}$/)
        .optional()
        .messages({
        'string.pattern.base': 'Format tahun anggaran tidak valid (contoh: 2024)'
    }),
    period: joi_1.default.string()
        .optional()
        .messages({
        'string.base': 'Periode harus berupa string'
    }),
    budgetCategory: joi_1.default.string()
        .optional()
        .messages({
        'string.base': 'Kategori anggaran harus berupa string'
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
// Validation for creating budget
exports.createBudgetValidation = joi_1.default.object({
    budgetYear: joi_1.default.string()
        .pattern(/^\d{4}$/)
        .required()
        .messages({
        'string.pattern.base': 'Format tahun anggaran tidak valid (contoh: 2024)',
        'any.required': 'Tahun anggaran wajib diisi'
    }),
    period: joi_1.default.string()
        .required()
        .max(50)
        .messages({
        'string.base': 'Periode harus berupa string',
        'string.max': 'Periode maksimal 50 karakter',
        'any.required': 'Periode wajib diisi'
    }),
    budgetCategory: joi_1.default.string()
        .required()
        .max(100)
        .messages({
        'string.base': 'Kategori anggaran harus berupa string',
        'string.max': 'Kategori anggaran maksimal 100 karakter',
        'any.required': 'Kategori anggaran wajib diisi'
    }),
    budgetAmount: joi_1.default.number()
        .positive()
        .required()
        .messages({
        'number.base': 'Jumlah anggaran harus berupa angka',
        'number.positive': 'Jumlah anggaran harus positif',
        'any.required': 'Jumlah anggaran wajib diisi'
    }),
    notes: joi_1.default.string()
        .optional()
        .allow('')
        .max(500)
        .messages({
        'string.base': 'Catatan harus berupa string',
        'string.max': 'Catatan maksimal 500 karakter'
    })
});
// Validation for updating budget
exports.updateBudgetValidation = joi_1.default.object({
    budgetAmount: joi_1.default.number()
        .positive()
        .optional()
        .messages({
        'number.base': 'Jumlah anggaran harus berupa angka',
        'number.positive': 'Jumlah anggaran harus positif'
    }),
    notes: joi_1.default.string()
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
exports.getTransactionsValidation = joi_1.default.object({
    schoolFinanceId: joi_1.default.number()
        .integer()
        .positive()
        .optional()
        .messages({
        'number.base': 'School Finance ID harus berupa angka',
        'number.integer': 'School Finance ID harus berupa bilangan bulat',
        'number.positive': 'School Finance ID harus positif'
    }),
    transactionType: joi_1.default.string()
        .valid('income', 'expense')
        .optional()
        .messages({
        'any.only': 'Tipe transaksi harus income atau expense'
    }),
    dateFrom: joi_1.default.date()
        .optional()
        .messages({
        'date.base': 'Tanggal dari tidak valid'
    }),
    dateTo: joi_1.default.date()
        .optional()
        .min(joi_1.default.ref('dateFrom'))
        .messages({
        'date.base': 'Tanggal sampai tidak valid',
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
    })
});
// Validation for creating financial transaction
exports.createTransactionValidation = joi_1.default.object({
    schoolFinanceId: joi_1.default.number()
        .integer()
        .positive()
        .required()
        .messages({
        'number.base': 'School Finance ID harus berupa angka',
        'number.integer': 'School Finance ID harus berupa bilangan bulat',
        'number.positive': 'School Finance ID harus positif',
        'any.required': 'School Finance ID wajib diisi'
    }),
    transactionDate: joi_1.default.date()
        .required()
        .messages({
        'date.base': 'Tanggal transaksi tidak valid',
        'any.required': 'Tanggal transaksi wajib diisi'
    }),
    transactionType: joi_1.default.string()
        .valid('income', 'expense')
        .required()
        .messages({
        'any.only': 'Tipe transaksi harus income atau expense',
        'any.required': 'Tipe transaksi wajib diisi'
    }),
    amount: joi_1.default.number()
        .positive()
        .required()
        .messages({
        'number.base': 'Jumlah harus berupa angka',
        'number.positive': 'Jumlah harus positif',
        'any.required': 'Jumlah wajib diisi'
    }),
    description: joi_1.default.string()
        .required()
        .max(500)
        .messages({
        'string.base': 'Deskripsi harus berupa string',
        'string.max': 'Deskripsi maksimal 500 karakter',
        'any.required': 'Deskripsi wajib diisi'
    }),
    transactionCategory: joi_1.default.string()
        .optional()
        .allow('')
        .max(100)
        .messages({
        'string.base': 'Kategori transaksi harus berupa string',
        'string.max': 'Kategori transaksi maksimal 100 karakter'
    }),
    transactionProof: joi_1.default.string()
        .optional()
        .allow('')
        .max(500)
        .messages({
        'string.base': 'Bukti transaksi harus berupa string',
        'string.max': 'Bukti transaksi maksimal 500 karakter'
    })
});
