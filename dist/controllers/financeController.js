"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinanceController = void 0;
const financeService_1 = require("../services/financeService");
const resourceValidation_1 = require("../validation/resourceValidation");
class FinanceController {
    constructor() {
        // Get all budgets - equivalent to budgetApi.getBudgets()
        this.getBudgets = async (req, res) => {
            try {
                if (!req.user?.schoolId) {
                    res.status(400).json({
                        success: false,
                        message: 'Informasi sekolah tidak ditemukan',
                        error: 'SCHOOL_INFO_MISSING'
                    });
                    return;
                }
                // Validate query parameters
                const { error, value } = resourceValidation_1.getBudgetsValidation.validate(req.query);
                if (error) {
                    res.status(400).json({
                        success: false,
                        message: 'Parameter tidak valid',
                        errors: error.details.map(detail => ({
                            field: detail.path.join('.'),
                            message: detail.message
                        }))
                    });
                    return;
                }
                const result = await this.financeService.getBudgets({
                    ...value,
                    schoolId: req.user.schoolId
                });
                res.status(200).json({
                    success: true,
                    message: 'Data anggaran berhasil diambil',
                    data: result
                });
            }
            catch (error) {
                console.error('Get budgets error:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || 'Gagal mengambil data anggaran',
                    error: 'GET_BUDGETS_FAILED'
                });
            }
        };
        // Get budget by ID - equivalent to budgetApi.getBudgetById()
        this.getBudgetById = async (req, res) => {
            try {
                if (!req.user?.schoolId) {
                    res.status(400).json({
                        success: false,
                        message: 'Informasi sekolah tidak ditemukan',
                        error: 'SCHOOL_INFO_MISSING'
                    });
                    return;
                }
                const budgetId = parseInt(req.params.id);
                if (isNaN(budgetId)) {
                    res.status(400).json({
                        success: false,
                        message: 'ID anggaran tidak valid',
                        error: 'INVALID_BUDGET_ID'
                    });
                    return;
                }
                const result = await this.financeService.getBudgetById(budgetId, req.user.schoolId);
                if (!result) {
                    res.status(404).json({
                        success: false,
                        message: 'Anggaran tidak ditemukan',
                        error: 'BUDGET_NOT_FOUND'
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    message: 'Data anggaran berhasil diambil',
                    data: result
                });
            }
            catch (error) {
                console.error('Get budget by ID error:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || 'Gagal mengambil data anggaran',
                    error: 'GET_BUDGET_FAILED'
                });
            }
        };
        // Get budgets by category - equivalent to budgetApi.getBudgetsByCategory()
        this.getBudgetsByCategory = async (req, res) => {
            try {
                if (!req.user?.schoolId) {
                    res.status(400).json({
                        success: false,
                        message: 'Informasi sekolah tidak ditemukan',
                        error: 'SCHOOL_INFO_MISSING'
                    });
                    return;
                }
                const category = req.params.category;
                if (!category) {
                    res.status(400).json({
                        success: false,
                        message: 'Kategori anggaran tidak boleh kosong',
                        error: 'CATEGORY_REQUIRED'
                    });
                    return;
                }
                const result = await this.financeService.getBudgetsByCategory(category, req.user.schoolId);
                res.status(200).json({
                    success: true,
                    message: 'Data anggaran berdasarkan kategori berhasil diambil',
                    data: result
                });
            }
            catch (error) {
                console.error('Get budgets by category error:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || 'Gagal mengambil data anggaran berdasarkan kategori',
                    error: 'GET_BUDGETS_BY_CATEGORY_FAILED'
                });
            }
        };
        // Add new budget - equivalent to budgetApi.addBudget()
        this.addBudget = async (req, res) => {
            try {
                if (!req.user?.schoolId) {
                    res.status(400).json({
                        success: false,
                        message: 'Informasi sekolah tidak ditemukan',
                        error: 'SCHOOL_INFO_MISSING'
                    });
                    return;
                }
                // Validate request body
                const { error, value } = resourceValidation_1.createBudgetValidation.validate(req.body);
                if (error) {
                    res.status(400).json({
                        success: false,
                        message: 'Data tidak valid',
                        errors: error.details.map(detail => ({
                            field: detail.path.join('.'),
                            message: detail.message
                        }))
                    });
                    return;
                }
                const result = await this.financeService.addBudget(value, req.user.schoolId);
                res.status(201).json({
                    success: true,
                    message: 'Anggaran berhasil ditambahkan',
                    data: result
                });
            }
            catch (error) {
                console.error('Add budget error:', error);
                res.status(400).json({
                    success: false,
                    message: error.message || 'Gagal menambahkan anggaran',
                    error: 'ADD_BUDGET_FAILED'
                });
            }
        };
        // Update budget - equivalent to budgetApi.updateBudget()
        this.updateBudget = async (req, res) => {
            try {
                if (!req.user?.schoolId) {
                    res.status(400).json({
                        success: false,
                        message: 'Informasi sekolah tidak ditemukan',
                        error: 'SCHOOL_INFO_MISSING'
                    });
                    return;
                }
                const budgetId = parseInt(req.params.id);
                if (isNaN(budgetId)) {
                    res.status(400).json({
                        success: false,
                        message: 'ID anggaran tidak valid',
                        error: 'INVALID_BUDGET_ID'
                    });
                    return;
                }
                // Validate request body
                const { error, value } = resourceValidation_1.updateBudgetValidation.validate(req.body);
                if (error) {
                    res.status(400).json({
                        success: false,
                        message: 'Data tidak valid',
                        errors: error.details.map(detail => ({
                            field: detail.path.join('.'),
                            message: detail.message
                        }))
                    });
                    return;
                }
                const result = await this.financeService.updateBudget(budgetId, value, req.user.schoolId);
                if (!result) {
                    res.status(404).json({
                        success: false,
                        message: 'Anggaran tidak ditemukan',
                        error: 'BUDGET_NOT_FOUND'
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    message: 'Anggaran berhasil diperbarui',
                    data: result
                });
            }
            catch (error) {
                console.error('Update budget error:', error);
                res.status(400).json({
                    success: false,
                    message: error.message || 'Gagal memperbarui anggaran',
                    error: 'UPDATE_BUDGET_FAILED'
                });
            }
        };
        // Get transactions - equivalent to budgetApi.getTransactions()
        this.getTransactions = async (req, res) => {
            try {
                if (!req.user?.schoolId) {
                    res.status(400).json({
                        success: false,
                        message: 'Informasi sekolah tidak ditemukan',
                        error: 'SCHOOL_INFO_MISSING'
                    });
                    return;
                }
                // Validate query parameters
                const { error, value } = resourceValidation_1.getTransactionsValidation.validate(req.query);
                if (error) {
                    res.status(400).json({
                        success: false,
                        message: 'Parameter tidak valid',
                        errors: error.details.map(detail => ({
                            field: detail.path.join('.'),
                            message: detail.message
                        }))
                    });
                    return;
                }
                const result = await this.financeService.getTransactions({
                    ...value,
                    schoolId: req.user.schoolId
                });
                res.status(200).json({
                    success: true,
                    message: 'Data transaksi berhasil diambil',
                    data: result
                });
            }
            catch (error) {
                console.error('Get transactions error:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || 'Gagal mengambil data transaksi',
                    error: 'GET_TRANSACTIONS_FAILED'
                });
            }
        };
        // Get transactions by budget ID - equivalent to budgetApi.getTransactionsByBudgetId()
        this.getTransactionsByBudgetId = async (req, res) => {
            try {
                if (!req.user?.schoolId) {
                    res.status(400).json({
                        success: false,
                        message: 'Informasi sekolah tidak ditemukan',
                        error: 'SCHOOL_INFO_MISSING'
                    });
                    return;
                }
                const budgetId = parseInt(req.params.budgetId);
                if (isNaN(budgetId)) {
                    res.status(400).json({
                        success: false,
                        message: 'ID anggaran tidak valid',
                        error: 'INVALID_BUDGET_ID'
                    });
                    return;
                }
                const result = await this.financeService.getTransactionsByBudgetId(budgetId, req.user.schoolId);
                res.status(200).json({
                    success: true,
                    message: 'Data transaksi berdasarkan anggaran berhasil diambil',
                    data: result
                });
            }
            catch (error) {
                console.error('Get transactions by budget ID error:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || 'Gagal mengambil data transaksi berdasarkan anggaran',
                    error: 'GET_TRANSACTIONS_BY_BUDGET_FAILED'
                });
            }
        };
        // Add new transaction
        this.addTransaction = async (req, res) => {
            try {
                if (!req.user?.schoolId) {
                    res.status(400).json({
                        success: false,
                        message: 'Informasi sekolah tidak ditemukan',
                        error: 'SCHOOL_INFO_MISSING'
                    });
                    return;
                }
                // Validate request body
                const { error, value } = resourceValidation_1.createTransactionValidation.validate(req.body);
                if (error) {
                    res.status(400).json({
                        success: false,
                        message: 'Data tidak valid',
                        errors: error.details.map(detail => ({
                            field: detail.path.join('.'),
                            message: detail.message
                        }))
                    });
                    return;
                }
                const result = await this.financeService.addTransaction(value, req.user.schoolId, req.user.userId);
                res.status(201).json({
                    success: true,
                    message: 'Transaksi berhasil ditambahkan',
                    data: result
                });
            }
            catch (error) {
                console.error('Add transaction error:', error);
                res.status(400).json({
                    success: false,
                    message: error.message || 'Gagal menambahkan transaksi',
                    error: 'ADD_TRANSACTION_FAILED'
                });
            }
        };
        // Get financial summary
        this.getFinancialSummary = async (req, res) => {
            try {
                if (!req.user?.schoolId) {
                    res.status(400).json({
                        success: false,
                        message: 'Informasi sekolah tidak ditemukan',
                        error: 'SCHOOL_INFO_MISSING'
                    });
                    return;
                }
                const budgetYear = req.query.budgetYear;
                const result = await this.financeService.getFinancialSummary(req.user.schoolId, budgetYear);
                res.status(200).json({
                    success: true,
                    message: 'Ringkasan keuangan berhasil diambil',
                    data: result
                });
            }
            catch (error) {
                console.error('Get financial summary error:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || 'Gagal mengambil ringkasan keuangan',
                    error: 'GET_FINANCIAL_SUMMARY_FAILED'
                });
            }
        };
        // Approve budget
        this.approveBudget = async (req, res) => {
            try {
                if (!req.user?.schoolId) {
                    res.status(400).json({
                        success: false,
                        message: 'Informasi sekolah tidak ditemukan',
                        error: 'SCHOOL_INFO_MISSING'
                    });
                    return;
                }
                const budgetId = parseInt(req.params.id);
                if (isNaN(budgetId)) {
                    res.status(400).json({
                        success: false,
                        message: 'ID anggaran tidak valid',
                        error: 'INVALID_BUDGET_ID'
                    });
                    return;
                }
                // Check if user has permission to approve (principal or admin)
                if (!['principal', 'admin'].includes(req.user.role)) {
                    res.status(403).json({
                        success: false,
                        message: 'Tidak memiliki izin untuk menyetujui anggaran',
                        error: 'INSUFFICIENT_PERMISSION'
                    });
                    return;
                }
                const result = await this.financeService.approveBudget(budgetId, req.user.userId, req.user.schoolId);
                res.status(200).json({
                    success: true,
                    message: 'Anggaran berhasil disetujui',
                    data: result
                });
            }
            catch (error) {
                console.error('Approve budget error:', error);
                res.status(400).json({
                    success: false,
                    message: error.message || 'Gagal menyetujui anggaran',
                    error: 'APPROVE_BUDGET_FAILED'
                });
            }
        };
        // Get budget categories (helper endpoint)
        this.getBudgetCategories = async (req, res) => {
            try {
                if (!req.user?.schoolId) {
                    res.status(400).json({
                        success: false,
                        message: 'Informasi sekolah tidak ditemukan',
                        error: 'SCHOOL_INFO_MISSING'
                    });
                    return;
                }
                // Get distinct budget categories for this school
                const budgets = await this.financeService.getBudgets({
                    schoolId: req.user.schoolId
                });
                const categories = [...new Set(budgets.map(budget => budget.budgetCategory))];
                res.status(200).json({
                    success: true,
                    message: 'Kategori anggaran berhasil diambil',
                    data: categories
                });
            }
            catch (error) {
                console.error('Get budget categories error:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || 'Gagal mengambil kategori anggaran',
                    error: 'GET_BUDGET_CATEGORIES_FAILED'
                });
            }
        };
        // Get spending report by period
        this.getSpendingReport = async (req, res) => {
            try {
                if (!req.user?.schoolId) {
                    res.status(400).json({
                        success: false,
                        message: 'Informasi sekolah tidak ditemukan',
                        error: 'SCHOOL_INFO_MISSING'
                    });
                    return;
                }
                const { budgetYear, period } = req.query;
                const result = await this.financeService.getBudgets({
                    schoolId: req.user.schoolId,
                    budgetYear: budgetYear,
                    period: period
                });
                // Calculate spending percentages
                const spendingReport = result.map(budget => ({
                    budgetCategory: budget.budgetCategory,
                    budgetAmount: budget.budgetAmount,
                    usedAmount: budget.usedAmount,
                    remainingAmount: budget.remainingAmount,
                    spendingPercentage: budget.budgetAmount > 0
                        ? Math.round((budget.usedAmount / budget.budgetAmount) * 100)
                        : 0,
                    status: budget.usedAmount > budget.budgetAmount * 0.9
                        ? 'warning'
                        : budget.usedAmount > budget.budgetAmount * 0.7
                            ? 'caution'
                            : 'normal'
                }));
                res.status(200).json({
                    success: true,
                    message: 'Laporan pengeluaran berhasil diambil',
                    data: spendingReport
                });
            }
            catch (error) {
                console.error('Get spending report error:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || 'Gagal mengambil laporan pengeluaran',
                    error: 'GET_SPENDING_REPORT_FAILED'
                });
            }
        };
        this.financeService = new financeService_1.FinanceService();
    }
}
exports.FinanceController = FinanceController;
