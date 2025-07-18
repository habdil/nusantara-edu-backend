// src/controllers/earlyWarningController.ts
import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { WarningCategory, UrgencyLevel } from '@prisma/client';

export class EarlyWarningController {

  // Get all early warnings for a school
  getWarnings = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user?.schoolId) {
        res.status(400).json({
          success: false,
          message: 'Informasi sekolah tidak ditemukan',
          error: 'SCHOOL_INFO_MISSING'
        });
        return;
      }

      console.log('🔍 Getting warnings for school:', req.user.schoolId);

      // Get warnings from database
      const warnings = await prisma.earlyWarning.findMany({
        where: {
          schoolId: req.user.schoolId
        },
        orderBy: [
          { urgencyLevel: 'desc' }, // Critical first
          { detectedDate: 'desc' }  // Newest first
        ]
      });

      console.log('📊 Found warnings:', warnings.length);

      // Transform data to match frontend format
      const transformedWarnings = warnings.map(warning => ({
        id: warning.id,
        category: warning.category,
        title: warning.title,
        description: warning.description,
        urgency: warning.urgencyLevel,
        detectedDate: warning.detectedDate.toISOString().split('T')[0],
        targetValue: warning.targetValue ? Number(warning.targetValue) : undefined,
        actualValue: warning.actualValue ? Number(warning.actualValue) : undefined,
        handlingStatus: warning.handlingStatus,
        // Add icon and color based on category
        icon: this.getCategoryIcon(warning.category),
        color: this.getUrgencyColor(warning.urgencyLevel)
      }));

      // Calculate stats
      const stats = {
        total: warnings.length,
        critical: warnings.filter(w => w.urgencyLevel === 'critical').length,
        high: warnings.filter(w => w.urgencyLevel === 'high').length,
        medium: warnings.filter(w => w.urgencyLevel === 'medium').length,
        low: warnings.filter(w => w.urgencyLevel === 'low').length,
        byCategory: this.groupByCategory(warnings)
      };

      res.status(200).json({
        success: true,
        message: 'Peringatan dini berhasil diambil',
        data: transformedWarnings,
        stats
      });

    } catch (error: any) {
      console.error('Get warnings error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Gagal mengambil peringatan dini',
        error: 'GET_WARNINGS_FAILED'
      });
    }
  };

  // Get warning statistics only
  getStats = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user?.schoolId) {
        res.status(400).json({
          success: false,
          message: 'Informasi sekolah tidak ditemukan',
          error: 'SCHOOL_INFO_MISSING'
        });
        return;
      }

      const warnings = await prisma.earlyWarning.findMany({
        where: {
          schoolId: req.user.schoolId
        },
        select: {
          category: true,
          urgencyLevel: true,
          detectedDate: true,
          handlingStatus: true
        }
      });

      const stats = {
        total: warnings.length,
        critical: warnings.filter(w => w.urgencyLevel === 'critical').length,
        high: warnings.filter(w => w.urgencyLevel === 'high').length,
        medium: warnings.filter(w => w.urgencyLevel === 'medium').length,
        low: warnings.filter(w => w.urgencyLevel === 'low').length,
        byCategory: this.groupByCategory(warnings),
        recent: warnings.filter(w => {
          const daysDiff = (new Date().getTime() - new Date(w.detectedDate).getTime()) / (1000 * 60 * 60 * 24);
          return daysDiff <= 7;
        }).length
      };

      res.status(200).json({
        success: true,
        message: 'Statistik peringatan berhasil diambil',
        data: stats
      });

    } catch (error: any) {
      console.error('Get warning stats error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Gagal mengambil statistik peringatan',
        error: 'GET_STATS_FAILED'
      });
    }
  };

  // Generate early warnings based on school data analysis
  generateWarnings = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user?.schoolId) {
        res.status(400).json({
          success: false,
          message: 'Informasi sekolah tidak ditemukan',
          error: 'SCHOOL_INFO_MISSING'
        });
        return;
      }

      // Check if user has admin/principal role
      if (req.user.role !== 'admin' && req.user.role !== 'principal') {
        res.status(403).json({
          success: false,
          message: 'Hanya admin dan kepala sekolah yang dapat generate peringatan',
          error: 'INSUFFICIENT_PERMISSION'
        });
        return;
      }

      console.log('🔍 Generating warnings for school:', req.user.schoolId);

      // Import early warning analysis service
      const { default: EarlyWarningAnalysisService } = await import('../services/earlyWarningAnalysisService');
      const analysisService = new EarlyWarningAnalysisService();

      // Run warning analysis
      const analysisResult = await analysisService.analyzeSchoolWarnings(req.user.schoolId);

      if (!analysisResult.success) {
        res.status(400).json({
          success: false,
          message: 'Gagal melakukan analisis peringatan dini',
          error: 'ANALYSIS_FAILED',
          details: analysisResult.errors
        });
        return;
      }

      if (analysisResult.warnings.length === 0) {
        res.status(200).json({
          success: true,
          message: 'Analisis selesai, tidak ada peringatan yang perlu diberikan',
          data: {
            generated: 0,
            saved: 0,
            message: 'Semua indikator sekolah dalam kondisi baik'
          }
        });
        return;
      }

      // Save warnings to database
      const saveResult = await analysisService.saveWarnings(analysisResult.warnings);

      res.status(200).json({
        success: true,
        message: `Berhasil generate dan simpan ${saveResult.saved} peringatan dini`,
        data: {
          generated: analysisResult.warnings.length,
          saved: saveResult.saved,
          skipped: saveResult.skipped,
          errors: saveResult.errors,
          summary: analysisResult.summary,
          metadata: analysisResult.metadata
        }
      });

    } catch (error: any) {
      console.error('Generate warnings error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Gagal generate peringatan dini',
        error: 'GENERATE_WARNINGS_FAILED'
      });
    }
  };
  private getCategoryIcon(category: string): string {
    const iconMap: Record<string, string> = {
      attendance: 'Users',
      academic: 'BookOpen',
      financial: 'DollarSign',
      asset: 'Building',
      teacher: 'Users',
      deadline: 'Clock',
      system: 'AlertCircle'
    };
    return iconMap[category] || 'AlertTriangle';
  }

  private getUrgencyColor(urgency: string): string {
    const colorMap: Record<string, string> = {
      critical: 'red',
      high: 'red',
      medium: 'yellow',
      low: 'blue'
    };
    return colorMap[urgency] || 'gray';
  }

  private groupByCategory(warnings: any[]): Record<string, number> {
    const grouped: Record<string, number> = {};
    warnings.forEach(warning => {
      const category = warning.category;
      grouped[category] = (grouped[category] || 0) + 1;
    });
    return grouped;
  }
}