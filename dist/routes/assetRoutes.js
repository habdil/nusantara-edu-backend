"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const assetController_1 = require("../controllers/assetController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const router = (0, express_1.Router)();
const assetController = new assetController_1.AssetController();
// Rate limiting for asset endpoints
const assetRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 150, // Maximum 150 requests per 15 minutes per IP
    message: {
        success: false,
        message: 'Terlalu banyak request untuk endpoint aset. Silakan coba lagi nanti.',
        error: 'ASSET_RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
// Apply authentication and rate limiting to all routes
router.use(authMiddleware_1.authenticateToken);
router.use(authMiddleware_1.requirePrincipalOrAdmin);
router.use(assetRateLimit);
// ===== ASSET ENDPOINTS =====
// Get asset statistics (must be before /:id to avoid conflicts)
router.get('/stats', assetController.getAssetStats);
// Get assets by category (must be before /:id to avoid conflicts)
router.get('/category/:category', assetController.getAssetsByCategory);
// Get all assets with filtering
router.get('/', assetController.getAssets);
// Get single asset by ID
router.get('/:id', assetController.getAssetById);
// Create new asset
router.post('/', assetController.addAsset);
// Update existing asset
router.put('/:id', assetController.updateAsset);
// Delete asset
router.delete('/:id', assetController.deleteAsset);
// ===== ASSET MAINTENANCE ENDPOINTS =====
// Get maintenance records for specific asset
router.get('/:assetId/maintenance', assetController.getMaintenanceRecords);
// Get all maintenance records (separate endpoint)
router.get('/maintenance/all', assetController.getAllMaintenanceRecords);
// Add maintenance record
router.post('/maintenance', assetController.addMaintenanceRecord);
exports.default = router;
