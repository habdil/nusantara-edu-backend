import Joi from 'joi';

// Validation for getting students
export const getStudentsValidation = Joi.object({
  gradeLevel: Joi.string()
    .optional()
    .messages({
      'string.base': 'Grade level harus berupa string'
    }),
  className: Joi.string()
    .optional()
    .messages({
      'string.base': 'Nama kelas harus berupa string'
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

// Validation for getting academic records
export const getAcademicRecordsValidation = Joi.object({
  studentId: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Student ID harus berupa angka',
      'number.integer': 'Student ID harus berupa bilangan bulat',
      'number.positive': 'Student ID harus positif'
    }),
  subjectId: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Subject ID harus berupa angka',
      'number.integer': 'Subject ID harus berupa bilangan bulat',
      'number.positive': 'Subject ID harus positif'
    }),
  semester: Joi.string()
    .valid('1', '2')
    .optional()
    .messages({
      'any.only': 'Semester harus 1 atau 2'
    }),
  academicYear: Joi.string()
    .pattern(/^\d{4}\/\d{4}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Format tahun akademik tidak valid (contoh: 2024/2025)'
    }),
  gradeLevel: Joi.string()
    .optional()
    .messages({
      'string.base': 'Grade level harus berupa string'
    })
});

// Validation for attendance summary
export const getAttendanceSummaryValidation = Joi.object({
  academicYear: Joi.string()
    .pattern(/^\d{4}\/\d{4}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Format tahun akademik tidak valid (contoh: 2024/2025)'
    }),
  semester: Joi.string()
    .valid('1', '2')
    .optional()
    .messages({
      'any.only': 'Semester harus 1 atau 2'
    })
});

// Validation for grade distribution
export const getGradeDistributionValidation = Joi.object({
  academicYear: Joi.string()
    .pattern(/^\d{4}\/\d{4}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Format tahun akademik tidak valid (contoh: 2024/2025)'
    }),
  semester: Joi.string()
    .valid('1', '2')
    .optional()
    .messages({
      'any.only': 'Semester harus 1 atau 2'
    }),
  gradeLevel: Joi.string()
    .optional()
    .messages({
      'string.base': 'Grade level harus berupa string'
    })
});

// Validation for subject averages
export const getSubjectAveragesValidation = Joi.object({
  academicYear: Joi.string()
    .pattern(/^\d{4}\/\d{4}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Format tahun akademik tidak valid (contoh: 2024/2025)'
    }),
  semester: Joi.string()
    .valid('1', '2')
    .optional()
    .messages({
      'any.only': 'Semester harus 1 atau 2'
    }),
  gradeLevel: Joi.string()
    .optional()
    .messages({
      'string.base': 'Grade level harus berupa string'
    })
});

// Validation for getting subjects
export const getSubjectsValidation = Joi.object({
  gradeLevel: Joi.string()
    .optional()
    .messages({
      'string.base': 'Grade level harus berupa string'
    })
});

// Validation for getting basic competencies
export const getBasicCompetenciesValidation = Joi.object({
  subjectId: Joi.number()
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
export const getStudentAttendanceValidation = Joi.object({
  studentId: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Student ID harus berupa angka',
      'number.integer': 'Student ID harus berupa bilangan bulat',
      'number.positive': 'Student ID harus positif'
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
  status: Joi.string()
    .valid('present', 'excused', 'sick', 'unexcused')
    .optional()
    .messages({
      'any.only': 'Status harus salah satu dari: present, excused, sick, unexcused'
    })
});

// Validation for getting academic stats
export const getAcademicStatsValidation = Joi.object({
  academicYear: Joi.string()
    .pattern(/^\d{4}\/\d{4}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Format tahun akademik tidak valid (contoh: 2024/2025)'
    }),
  semester: Joi.string()
    .valid('1', '2')
    .optional()
    .messages({
      'any.only': 'Semester harus 1 atau 2'
    }),
  gradeLevel: Joi.string()
    .optional()
    .messages({
      'string.base': 'Grade level harus berupa string'
    })
});

// Validation for creating academic record
export const createAcademicRecordValidation = Joi.object({
  studentId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Student ID harus berupa angka',
      'number.integer': 'Student ID harus berupa bilangan bulat',
      'number.positive': 'Student ID harus positif',
      'any.required': 'Student ID wajib diisi'
    }),
  subjectId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Subject ID harus berupa angka',
      'number.integer': 'Subject ID harus berupa bilangan bulat',
      'number.positive': 'Subject ID harus positif',
      'any.required': 'Subject ID wajib diisi'
    }),
  teacherId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Teacher ID harus berupa angka',
      'number.integer': 'Teacher ID harus berupa bilangan bulat',
      'number.positive': 'Teacher ID harus positif',
      'any.required': 'Teacher ID wajib diisi'
    }),
  semester: Joi.string()
    .valid('1', '2')
    .required()
    .messages({
      'any.only': 'Semester harus 1 atau 2',
      'any.required': 'Semester wajib diisi'
    }),
  academicYear: Joi.string()
    .pattern(/^\d{4}\/\d{4}$/)
    .required()
    .messages({
      'string.pattern.base': 'Format tahun akademik tidak valid (contoh: 2024/2025)',
      'any.required': 'Tahun akademik wajib diisi'
    }),
  knowledgeScore: Joi.number()
    .min(0)
    .max(100)
    .optional()
    .messages({
      'number.base': 'Nilai pengetahuan harus berupa angka',
      'number.min': 'Nilai pengetahuan minimal 0',
      'number.max': 'Nilai pengetahuan maksimal 100'
    }),
  skillScore: Joi.number()
    .min(0)
    .max(100)
    .optional()
    .messages({
      'number.base': 'Nilai keterampilan harus berupa angka',
      'number.min': 'Nilai keterampilan minimal 0',
      'number.max': 'Nilai keterampilan maksimal 100'
    }),
  attitudeScore: Joi.string()
    .valid('A', 'B', 'C', 'D')
    .optional()
    .messages({
      'any.only': 'Nilai sikap harus A, B, C, atau D'
    }),
  midtermExamScore: Joi.number()
    .min(0)
    .max(100)
    .optional()
    .messages({
      'number.base': 'Nilai UTS harus berupa angka',
      'number.min': 'Nilai UTS minimal 0',
      'number.max': 'Nilai UTS maksimal 100'
    }),
  finalExamScore: Joi.number()
    .min(0)
    .max(100)
    .optional()
    .messages({
      'number.base': 'Nilai UAS harus berupa angka',
      'number.min': 'Nilai UAS minimal 0',
      'number.max': 'Nilai UAS maksimal 100'
    }),
  finalScore: Joi.number()
    .min(0)
    .max(100)
    .optional()
    .messages({
      'number.base': 'Nilai akhir harus berupa angka',
      'number.min': 'Nilai akhir minimal 0',
      'number.max': 'Nilai akhir maksimal 100'
    }),
  teacherNotes: Joi.string()
    .max(500)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Catatan guru maksimal 500 karakter'
    })
});

// Validation for updating academic record
export const updateAcademicRecordValidation = Joi.object({
  knowledgeScore: Joi.number()
    .min(0)
    .max(100)
    .optional()
    .messages({
      'number.base': 'Nilai pengetahuan harus berupa angka',
      'number.min': 'Nilai pengetahuan minimal 0',
      'number.max': 'Nilai pengetahuan maksimal 100'
    }),
  skillScore: Joi.number()
    .min(0)
    .max(100)
    .optional()
    .messages({
      'number.base': 'Nilai keterampilan harus berupa angka',
      'number.min': 'Nilai keterampilan minimal 0',
      'number.max': 'Nilai keterampilan maksimal 100'
    }),
  attitudeScore: Joi.string()
    .valid('A', 'B', 'C', 'D')
    .optional()
    .messages({
      'any.only': 'Nilai sikap harus A, B, C, atau D'
    }),
  midtermExamScore: Joi.number()
    .min(0)
    .max(100)
    .optional()
    .messages({
      'number.base': 'Nilai UTS harus berupa angka',
      'number.min': 'Nilai UTS minimal 0',
      'number.max': 'Nilai UTS maksimal 100'
    }),
  finalExamScore: Joi.number()
    .min(0)
    .max(100)
    .optional()
    .messages({
      'number.base': 'Nilai UAS harus berupa angka',
      'number.min': 'Nilai UAS minimal 0',
      'number.max': 'Nilai UAS maksimal 100'
    }),
  finalScore: Joi.number()
    .min(0)
    .max(100)
    .optional()
    .messages({
      'number.base': 'Nilai akhir harus berupa angka',
      'number.min': 'Nilai akhir minimal 0',
      'number.max': 'Nilai akhir maksimal 100'
    }),
  teacherNotes: Joi.string()
    .max(500)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Catatan guru maksimal 500 karakter'
    })
});