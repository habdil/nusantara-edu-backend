"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinanceService = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
class FinanceService {
    // Transform database budget to frontend format
    transformBudget(budget) {
        return {
            id: budget.id,
            schoolId: budget.schoolId,
            budgetYear: budget.budgetYear,
            period: budget.period,
            budgetCategory: budget.budgetCategory,
            budgetAmount: budget.budgetAmount ? Number(budget.budgetAmount) : 0,
            usedAmount: budget.usedAmount ? Number(budget.usedAmount) : 0,
            remainingAmount: budget.remainingAmount ? Number(budget.remainingAmount) : 0,
            notes: budget.notes || undefined,
            approvalStatus: budget.approvalStatus || undefined,
            approvedBy: budget.approvedBy || undefined,
            createdAt: budget.createdAt,
            updatedAt: budget.updatedAt
        };
    }
    // Transform database transaction to frontend format
    transformTransaction(transaction) {
        return {
            id: transaction.id,
            schoolFinanceId: transaction.schoolFinanceId,
            transactionDate: transaction.transactionDate,
            transactionType: transaction.transactionType,
            amount: transaction.amount ? Number(transaction.amount) : 0,
            description: transaction.description || undefined,
            category: transaction.transactionCategory || undefined,
            vendor: undefined, // Not in database schema - could be extracted from description
            receiptNumber: undefined, // Not in database schema - could be stored in transactionProof
            approvalStatus: 'approved', // Default status since it's in database
            createdAt: transaction.createdAt,
            updatedAt: transaction.updatedAt
        };
    }
    // Get all budgets - equivalent to budgetApi.getBudgets()
    async getBudgets(params) {
        try {
            const { budgetYear, period, budgetCategory, schoolId } = params;
            // Build where clause
            const where = {
                schoolId: schoolId
            };
            if (budgetYear) {
                where.budgetYear = budgetYear;
            }
            if (period) {
                where.period = { contains: period, mode: 'insensitive' };
            }
            if (budgetCategory) {
                where.budgetCategory = { contains: budgetCategory, mode: 'insensitive' };
            }
            const budgets = await prisma_1.default.schoolFinance.findMany({
                where,
                orderBy: [
                    { budgetYear: 'desc' },
                    { period: 'asc' },
                    { budgetCategory: 'asc' }
                ]
            });
            return budgets.map(budget => this.transformBudget(budget));
        }
        catch (error) {
            throw new Error(error.message || 'Gagal mengambil data anggaran');
        }
    }
    // Get budget by ID - equivalent to budgetApi.getBudgetById()
    async getBudgetById(id, schoolId) {
        try {
            const budget = await prisma_1.default.schoolFinance.findFirst({
                where: {
                    id: id,
                    schoolId: schoolId
                }
            });
            if (!budget) {
                return null;
            }
            return this.transformBudget(budget);
        }
        catch (error) {
            throw new Error(error.message || 'Gagal mengambil data anggaran');
        }
    }
    // Get budgets by category - equivalent to budgetApi.getBudgetsByCategory()
    async getBudgetsByCategory(category, schoolId) {
        try {
            const budgets = await prisma_1.default.schoolFinance.findMany({
                where: {
                    schoolId: schoolId,
                    budgetCategory: { contains: category, mode: 'insensitive' }
                },
                orderBy: [
                    { budgetYear: 'desc' },
                    { period: 'asc' }
                ]
            });
            return budgets.map(budget => this.transformBudget(budget));
        }
        catch (error) {
            throw new Error(error.message || 'Gagal mengambil data anggaran berdasarkan kategori');
        }
    }
    // Add new budget - equivalent to budgetApi.addBudget()
    async addBudget(data, schoolId) {
        try {
            // Check if budget already exists for the same year, period, and category
            const existingBudget = await prisma_1.default.schoolFinance.findFirst({
                where: {
                    schoolId: schoolId,
                    budgetYear: data.budgetYear,
                    period: data.period,
                    budgetCategory: data.budgetCategory
                }
            });
            if (existingBudget) {
                throw new Error('Anggaran untuk tahun, periode, dan kategori ini sudah ada');
            }
            const budget = await prisma_1.default.schoolFinance.create({
                data: {
                    schoolId: schoolId,
                    budgetYear: data.budgetYear,
                    period: data.period,
                    budgetCategory: data.budgetCategory,
                    budgetAmount: data.budgetAmount,
                    usedAmount: 0, // Default to 0
                    remainingAmount: data.budgetAmount, // Initially equals budgetAmount
                    notes: data.notes,
                    approvalStatus: false // Default to false, needs approval
                }
            });
            return this.transformBudget(budget);
        }
        catch (error) {
            throw new Error(error.message || 'Gagal menambahkan anggaran');
        }
    }
    // Update budget - equivalent to budgetApi.updateBudget()
    async updateBudget(id, updates, schoolId) {
        try {
            // Verify budget exists and belongs to school
            const existingBudget = await prisma_1.default.schoolFinance.findFirst({
                where: {
                    id: id,
                    schoolId: schoolId
                }
            });
            if (!existingBudget) {
                throw new Error('Anggaran tidak ditemukan atau bukan bagian dari sekolah ini');
            }
            const updateData = {};
            if (updates.budgetAmount !== undefined) {
                updateData.budgetAmount = updates.budgetAmount;
                // Recalculate remaining amount
                const currentUsed = existingBudget.usedAmount ? Number(existingBudget.usedAmount) : 0;
                updateData.remainingAmount = updates.budgetAmount - currentUsed;
            }
            if (updates.notes !== undefined)
                updateData.notes = updates.notes;
            const budget = await prisma_1.default.schoolFinance.update({
                where: { id: id },
                data: updateData
            });
            return this.transformBudget(budget);
        }
        catch (error) {
            throw new Error(error.message || 'Gagal memperbarui anggaran');
        }
    }
    // Get transactions - equivalent to budgetApi.getTransactions()
    async getTransactions(params) {
        try {
            const { schoolFinanceId, transactionType, dateFrom, dateTo, schoolId } = params;
            // Build where clause
            const where = {
                schoolFinance: {
                    schoolId: schoolId
                }
            };
            if (schoolFinanceId) {
                where.schoolFinanceId = schoolFinanceId;
            }
            if (transactionType) {
                where.transactionType = transactionType;
            }
            if (dateFrom || dateTo) {
                where.transactionDate = {};
                if (dateFrom)
                    where.transactionDate.gte = dateFrom;
                if (dateTo)
                    where.transactionDate.lte = dateTo;
            }
            const transactions = await prisma_1.default.financialTransaction.findMany({
                where,
                include: {
                    schoolFinance: {
                        select: {
                            budgetCategory: true,
                            budgetYear: true,
                            period: true
                        }
                    }
                },
                orderBy: [
                    { transactionDate: 'desc' }
                ]
            });
            return transactions.map(transaction => this.transformTransaction(transaction));
        }
        catch (error) {
            throw new Error(error.message || 'Gagal mengambil data transaksi');
        }
    }
    // Get transactions by budget ID - equivalent to budgetApi.getTransactionsByBudgetId()
    async getTransactionsByBudgetId(budgetId, schoolId) {
        try {
            // Verify budget belongs to school
            const budget = await prisma_1.default.schoolFinance.findFirst({
                where: {
                    id: budgetId,
                    schoolId: schoolId
                }
            });
            if (!budget) {
                throw new Error('Anggaran tidak ditemukan atau bukan bagian dari sekolah ini');
            }
            const transactions = await prisma_1.default.financialTransaction.findMany({
                where: { schoolFinanceId: budgetId },
                orderBy: [
                    { transactionDate: 'desc' }
                ]
            });
            return transactions.map(transaction => this.transformTransaction(transaction));
        }
        catch (error) {
            throw new Error(error.message || 'Gagal mengambil data transaksi berdasarkan anggaran');
        }
    }
    // Add new transaction
    async addTransaction(data, schoolId, recordedBy) {
        try {
            // Verify budget exists and belongs to school
            const budget = await prisma_1.default.schoolFinance.findFirst({
                where: {
                    id: data.schoolFinanceId,
                    schoolId: schoolId
                }
            });
            if (!budget) {
                throw new Error('Anggaran tidak ditemukan atau bukan bagian dari sekolah ini');
            }
            // Check if budget has enough remaining amount for expense
            if (data.transactionType === 'expense') {
                const currentRemaining = budget.remainingAmount ? Number(budget.remainingAmount) : 0;
                if (data.amount > currentRemaining) {
                    throw new Error('Jumlah transaksi melebihi sisa anggaran yang tersedia');
                }
            }
            // Create transaction
            const transaction = await prisma_1.default.financialTransaction.create({
                data: {
                    schoolFinanceId: data.schoolFinanceId,
                    transactionDate: data.transactionDate,
                    transactionType: data.transactionType,
                    amount: data.amount,
                    description: data.description,
                    transactionCategory: data.transactionCategory,
                    transactionProof: data.transactionProof,
                    recordedBy: recordedBy
                }
            });
            // Update budget amounts
            const currentUsed = budget.usedAmount ? Number(budget.usedAmount) : 0;
            const currentRemaining = budget.remainingAmount ? Number(budget.remainingAmount) : 0;
            let newUsedAmount = currentUsed;
            let newRemainingAmount = currentRemaining;
            if (data.transactionType === 'expense') {
                newUsedAmount = currentUsed + data.amount;
                newRemainingAmount = currentRemaining - data.amount;
            }
            else if (data.transactionType === 'income') {
                // For income, increase the budget amount and remaining amount
                const currentBudget = budget.budgetAmount ? Number(budget.budgetAmount) : 0;
                await prisma_1.default.schoolFinance.update({
                    where: { id: data.schoolFinanceId },
                    data: {
                        budgetAmount: currentBudget + data.amount,
                        remainingAmount: newRemainingAmount + data.amount
                    }
                });
            }
            else {
                // For expense transactions
                await prisma_1.default.schoolFinance.update({
                    where: { id: data.schoolFinanceId },
                    data: {
                        usedAmount: newUsedAmount,
                        remainingAmount: newRemainingAmount
                    }
                });
            }
            return this.transformTransaction(transaction);
        }
        catch (error) {
            throw new Error(error.message || 'Gagal menambahkan transaksi');
        }
    }
    // Get financial summary/stats
    async getFinancialSummary(schoolId, budgetYear) {
        try {
            const where = {
                schoolId: schoolId
            };
            if (budgetYear) {
                where.budgetYear = budgetYear;
            }
            // Get budget summary
            const budgetSummary = await prisma_1.default.schoolFinance.aggregate({
                where,
                _sum: {
                    budgetAmount: true,
                    usedAmount: true,
                    remainingAmount: true
                }
            });
            // Get budget by category
            const budgetByCategory = await prisma_1.default.schoolFinance.groupBy({
                by: ['budgetCategory'],
                where,
                _sum: {
                    budgetAmount: true,
                    usedAmount: true,
                    remainingAmount: true
                }
            });
            // Get recent transactions
            const recentTransactions = await prisma_1.default.financialTransaction.findMany({
                where: {
                    schoolFinance: {
                        schoolId: schoolId,
                        ...(budgetYear && { budgetYear })
                    }
                },
                take: 10,
                orderBy: {
                    transactionDate: 'desc'
                },
                include: {
                    schoolFinance: {
                        select: {
                            budgetCategory: true
                        }
                    }
                }
            });
            // Calculate monthly spending trend
            const monthlySpending = await prisma_1.default.financialTransaction.groupBy({
                by: ['transactionDate'],
                where: {
                    schoolFinance: {
                        schoolId: schoolId,
                        ...(budgetYear && { budgetYear })
                    },
                    transactionType: 'expense'
                },
                _sum: {
                    amount: true
                }
            });
            return {
                totalBudget: budgetSummary._sum.budgetAmount ? Number(budgetSummary._sum.budgetAmount) : 0,
                totalUsed: budgetSummary._sum.usedAmount ? Number(budgetSummary._sum.usedAmount) : 0,
                totalRemaining: budgetSummary._sum.remainingAmount ? Number(budgetSummary._sum.remainingAmount) : 0,
                budgetByCategory: budgetByCategory.map(item => ({
                    category: item.budgetCategory,
                    budgetAmount: item._sum.budgetAmount ? Number(item._sum.budgetAmount) : 0,
                    usedAmount: item._sum.usedAmount ? Number(item._sum.usedAmount) : 0,
                    remainingAmount: item._sum.remainingAmount ? Number(item._sum.remainingAmount) : 0,
                    usagePercentage: item._sum.budgetAmount && item._sum.usedAmount
                        ? Math.round((Number(item._sum.usedAmount) / Number(item._sum.budgetAmount)) * 100)
                        : 0
                })),
                recentTransactions: recentTransactions.map(transaction => this.transformTransaction(transaction))
            };
        }
        catch (error) {
            throw new Error(error.message || 'Gagal mengambil ringkasan keuangan');
        }
    }
    // Approve budget
    async approveBudget(id, approvedBy, schoolId) {
        try {
            // Verify budget exists and belongs to school
            const existingBudget = await prisma_1.default.schoolFinance.findFirst({
                where: {
                    id: id,
                    schoolId: schoolId
                }
            });
            if (!existingBudget) {
                throw new Error('Anggaran tidak ditemukan atau bukan bagian dari sekolah ini');
            }
            const budget = await prisma_1.default.schoolFinance.update({
                where: { id: id },
                data: {
                    approvalStatus: true,
                    approvedBy: approvedBy,
                    updatedAt: new Date()
                }
            });
            return this.transformBudget(budget);
        }
        catch (error) {
            throw new Error(error.message || 'Gagal menyetujui anggaran');
        }
    }
}
exports.FinanceService = FinanceService;
