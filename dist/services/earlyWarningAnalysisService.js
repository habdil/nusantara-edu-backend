"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EarlyWarningAnalysisService = void 0;
// src/services/earlyWarningAnalysisService.ts
const library_1 = require("@prisma/client/runtime/library");
const prisma_1 = __importDefault(require("../config/prisma"));
const client_1 = require("@prisma/client");
class EarlyWarningAnalysisService {
    // Main analysis method for generating early warnings
    async analyzeSchoolWarnings(schoolId) {
        const startTime = Date.now();
        let warnings = [];
        let errors = [];
        try {
            console.log(`🔍 Starting early warning analysis for school ID: ${schoolId}`);
            // Run different types of analysis
            const analysisPromises = [
                this.analyzeStudentAttendance(schoolId),
                this.analyzeAcademicPerformance(schoolId),
                this.analyzeFinancialStatus(schoolId),
                this.analyzeAssetCondition(schoolId),
                this.analyzeTeacherPerformance(schoolId),
                this.analyzeUpcomingDeadlines(schoolId)
            ];
            const analysisResults = await Promise.allSettled(analysisPromises);
            // Collect warnings from all analyses
            analysisResults.forEach((result, index) => {
                if (result.status === 'fulfilled') {
                    warnings.push(...result.value);
                }
                else {
                    const analysisTypes = ['attendance', 'academic', 'financial', 'asset', 'teacher', 'deadline'];
                    errors.push(`${analysisTypes[index]} analysis failed: ${result.reason}`);
                }
            });
            // Generate summary
            const summary = this.generateSummary(warnings);
            console.log(`✅ Early warning analysis completed. Generated ${warnings.length} warnings`);
            return {
                success: true,
                warnings,
                summary,
                metadata: {
                    analysisDate: new Date().toISOString(),
                    processingTime: Date.now() - startTime,
                    dataQuality: this.calculateDataQuality(warnings)
                },
                errors: errors.length > 0 ? errors : undefined
            };
        }
        catch (error) {
            console.error('Early warning analysis error:', error);
            return {
                success: false,
                warnings: [],
                summary: {
                    totalWarnings: 0,
                    criticalWarnings: 0,
                    warningsByCategory: {}
                },
                metadata: {
                    analysisDate: new Date().toISOString(),
                    processingTime: Date.now() - startTime,
                    dataQuality: 0
                },
                errors: [error.message]
            };
        }
    }
    // Save warnings to database
    async saveWarnings(warnings) {
        let savedCount = 0;
        let skippedCount = 0;
        const errors = [];
        try {
            console.log(`💾 Saving ${warnings.length} early warnings to database...`);
            for (const warning of warnings) {
                try {
                    // Check if similar warning already exists
                    const existing = await this.findSimilarWarning(warning);
                    if (existing) {
                        console.log(`⚠️  Similar warning already exists: ${warning.title}`);
                        skippedCount++;
                        continue;
                    }
                    // Create the warning
                    const savedWarning = await prisma_1.default.earlyWarning.create({
                        data: {
                            schoolId: warning.schoolId,
                            category: warning.category,
                            title: warning.title,
                            description: warning.description,
                            urgencyLevel: warning.urgencyLevel,
                            detectedDate: warning.detectedDate,
                            targetValue: warning.targetValue ? new library_1.Decimal(warning.targetValue) : null,
                            actualValue: warning.actualValue ? new library_1.Decimal(warning.actualValue) : null,
                            handlingStatus: warning.handlingStatus || 'pending'
                        }
                    });
                    savedCount++;
                    console.log(`✅ Saved: ${warning.title} (ID: ${savedWarning.id})`);
                }
                catch (error) {
                    const errorMsg = `Failed to save warning "${warning.title}": ${error.message}`;
                    errors.push(errorMsg);
                    console.error(`❌ ${errorMsg}`);
                }
            }
            console.log(`💾 Save completed: ${savedCount} saved, ${skippedCount} skipped, ${errors.length} errors`);
            return {
                success: errors.length < warnings.length,
                saved: savedCount,
                skipped: skippedCount,
                errors
            };
        }
        catch (error) {
            console.error('Save warnings error:', error);
            return {
                success: false,
                saved: savedCount,
                skipped: skippedCount,
                errors: [error.message]
            };
        }
    }
    // Analyze student attendance patterns
    async analyzeStudentAttendance(schoolId) {
        const warnings = [];
        try {
            // Get attendance data for last 30 days
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const attendanceData = await prisma_1.default.studentAttendance.groupBy({
                by: ['studentId'],
                where: {
                    student: { schoolId },
                    date: { gte: thirtyDaysAgo }
                },
                _count: {
                    id: true
                },
                _sum: {
                // Count present days (status = 'present')
                }
            });
            // Calculate attendance rates
            const studentsWithLowAttendance = await prisma_1.default.studentAttendance.groupBy({
                by: ['studentId'],
                where: {
                    student: { schoolId },
                    date: { gte: thirtyDaysAgo }
                },
                _count: {
                    id: true
                },
                having: {
                    id: { _count: { lt: 20 } } // Less than 20 days present in 30 days (< 67%)
                }
            });
            if (studentsWithLowAttendance.length > 0) {
                const attendanceRate = Math.round(((30 - studentsWithLowAttendance.length) / 30) * 100);
                warnings.push({
                    schoolId,
                    category: client_1.WarningCategory.attendance,
                    title: 'Tingkat Absensi Menurun',
                    description: `${studentsWithLowAttendance.length} siswa memiliki tingkat kehadiran rendah dalam 30 hari terakhir`,
                    urgencyLevel: attendanceRate < 70 ? client_1.UrgencyLevel.critical : client_1.UrgencyLevel.high,
                    detectedDate: new Date(),
                    targetValue: 85,
                    actualValue: attendanceRate
                });
            }
        }
        catch (error) {
            console.error('Attendance analysis error:', error);
        }
        return warnings;
    }
    // Analyze academic performance
    async analyzeAcademicPerformance(schoolId) {
        const warnings = [];
        try {
            // Get current academic year
            const currentYear = new Date().getFullYear();
            const academicYear = `${currentYear}/${currentYear + 1}`;
            // Find subjects with low average scores
            const academicRecords = await prisma_1.default.academicRecord.groupBy({
                by: ['subjectId'],
                where: {
                    student: { schoolId },
                    academicYear,
                    finalScore: { not: null }
                },
                _avg: {
                    finalScore: true
                },
                _count: {
                    id: true
                }
            });
            for (const record of academicRecords) {
                const avgScore = record._avg.finalScore;
                if (avgScore && Number(avgScore) < 70 && record._count.id >= 5) { // At least 5 students
                    // Get subject name
                    const subject = await prisma_1.default.subject.findUnique({
                        where: { id: record.subjectId },
                        select: { subjectName: true }
                    });
                    const avgScoreNum = Number(avgScore);
                    warnings.push({
                        schoolId,
                        category: client_1.WarningCategory.academic,
                        title: `Nilai ${subject?.subjectName || 'Mata Pelajaran'} Rendah`,
                        description: `Rata-rata nilai ${subject?.subjectName || 'mata pelajaran'} di bawah standar minimum`,
                        urgencyLevel: avgScoreNum < 60 ? client_1.UrgencyLevel.critical : client_1.UrgencyLevel.medium,
                        detectedDate: new Date(),
                        targetValue: 75,
                        actualValue: Math.round(avgScoreNum)
                    });
                }
            }
        }
        catch (error) {
            console.error('Academic analysis error:', error);
        }
        return warnings;
    }
    // Analyze financial status
    async analyzeFinancialStatus(schoolId) {
        const warnings = [];
        try {
            const currentYear = new Date().getFullYear().toString();
            // Check budget usage
            const budgets = await prisma_1.default.schoolFinance.findMany({
                where: {
                    schoolId,
                    budgetYear: currentYear
                }
            });
            for (const budget of budgets) {
                const budgetAmountNum = Number(budget.budgetAmount);
                const usedAmountNum = Number(budget.usedAmount);
                const usagePercentage = usedAmountNum / budgetAmountNum * 100;
                const remainingPercentage = 100 - usagePercentage;
                // Warning for low remaining budget
                if (remainingPercentage < 20) {
                    warnings.push({
                        schoolId,
                        category: client_1.WarningCategory.financial,
                        title: `Anggaran ${budget.budgetCategory} Menipis`,
                        description: `Sisa anggaran ${budget.budgetCategory} hanya ${remainingPercentage.toFixed(1)}% dari total alokasi`,
                        urgencyLevel: remainingPercentage < 10 ? client_1.UrgencyLevel.critical : client_1.UrgencyLevel.high,
                        detectedDate: new Date(),
                        targetValue: 50,
                        actualValue: Math.round(remainingPercentage)
                    });
                }
            }
        }
        catch (error) {
            console.error('Financial analysis error:', error);
        }
        return warnings;
    }
    // Analyze asset condition
    async analyzeAssetCondition(schoolId) {
        const warnings = [];
        try {
            // Count assets needing maintenance
            const assetsNeedingMaintenance = await prisma_1.default.asset.count({
                where: {
                    schoolId,
                    condition: {
                        in: ['minor_damage', 'major_damage', 'under_repair']
                    }
                }
            });
            if (assetsNeedingMaintenance > 0) {
                warnings.push({
                    schoolId,
                    category: client_1.WarningCategory.asset,
                    title: 'Aset Memerlukan Perawatan',
                    description: `${assetsNeedingMaintenance} aset sekolah memerlukan perawatan atau perbaikan`,
                    urgencyLevel: assetsNeedingMaintenance > 5 ? client_1.UrgencyLevel.high : client_1.UrgencyLevel.medium,
                    detectedDate: new Date(),
                    targetValue: 0,
                    actualValue: assetsNeedingMaintenance
                });
            }
        }
        catch (error) {
            console.error('Asset analysis error:', error);
        }
        return warnings;
    }
    // Analyze teacher performance
    async analyzeTeacherPerformance(schoolId) {
        const warnings = [];
        try {
            const currentYear = new Date().getFullYear().toString();
            // Find teachers without recent performance evaluation
            const teachersWithoutEvaluation = await prisma_1.default.teacher.count({
                where: {
                    schoolId,
                    performance: {
                        none: {
                            academicYear: currentYear
                        }
                    }
                }
            });
            if (teachersWithoutEvaluation > 0) {
                warnings.push({
                    schoolId,
                    category: client_1.WarningCategory.teacher,
                    title: 'Evaluasi Kinerja Guru Tertunda',
                    description: `${teachersWithoutEvaluation} guru belum menyelesaikan evaluasi kinerja tahun ini`,
                    urgencyLevel: teachersWithoutEvaluation > 3 ? client_1.UrgencyLevel.medium : client_1.UrgencyLevel.low,
                    detectedDate: new Date(),
                    targetValue: 0,
                    actualValue: teachersWithoutEvaluation
                });
            }
        }
        catch (error) {
            console.error('Teacher analysis error:', error);
        }
        return warnings;
    }
    // Analyze upcoming deadlines
    async analyzeUpcomingDeadlines(schoolId) {
        const warnings = [];
        try {
            const today = new Date();
            const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
            // Check for pending reports
            const pendingReports = await prisma_1.default.report.count({
                where: {
                    schoolId,
                    submissionStatus: {
                        in: ['pending', 'draft']
                    },
                    submissionDate: {
                        lte: nextWeek
                    }
                }
            });
            if (pendingReports > 0) {
                const daysUntilDeadline = Math.ceil((nextWeek.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                warnings.push({
                    schoolId,
                    category: client_1.WarningCategory.deadline,
                    title: 'Laporan Mendekati Deadline',
                    description: `${pendingReports} laporan perlu diselesaikan dalam ${daysUntilDeadline} hari`,
                    urgencyLevel: daysUntilDeadline <= 3 ? client_1.UrgencyLevel.critical : client_1.UrgencyLevel.medium,
                    detectedDate: new Date(),
                    targetValue: 7,
                    actualValue: daysUntilDeadline
                });
            }
        }
        catch (error) {
            console.error('Deadline analysis error:', error);
        }
        return warnings;
    }
    // Helper methods
    async findSimilarWarning(warning) {
        try {
            // Look for similar warnings within last 24 hours
            const dayAgo = new Date();
            dayAgo.setDate(dayAgo.getDate() - 1);
            const similar = await prisma_1.default.earlyWarning.findFirst({
                where: {
                    schoolId: warning.schoolId,
                    category: warning.category,
                    title: {
                        contains: warning.title.substring(0, 15),
                        mode: 'insensitive'
                    },
                    detectedDate: {
                        gte: dayAgo
                    }
                }
            });
            return similar;
        }
        catch (error) {
            console.error('Error finding similar warning:', error);
            return null;
        }
    }
    generateSummary(warnings) {
        const summary = {
            totalWarnings: warnings.length,
            criticalWarnings: warnings.filter(w => w.urgencyLevel === client_1.UrgencyLevel.critical).length,
            warningsByCategory: {}
        };
        warnings.forEach(warning => {
            const category = warning.category;
            summary.warningsByCategory[category] = (summary.warningsByCategory[category] || 0) + 1;
        });
        return summary;
    }
    calculateDataQuality(warnings) {
        if (warnings.length === 0)
            return 0.5;
        // Simple quality score based on warnings with target/actual values
        const warningsWithValues = warnings.filter(w => w.targetValue !== undefined && w.actualValue !== undefined).length;
        return Math.min(warningsWithValues / warnings.length, 1.0);
    }
}
exports.EarlyWarningAnalysisService = EarlyWarningAnalysisService;
exports.default = EarlyWarningAnalysisService;
