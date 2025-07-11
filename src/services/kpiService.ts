import prisma from '../config/prisma';
import { Prisma } from '@prisma/client';

export interface GetKPIsParams {
  academicYear?: string;
  period?: string;
  kpiCategory?: string;
  priority?: number;
  trend?: string;
  schoolId: number;
}

export interface CreateKPIData {
  kpiCategory: string;
  kpiName: string;
  academicYear: string;
  period: string;
  targetValue: number;
  achievedValue?: number;
  achievementPercentage?: number;
  trend?: string;
  priority?: number;
  analysis?: string;
}

export interface UpdateKPIData {
  kpiCategory?: string;
  kpiName?: string;
  targetValue?: number;
  achievedValue?: number;
  achievementPercentage?: number;
  trend?: string;
  priority?: number;
  analysis?: string;
}

export interface KPIStatistics {
  totalKPIs: number;
  averageAchievement: number;
  excellentCount: number;
  goodCount: number;
  needsAttentionCount: number;
  criticalCount: number;
  byCategory: Record<string, {
    count: number;
    averageAchievement: number;
  }>;
}

export class KPIService {
  
  // Get KPIs with filters
  async getKPIs(params: GetKPIsParams) {
    try {
      const { academicYear, period, kpiCategory, priority, trend, schoolId } = params;

      // Build where clause
      const where: Prisma.SchoolKpiWhereInput = {
        schoolId: schoolId
      };

      if (academicYear) where.academicYear = academicYear;
      if (period) where.period = period;
      if (kpiCategory) where.kpiCategory = kpiCategory;
      if (priority) where.priority = priority;
      if (trend) where.trend = trend;

      const kpis = await prisma.schoolKpi.findMany({
        where,
        orderBy: [
          { priority: 'asc' },
          { kpiCategory: 'asc' },
          { kpiName: 'asc' }
        ]
      });

      // Convert Decimal to number for frontend compatibility
      const transformedKpis = kpis.map(kpi => ({
        ...kpi,
        targetValue: kpi.targetValue ? Number(kpi.targetValue) : null,
        achievedValue: kpi.achievedValue ? Number(kpi.achievedValue) : null,
        achievementPercentage: kpi.achievementPercentage ? Number(kpi.achievementPercentage) : null
      }));

      return transformedKpis;
    } catch (error: any) {
      throw new Error(error.message || 'Gagal mengambil data KPI');
    }
  }

  // Get KPI by ID
  async getKPIById(id: number, schoolId: number) {
    try {
      const kpi = await prisma.schoolKpi.findFirst({
        where: {
          id: id,
          schoolId: schoolId
        }
      });

      if (!kpi) {
        throw new Error('KPI tidak ditemukan atau bukan bagian dari sekolah ini');
      }

      // Convert Decimal to number for frontend compatibility
      const transformedKpi = {
        ...kpi,
        targetValue: kpi.targetValue ? Number(kpi.targetValue) : null,
        achievedValue: kpi.achievedValue ? Number(kpi.achievedValue) : null,
        achievementPercentage: kpi.achievementPercentage ? Number(kpi.achievementPercentage) : null
      };

      return transformedKpi;
    } catch (error: any) {
      throw new Error(error.message || 'Gagal mengambil data KPI');
    }
  }

  // Get KPIs by category
  async getKPIsByCategory(category: string, schoolId: number) {
    try {
      const kpis = await prisma.schoolKpi.findMany({
        where: {
          schoolId: schoolId,
          kpiCategory: category
        },
        orderBy: [
          { priority: 'asc' },
          { kpiName: 'asc' }
        ]
      });

      return kpis;
    } catch (error: any) {
      throw new Error(error.message || 'Gagal mengambil data KPI berdasarkan kategori');
    }
  }

  // Get KPIs by priority
  async getKPIsByPriority(priority: number, schoolId: number) {
    try {
      const kpis = await prisma.schoolKpi.findMany({
        where: {
          schoolId: schoolId,
          priority: priority
        },
        orderBy: [
          { kpiCategory: 'asc' },
          { kpiName: 'asc' }
        ]
      });

      return kpis;
    } catch (error: any) {
      throw new Error(error.message || 'Gagal mengambil data KPI berdasarkan prioritas');
    }
  }

  // Get critical KPIs (high priority + low performance)
  async getCriticalKPIs(schoolId: number) {
    try {
      const kpis = await prisma.schoolKpi.findMany({
        where: {
          schoolId: schoolId,
          AND: [
            {
              OR: [
                { priority: { lte: 2 } }, // High priority (1-2)
                { priority: null } // Handle null priority as high
              ]
            },
            {
              OR: [
                { achievementPercentage: { lt: 70 } }, // Low achievement
                { achievementPercentage: null } // Handle null achievement
              ]
            }
          ]
        },
        orderBy: [
          { priority: 'asc' },
          { achievementPercentage: 'asc' }
        ]
      });

      return kpis;
    } catch (error: any) {
      throw new Error(error.message || 'Gagal mengambil data KPI kritis');
    }
  }

  // Create new KPI
  async createKPI(data: CreateKPIData, schoolId: number) {
    try {
      // Check if KPI with same name, year, and period already exists
      const existingKPI = await prisma.schoolKpi.findFirst({
        where: {
          schoolId: schoolId,
          kpiName: data.kpiName,
          academicYear: data.academicYear,
          period: data.period
        }
      });

      if (existingKPI) {
        throw new Error('KPI dengan nama, tahun akademik, dan period yang sama sudah ada');
      }

      // Calculate achievement percentage if not provided
      let achievementPercentage = data.achievementPercentage;
      if (!achievementPercentage && data.achievedValue && data.targetValue && data.targetValue > 0) {
        achievementPercentage = (Number(data.achievedValue) / Number(data.targetValue)) * 100;
      }

      const kpi = await prisma.schoolKpi.create({
        data: {
          schoolId: schoolId,
          kpiCategory: data.kpiCategory,
          kpiName: data.kpiName,
          academicYear: data.academicYear,
          period: data.period,
          targetValue: data.targetValue,
          achievedValue: data.achievedValue,
          achievementPercentage: achievementPercentage,
          trend: data.trend,
          priority: data.priority || 3, // Default priority 3 if not specified
          analysis: data.analysis
        }
      });

      return kpi;
    } catch (error: any) {
      throw new Error(error.message || 'Gagal membuat KPI baru');
    }
  }

  // Update KPI
  async updateKPI(id: number, data: UpdateKPIData, schoolId: number) {
    try {
      // Check if KPI exists and belongs to school
      const existingKPI = await prisma.schoolKpi.findFirst({
        where: {
          id: id,
          schoolId: schoolId
        }
      });

      if (!existingKPI) {
        throw new Error('KPI tidak ditemukan atau bukan bagian dari sekolah ini');
      }

      // If updating name, check for duplicates
      if (data.kpiName && data.kpiName !== existingKPI.kpiName) {
        const duplicateKPI = await prisma.schoolKpi.findFirst({
          where: {
            schoolId: schoolId,
            kpiName: data.kpiName,
            academicYear: existingKPI.academicYear,
            period: existingKPI.period,
            id: { not: id } // Exclude current KPI
          }
        });

        if (duplicateKPI) {
          throw new Error('KPI dengan nama, tahun akademik, dan period yang sama sudah ada');
        }
      }

      // Calculate achievement percentage if target/achieved values are updated
      let achievementPercentage = data.achievementPercentage;
      if (!achievementPercentage) {
        const targetValue = data.targetValue ?? Number(existingKPI.targetValue);
        const achievedValue = data.achievedValue ?? (existingKPI.achievedValue ? Number(existingKPI.achievedValue) : null);
        
        if (targetValue && achievedValue && targetValue > 0) {
          achievementPercentage = (achievedValue / targetValue) * 100;
        }
      }

      const updatedKPI = await prisma.schoolKpi.update({
        where: { id: id },
        data: {
          ...data,
          achievementPercentage,
          updatedAt: new Date()
        }
      });

      return updatedKPI;
    } catch (error: any) {
      throw new Error(error.message || 'Gagal memperbarui KPI');
    }
  }

  // Delete KPI
  async deleteKPI(id: number, schoolId: number) {
    try {
      // Check if KPI exists and belongs to school
      const existingKPI = await prisma.schoolKpi.findFirst({
        where: {
          id: id,
          schoolId: schoolId
        }
      });

      if (!existingKPI) {
        throw new Error('KPI tidak ditemukan atau bukan bagian dari sekolah ini');
      }

      await prisma.schoolKpi.delete({
        where: { id: id }
      });

      return { message: 'KPI berhasil dihapus' };
    } catch (error: any) {
      throw new Error(error.message || 'Gagal menghapus KPI');
    }
  }

  // Get KPI statistics
  async getKPIStatistics(schoolId: number, academicYear?: string, period?: string): Promise<KPIStatistics> {
    try {
      const where: Prisma.SchoolKpiWhereInput = {
        schoolId: schoolId
      };

      if (academicYear) where.academicYear = academicYear;
      if (period) where.period = period;

      const kpis = await prisma.schoolKpi.findMany({
        where,
        select: {
          kpiCategory: true,
          achievementPercentage: true,
          priority: true
        }
      });

      const totalKPIs = kpis.length;
      
      // Calculate average achievement
      const validAchievements = kpis
        .filter(kpi => kpi.achievementPercentage !== null)
        .map(kpi => Number(kpi.achievementPercentage!));
      
      const averageAchievement = validAchievements.length > 0 
        ? validAchievements.reduce((sum, val) => sum + val, 0) / validAchievements.length 
        : 0;

      // Count performance categories
      const excellentCount = validAchievements.filter(val => val >= 90).length;
      const goodCount = validAchievements.filter(val => val >= 70 && val < 90).length;
      const needsAttentionCount = validAchievements.filter(val => val < 70).length;
      
      // Count critical KPIs (high priority + low performance)
      const criticalCount = kpis.filter(kpi => 
        (kpi.priority || 5) <= 2 && (Number(kpi.achievementPercentage) || 0) < 70
      ).length;

      // Group by category
      const categoryGroups = kpis.reduce((acc, kpi) => {
        const category = kpi.kpiCategory;
        if (!acc[category]) {
          acc[category] = { achievements: [], count: 0 };
        }
        acc[category].count += 1;
        if (kpi.achievementPercentage !== null) {
          acc[category].achievements.push(Number(kpi.achievementPercentage));
        }
        return acc;
      }, {} as Record<string, { achievements: number[], count: number }>);

      const byCategory = Object.entries(categoryGroups).reduce((acc, [category, data]) => {
        const averageAchievement = data.achievements.length > 0
          ? data.achievements.reduce((sum, val) => sum + val, 0) / data.achievements.length
          : 0;
        
        acc[category] = {
          count: data.count,
          averageAchievement: Math.round(averageAchievement * 100) / 100
        };
        return acc;
      }, {} as Record<string, { count: number; averageAchievement: number }>);

      return {
        totalKPIs,
        averageAchievement: Math.round(averageAchievement * 100) / 100,
        excellentCount,
        goodCount,
        needsAttentionCount,
        criticalCount,
        byCategory
      };
    } catch (error: any) {
      throw new Error(error.message || 'Gagal mengambil statistik KPI');
    }
  }

  // Export KPI data for report
  async exportKPIReport(academicYear: string, period: string, schoolId: number, categories?: string[]) {
    try {
      const where: Prisma.SchoolKpiWhereInput = {
        schoolId: schoolId,
        academicYear: academicYear,
        period: period
      };

      if (categories && categories.length > 0) {
        where.kpiCategory = { in: categories };
      }

      const kpis = await prisma.schoolKpi.findMany({
        where,
        orderBy: [
          { kpiCategory: 'asc' },
          { priority: 'asc' },
          { kpiName: 'asc' }
        ]
      });

      return kpis;
    } catch (error: any) {
      throw new Error(error.message || 'Gagal mengambil data KPI untuk export');
    }
  }
}