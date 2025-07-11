// src/services/aiRecommendationService.ts
import prisma from '../config/prisma';
import { Prisma } from '@prisma/client';
import { 
  AIRecommendationData, 
  RecommendationCategory, 
  ImplementationStatus,
  UrgencyLevel 
} from '../types/aiTypes';

export interface GetRecommendationsParams {
  schoolId: number;
  category?: RecommendationCategory;
  implementationStatus?: ImplementationStatus;
  urgencyLevel?: UrgencyLevel;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  limit?: number;
  confidenceThreshold?: number;
}

export interface RecommendationStats {
  total: number;
  byCategory: Record<string, number>;
  byStatus: Record<string, number>;
  byUrgency: Record<string, number>;
  averageConfidence: number;
  recentCount: number;
}

export interface UpdateRecommendationData {
  implementationStatus?: ImplementationStatus;
  principalFeedback?: string;
}

export class AIRecommendationService {

  // Save AI recommendations to database
  async saveRecommendations(recommendations: AIRecommendationData[]): Promise<{
    success: boolean;
    saved: number;
    skipped: number;
    errors: string[];
  }> {
    let savedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    try {
      console.log(`💾 Saving ${recommendations.length} AI recommendations to database...`);

      for (const recommendation of recommendations) {
        try {
          // Check if similar recommendation already exists (avoid duplicates)
          const existing = await this.findSimilarRecommendation(recommendation);
          
          if (existing) {
            console.log(`⚠️  Similar recommendation already exists: ${recommendation.title}`);
            skippedCount++;
            continue;
          }

          // Create the recommendation
          const savedRec = await prisma.aiRecommendation.create({
            data: {
              schoolId: recommendation.schoolId,
              category: recommendation.category,
              title: recommendation.title,
              description: recommendation.description,
              supportingData: recommendation.supportingData as Prisma.JsonObject || {},
              confidenceLevel: recommendation.confidenceLevel,
              generatedDate: recommendation.generatedDate,
              predictedImpact: recommendation.predictedImpact,
              implementationStatus: recommendation.implementationStatus || 'pending',
              principalFeedback: recommendation.principalFeedback
            }
          });

          savedCount++;
          console.log(`✅ Saved: ${recommendation.title} (ID: ${savedRec.id})`);

        } catch (error: any) {
          const errorMsg = `Failed to save recommendation "${recommendation.title}": ${error.message}`;
          errors.push(errorMsg);
          console.error(`❌ ${errorMsg}`);
        }
      }

      console.log(`💾 Save completed: ${savedCount} saved, ${skippedCount} skipped, ${errors.length} errors`);

      return {
        success: errors.length < recommendations.length,
        saved: savedCount,
        skipped: skippedCount,
        errors
      };

    } catch (error: any) {
      console.error('Save recommendations error:', error);
      return {
        success: false,
        saved: savedCount,
        skipped: skippedCount,
        errors: [error.message]
      };
    }
  }

  // Get recommendations with filters and pagination
  async getRecommendations(params: GetRecommendationsParams): Promise<{
    success: boolean;
    data: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    stats?: RecommendationStats;
  }> {
    try {
      const {
        schoolId,
        category,
        implementationStatus,
        urgencyLevel,
        dateFrom,
        dateTo,
        page = 1,
        limit = 10,
        confidenceThreshold
      } = params;

      // Build where clause
      const where: Prisma.AiRecommendationWhereInput = {
        schoolId: schoolId
      };

      if (category) where.category = category;
      if (implementationStatus) where.implementationStatus = implementationStatus;
      if (confidenceThreshold) {
        where.confidenceLevel = { gte: confidenceThreshold };
      }

      if (dateFrom || dateTo) {
        where.generatedDate = {};
        if (dateFrom) where.generatedDate.gte = dateFrom;
        if (dateTo) where.generatedDate.lte = dateTo;
      }

      // Calculate pagination
      const skip = (page - 1) * limit;

      // Get recommendations with pagination
      const [recommendations, total] = await Promise.all([
        prisma.aiRecommendation.findMany({
          where,
          skip,
          take: limit,
          orderBy: [
            { generatedDate: 'desc' },
            { confidenceLevel: 'desc' }
          ]
        }),
        prisma.aiRecommendation.count({ where })
      ]);

      // Transform data to match frontend format
      const transformedRecommendations = recommendations.map(rec => {
        // Determine urgency level from supporting data or implementation status
        let urgency = 'medium';
        if (rec.supportingData && typeof rec.supportingData === 'object') {
          const data = rec.supportingData as any;
          if (data.currentAverage && data.currentAverage < 60) urgency = 'critical';
          else if (data.currentAverage && data.currentAverage < 70) urgency = 'high';
          else if (data.attendanceRate && data.attendanceRate < 70) urgency = 'critical';
          else if (data.attendanceRate && data.attendanceRate < 80) urgency = 'high';
        }

        // Determine icon and color based on category
        let icon = 'Target';
        let color = 'blue';
        
        switch (rec.category) {
          case 'financial':
            icon = 'TrendingUp';
            color = 'green';
            break;
          case 'teacher':
            icon = 'Lightbulb';
            color = 'purple';
            break;
          case 'asset':
            icon = 'Brain';
            color = 'orange';
            break;
          default:
            icon = 'Target';
            color = 'blue';
        }

        return {
          id: rec.id,
          category: rec.category,
          title: rec.title,
          description: rec.description,
          supportingData: rec.supportingData,
          confidenceLevel: Number(rec.confidenceLevel),
          generatedDate: rec.generatedDate.toISOString().split('T')[0],
          predictedImpact: rec.predictedImpact,
          implementationStatus: rec.implementationStatus || 'pending',
          principalFeedback: rec.principalFeedback,
          icon,
          color,
          urgencyLevel: urgency
        };
      });

      // Calculate stats if needed
      const stats = await this.getRecommendationStats(schoolId);

      return {
        success: true,
        data: transformedRecommendations,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        stats
      };

    } catch (error: any) {
      console.error('Get recommendations error:', error);
      return {
        success: false,
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
      };
    }
  }

  // Get single recommendation by ID
  async getRecommendationById(id: number, schoolId: number): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      const recommendation = await prisma.aiRecommendation.findFirst({
        where: {
          id: id,
          schoolId: schoolId
        }
      });

      if (!recommendation) {
        return {
          success: false,
          error: 'Recommendation not found'
        };
      }

      return {
        success: true,
        data: {
          id: recommendation.id,
          category: recommendation.category,
          title: recommendation.title,
          description: recommendation.description,
          supportingData: recommendation.supportingData,
          confidenceLevel: Number(recommendation.confidenceLevel),
          generatedDate: recommendation.generatedDate.toISOString(),
          predictedImpact: recommendation.predictedImpact,
          implementationStatus: recommendation.implementationStatus,
          principalFeedback: recommendation.principalFeedback,
          createdAt: recommendation.createdAt.toISOString(),
          updatedAt: recommendation.updatedAt?.toISOString()
        }
      };

    } catch (error: any) {
      console.error('Get recommendation by ID error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Update recommendation implementation status and feedback
  async updateRecommendation(id: number, schoolId: number, data: UpdateRecommendationData): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      // Verify recommendation exists and belongs to school
      const existing = await prisma.aiRecommendation.findFirst({
        where: {
          id: id,
          schoolId: schoolId
        }
      });

      if (!existing) {
        return {
          success: false,
          error: 'Recommendation not found or access denied'
        };
      }

      // Update the recommendation
      const updated = await prisma.aiRecommendation.update({
        where: { id: id },
        data: {
          implementationStatus: data.implementationStatus || existing.implementationStatus,
          principalFeedback: data.principalFeedback !== undefined ? data.principalFeedback : existing.principalFeedback,
          updatedAt: new Date()
        }
      });

      return {
        success: true,
        data: {
          id: updated.id,
          implementationStatus: updated.implementationStatus,
          principalFeedback: updated.principalFeedback,
          updatedAt: updated.updatedAt?.toISOString()
        }
      };

    } catch (error: any) {
      console.error('Update recommendation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Delete recommendation
  async deleteRecommendation(id: number, schoolId: number): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      // Verify recommendation exists and belongs to school
      const existing = await prisma.aiRecommendation.findFirst({
        where: {
          id: id,
          schoolId: schoolId
        }
      });

      if (!existing) {
        return {
          success: false,
          error: 'Recommendation not found or access denied'
        };
      }

      await prisma.aiRecommendation.delete({
        where: { id: id }
      });

      return { success: true };

    } catch (error: any) {
      console.error('Delete recommendation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get recommendation statistics
  async getRecommendationStats(schoolId: number): Promise<RecommendationStats> {
    try {
      const recommendations = await prisma.aiRecommendation.findMany({
        where: { schoolId: schoolId },
        select: {
          category: true,
          implementationStatus: true,
          confidenceLevel: true,
          generatedDate: true
        }
      });

      const total = recommendations.length;
      
      // Group by category
      const byCategory: Record<string, number> = {};
      recommendations.forEach(rec => {
        byCategory[rec.category] = (byCategory[rec.category] || 0) + 1;
      });

      // Group by status
      const byStatus: Record<string, number> = {};
      recommendations.forEach(rec => {
        const status = rec.implementationStatus || 'pending';
        byStatus[status] = (byStatus[status] || 0) + 1;
      });

      // Calculate urgency levels from supporting data (simplified)
      const byUrgency: Record<string, number> = {
        low: 0,
        medium: total,
        high: 0,
        critical: 0
      };

      // Calculate average confidence
      const averageConfidence = total > 0 
        ? recommendations.reduce((sum, rec) => sum + Number(rec.confidenceLevel), 0) / total
        : 0;

      // Count recent recommendations (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const recentCount = recommendations.filter(rec => rec.generatedDate >= weekAgo).length;

      return {
        total,
        byCategory,
        byStatus,
        byUrgency,
        averageConfidence,
        recentCount
      };

    } catch (error: any) {
      console.error('Get recommendation stats error:', error);
      return {
        total: 0,
        byCategory: {},
        byStatus: {},
        byUrgency: {},
        averageConfidence: 0,
        recentCount: 0
      };
    }
  }

  // Find similar recommendations to avoid duplicates
  private async findSimilarRecommendation(recommendation: AIRecommendationData): Promise<any | null> {
    try {
      // Look for recommendations with similar title and category within last 24 hours
      const dayAgo = new Date();
      dayAgo.setDate(dayAgo.getDate() - 1);

      const similar = await prisma.aiRecommendation.findFirst({
        where: {
          schoolId: recommendation.schoolId,
          category: recommendation.category,
          title: {
            contains: recommendation.title.substring(0, 20), // First 20 chars
            mode: 'insensitive'
          },
          generatedDate: {
            gte: dayAgo
          }
        }
      });

      return similar;

    } catch (error) {
      console.error('Error finding similar recommendation:', error);
      return null;
    }
  }

  // Bulk operations
  async bulkUpdateStatus(ids: number[], schoolId: number, status: ImplementationStatus): Promise<{
    success: boolean;
    updated: number;
    errors: string[];
  }> {
    try {
      const updated = await prisma.aiRecommendation.updateMany({
        where: {
          id: { in: ids },
          schoolId: schoolId
        },
        data: {
          implementationStatus: status,
          updatedAt: new Date()
        }
      });

      return {
        success: true,
        updated: updated.count,
        errors: []
      };

    } catch (error: any) {
      return {
        success: false,
        updated: 0,
        errors: [error.message]
      };
    }
  }

  // Cleanup old recommendations
  async cleanupOldRecommendations(schoolId: number, daysOld: number = 90): Promise<{
    success: boolean;
    deleted: number;
    error?: string;
  }> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const deleted = await prisma.aiRecommendation.deleteMany({
        where: {
          schoolId: schoolId,
          generatedDate: {
            lt: cutoffDate
          },
          implementationStatus: {
            in: ['completed', 'rejected']
          }
        }
      });

      console.log(`🧹 Cleaned up ${deleted.count} old recommendations for school ${schoolId}`);

      return {
        success: true,
        deleted: deleted.count
      };

    } catch (error: any) {
      console.error('Cleanup error:', error);
      return {
        success: false,
        deleted: 0,
        error: error.message
      };
    }
  }

  // Get trending categories (most recommendations generated)
  async getTrendingCategories(schoolId: number, days: number = 30): Promise<Array<{
    category: string;
    count: number;
    percentage: number;
  }>> {
    try {
      const since = new Date();
      since.setDate(since.getDate() - days);

      const recommendations = await prisma.aiRecommendation.findMany({
        where: {
          schoolId: schoolId,
          generatedDate: {
            gte: since
          }
        },
        select: {
          category: true
        }
      });

      const total = recommendations.length;
      const categoryCount: Record<string, number> = {};

      recommendations.forEach(rec => {
        categoryCount[rec.category] = (categoryCount[rec.category] || 0) + 1;
      });

      return Object.entries(categoryCount)
        .map(([category, count]) => ({
          category,
          count,
          percentage: total > 0 ? (count / total) * 100 : 0
        }))
        .sort((a, b) => b.count - a.count);

    } catch (error) {
      console.error('Get trending categories error:', error);
      return [];
    }
  }
}

export default AIRecommendationService;