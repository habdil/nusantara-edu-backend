import { Router } from 'express';
import { AssetController } from '../controllers/assetController';
import { authenticateToken, requirePrincipalOrAdmin } from '../middlewares/authMiddleware';
import rateLimit from 'express-rate-limit';

const router = Router();
const assetController = new AssetController();

// Rate limiting for asset endpoints
const assetRateLimit = rateLimit({
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
router.use(authenticateToken);
router.use(requirePrincipalOrAdmin);
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

export default router;