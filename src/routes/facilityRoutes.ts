import { Router } from 'express';
import { FacilityController } from '../controllers/facilityController';
import { authenticateToken, requirePrincipalOrAdmin } from '../middlewares/authMiddleware';
import rateLimit from 'express-rate-limit';

const router = Router();
const facilityController = new FacilityController();

// Rate limiting for facility endpoints
const facilityRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 120, // Maximum 120 requests per 15 minutes per IP
  message: {
    success: false,
    message: 'Terlalu banyak request untuk endpoint fasilitas. Silakan coba lagi nanti.',
    error: 'FACILITY_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply authentication and rate limiting to all routes
router.use(authenticateToken);
router.use(requirePrincipalOrAdmin);
router.use(facilityRateLimit);

// ===== FACILITY ENDPOINTS =====

// Get facility statistics (must be before /:id to avoid conflicts)
router.get('/stats', facilityController.getFacilityStats);

// Get facility types (must be before /:id to avoid conflicts)
router.get('/types', facilityController.getFacilityTypes);

// Get facility utilization report (must be before /:id to avoid conflicts)
router.get('/utilization-report', facilityController.getFacilityUtilizationReport);

// Get facilities by type (must be before /:id to avoid conflicts)
router.get('/type/:type', facilityController.getFacilitiesByType);

// Get all facilities with filtering
router.get('/', facilityController.getFacilities);

// Get single facility by ID
router.get('/:id', facilityController.getFacilityById);

// Create new facility
router.post('/', facilityController.addFacility);

// Update existing facility
router.put('/:id', facilityController.updateFacility);

// Delete facility
router.delete('/:id', facilityController.deleteFacility);

// Get facility usage for specific facility
router.get('/:facilityId/usage', facilityController.getFacilityUsageByFacilityId);

// ===== FACILITY USAGE/BOOKING ENDPOINTS =====

// Get all facility usage records with filtering
router.get('/usage/all', facilityController.getFacilityUsage);

// Create new facility usage/booking
router.post('/usage', facilityController.addFacilityUsage);

// Update facility usage approval status
router.put('/usage/:usageId/approval', facilityController.updateFacilityUsageApproval);

export default router;