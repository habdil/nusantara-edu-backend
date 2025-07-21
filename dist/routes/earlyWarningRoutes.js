"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/earlyWarningRoutes.ts
const express_1 = require("express");
const earlyWarningController_1 = require("../controllers/earlyWarningController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const router = (0, express_1.Router)();
const earlyWarningController = new earlyWarningController_1.EarlyWarningController();
// Rate limiting for early warning endpoints
const earlyWarningRateLimit = (0, express_rate_limit_1.default)({
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
router.use(authMiddleware_1.authenticateToken);
router.use(authMiddleware_1.requirePrincipalOrAdmin);
router.use(earlyWarningRateLimit);
// GET endpoints - Read operations
router.get('/', earlyWarningController.getWarnings);
router.get('/stats', earlyWarningController.getStats);
// POST endpoints - Analysis operations  
router.post('/generate', earlyWarningController.generateWarnings); // ✅ Real data analysis
exports.default = router;
