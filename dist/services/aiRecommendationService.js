"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIRecommendationService = void 0;
// src/services/aiRecommendationService.ts
const prisma_1 = __importDefault(require("../config/prisma"));
class AIRecommendationService {
    // Save AI recommendations to database
    async saveRecommendations(recommendations) {
        let savedCount = 0;
        let skippedCount = 0;
        const errors = [];
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
                    const savedRec = await prisma_1.default.aiRecommendation.create({
                        data: {
                            schoolId: recommendation.schoolId,
                            category: recommendation.category,
                            title: recommendation.title,
                            description: recommendation.description,
                            supportingData: recommendation.supportingData || {},
                            confidenceLevel: recommendation.confidenceLevel,
                            generatedDate: recommendation.generatedDate,
                            predictedImpact: recommendation.predictedImpact,
                            implementationStatus: recommendation.implementationStatus || 'pending',
                            principalFeedback: recommendation.principalFeedback
                        }
                    });
                    savedCount++;
                    console.log(`✅ Saved: ${recommendation.title} (ID: ${savedRec.id})`);
                }
                catch (error) {
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
        }
        catch (error) {
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
    // Tambahkan di aiRecommendationService.ts - method getRecommendations
    async getRecommendations(params) {
        try {
            console.log('🔍 Service getRecommendations called with params:', params);
            const { schoolId, category, implementationStatus, urgencyLevel, dateFrom, dateTo, page = 1, limit = 10, confidenceThreshold } = params;
            console.log('🏫 Querying for schoolId:', schoolId);
            // Build where clause
            const where = {
                schoolId: schoolId
            };
            if (category)
                where.category = category;
            if (implementationStatus)
                where.implementationStatus = implementationStatus;
            if (confidenceThreshold) {
                where.confidenceLevel = { gte: confidenceThreshold };
            }
            if (dateFrom || dateTo) {
                where.generatedDate = {};
                if (dateFrom)
                    where.generatedDate.gte = dateFrom;
                if (dateTo)
                    where.generatedDate.lte = dateTo;
            }
            console.log('📋 Prisma where clause:', JSON.stringify(where, null, 2));
            // Calculate pagination
            const skip = (page - 1) * limit;
            console.log('📄 Pagination: skip =', skip, ', take =', limit);
            // Get recommendations with pagination
            const [recommendations, total] = await Promise.all([
                prisma_1.default.aiRecommendation.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: [
                        { generatedDate: 'desc' },
                        { confidenceLevel: 'desc' }
                    ]
                }),
                prisma_1.default.aiRecommendation.count({ where })
            ]);
            console.log('📊 Database results:', {
                recommendationsFound: recommendations.length,
                totalCount: total,
                sampleData: recommendations.slice(0, 2).map(r => ({
                    id: r.id,
                    title: r.title,
                    category: r.category,
                    schoolId: r.schoolId,
                    generatedDate: r.generatedDate
                }))
            });
            // Transform data to match frontend format
            const transformedRecommendations = recommendations.map(rec => {
                // Determine urgency level from supporting data or implementation status
                let urgency = 'medium';
                if (rec.supportingData && typeof rec.supportingData === 'object') {
                    const data = rec.supportingData;
                    if (data.currentAverage && data.currentAverage < 60)
                        urgency = 'critical';
                    else if (data.currentAverage && data.currentAverage < 70)
                        urgency = 'high';
                    else if (data.attendanceRate && data.attendanceRate < 70)
                        urgency = 'critical';
                    else if (data.attendanceRate && data.attendanceRate < 80)
                        urgency = 'high';
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
            console.log('✅ Transformed recommendations:', transformedRecommendations.length);
            // Calculate stats if needed
            const stats = await this.getRecommendationStats(schoolId);
            console.log('📈 Stats:', stats);
            return {
                success: true,
                data: transformedRecommendations,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                stats
            };
        }
        catch (error) {
            console.error('💥 Service getRecommendations error:', error);
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
    async getRecommendationById(id, schoolId) {
        try {
            const recommendation = await prisma_1.default.aiRecommendation.findFirst({
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
        }
        catch (error) {
            console.error('Get recommendation by ID error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    // Update recommendation implementation status and feedback
    async updateRecommendation(id, schoolId, data) {
        try {
            // Verify recommendation exists and belongs to school
            const existing = await prisma_1.default.aiRecommendation.findFirst({
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
            const updated = await prisma_1.default.aiRecommendation.update({
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
        }
        catch (error) {
            console.error('Update recommendation error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    // Delete recommendation
    async deleteRecommendation(id, schoolId) {
        try {
            // Verify recommendation exists and belongs to school
            const existing = await prisma_1.default.aiRecommendation.findFirst({
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
            await prisma_1.default.aiRecommendation.delete({
                where: { id: id }
            });
            return { success: true };
        }
        catch (error) {
            console.error('Delete recommendation error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    // Get recommendation statistics
    async getRecommendationStats(schoolId) {
        try {
            const recommendations = await prisma_1.default.aiRecommendation.findMany({
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
            const byCategory = {};
            recommendations.forEach(rec => {
                byCategory[rec.category] = (byCategory[rec.category] || 0) + 1;
            });
            // Group by status
            const byStatus = {};
            recommendations.forEach(rec => {
                const status = rec.implementationStatus || 'pending';
                byStatus[status] = (byStatus[status] || 0) + 1;
            });
            // Calculate urgency levels from supporting data (simplified)
            const byUrgency = {
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
        }
        catch (error) {
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
    async findSimilarRecommendation(recommendation) {
        try {
            // Look for recommendations with similar title and category within last 24 hours
            const dayAgo = new Date();
            dayAgo.setDate(dayAgo.getDate() - 1);
            const similar = await prisma_1.default.aiRecommendation.findFirst({
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
        }
        catch (error) {
            console.error('Error finding similar recommendation:', error);
            return null;
        }
    }
    // Bulk operations
    async bulkUpdateStatus(ids, schoolId, status) {
        try {
            const updated = await prisma_1.default.aiRecommendation.updateMany({
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
        }
        catch (error) {
            return {
                success: false,
                updated: 0,
                errors: [error.message]
            };
        }
    }
    // Cleanup old recommendations
    async cleanupOldRecommendations(schoolId, daysOld = 90) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysOld);
            const deleted = await prisma_1.default.aiRecommendation.deleteMany({
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
        }
        catch (error) {
            console.error('Cleanup error:', error);
            return {
                success: false,
                deleted: 0,
                error: error.message
            };
        }
    }
    // Get trending categories (most recommendations generated)
    async getTrendingCategories(schoolId, days = 30) {
        try {
            const since = new Date();
            since.setDate(since.getDate() - days);
            const recommendations = await prisma_1.default.aiRecommendation.findMany({
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
            const categoryCount = {};
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
        }
        catch (error) {
            console.error('Get trending categories error:', error);
            return [];
        }
    }
}
exports.AIRecommendationService = AIRecommendationService;
exports.default = AIRecommendationService;
