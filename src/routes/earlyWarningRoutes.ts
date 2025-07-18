// src/routes/earlyWarningRoutes.ts
import { Router } from 'express';
import { EarlyWarningController } from '../controllers/earlyWarningController';
import { authenticateToken, requirePrincipalOrAdmin } from '../middlewares/authMiddleware';
import rateLimit from 'express-rate-limit';

const router = Router();
const earlyWarningController = new EarlyWarningController();

// Rate limiting for early warning endpoints
const earlyWarningRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Maximum 100 requests per 15 minutes per IP
  message: {
    success: false,
    message: 'Terlalu banyak request untuk endpoint early warnings. Silakan coba lagi nanti.',
    error: 'EARLY_WARNING_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply authentication and rate limiting to all routes
router.use(authenticateToken);
router.use(requirePrincipalOrAdmin);
router.use(earlyWarningRateLimit);

// GET endpoints - Read operations
router.get('/', earlyWarningController.getWarnings);
router.get('/stats', earlyWarningController.getStats);

// POST endpoints - Analysis operations  
router.post('/generate', earlyWarningController.generateWarnings); // ✅ Real data analysis

export default router;