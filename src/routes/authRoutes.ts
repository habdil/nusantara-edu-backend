import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticateToken, requirePrincipal } from '../middlewares/authMiddleware';
import rateLimit from 'express-rate-limit';

const router = Router();
const authController = new AuthController();

// Public routes (tidak perlu autentikasi)
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes (perlu autentikasi)
router.post('/logout', authenticateToken, authController.logout);
router.get('/profile', authenticateToken, authController.getProfile);
router.put('/profile', authenticateToken, authController.updateProfile);
router.put('/change-password', authenticateToken, authController.changePassword);

// Dashboard specific routes
router.get('/dashboard-info', authenticateToken, authController.getDashboardInfo);

// Principal only routes (jika diperlukan di masa depan)
router.get('/principal/verify', authenticateToken, requirePrincipal, (req, res) => {
  res.json({
    success: true,
    message: 'Akses kepala sekolah terverifikasi',
    data: {
      user: req.user
    }
  });
});

export default router;