import prisma from '../config/prisma';
import { Prisma } from '@prisma/client';

// Types based on frontend interface
export interface SchoolFinanceResponse {
  id: number;
  schoolId: number;
  budgetYear: string;
  period: string;
  budgetCategory: string;
  budgetAmount: number;
  usedAmount: number;
  remainingAmount: number;
  notes?: string;
  approvalStatus?: boolean;
  approvedBy?: number;
  createdAt: Date;
  updatedAt?: Date;
}

export interface FinancialTransactionResponse {
  id: number;
  schoolFinanceId: number;
  transactionDate: Date;
  transactionType: string;
  amount: number;
  description?: string;
  category?: string;
  vendor?: string;
  receiptNumber?: string;
  approvalStatus?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface GetBudgetsParams {
  budgetYear?: string;
  period?: string;
  budgetCategory?: string;
  page?: number;
  limit?: number;
  schoolId: number;
}

export interface GetTransactionsParams {
  schoolFinanceId?: number;
  transactionType?: string;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  limit?: number;
  schoolId: number;
}

export interface CreateBudgetData {
  budgetYear: string;
  period: string;
  budgetCategory: string;
  budgetAmount: number;
  notes?: string;
}

export interface CreateTransactionData {
  schoolFinanceId: number;
  transactionDate: Date;
  transactionType: string;
  amount: number;
  description: string;
  transactionCategory?: string;
  transactionProof?: string;
}

export class FinanceService {
  // Transform database budget to frontend format
  private transformBudget(budget: any): SchoolFinanceResponse {
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
  private transformTransaction(transaction: any): FinancialTransactionResponse {
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
  async getBudgets(params: GetBudgetsParams): Promise<SchoolFinanceResponse[]> {
    try {
      const { budgetYear, period, budgetCategory, schoolId } = params;

      // Build where clause
      const where: Prisma.SchoolFinanceWhereInput = {
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

      const budgets = await prisma.schoolFinance.findMany({
        where,
        orderBy: [
          { budgetYear: 'desc' },
          { period: 'asc' },
          { budgetCategory: 'asc' }
        ]
      });

      return budgets.map(budget => this.transformBudget(budget));
    } catch (error: any) {
      throw new Error(error.message || 'Gagal mengambil data anggaran');
    }
  }

  // Get budget by ID - equivalent to budgetApi.getBudgetById()
  async getBudgetById(id: number, schoolId: number): Promise<SchoolFinanceResponse | null> {
    try {
      const budget = await prisma.schoolFinance.findFirst({
        where: {
          id: id,
          schoolId: schoolId
        }
      });

      if (!budget) {
        return null;
      }

      return this.transformBudget(budget);
    } catch (error: any) {
      throw new Error(error.message || 'Gagal mengambil data anggaran');
    }
  }

  // Get budgets by category - equivalent to budgetApi.getBudgetsByCategory()
  async getBudgetsByCategory(category: string, schoolId: number): Promise<SchoolFinanceResponse[]> {
    try {
      const budgets = await prisma.schoolFinance.findMany({
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
    } catch (error: any) {
      throw new Error(error.message || 'Gagal mengambil data anggaran berdasarkan kategori');
    }
  }

  // Add new budget - equivalent to budgetApi.addBudget()
  async addBudget(data: CreateBudgetData, schoolId: number): Promise<SchoolFinanceResponse> {
    try {
      // Check if budget already exists for the same year, period, and category
      const existingBudget = await prisma.schoolFinance.findFirst({
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

      const budget = await prisma.schoolFinance.create({
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
    } catch (error: any) {
      throw new Error(error.message || 'Gagal menambahkan anggaran');
    }
  }

  // Update budget - equivalent to budgetApi.updateBudget()
  async updateBudget(id: number, updates: Partial<CreateBudgetData>, schoolId: number): Promise<SchoolFinanceResponse | null> {
    try {
      // Verify budget exists and belongs to school
      const existingBudget = await prisma.schoolFinance.findFirst({
        where: {
          id: id,
          schoolId: schoolId
        }
      });

      if (!existingBudget) {
        throw new Error('Anggaran tidak ditemukan atau bukan bagian dari sekolah ini');
      }

      const updateData: Prisma.SchoolFinanceUpdateInput = {};
      
      if (updates.budgetAmount !== undefined) {
        updateData.budgetAmount = updates.budgetAmount;
        // Recalculate remaining amount
        const currentUsed = existingBudget.usedAmount ? Number(existingBudget.usedAmount) : 0;
        updateData.remainingAmount = updates.budgetAmount - currentUsed;
      }
      
      if (updates.notes !== undefined) updateData.notes = updates.notes;

      const budget = await prisma.schoolFinance.update({
        where: { id: id },
        data: updateData
      });

      return this.transformBudget(budget);
    } catch (error: any) {
      throw new Error(error.message || 'Gagal memperbarui anggaran');
    }
  }

  // Get transactions - equivalent to budgetApi.getTransactions()
  async getTransactions(params: GetTransactionsParams): Promise<FinancialTransactionResponse[]> {
    try {
      const { schoolFinanceId, transactionType, dateFrom, dateTo, schoolId } = params;

      // Build where clause
      const where: Prisma.FinancialTransactionWhereInput = {
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
        if (dateFrom) where.transactionDate.gte = dateFrom;
        if (dateTo) where.transactionDate.lte = dateTo;
      }

      const transactions = await prisma.financialTransaction.findMany({
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
    } catch (error: any) {
      throw new Error(error.message || 'Gagal mengambil data transaksi');
    }
  }

  // Get transactions by budget ID - equivalent to budgetApi.getTransactionsByBudgetId()
  async getTransactionsByBudgetId(budgetId: number, schoolId: number): Promise<FinancialTransactionResponse[]> {
    try {
      // Verify budget belongs to school
      const budget = await prisma.schoolFinance.findFirst({
        where: {
          id: budgetId,
          schoolId: schoolId
        }
      });

      if (!budget) {
        throw new Error('Anggaran tidak ditemukan atau bukan bagian dari sekolah ini');
      }

      const transactions = await prisma.financialTransaction.findMany({
        where: { schoolFinanceId: budgetId },
        orderBy: [
          { transactionDate: 'desc' }
        ]
      });

      return transactions.map(transaction => this.transformTransaction(transaction));
    } catch (error: any) {
      throw new Error(error.message || 'Gagal mengambil data transaksi berdasarkan anggaran');
    }
  }

  // Add new transaction
  async addTransaction(data: CreateTransactionData, schoolId: number, recordedBy?: number): Promise<FinancialTransactionResponse> {
    try {
      // Verify budget exists and belongs to school
      const budget = await prisma.schoolFinance.findFirst({
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
      const transaction = await prisma.financialTransaction.create({
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
      } else if (data.transactionType === 'income') {
        // For income, increase the budget amount and remaining amount
        const currentBudget = budget.budgetAmount ? Number(budget.budgetAmount) : 0;
        await prisma.schoolFinance.update({
          where: { id: data.schoolFinanceId },
          data: {
            budgetAmount: currentBudget + data.amount,
            remainingAmount: newRemainingAmount + data.amount
          }
        });
      } else {
        // For expense transactions
        await prisma.schoolFinance.update({
          where: { id: data.schoolFinanceId },
          data: {
            usedAmount: newUsedAmount,
            remainingAmount: newRemainingAmount
          }
        });
      }

      return this.transformTransaction(transaction);
    } catch (error: any) {
      throw new Error(error.message || 'Gagal menambahkan transaksi');
    }
  }

  // Get financial summary/stats
  async getFinancialSummary(schoolId: number, budgetYear?: string) {
    try {
      const where: Prisma.SchoolFinanceWhereInput = {
        schoolId: schoolId
      };

      if (budgetYear) {
        where.budgetYear = budgetYear;
      }

      // Get budget summary
      const budgetSummary = await prisma.schoolFinance.aggregate({
        where,
        _sum: {
          budgetAmount: true,
          usedAmount: true,
          remainingAmount: true
        }
      });

      // Get budget by category
      const budgetByCategory = await prisma.schoolFinance.groupBy({
        by: ['budgetCategory'],
        where,
        _sum: {
          budgetAmount: true,
          usedAmount: true,
          remainingAmount: true
        }
      });

      // Get recent transactions
      const recentTransactions = await prisma.financialTransaction.findMany({
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
      const monthlySpending = await prisma.financialTransaction.groupBy({
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
    } catch (error: any) {
      throw new Error(error.message || 'Gagal mengambil ringkasan keuangan');
    }
  }

  // Approve budget
  async approveBudget(id: number, approvedBy: number, schoolId: number): Promise<SchoolFinanceResponse> {
    try {
      // Verify budget exists and belongs to school
      const existingBudget = await prisma.schoolFinance.findFirst({
        where: {
          id: id,
          schoolId: schoolId
        }
      });

      if (!existingBudget) {
        throw new Error('Anggaran tidak ditemukan atau bukan bagian dari sekolah ini');
      }

      const budget = await prisma.schoolFinance.update({
        where: { id: id },
        data: {
          approvalStatus: true,
          approvedBy: approvedBy,
          updatedAt: new Date()
        }
      });

      return this.transformBudget(budget);
    } catch (error: any) {
      throw new Error(error.message || 'Gagal menyetujui anggaran');
    }
  }
}