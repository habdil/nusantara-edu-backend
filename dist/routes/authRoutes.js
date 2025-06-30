"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
const authController = new authController_1.AuthController();
// Public routes (tidak perlu autentikasi)
router.post('/register', authController.register);
router.post('/login', authController.login);
// Protected routes (perlu autentikasi)
router.post('/logout', authMiddleware_1.authenticateToken, authController.logout);
router.get('/profile', authMiddleware_1.authenticateToken, authController.getProfile);
router.put('/profile', authMiddleware_1.authenticateToken, authController.updateProfile);
router.put('/change-password', authMiddleware_1.authenticateToken, authController.changePassword);
// Dashboard specific routes
router.get('/dashboard-info', authMiddleware_1.authenticateToken, authController.getDashboardInfo);
// Principal only routes (jika diperlukan di masa depan)
router.get('/principal/verify', authMiddleware_1.authenticateToken, authMiddleware_1.requirePrincipal, (req, res) => {
    res.json({
        success: true,
        message: 'Akses kepala sekolah terverifikasi',
        data: {
            user: req.user
        }
    });
});
exports.default = router;
