// src/services/earlyWarningAnalysisService.ts
import { Decimal } from '@prisma/client/runtime/library';
import prisma from '../config/prisma';
import { WarningCategory, UrgencyLevel} from '@prisma/client';

export interface EarlyWarningData {
  schoolId: number;
  category: WarningCategory;
  title: string;
  description: string;
  urgencyLevel: UrgencyLevel;
  detectedDate: Date;
  targetValue?: number;
  actualValue?: number;
  handlingStatus?: string;
}

export interface WarningAnalysisResult {
  success: boolean;
  warnings: EarlyWarningData[];
  summary: {
    totalWarnings: number;
    criticalWarnings: number;
    warningsByCategory: Record<string, number>;
  };
  metadata: {
    analysisDate: string;
    processingTime: number;
    dataQuality: number;
  };
  errors?: string[];
}

export class EarlyWarningAnalysisService {
  
  // Main analysis method for generating early warnings
  async analyzeSchoolWarnings(schoolId: number): Promise<WarningAnalysisResult> {
    const startTime = Date.now();
    let warnings: EarlyWarningData[] = [];
    let errors: string[] = [];

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
        } else {
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

    } catch (error: any) {
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
  async saveWarnings(warnings: EarlyWarningData[]): Promise<{
    success: boolean;
    saved: number;
    skipped: number;
    errors: string[];
  }> {
    let savedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

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
          const savedWarning = await prisma.earlyWarning.create({
            data: {
              schoolId: warning.schoolId,
              category: warning.category,
              title: warning.title,
              description: warning.description,
              urgencyLevel: warning.urgencyLevel,
              detectedDate: warning.detectedDate,
              targetValue: warning.targetValue ? new Decimal(warning.targetValue) : null,
              actualValue: warning.actualValue ? new Decimal(warning.actualValue) : null,
              handlingStatus: warning.handlingStatus || 'pending'
            }
          });

          savedCount++;
          console.log(`✅ Saved: ${warning.title} (ID: ${savedWarning.id})`);

        } catch (error: any) {
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

    } catch (error: any) {
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
  private async analyzeStudentAttendance(schoolId: number): Promise<EarlyWarningData[]> {
    const warnings: EarlyWarningData[] = [];

    try {
      // Get attendance data for last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const attendanceData = await prisma.studentAttendance.groupBy({
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
      const studentsWithLowAttendance = await prisma.studentAttendance.groupBy({
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
          category: WarningCategory.attendance,
          title: 'Tingkat Absensi Menurun',
          description: `${studentsWithLowAttendance.length} siswa memiliki tingkat kehadiran rendah dalam 30 hari terakhir`,
          urgencyLevel: attendanceRate < 70 ? UrgencyLevel.critical : UrgencyLevel.high,
          detectedDate: new Date(),
          targetValue: 85,
          actualValue: attendanceRate
        });
      }

    } catch (error) {
      console.error('Attendance analysis error:', error);
    }

    return warnings;
  }

  // Analyze academic performance
  private async analyzeAcademicPerformance(schoolId: number): Promise<EarlyWarningData[]> {
    const warnings: EarlyWarningData[] = [];

    try {
      // Get current academic year
      const currentYear = new Date().getFullYear();
      const academicYear = `${currentYear}/${currentYear + 1}`;

      // Find subjects with low average scores
      const academicRecords = await prisma.academicRecord.groupBy({
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
          const subject = await prisma.subject.findUnique({
            where: { id: record.subjectId },
            select: { subjectName: true }
          });

          const avgScoreNum = Number(avgScore);

          warnings.push({
            schoolId,
            category: WarningCategory.academic,
            title: `Nilai ${subject?.subjectName || 'Mata Pelajaran'} Rendah`,
            description: `Rata-rata nilai ${subject?.subjectName || 'mata pelajaran'} di bawah standar minimum`,
            urgencyLevel: avgScoreNum < 60 ? UrgencyLevel.critical : UrgencyLevel.medium,
            detectedDate: new Date(),
            targetValue: 75,
            actualValue: Math.round(avgScoreNum)
          });
        }
      }

    } catch (error) {
      console.error('Academic analysis error:', error);
    }

    return warnings;
  }

  // Analyze financial status
  private async analyzeFinancialStatus(schoolId: number): Promise<EarlyWarningData[]> {
    const warnings: EarlyWarningData[] = [];

    try {
      const currentYear = new Date().getFullYear().toString();

      // Check budget usage
      const budgets = await prisma.schoolFinance.findMany({
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
            category: WarningCategory.financial,
            title: `Anggaran ${budget.budgetCategory} Menipis`,
            description: `Sisa anggaran ${budget.budgetCategory} hanya ${remainingPercentage.toFixed(1)}% dari total alokasi`,
            urgencyLevel: remainingPercentage < 10 ? UrgencyLevel.critical : UrgencyLevel.high,
            detectedDate: new Date(),
            targetValue: 50,
            actualValue: Math.round(remainingPercentage)
          });
        }
      }

    } catch (error) {
      console.error('Financial analysis error:', error);
    }

    return warnings;
  }

  // Analyze asset condition
  private async analyzeAssetCondition(schoolId: number): Promise<EarlyWarningData[]> {
    const warnings: EarlyWarningData[] = [];

    try {
      // Count assets needing maintenance
      const assetsNeedingMaintenance = await prisma.asset.count({
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
          category: WarningCategory.asset,
          title: 'Aset Memerlukan Perawatan',
          description: `${assetsNeedingMaintenance} aset sekolah memerlukan perawatan atau perbaikan`,
          urgencyLevel: assetsNeedingMaintenance > 5 ? UrgencyLevel.high : UrgencyLevel.medium,
          detectedDate: new Date(),
          targetValue: 0,
          actualValue: assetsNeedingMaintenance
        });
      }

    } catch (error) {
      console.error('Asset analysis error:', error);
    }

    return warnings;
  }

  // Analyze teacher performance
  private async analyzeTeacherPerformance(schoolId: number): Promise<EarlyWarningData[]> {
    const warnings: EarlyWarningData[] = [];

    try {
      const currentYear = new Date().getFullYear().toString();

      // Find teachers without recent performance evaluation
      const teachersWithoutEvaluation = await prisma.teacher.count({
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
          category: WarningCategory.teacher,
          title: 'Evaluasi Kinerja Guru Tertunda',
          description: `${teachersWithoutEvaluation} guru belum menyelesaikan evaluasi kinerja tahun ini`,
          urgencyLevel: teachersWithoutEvaluation > 3 ? UrgencyLevel.medium : UrgencyLevel.low,
          detectedDate: new Date(),
          targetValue: 0,
          actualValue: teachersWithoutEvaluation
        });
      }

    } catch (error) {
      console.error('Teacher analysis error:', error);
    }

    return warnings;
  }

  // Analyze upcoming deadlines
  private async analyzeUpcomingDeadlines(schoolId: number): Promise<EarlyWarningData[]> {
    const warnings: EarlyWarningData[] = [];

    try {
      const today = new Date();
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

      // Check for pending reports
      const pendingReports = await prisma.report.count({
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
          category: WarningCategory.deadline,
          title: 'Laporan Mendekati Deadline',
          description: `${pendingReports} laporan perlu diselesaikan dalam ${daysUntilDeadline} hari`,
          urgencyLevel: daysUntilDeadline <= 3 ? UrgencyLevel.critical : UrgencyLevel.medium,
          detectedDate: new Date(),
          targetValue: 7,
          actualValue: daysUntilDeadline
        });
      }

    } catch (error) {
      console.error('Deadline analysis error:', error);
    }

    return warnings;
  }

  // Helper methods
  private async findSimilarWarning(warning: EarlyWarningData): Promise<any | null> {
    try {
      // Look for similar warnings within last 24 hours
      const dayAgo = new Date();
      dayAgo.setDate(dayAgo.getDate() - 1);

      const similar = await prisma.earlyWarning.findFirst({
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

    } catch (error) {
      console.error('Error finding similar warning:', error);
      return null;
    }
  }

  private generateSummary(warnings: EarlyWarningData[]) {
    const summary = {
      totalWarnings: warnings.length,
      criticalWarnings: warnings.filter(w => w.urgencyLevel === UrgencyLevel.critical).length,
      warningsByCategory: {} as Record<string, number>
    };

    warnings.forEach(warning => {
      const category = warning.category;
      summary.warningsByCategory[category] = (summary.warningsByCategory[category] || 0) + 1;
    });

    return summary;
  }

  private calculateDataQuality(warnings: EarlyWarningData[]): number {
    if (warnings.length === 0) return 0.5;
    
    // Simple quality score based on warnings with target/actual values
    const warningsWithValues = warnings.filter(w => 
      w.targetValue !== undefined && w.actualValue !== undefined
    ).length;
    
    return Math.min(warningsWithValues / warnings.length, 1.0);
  }
}

export default EarlyWarningAnalysisService;