"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/aiRecommendationRoutes.ts
const express_1 = require("express");
const aiRecommendationController_1 = require("../controllers/aiRecommendationController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const router = (0, express_1.Router)();
const aiRecommendationController = new aiRecommendationController_1.AIRecommendationController();
// Rate limiting for AI recommendation endpoints
const aiRecommendationRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Maximum 100 requests per 15 minutes per IP
    message: {
        success: false,
        message: 'Terlalu banyak request untuk endpoint AI recommendations. Silakan coba lagi nanti.',
        error: 'AI_RECOMMENDATION_RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
// Rate limiting for update operations (more restrictive)
const updateRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 20, // Maximum 20 updates per 5 minutes per IP
    message: {
        success: false,
        message: 'Terlalu banyak operasi update. Silakan coba lagi nanti.',
        error: 'UPDATE_RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
// Rate limiting for generate operation (very restrictive)
const generateRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 3, // Maximum 3 generate per 10 minutes per IP
    message: {
        success: false,
        message: 'Terlalu banyak operasi generate rekomendasi. Silakan tunggu 10 menit.',
        error: 'GENERATE_RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
// Apply authentication and rate limiting to all routes
router.use(authMiddleware_1.authenticateToken);
router.use(authMiddleware_1.requirePrincipalOrAdmin);
router.use(aiRecommendationRateLimit);
// GET endpoints - Read operations
router.get('/', aiRecommendationController.getRecommendations);
router.get('/stats', aiRecommendationController.getStats);
router.get('/trending', aiRecommendationController.getTrendingCategories);
router.get('/:id', aiRecommendationController.getRecommendation);
// POST endpoints - Create operations (with stricter rate limiting)
router.post('/generate', generateRateLimit, aiRecommendationController.generateRecommendations); // ✅ Added generate endpoint
// PUT endpoints - Update operations (with stricter rate limiting)
router.put('/:id', updateRateLimit, aiRecommendationController.updateRecommendation);
router.put('/bulk/status', updateRateLimit, aiRecommendationController.bulkUpdateStatus);
// DELETE endpoints - Delete operations (with stricter rate limiting)
router.delete('/:id', updateRateLimit, aiRecommendationController.deleteRecommendation);
router.delete('/cleanup/old', updateRateLimit, aiRecommendationController.cleanupOld);
exports.default = router;
