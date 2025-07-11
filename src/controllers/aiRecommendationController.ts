// src/controllers/aiRecommendationController.ts
import { Request, Response } from 'express';
import AIRecommendationService from '../services/aiRecommendationService';
import {
  getRecommendationsValidation,
  updateRecommendationValidation,
  bulkUpdateValidation
} from '../validation/aiRecommendationValidation';

export class AIRecommendationController {
  private aiRecommendationService: AIRecommendationService;

  constructor() {
    this.aiRecommendationService = new AIRecommendationService();
  }

  // Get AI recommendations with filters and pagination
  getRecommendations = async (req: Request, res: Response): Promise<void> => {
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
      const { error, value } = getRecommendationsValidation.validate(req.query);
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

      const result = await this.aiRecommendationService.getRecommendations({
        ...value,
        schoolId: req.user.schoolId
      });

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Rekomendasi AI berhasil diambil',
          data: result.data,
          pagination: {
            page: result.page,
            limit: result.limit,
            total: result.total,
            totalPages: result.totalPages
          },
          stats: result.stats
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Gagal mengambil rekomendasi AI',
          error: 'GET_RECOMMENDATIONS_FAILED'
        });
      }
    } catch (error: any) {
      console.error('Get recommendations error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Gagal mengambil rekomendasi AI',
        error: 'GET_RECOMMENDATIONS_FAILED'
      });
    }
  };

  // Get single recommendation by ID
  getRecommendation = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user?.schoolId) {
        res.status(400).json({
          success: false,
          message: 'Informasi sekolah tidak ditemukan',
          error: 'SCHOOL_INFO_MISSING'
        });
        return;
      }

      const recommendationId = parseInt(req.params.id);
      if (isNaN(recommendationId)) {
        res.status(400).json({
          success: false,
          message: 'ID rekomendasi tidak valid',
          error: 'INVALID_RECOMMENDATION_ID'
        });
        return;
      }

      const result = await this.aiRecommendationService.getRecommendationById(
        recommendationId,
        req.user.schoolId
      );

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Rekomendasi berhasil diambil',
          data: result.data
        });
      } else {
        res.status(404).json({
          success: false,
          message: result.error || 'Rekomendasi tidak ditemukan',
          error: 'RECOMMENDATION_NOT_FOUND'
        });
      }
    } catch (error: any) {
      console.error('Get recommendation error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Gagal mengambil rekomendasi',
        error: 'GET_RECOMMENDATION_FAILED'
      });
    }
  };

  // Update recommendation status and feedback
  updateRecommendation = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user?.schoolId) {
        res.status(400).json({
          success: false,
          message: 'Informasi sekolah tidak ditemukan',
          error: 'SCHOOL_INFO_MISSING'
        });
        return;
      }

      const recommendationId = parseInt(req.params.id);
      if (isNaN(recommendationId)) {
        res.status(400).json({
          success: false,
          message: 'ID rekomendasi tidak valid',
          error: 'INVALID_RECOMMENDATION_ID'
        });
        return;
      }

      // Validate request body
      const { error, value } = updateRecommendationValidation.validate(req.body);
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

      const result = await this.aiRecommendationService.updateRecommendation(
        recommendationId,
        req.user.schoolId,
        value
      );

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Rekomendasi berhasil diperbarui',
          data: result.data
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.error || 'Gagal memperbarui rekomendasi',
          error: 'UPDATE_RECOMMENDATION_FAILED'
        });
      }
    } catch (error: any) {
      console.error('Update recommendation error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Gagal memperbarui rekomendasi',
        error: 'UPDATE_RECOMMENDATION_FAILED'
      });
    }
  };

  // Delete recommendation
  deleteRecommendation = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user?.schoolId) {
        res.status(400).json({
          success: false,
          message: 'Informasi sekolah tidak ditemukan',
          error: 'SCHOOL_INFO_MISSING'
        });
        return;
      }

      const recommendationId = parseInt(req.params.id);
      if (isNaN(recommendationId)) {
        res.status(400).json({
          success: false,
          message: 'ID rekomendasi tidak valid',
          error: 'INVALID_RECOMMENDATION_ID'
        });
        return;
      }

      const result = await this.aiRecommendationService.deleteRecommendation(
        recommendationId,
        req.user.schoolId
      );

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Rekomendasi berhasil dihapus',
          data: null
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.error || 'Gagal menghapus rekomendasi',
          error: 'DELETE_RECOMMENDATION_FAILED'
        });
      }
    } catch (error: any) {
      console.error('Delete recommendation error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Gagal menghapus rekomendasi',
        error: 'DELETE_RECOMMENDATION_FAILED'
      });
    }
  };

  // Get recommendation statistics
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

      const stats = await this.aiRecommendationService.getRecommendationStats(req.user.schoolId);

      res.status(200).json({
        success: true,
        message: 'Statistik rekomendasi berhasil diambil',
        data: stats
      });
    } catch (error: any) {
      console.error('Get stats error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Gagal mengambil statistik rekomendasi',
        error: 'GET_STATS_FAILED'
      });
    }
  };

  // Bulk update recommendation status
  bulkUpdateStatus = async (req: Request, res: Response): Promise<void> => {
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
      const { error, value } = bulkUpdateValidation.validate(req.body);
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

      const result = await this.aiRecommendationService.bulkUpdateStatus(
        value.ids,
        req.user.schoolId,
        value.status
      );

      if (result.success) {
        res.status(200).json({
          success: true,
          message: `${result.updated} rekomendasi berhasil diperbarui`,
          data: {
            updated: result.updated,
            errors: result.errors
          }
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Gagal memperbarui rekomendasi',
          errors: result.errors,
          error: 'BULK_UPDATE_FAILED'
        });
      }
    } catch (error: any) {
      console.error('Bulk update error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Gagal memperbarui rekomendasi',
        error: 'BULK_UPDATE_FAILED'
      });
    }
  };

  // Get trending categories
  getTrendingCategories = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user?.schoolId) {
        res.status(400).json({
          success: false,
          message: 'Informasi sekolah tidak ditemukan',
          error: 'SCHOOL_INFO_MISSING'
        });
        return;
      }

      const days = parseInt(req.query.days as string) || 30;
      if (days < 1 || days > 365) {
        res.status(400).json({
          success: false,
          message: 'Parameter days harus antara 1-365',
          error: 'INVALID_DAYS_PARAMETER'
        });
        return;
      }

      const trending = await this.aiRecommendationService.getTrendingCategories(
        req.user.schoolId,
        days
      );

      res.status(200).json({
        success: true,
        message: 'Kategori trending berhasil diambil',
        data: trending
      });
    } catch (error: any) {
      console.error('Get trending categories error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Gagal mengambil kategori trending',
        error: 'GET_TRENDING_FAILED'
      });
    }
  };

  // Cleanup old recommendations
  cleanupOld = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user?.schoolId) {
        res.status(400).json({
          success: false,
          message: 'Informasi sekolah tidak ditemukan',
          error: 'SCHOOL_INFO_MISSING'
        });
        return;
      }

      const days = parseInt(req.query.days as string) || 90;
      if (days < 30) {
        res.status(400).json({
          success: false,
          message: 'Minimal 30 hari untuk cleanup old recommendations',
          error: 'INVALID_CLEANUP_DAYS'
        });
        return;
      }

      const result = await this.aiRecommendationService.cleanupOldRecommendations(
        req.user.schoolId,
        days
      );

      if (result.success) {
        res.status(200).json({
          success: true,
          message: `${result.deleted} rekomendasi lama berhasil dihapus`,
          data: { deleted: result.deleted }
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.error || 'Gagal membersihkan rekomendasi lama',
          error: 'CLEANUP_FAILED'
        });
      }
    } catch (error: any) {
      console.error('Cleanup error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Gagal membersihkan rekomendasi lama',
        error: 'CLEANUP_FAILED'
      });
    }
  };

  // Generate new recommendations (trigger AI analysis)
  generateRecommendations = async (req: Request, res: Response): Promise<void> => {
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
          message: 'Hanya admin dan kepala sekolah yang dapat generate rekomendasi',
          error: 'INSUFFICIENT_PERMISSION'
        });
        return;
      }

      // Import academic analysis service (dynamic import to avoid circular dependency)
      const { default: AcademicAnalysisService } = await import('../services/academicAnalysisService');
      const academicAnalysisService = new AcademicAnalysisService();

      // Run academic analysis
      const analysisResult = await academicAnalysisService.analyzeSchoolAcademicData(req.user.schoolId);

      if (!analysisResult.success) {
        res.status(400).json({
          success: false,
          message: 'Gagal melakukan analisis akademik',
          error: 'ANALYSIS_FAILED',
          details: analysisResult.errors
        });
        return;
      }

      if (analysisResult.recommendations.length === 0) {
        res.status(200).json({
          success: true,
          message: 'Analisis selesai, tidak ada rekomendasi yang perlu diberikan',
          data: {
            generated: 0,
            saved: 0,
            message: 'Performa sekolah sudah baik'
          }
        });
        return;
      }

      // Save recommendations to database
      const saveResult = await this.aiRecommendationService.saveRecommendations(analysisResult.recommendations);

      res.status(200).json({
        success: true,
        message: `Berhasil generate dan simpan ${saveResult.saved} rekomendasi baru`,
        data: {
          generated: analysisResult.recommendations.length,
          saved: saveResult.saved,
          skipped: saveResult.skipped,
          errors: saveResult.errors,
          metadata: {
            confidence: analysisResult.metadata.confidence,
            dataQuality: analysisResult.metadata.dataQuality,
            processingTime: analysisResult.metadata.processingTime
          }
        }
      });
    } catch (error: any) {
      console.error('Generate recommendations error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Gagal generate rekomendasi',
        error: 'GENERATE_RECOMMENDATIONS_FAILED'
      });
    }
  };

  // Get recommendation categories summary
  getCategorySummary = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user?.schoolId) {
        res.status(400).json({
          success: false,
          message: 'Informasi sekolah tidak ditemukan',
          error: 'SCHOOL_INFO_MISSING'
        });
        return;
      }

      const stats = await this.aiRecommendationService.getRecommendationStats(req.user.schoolId);
      
      // Transform to match frontend expectations
      const categories = Object.entries(stats.byCategory).map(([category, count]) => ({
        name: category,
        count: count,
        percentage: stats.total > 0 ? Math.round((count / stats.total) * 100) : 0
      }));

      const statuses = Object.entries(stats.byStatus).map(([status, count]) => ({
        name: status,
        count: count,
        percentage: stats.total > 0 ? Math.round((count / stats.total) * 100) : 0
      }));

      res.status(200).json({
        success: true,
        message: 'Summary kategori berhasil diambil',
        data: {
          total: stats.total,
          categories,
          statuses,
          averageConfidence: Math.round(stats.averageConfidence * 100),
          recentCount: stats.recentCount
        }
      });
    } catch (error: any) {
      console.error('Get category summary error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Gagal mengambil summary kategori',
        error: 'GET_CATEGORY_SUMMARY_FAILED'
      });
    }
  };
}