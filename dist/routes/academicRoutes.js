"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const academicController_1 = require("../controllers/academicController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const router = (0, express_1.Router)();
const academicController = new academicController_1.AcademicController();
// Rate limiting for academic endpoints
const academicRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // Maximum 200 requests per 15 minutes per IP
    message: {
        success: false,
        message: 'Terlalu banyak request untuk endpoint akademik. Silakan coba lagi nanti.',
        error: 'ACADEMIC_RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
// Apply authentication and rate limiting to all routes
router.use(authMiddleware_1.authenticateToken);
router.use(authMiddleware_1.requirePrincipalOrAdmin);
router.use(academicRateLimit);
// Students endpoints
router.get('/students', academicController.getStudents);
router.get('/students/:id', academicController.getStudent);
// Academic records endpoints
router.get('/academic-records', academicController.getAcademicRecords);
router.get('/academic-records/:id', academicController.getAcademicRecord);
router.post('/academic-records', academicController.createAcademicRecord);
router.put('/academic-records/:id', academicController.updateAcademicRecord);
router.delete('/academic-records/:id', academicController.deleteAcademicRecord);
// Subjects endpoints
router.get('/subjects', academicController.getSubjects);
// Teachers endpoints
router.get('/teachers', academicController.getTeachers);
// Basic competencies endpoints
router.get('/basic-competencies', academicController.getBasicCompetencies);
// Student attendance endpoints
router.get('/student-attendance', academicController.getStudentAttendance);
// Academic statistics endpoints
router.get('/stats', academicController.getAcademicStats);
// Attendance summary endpoint
router.get('/attendance-summary', academicController.getAttendanceSummary);
// Grade analysis endpoints
router.get('/grade-distribution', academicController.getGradeDistribution);
router.get('/subject-averages', academicController.getSubjectAverages);
exports.default = router;
