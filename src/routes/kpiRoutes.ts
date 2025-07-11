import { Router } from 'express';
import { KPIController } from '../controllers/kpiController';
import { authenticateToken, requirePrincipalOrAdmin } from '../middlewares/authMiddleware';
import rateLimit from 'express-rate-limit';

const router = Router();
const kpiController = new KPIController();

// Rate limiting for KPI endpoints
const kpiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 150, // Maximum 150 requests per 15 minutes per IP
  message: {
    success: false,
    message: 'Terlalu banyak request untuk endpoint KPI. Silakan coba lagi nanti.',
    error: 'KPI_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for export endpoint (more restrictive)
const exportRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Maximum 10 export requests per hour per IP
  message: {
    success: false,
    message: 'Terlalu banyak request export. Silakan coba lagi dalam 1 jam.',
    error: 'EXPORT_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply authentication and rate limiting to all routes
router.use(authenticateToken);
router.use(requirePrincipalOrAdmin);
router.use(kpiRateLimit);

// ========================
// KPI CRUD Operations
// ========================

// Get all KPIs with filters
// GET /api/kpi?academicYear=2024&period=Semester 1&kpiCategory=Academic&priority=1&trend=increasing
router.get('/', kpiController.getKPIs);

// Get single KPI by ID
// GET /api/kpi/:id
router.get('/:id', kpiController.getKPIById);

// Create new KPI
// POST /api/kpi
router.post('/', kpiController.createKPI);

// Update existing KPI
// PUT /api/kpi/:id
router.put('/:id', kpiController.updateKPI);

// Delete KPI
// DELETE /api/kpi/:id
router.delete('/:id', kpiController.deleteKPI);

// ========================
// KPI Analytics & Reports
// ========================

// Get KPI statistics
// GET /api/kpi/statistics?academicYear=2024&period=Semester 1&includeAnalysis=true
router.get('/statistics', kpiController.getKPIStatistics);

// Get critical KPIs (high priority + low performance)
// GET /api/kpi/critical
router.get('/critical', kpiController.getCriticalKPIs);

// Export KPI report
// GET /api/kpi/export?academicYear=2024&period=Semester 1&format=csv&categories=Academic,Financial
router.get('/export', exportRateLimit, kpiController.exportKPIReport);

// ========================
// KPI Filtered Views
// ========================

// Get KPIs by category
// GET /api/kpi/category/:category (Academic, Operational, Financial, Resource)
router.get('/category/:category', kpiController.getKPIsByCategory);

// Get KPIs by priority
// GET /api/kpi/priority/:priority (1-5)
router.get('/priority/:priority', kpiController.getKPIsByPriority);

export default router;