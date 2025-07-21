"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const facilityController_1 = require("../controllers/facilityController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const router = (0, express_1.Router)();
const facilityController = new facilityController_1.FacilityController();
// Rate limiting for facility endpoints
const facilityRateLimit = (0, express_rate_limit_1.default)({
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
router.use(authMiddleware_1.authenticateToken);
router.use(authMiddleware_1.requirePrincipalOrAdmin);
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
exports.default = router;
