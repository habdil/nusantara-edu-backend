"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAcademicRecordValidation = exports.createAcademicRecordValidation = exports.getAcademicStatsValidation = exports.getStudentAttendanceValidation = exports.getBasicCompetenciesValidation = exports.getSubjectsValidation = exports.getSubjectAveragesValidation = exports.getGradeDistributionValidation = exports.getAttendanceSummaryValidation = exports.getAcademicRecordsValidation = exports.getStudentsValidation = void 0;
const joi_1 = __importDefault(require("joi"));
// Validation for getting students
exports.getStudentsValidation = joi_1.default.object({
    gradeLevel: joi_1.default.string()
        .optional()
        .messages({
        'string.base': 'Grade level harus berupa string'
    }),
    className: joi_1.default.string()
        .optional()
        .messages({
        'string.base': 'Nama kelas harus berupa string'
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
// Validation for getting academic records
exports.getAcademicRecordsValidation = joi_1.default.object({
    studentId: joi_1.default.number()
        .integer()
        .positive()
        .optional()
        .messages({
        'number.base': 'Student ID harus berupa angka',
        'number.integer': 'Student ID harus berupa bilangan bulat',
        'number.positive': 'Student ID harus positif'
    }),
    subjectId: joi_1.default.number()
        .integer()
        .positive()
        .optional()
        .messages({
        'number.base': 'Subject ID harus berupa angka',
        'number.integer': 'Subject ID harus berupa bilangan bulat',
        'number.positive': 'Subject ID harus positif'
    }),
    semester: joi_1.default.string()
        .valid('1', '2')
        .optional()
        .messages({
        'any.only': 'Semester harus 1 atau 2'
    }),
    academicYear: joi_1.default.string()
        .pattern(/^\d{4}\/\d{4}$/)
        .optional()
        .messages({
        'string.pattern.base': 'Format tahun akademik tidak valid (contoh: 2024/2025)'
    }),
    gradeLevel: joi_1.default.string()
        .optional()
        .messages({
        'string.base': 'Grade level harus berupa string'
    })
});
// Validation for attendance summary
exports.getAttendanceSummaryValidation = joi_1.default.object({
    academicYear: joi_1.default.string()
        .pattern(/^\d{4}\/\d{4}$/)
        .optional()
        .messages({
        'string.pattern.base': 'Format tahun akademik tidak valid (contoh: 2024/2025)'
    }),
    semester: joi_1.default.string()
        .valid('1', '2')
        .optional()
        .messages({
        'any.only': 'Semester harus 1 atau 2'
    })
});
// Validation for grade distribution
exports.getGradeDistributionValidation = joi_1.default.object({
    academicYear: joi_1.default.string()
        .pattern(/^\d{4}\/\d{4}$/)
        .optional()
        .messages({
        'string.pattern.base': 'Format tahun akademik tidak valid (contoh: 2024/2025)'
    }),
    semester: joi_1.default.string()
        .valid('1', '2')
        .optional()
        .messages({
        'any.only': 'Semester harus 1 atau 2'
    }),
    gradeLevel: joi_1.default.string()
        .optional()
        .messages({
        'string.base': 'Grade level harus berupa string'
    })
});
// Validation for subject averages
exports.getSubjectAveragesValidation = joi_1.default.object({
    academicYear: joi_1.default.string()
        .pattern(/^\d{4}\/\d{4}$/)
        .optional()
        .messages({
        'string.pattern.base': 'Format tahun akademik tidak valid (contoh: 2024/2025)'
    }),
    semester: joi_1.default.string()
        .valid('1', '2')
        .optional()
        .messages({
        'any.only': 'Semester harus 1 atau 2'
    }),
    gradeLevel: joi_1.default.string()
        .optional()
        .messages({
        'string.base': 'Grade level harus berupa string'
    })
});
// Validation for getting subjects
exports.getSubjectsValidation = joi_1.default.object({
    gradeLevel: joi_1.default.string()
        .optional()
        .messages({
        'string.base': 'Grade level harus berupa string'
    })
});
// Validation for getting basic competencies
exports.getBasicCompetenciesValidation = joi_1.default.object({
    subjectId: joi_1.default.number()
        .integer()
        .positive()
        .optional()
        .messages({
        'number.base': 'Subject ID harus berupa angka',
        'number.integer': 'Subject ID harus berupa bilangan bulat',
        'number.positive': 'Subject ID harus positif'
    })
});
// Validation for getting student attendance
exports.getStudentAttendanceValidation = joi_1.default.object({
    studentId: joi_1.default.number()
        .integer()
        .positive()
        .optional()
        .messages({
        'number.base': 'Student ID harus berupa angka',
        'number.integer': 'Student ID harus berupa bilangan bulat',
        'number.positive': 'Student ID harus positif'
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
    status: joi_1.default.string()
        .valid('present', 'excused', 'sick', 'unexcused')
        .optional()
        .messages({
        'any.only': 'Status harus salah satu dari: present, excused, sick, unexcused'
    })
});
// Validation for getting academic stats
exports.getAcademicStatsValidation = joi_1.default.object({
    academicYear: joi_1.default.string()
        .pattern(/^\d{4}\/\d{4}$/)
        .optional()
        .messages({
        'string.pattern.base': 'Format tahun akademik tidak valid (contoh: 2024/2025)'
    }),
    semester: joi_1.default.string()
        .valid('1', '2')
        .optional()
        .messages({
        'any.only': 'Semester harus 1 atau 2'
    }),
    gradeLevel: joi_1.default.string()
        .optional()
        .messages({
        'string.base': 'Grade level harus berupa string'
    })
});
// Validation for creating academic record
exports.createAcademicRecordValidation = joi_1.default.object({
    studentId: joi_1.default.number()
        .integer()
        .positive()
        .required()
        .messages({
        'number.base': 'Student ID harus berupa angka',
        'number.integer': 'Student ID harus berupa bilangan bulat',
        'number.positive': 'Student ID harus positif',
        'any.required': 'Student ID wajib diisi'
    }),
    subjectId: joi_1.default.number()
        .integer()
        .positive()
        .required()
        .messages({
        'number.base': 'Subject ID harus berupa angka',
        'number.integer': 'Subject ID harus berupa bilangan bulat',
        'number.positive': 'Subject ID harus positif',
        'any.required': 'Subject ID wajib diisi'
    }),
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
    semester: joi_1.default.string()
        .valid('1', '2')
        .required()
        .messages({
        'any.only': 'Semester harus 1 atau 2',
        'any.required': 'Semester wajib diisi'
    }),
    academicYear: joi_1.default.string()
        .pattern(/^\d{4}\/\d{4}$/)
        .required()
        .messages({
        'string.pattern.base': 'Format tahun akademik tidak valid (contoh: 2024/2025)',
        'any.required': 'Tahun akademik wajib diisi'
    }),
    knowledgeScore: joi_1.default.number()
        .min(0)
        .max(100)
        .optional()
        .messages({
        'number.base': 'Nilai pengetahuan harus berupa angka',
        'number.min': 'Nilai pengetahuan minimal 0',
        'number.max': 'Nilai pengetahuan maksimal 100'
    }),
    skillScore: joi_1.default.number()
        .min(0)
        .max(100)
        .optional()
        .messages({
        'number.base': 'Nilai keterampilan harus berupa angka',
        'number.min': 'Nilai keterampilan minimal 0',
        'number.max': 'Nilai keterampilan maksimal 100'
    }),
    attitudeScore: joi_1.default.string()
        .valid('A', 'B', 'C', 'D')
        .optional()
        .messages({
        'any.only': 'Nilai sikap harus A, B, C, atau D'
    }),
    midtermExamScore: joi_1.default.number()
        .min(0)
        .max(100)
        .optional()
        .messages({
        'number.base': 'Nilai UTS harus berupa angka',
        'number.min': 'Nilai UTS minimal 0',
        'number.max': 'Nilai UTS maksimal 100'
    }),
    finalExamScore: joi_1.default.number()
        .min(0)
        .max(100)
        .optional()
        .messages({
        'number.base': 'Nilai UAS harus berupa angka',
        'number.min': 'Nilai UAS minimal 0',
        'number.max': 'Nilai UAS maksimal 100'
    }),
    finalScore: joi_1.default.number()
        .min(0)
        .max(100)
        .optional()
        .messages({
        'number.base': 'Nilai akhir harus berupa angka',
        'number.min': 'Nilai akhir minimal 0',
        'number.max': 'Nilai akhir maksimal 100'
    }),
    teacherNotes: joi_1.default.string()
        .max(500)
        .optional()
        .allow('')
        .messages({
        'string.max': 'Catatan guru maksimal 500 karakter'
    })
});
// Validation for updating academic record
exports.updateAcademicRecordValidation = joi_1.default.object({
    knowledgeScore: joi_1.default.number()
        .min(0)
        .max(100)
        .optional()
        .messages({
        'number.base': 'Nilai pengetahuan harus berupa angka',
        'number.min': 'Nilai pengetahuan minimal 0',
        'number.max': 'Nilai pengetahuan maksimal 100'
    }),
    skillScore: joi_1.default.number()
        .min(0)
        .max(100)
        .optional()
        .messages({
        'number.base': 'Nilai keterampilan harus berupa angka',
        'number.min': 'Nilai keterampilan minimal 0',
        'number.max': 'Nilai keterampilan maksimal 100'
    }),
    attitudeScore: joi_1.default.string()
        .valid('A', 'B', 'C', 'D')
        .optional()
        .messages({
        'any.only': 'Nilai sikap harus A, B, C, atau D'
    }),
    midtermExamScore: joi_1.default.number()
        .min(0)
        .max(100)
        .optional()
        .messages({
        'number.base': 'Nilai UTS harus berupa angka',
        'number.min': 'Nilai UTS minimal 0',
        'number.max': 'Nilai UTS maksimal 100'
    }),
    finalExamScore: joi_1.default.number()
        .min(0)
        .max(100)
        .optional()
        .messages({
        'number.base': 'Nilai UAS harus berupa angka',
        'number.min': 'Nilai UAS minimal 0',
        'number.max': 'Nilai UAS maksimal 100'
    }),
    finalScore: joi_1.default.number()
        .min(0)
        .max(100)
        .optional()
        .messages({
        'number.base': 'Nilai akhir harus berupa angka',
        'number.min': 'Nilai akhir minimal 0',
        'number.max': 'Nilai akhir maksimal 100'
    }),
    teacherNotes: joi_1.default.string()
        .max(500)
        .optional()
        .allow('')
        .messages({
        'string.max': 'Catatan guru maksimal 500 karakter'
    })
});
