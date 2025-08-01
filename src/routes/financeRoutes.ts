import { Router } from 'express';
import { FinanceController } from '../controllers/financeController';
import { authenticateToken, requirePrincipalOrAdmin } from '../middlewares/authMiddleware';
import rateLimit from 'express-rate-limit';

const router = Router();
const financeController = new FinanceController();

// Rate limiting for finance endpoints
const financeRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Maximum 100 requests per 15 minutes per IP
  message: {
    success: false,
    message: 'Terlalu banyak request untuk endpoint keuangan. Silakan coba lagi nanti.',
    error: 'FINANCE_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply authentication and rate limiting to all routes
router.use(authenticateToken);
router.use(requirePrincipalOrAdmin);
router.use(financeRateLimit);

// ===== BUDGET ENDPOINTS =====

// Get budget categories (must be before other budget routes)
router.get('/budgets/categories', financeController.getBudgetCategories);

// Get budgets by category (must be before /:id to avoid conflicts)
router.get('/budgets/category/:category', financeController.getBudgetsByCategory);

// Get all budgets with filtering
router.get('/budgets', financeController.getBudgets);

// Get single budget by ID
router.get('/budgets/:id', financeController.getBudgetById);

// Create new budget
router.post('/budgets', financeController.addBudget);

// Update existing budget
router.put('/budgets/:id', financeController.updateBudget);

// Approve budget (special endpoint)
router.put('/budgets/:id/approve', financeController.approveBudget);

// Get transactions for specific budget
router.get('/budgets/:budgetId/transactions', financeController.getTransactionsByBudgetId);

// ===== TRANSACTION ENDPOINTS =====

// Get all transactions with filtering
router.get('/transactions', financeController.getTransactions);

// Create new transaction
router.post('/transactions', financeController.addTransaction);

// ===== FINANCIAL ANALYTICS ENDPOINTS =====

// Get financial summary
router.get('/summary', financeController.getFinancialSummary);

// Get spending report
router.get('/spending-report', financeController.getSpendingReport);

export default router;