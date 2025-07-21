"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AcademicController = void 0;
const academicService_1 = require("../services/academicService");
const academicValidation_1 = require("../validation/academicValidation");
class AcademicController {
    constructor() {
        // Get students with pagination and filters
        this.getStudents = async (req, res) => {
            try {
                if (!req.user?.schoolId) {
                    res.status(400).json({
                        success: false,
                        message: 'Informasi sekolah tidak ditemukan',
                        error: 'SCHOOL_INFO_MISSING'
                    });
                    return;
                }
                // Validate query parameters
                const { error, value } = academicValidation_1.getStudentsValidation.validate(req.query);
                if (error) {
                    res.status(400).json({
                        success: false,
                        message: 'Parameter tidak valid',
                        errors: error.details.map(detail => ({
                            field: detail.path.join('.'),
                            message: detail.message
                        }))
                    });
                    return;
                }
                const result = await this.academicService.getStudents({
                    ...value,
                    schoolId: req.user.schoolId
                });
                res.status(200).json({
                    success: true,
                    message: 'Data siswa berhasil diambil',
                    data: result
                });
            }
            catch (error) {
                console.error('Get students error:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || 'Gagal mengambil data siswa',
                    error: 'GET_STUDENTS_FAILED'
                });
            }
        };
        // Get attendance summary
        this.getAttendanceSummary = async (req, res) => {
            try {
                if (!req.user?.schoolId) {
                    res.status(400).json({
                        success: false,
                        message: 'Informasi sekolah tidak ditemukan',
                        error: 'SCHOOL_INFO_MISSING'
                    });
                    return;
                }
                // Validate query parameters
                const academicYear = req.query.academicYear;
                const semester = req.query.semester;
                const result = await this.academicService.getAttendanceSummary({
                    academicYear,
                    semester,
                    schoolId: req.user.schoolId
                });
                res.status(200).json({
                    success: true,
                    message: 'Ringkasan kehadiran berhasil diambil',
                    data: result
                });
            }
            catch (error) {
                console.error('Get attendance summary error:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || 'Gagal mengambil ringkasan kehadiran',
                    error: 'GET_ATTENDANCE_SUMMARY_FAILED'
                });
            }
        };
        // Get grade distribution
        this.getGradeDistribution = async (req, res) => {
            try {
                if (!req.user?.schoolId) {
                    res.status(400).json({
                        success: false,
                        message: 'Informasi sekolah tidak ditemukan',
                        error: 'SCHOOL_INFO_MISSING'
                    });
                    return;
                }
                // Validate query parameters
                const academicYear = req.query.academicYear;
                const semester = req.query.semester;
                const gradeLevel = req.query.gradeLevel;
                const result = await this.academicService.getGradeDistribution({
                    academicYear,
                    semester,
                    gradeLevel,
                    schoolId: req.user.schoolId
                });
                res.status(200).json({
                    success: true,
                    message: 'Distribusi nilai berhasil diambil',
                    data: result
                });
            }
            catch (error) {
                console.error('Get grade distribution error:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || 'Gagal mengambil distribusi nilai',
                    error: 'GET_GRADE_DISTRIBUTION_FAILED'
                });
            }
        };
        // Get subject averages
        this.getSubjectAverages = async (req, res) => {
            try {
                if (!req.user?.schoolId) {
                    res.status(400).json({
                        success: false,
                        message: 'Informasi sekolah tidak ditemukan',
                        error: 'SCHOOL_INFO_MISSING'
                    });
                    return;
                }
                // Validate query parameters
                const academicYear = req.query.academicYear;
                const semester = req.query.semester;
                const gradeLevel = req.query.gradeLevel;
                const result = await this.academicService.getSubjectAverages({
                    academicYear,
                    semester,
                    gradeLevel,
                    schoolId: req.user.schoolId
                });
                res.status(200).json({
                    success: true,
                    message: 'Rata-rata nilai per mata pelajaran berhasil diambil',
                    data: result
                });
            }
            catch (error) {
                console.error('Get subject averages error:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || 'Gagal mengambil rata-rata nilai per mata pelajaran',
                    error: 'GET_SUBJECT_AVERAGES_FAILED'
                });
            }
        };
        // Get academic records with filters
        this.getAcademicRecords = async (req, res) => {
            try {
                if (!req.user?.schoolId) {
                    res.status(400).json({
                        success: false,
                        message: 'Informasi sekolah tidak ditemukan',
                        error: 'SCHOOL_INFO_MISSING'
                    });
                    return;
                }
                // Validate query parameters
                const { error, value } = academicValidation_1.getAcademicRecordsValidation.validate(req.query);
                if (error) {
                    res.status(400).json({
                        success: false,
                        message: 'Parameter tidak valid',
                        errors: error.details.map(detail => ({
                            field: detail.path.join('.'),
                            message: detail.message
                        }))
                    });
                    return;
                }
                const result = await this.academicService.getAcademicRecords({
                    ...value,
                    schoolId: req.user.schoolId
                });
                res.status(200).json({
                    success: true,
                    message: 'Data nilai akademik berhasil diambil',
                    data: result
                });
            }
            catch (error) {
                console.error('Get academic records error:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || 'Gagal mengambil data nilai akademik',
                    error: 'GET_ACADEMIC_RECORDS_FAILED'
                });
            }
        };
        // Get subjects by grade level
        this.getSubjects = async (req, res) => {
            try {
                // Validate query parameters
                const { error, value } = academicValidation_1.getSubjectsValidation.validate(req.query);
                if (error) {
                    res.status(400).json({
                        success: false,
                        message: 'Parameter tidak valid',
                        errors: error.details.map(detail => ({
                            field: detail.path.join('.'),
                            message: detail.message
                        }))
                    });
                    return;
                }
                const result = await this.academicService.getSubjects(value.gradeLevel);
                res.status(200).json({
                    success: true,
                    message: 'Data mata pelajaran berhasil diambil',
                    data: result
                });
            }
            catch (error) {
                console.error('Get subjects error:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || 'Gagal mengambil data mata pelajaran',
                    error: 'GET_SUBJECTS_FAILED'
                });
            }
        };
        // Get teachers
        this.getTeachers = async (req, res) => {
            try {
                if (!req.user?.schoolId) {
                    res.status(400).json({
                        success: false,
                        message: 'Informasi sekolah tidak ditemukan',
                        error: 'SCHOOL_INFO_MISSING'
                    });
                    return;
                }
                const result = await this.academicService.getTeachers(req.user.schoolId);
                res.status(200).json({
                    success: true,
                    message: 'Data guru berhasil diambil',
                    data: result
                });
            }
            catch (error) {
                console.error('Get teachers error:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || 'Gagal mengambil data guru',
                    error: 'GET_TEACHERS_FAILED'
                });
            }
        };
        // Get basic competencies by subject
        this.getBasicCompetencies = async (req, res) => {
            try {
                // Validate query parameters
                const { error, value } = academicValidation_1.getBasicCompetenciesValidation.validate(req.query);
                if (error) {
                    res.status(400).json({
                        success: false,
                        message: 'Parameter tidak valid',
                        errors: error.details.map(detail => ({
                            field: detail.path.join('.'),
                            message: detail.message
                        }))
                    });
                    return;
                }
                const result = await this.academicService.getBasicCompetencies(value.subjectId);
                res.status(200).json({
                    success: true,
                    message: 'Data kompetensi dasar berhasil diambil',
                    data: result
                });
            }
            catch (error) {
                console.error('Get basic competencies error:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || 'Gagal mengambil data kompetensi dasar',
                    error: 'GET_BASIC_COMPETENCIES_FAILED'
                });
            }
        };
        // Get student attendance
        this.getStudentAttendance = async (req, res) => {
            try {
                if (!req.user?.schoolId) {
                    res.status(400).json({
                        success: false,
                        message: 'Informasi sekolah tidak ditemukan',
                        error: 'SCHOOL_INFO_MISSING'
                    });
                    return;
                }
                // Validate query parameters
                const { error, value } = academicValidation_1.getStudentAttendanceValidation.validate(req.query);
                if (error) {
                    res.status(400).json({
                        success: false,
                        message: 'Parameter tidak valid',
                        errors: error.details.map(detail => ({
                            field: detail.path.join('.'),
                            message: detail.message
                        }))
                    });
                    return;
                }
                const result = await this.academicService.getStudentAttendance({
                    ...value,
                    schoolId: req.user.schoolId
                });
                res.status(200).json({
                    success: true,
                    message: 'Data kehadiran siswa berhasil diambil',
                    data: result
                });
            }
            catch (error) {
                console.error('Get student attendance error:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || 'Gagal mengambil data kehadiran siswa',
                    error: 'GET_STUDENT_ATTENDANCE_FAILED'
                });
            }
        };
        // Get academic statistics
        this.getAcademicStats = async (req, res) => {
            try {
                if (!req.user?.schoolId) {
                    res.status(400).json({
                        success: false,
                        message: 'Informasi sekolah tidak ditemukan',
                        error: 'SCHOOL_INFO_MISSING'
                    });
                    return;
                }
                // Validate query parameters
                const { error, value } = academicValidation_1.getAcademicStatsValidation.validate(req.query);
                if (error) {
                    res.status(400).json({
                        success: false,
                        message: 'Parameter tidak valid',
                        errors: error.details.map(detail => ({
                            field: detail.path.join('.'),
                            message: detail.message
                        }))
                    });
                    return;
                }
                const result = await this.academicService.getAcademicStats({
                    ...value,
                    schoolId: req.user.schoolId
                });
                res.status(200).json({
                    success: true,
                    message: 'Statistik akademik berhasil diambil',
                    data: result
                });
            }
            catch (error) {
                console.error('Get academic stats error:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || 'Gagal mengambil statistik akademik',
                    error: 'GET_ACADEMIC_STATS_FAILED'
                });
            }
        };
        // Create academic record
        this.createAcademicRecord = async (req, res) => {
            try {
                if (!req.user?.schoolId) {
                    res.status(400).json({
                        success: false,
                        message: 'Informasi sekolah tidak ditemukan',
                        error: 'SCHOOL_INFO_MISSING'
                    });
                    return;
                }
                // Validate request body
                const { error, value } = academicValidation_1.createAcademicRecordValidation.validate(req.body);
                if (error) {
                    res.status(400).json({
                        success: false,
                        message: 'Data tidak valid',
                        errors: error.details.map(detail => ({
                            field: detail.path.join('.'),
                            message: detail.message
                        }))
                    });
                    return;
                }
                const result = await this.academicService.createAcademicRecord(value, req.user.schoolId);
                res.status(201).json({
                    success: true,
                    message: 'Data nilai akademik berhasil dibuat',
                    data: result
                });
            }
            catch (error) {
                console.error('Create academic record error:', error);
                res.status(400).json({
                    success: false,
                    message: error.message || 'Gagal membuat data nilai akademik',
                    error: 'CREATE_ACADEMIC_RECORD_FAILED'
                });
            }
        };
        // Update academic record
        this.updateAcademicRecord = async (req, res) => {
            try {
                if (!req.user?.schoolId) {
                    res.status(400).json({
                        success: false,
                        message: 'Informasi sekolah tidak ditemukan',
                        error: 'SCHOOL_INFO_MISSING'
                    });
                    return;
                }
                const recordId = parseInt(req.params.id);
                if (isNaN(recordId)) {
                    res.status(400).json({
                        success: false,
                        message: 'ID nilai tidak valid',
                        error: 'INVALID_RECORD_ID'
                    });
                    return;
                }
                // Validate request body
                const { error, value } = academicValidation_1.updateAcademicRecordValidation.validate(req.body);
                if (error) {
                    res.status(400).json({
                        success: false,
                        message: 'Data tidak valid',
                        errors: error.details.map(detail => ({
                            field: detail.path.join('.'),
                            message: detail.message
                        }))
                    });
                    return;
                }
                const result = await this.academicService.updateAcademicRecord(recordId, value, req.user.schoolId);
                res.status(200).json({
                    success: true,
                    message: 'Data nilai akademik berhasil diperbarui',
                    data: result
                });
            }
            catch (error) {
                console.error('Update academic record error:', error);
                res.status(400).json({
                    success: false,
                    message: error.message || 'Gagal memperbarui data nilai akademik',
                    error: 'UPDATE_ACADEMIC_RECORD_FAILED'
                });
            }
        };
        // Delete academic record
        this.deleteAcademicRecord = async (req, res) => {
            try {
                if (!req.user?.schoolId) {
                    res.status(400).json({
                        success: false,
                        message: 'Informasi sekolah tidak ditemukan',
                        error: 'SCHOOL_INFO_MISSING'
                    });
                    return;
                }
                const recordId = parseInt(req.params.id);
                if (isNaN(recordId)) {
                    res.status(400).json({
                        success: false,
                        message: 'ID nilai tidak valid',
                        error: 'INVALID_RECORD_ID'
                    });
                    return;
                }
                const result = await this.academicService.deleteAcademicRecord(recordId, req.user.schoolId);
                res.status(200).json({
                    success: true,
                    message: result.message,
                    data: null
                });
            }
            catch (error) {
                console.error('Delete academic record error:', error);
                res.status(400).json({
                    success: false,
                    message: error.message || 'Gagal menghapus data nilai akademik',
                    error: 'DELETE_ACADEMIC_RECORD_FAILED'
                });
            }
        };
        // Get single academic record by ID
        this.getAcademicRecord = async (req, res) => {
            try {
                if (!req.user?.schoolId) {
                    res.status(400).json({
                        success: false,
                        message: 'Informasi sekolah tidak ditemukan',
                        error: 'SCHOOL_INFO_MISSING'
                    });
                    return;
                }
                const recordId = parseInt(req.params.id);
                if (isNaN(recordId)) {
                    res.status(400).json({
                        success: false,
                        message: 'ID nilai tidak valid',
                        error: 'INVALID_RECORD_ID'
                    });
                    return;
                }
                // Get single record by filtering with ID
                const result = await this.academicService.getAcademicRecords({
                    schoolId: req.user.schoolId
                });
                const record = result.find(r => r.id === recordId);
                if (!record) {
                    res.status(404).json({
                        success: false,
                        message: 'Data nilai tidak ditemukan',
                        error: 'ACADEMIC_RECORD_NOT_FOUND'
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    message: 'Data nilai akademik berhasil diambil',
                    data: record
                });
            }
            catch (error) {
                console.error('Get academic record error:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || 'Gagal mengambil data nilai akademik',
                    error: 'GET_ACADEMIC_RECORD_FAILED'
                });
            }
        };
        // Get single student by ID
        this.getStudent = async (req, res) => {
            try {
                if (!req.user?.schoolId) {
                    res.status(400).json({
                        success: false,
                        message: 'Informasi sekolah tidak ditemukan',
                        error: 'SCHOOL_INFO_MISSING'
                    });
                    return;
                }
                const studentId = parseInt(req.params.id);
                if (isNaN(studentId)) {
                    res.status(400).json({
                        success: false,
                        message: 'ID siswa tidak valid',
                        error: 'INVALID_STUDENT_ID'
                    });
                    return;
                }
                // Get students and find the specific one
                const result = await this.academicService.getStudents({
                    schoolId: req.user.schoolId,
                    page: 1,
                    limit: 1000 // Get all to find the specific student
                });
                const student = result.data.find(s => s.id === studentId);
                if (!student) {
                    res.status(404).json({
                        success: false,
                        message: 'Data siswa tidak ditemukan',
                        error: 'STUDENT_NOT_FOUND'
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    message: 'Data siswa berhasil diambil',
                    data: student
                });
            }
            catch (error) {
                console.error('Get student error:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || 'Gagal mengambil data siswa',
                    error: 'GET_STUDENT_FAILED'
                });
            }
        };
        this.academicService = new academicService_1.AcademicService();
    }
}
exports.AcademicController = AcademicController;
