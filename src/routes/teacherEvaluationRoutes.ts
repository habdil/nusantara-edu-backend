import { Router } from 'express';
import { TeacherEvaluationController } from '../controllers/teacherEvaluationController';
import { authenticateToken, requirePrincipalOrAdmin } from '../middlewares/authMiddleware';
import rateLimit from 'express-rate-limit';

const router = Router();
const teacherEvaluationController = new TeacherEvaluationController();

// Rate limiting for teacher evaluation endpoints
const teacherEvaluationRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Maximum 200 requests per 15 minutes per IP
  message: {
    success: false,
    message: 'Terlalu banyak request untuk endpoint evaluasi guru. Silakan coba lagi nanti.',
    error: 'TEACHER_EVALUATION_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply authentication and rate limiting to all routes
router.use(authenticateToken);
router.use(requirePrincipalOrAdmin);
router.use(teacherEvaluationRateLimit);

// ================================
// TEACHER EVALUATION ROUTES
// ================================

// Get evaluations with filters and pagination
// GET /api/teacher-evaluation/evaluations?academicYear=2024/2025&evaluationPeriod=Semester 1&page=1&limit=10
router.get('/evaluations', teacherEvaluationController.getEvaluations);

// Get evaluation statistics
// GET /api/teacher-evaluation/stats
router.get('/stats', teacherEvaluationController.getEvaluationStats);

// Get single evaluation by ID
// GET /api/teacher-evaluation/evaluations/:id
router.get('/evaluations/:id', teacherEvaluationController.getEvaluation);

// Create new evaluation
// POST /api/teacher-evaluation/evaluations
router.post('/evaluations', teacherEvaluationController.createEvaluation);

// Update evaluation
// PUT /api/teacher-evaluation/evaluations/:id
router.put('/evaluations/:id', teacherEvaluationController.updateEvaluation);

// Delete evaluation
// DELETE /api/teacher-evaluation/evaluations/:id
router.delete('/evaluations/:id', teacherEvaluationController.deleteEvaluation);

// ================================
// DEVELOPMENT PROGRAM ROUTES
// ================================

// Get development programs with filters
// GET /api/teacher-evaluation/development-programs?teacherId=1&programType=training&status=completed
router.get('/development-programs', teacherEvaluationController.getDevelopmentPrograms);

// Get single development program by ID
// GET /api/teacher-evaluation/development-programs/:id
router.get('/development-programs/:id', teacherEvaluationController.getDevelopmentProgram);

// Create new development program
// POST /api/teacher-evaluation/development-programs
router.post('/development-programs', teacherEvaluationController.createDevelopmentProgram);

// Update development program
// PUT /api/teacher-evaluation/development-programs/:id
router.put('/development-programs/:id', teacherEvaluationController.updateDevelopmentProgram);

// Delete development program
// DELETE /api/teacher-evaluation/development-programs/:id
router.delete('/development-programs/:id', teacherEvaluationController.deleteDevelopmentProgram);

export default router;