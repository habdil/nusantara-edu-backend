// src/services/academicAnalysisService.ts
import prisma from '../config/prisma';
import { geminiService } from './geminiService';
import { 
  AIRecommendationData, 
  RecommendationCategory, 
  ImplementationStatus,
  UrgencyLevel,
  AcademicAnalysisInput,
  AcademicSupportingData 
} from '../types/aiTypes';

export interface AcademicAnalysisConfig {
  passingGradeThreshold: number;
  attendanceThreshold: number;
  improvementTargetPercentage: number;
  minimumSampleSize: number;
  analysisDepthLevel: 'basic' | 'detailed' | 'comprehensive';
}

export interface AcademicAnalysisResult {
  success: boolean;
  recommendations: AIRecommendationData[];
  summary: {
    totalStudentsAnalyzed: number;
    studentsNeedingHelp: number;
    averageClassPerformance: number;
    criticalSubjects: string[];
    attendanceIssues: number;
  };
  metadata: {
    analysisDate: string;
    processingTime: number;
    dataQuality: number;
    confidence: number;
  };
  errors?: string[];
}

export class AcademicAnalysisService {
  private config: AcademicAnalysisConfig;

  constructor(config?: Partial<AcademicAnalysisConfig>) {
    this.config = {
      passingGradeThreshold: 75,
      attendanceThreshold: 85,
      improvementTargetPercentage: 15,
      minimumSampleSize: 5,
      analysisDepthLevel: 'detailed',
      ...config
    };
  }

  // Main analysis method for a specific school
  async analyzeSchoolAcademicData(schoolId: number): Promise<AcademicAnalysisResult> {
    const startTime = Date.now();
    let recommendations: AIRecommendationData[] = [];
    let errors: string[] = [];

    try {
      console.log(`🔍 Starting academic analysis for school ID: ${schoolId}`);

      // 1. Gather academic data
      const academicData = await this.gatherAcademicData(schoolId);
      
      if (!academicData) {
        throw new Error('Failed to gather academic data');
      }

      // 2. Validate data quality
      const dataQuality = this.validateDataQuality(academicData);
      if (dataQuality < 0.3) {
        errors.push('Data quality too low for reliable analysis');
        return {
          success: false,
          recommendations: [],
          summary: this.generateEmptySummary(),
          metadata: {
            analysisDate: new Date().toISOString(),
            processingTime: Date.now() - startTime,
            dataQuality,
            confidence: 0
          },
          errors
        };
      }

      // 3. Perform different types of analysis
      const analysisPromises = [
        this.analyzeStudentPerformance(academicData, schoolId),
        this.analyzeSubjectPerformance(academicData, schoolId),
        this.analyzeAttendancePatterns(academicData, schoolId),
        this.analyzeClassPerformance(academicData, schoolId)
      ];

      const analysisResults = await Promise.allSettled(analysisPromises);

      // 4. Collect recommendations from all analyses
      analysisResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          recommendations.push(...result.value);
        } else {
          const analysisTypes = ['student', 'subject', 'attendance', 'class'];
          errors.push(`${analysisTypes[index]} analysis failed: ${result.reason}`);
        }
      });

      // 5. Generate summary
      const summary = this.generateSummary(academicData, recommendations);

      // 6. Calculate overall confidence
      const overallConfidence = recommendations.length > 0 
        ? recommendations.reduce((sum, rec) => sum + rec.confidenceLevel, 0) / recommendations.length
        : 0;

      console.log(`✅ Academic analysis completed. Generated ${recommendations.length} recommendations`);

      return {
        success: true,
        recommendations,
        summary,
        metadata: {
          analysisDate: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          dataQuality,
          confidence: overallConfidence
        },
        errors: errors.length > 0 ? errors : undefined
      };

    } catch (error: any) {
      console.error('Academic analysis error:', error);
      return {
        success: false,
        recommendations: [],
        summary: this.generateEmptySummary(),
        metadata: {
          analysisDate: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          dataQuality: 0,
          confidence: 0
        },
        errors: [error.message]
      };
    }
  }

  // Gather comprehensive academic data from database
  private async gatherAcademicData(schoolId: number): Promise<AcademicAnalysisInput | null> {
    try {
      // Get current academic year and semester
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const academicYear = currentDate.getMonth() >= 6 ? 
        `${currentYear}/${currentYear + 1}` : 
        `${currentYear - 1}/${currentYear}`;
      const semester = currentDate.getMonth() >= 0 && currentDate.getMonth() <= 5 ? '2' : '1';

      // Fetch students with their academic records and attendance
      const students = await prisma.student.findMany({
        where: {
          schoolId: schoolId,
          isActive: true
        },
        include: {
          academicRecords: {
            where: {
              academicYear: academicYear,
              semester: semester
            },
            include: {
              subject: true,
              teacher: true
            }
          },
          attendance: {
            where: {
              date: {
                gte: new Date(currentYear, currentDate.getMonth() - 3, 1), // Last 3 months
                lte: currentDate
              }
            }
          }
        }
      });

      // Transform data to match analysis input format
      const transformedStudents = students.map(student => ({
        id: student.id,
        studentId: student.studentId,
        fullName: student.fullName,
        grade: student.grade,
        academicRecords: student.academicRecords.map(record => ({
          subject: record.subject.subjectName,
          subjectCode: record.subject.subjectCode,
          finalScore: record.finalScore ? Number(record.finalScore) : 0,
          knowledgeScore: record.knowledgeScore ? Number(record.knowledgeScore) : 0,
          skillScore: record.skillScore ? Number(record.skillScore) : 0,
          attitudeScore: record.attitudeScore || 'C',
          semester: record.semester,
          academicYear: record.academicYear,
          teacherName: record.teacher.fullName
        })),
        attendance: student.attendance.map(att => ({
          date: att.date.toISOString().split('T')[0],
          status: att.status,
          notes: att.notes || ''
        }))
      }));

      // Get school benchmarks if available
      const schoolBenchmarks = await prisma.schoolBenchmark.findMany({
        where: {
          schoolId: schoolId,
          academicYear: academicYear
        },
        include: {
          nationalStandard: true
        }
      });

      const transformedBenchmarks = schoolBenchmarks.map(benchmark => ({
        category: benchmark.nationalStandard.category,
        standardName: benchmark.nationalStandard.standardName,
        schoolValue: benchmark.schoolValue ? Number(benchmark.schoolValue) : 0,
        districtRank: benchmark.districtRank || undefined,
        provinceRank: benchmark.provinceRank || undefined,
        nationalRank: benchmark.nationalRank || undefined
      }));

      return {
        students: transformedStudents,
        schoolBenchmarks: transformedBenchmarks,
        targets: {
          minimumPassingGrade: this.config.passingGradeThreshold,
          targetAttendanceRate: this.config.attendanceThreshold,
          benchmarkComparison: transformedBenchmarks.length > 0
        }
      };

    } catch (error) {
      console.error('Error gathering academic data:', error);
      return null;
    }
  }

  // Validate the quality of gathered data
  private validateDataQuality(data: AcademicAnalysisInput): number {
    let qualityScore = 0;
    let totalChecks = 0;

    // Check 1: Minimum number of students
    totalChecks++;
    if (data.students.length >= this.config.minimumSampleSize) {
      qualityScore += 0.3;
    }

    // Check 2: Students have academic records
    totalChecks++;
    const studentsWithRecords = data.students.filter(s => s.academicRecords.length > 0).length;
    if (studentsWithRecords > 0) {
      qualityScore += 0.3 * (studentsWithRecords / data.students.length);
    }

    // Check 3: Students have attendance data
    totalChecks++;
    const studentsWithAttendance = data.students.filter(s => s.attendance.length > 0).length;
    if (studentsWithAttendance > 0) {
      qualityScore += 0.2 * (studentsWithAttendance / data.students.length);
    }

    // Check 4: Benchmark data availability
    totalChecks++;
    if (data.schoolBenchmarks && data.schoolBenchmarks.length > 0) {
      qualityScore += 0.2;
    }

    return Math.min(qualityScore, 1.0);
  }

  // Analyze individual student performance
  private async analyzeStudentPerformance(data: AcademicAnalysisInput, schoolId: number): Promise<AIRecommendationData[]> {
    const recommendations: AIRecommendationData[] = [];

    // Find students with performance issues
    const studentsNeedingHelp = data.students.filter(student => {
      const avgScore = student.academicRecords.length > 0 
        ? student.academicRecords.reduce((sum, record) => sum + record.finalScore, 0) / student.academicRecords.length
        : 0;
      
      const attendanceRate = student.attendance.length > 0
        ? (student.attendance.filter(att => att.status === 'present').length / student.attendance.length) * 100
        : 100;

      return avgScore < this.config.passingGradeThreshold || attendanceRate < this.config.attendanceThreshold;
    });

    if (studentsNeedingHelp.length === 0) {
      return recommendations;
    }

    // Prepare data for AI analysis
    const analysisData = {
      studentsNeedingHelp: studentsNeedingHelp.slice(0, 10), // Limit for AI processing
      schoolTargets: data.targets,
      analysisConfig: this.config
    };

    const prompt = `
Analisis data akademik siswa yang memerlukan bantuan khusus. Berikan rekomendasi spesifik untuk setiap siswa atau kelompok siswa.

Kriteria siswa yang memerlukan bantuan:
- Nilai rata-rata di bawah ${this.config.passingGradeThreshold}
- Tingkat kehadiran di bawah ${this.config.attendanceThreshold}%

Berikan response dalam format JSON array dengan struktur:
[
  {
    "category": "academic",
    "title": "Judul rekomendasi spesifik",
    "description": "Deskripsi detail masalah dan solusi",
    "confidence": 0.8,
    "supportingData": {
      "studentsAffected": ["nama siswa"],
      "currentAverage": 65,
      "targetAverage": 75,
      "subjectAreas": ["Matematika"],
      "attendanceRate": 80
    },
    "predictedImpact": "Estimasi dampak implementasi",
    "recommendations": ["langkah konkret 1", "langkah konkret 2"]
  }
]

Fokus pada:
1. Identifikasi pola masalah yang spesifik
2. Rekomendasi yang dapat diimplementasikan kepala sekolah
3. Estimasi dampak yang realistis
4. Prioritas berdasarkan urgency dan impact
`;

    try {
      const aiResponse = await geminiService.generateContent({
        prompt,
        context: analysisData,
        temperature: 0.3
      });

      if (aiResponse.success && Array.isArray(aiResponse.data)) {
        const aiRecommendations = aiResponse.data.map(rec => ({
          schoolId,
          category: RecommendationCategory.ACADEMIC,
          title: rec.title,
          description: rec.description,
          supportingData: rec.supportingData,
          confidenceLevel: aiResponse.confidence || 0.7,
          generatedDate: new Date(),
          predictedImpact: rec.predictedImpact,
          implementationStatus: ImplementationStatus.PENDING,
          urgencyLevel: this.determineUrgencyLevel(rec.supportingData),
          affectedEntities: studentsNeedingHelp.map(s => s.studentId)
        }));

        recommendations.push(...aiRecommendations);
      }
    } catch (error) {
      console.error('Student performance analysis error:', error);
    }

    return recommendations;
  }

  // Analyze subject-specific performance issues
  private async analyzeSubjectPerformance(data: AcademicAnalysisInput, schoolId: number): Promise<AIRecommendationData[]> {
    const recommendations: AIRecommendationData[] = [];

    // Group academic records by subject
    const subjectPerformance = new Map<string, number[]>();
    
    data.students.forEach(student => {
      student.academicRecords.forEach(record => {
        if (!subjectPerformance.has(record.subject)) {
          subjectPerformance.set(record.subject, []);
        }
        subjectPerformance.get(record.subject)!.push(record.finalScore);
      });
    });

    // Find subjects with low performance
    const problematicSubjects = Array.from(subjectPerformance.entries())
      .map(([subject, scores]) => ({
        subject,
        average: scores.reduce((sum, score) => sum + score, 0) / scores.length,
        totalStudents: scores.length,
        belowThreshold: scores.filter(score => score < this.config.passingGradeThreshold).length
      }))
      .filter(subj => subj.average < this.config.passingGradeThreshold || subj.belowThreshold > subj.totalStudents * 0.3);

    if (problematicSubjects.length === 0) {
      return recommendations;
    }

    const prompt = `
Analisis performa mata pelajaran yang bermasalah di sekolah dasar. Berikan rekomendasi untuk meningkatkan kualitas pembelajaran.

Mata pelajaran bermasalah yang diidentifikasi:
${problematicSubjects.map(subj => 
  `- ${subj.subject}: Rata-rata ${subj.average.toFixed(1)}, ${subj.belowThreshold}/${subj.totalStudents} siswa di bawah KKM`
).join('\n')}

Target minimum: ${this.config.passingGradeThreshold}

Berikan rekomendasi dalam format JSON array yang fokus pada:
1. Strategi pembelajaran yang spesifik untuk setiap mata pelajaran
2. Pengembangan kompetensi guru
3. Penyediaan sumber belajar tambahan
4. Metode evaluasi yang lebih efektif
`;

    try {
      const aiResponse = await geminiService.generateContent({
        prompt,
        context: { problematicSubjects, config: this.config },
        temperature: 0.4
      });

      if (aiResponse.success && Array.isArray(aiResponse.data)) {
        const aiRecommendations = aiResponse.data.map(rec => ({
          schoolId,
          category: RecommendationCategory.ACADEMIC,
          title: rec.title,
          description: rec.description,
          supportingData: {
            ...rec.supportingData,
            subjectBreakdown: problematicSubjects
          } as AcademicSupportingData,
          confidenceLevel: aiResponse.confidence || 0.7,
          generatedDate: new Date(),
          predictedImpact: rec.predictedImpact,
          implementationStatus: ImplementationStatus.PENDING,
          urgencyLevel: UrgencyLevel.MEDIUM
        }));

        recommendations.push(...aiRecommendations);
      }
    } catch (error) {
      console.error('Subject performance analysis error:', error);
    }

    return recommendations;
  }

  // Analyze attendance patterns
  private async analyzeAttendancePatterns(data: AcademicAnalysisInput, schoolId: number): Promise<AIRecommendationData[]> {
    const recommendations: AIRecommendationData[] = [];

    // Calculate attendance statistics
    const attendanceStats = data.students.map(student => {
      const totalDays = student.attendance.length;
      const presentDays = student.attendance.filter(att => att.status === 'present').length;
      const rate = totalDays > 0 ? (presentDays / totalDays) * 100 : 100;

      return {
        studentId: student.studentId,
        studentName: student.fullName,
        grade: student.grade,
        attendanceRate: rate,
        totalDays,
        presentDays,
        absentPattern: this.analyzeAbsentPattern(student.attendance)
      };
    });

    const lowAttendanceStudents = attendanceStats.filter(stat => 
      stat.attendanceRate < this.config.attendanceThreshold
    );

    if (lowAttendanceStudents.length === 0) {
      return recommendations;
    }

    const prompt = `
Analisis pola kehadiran siswa yang bermasalah. Identifikasi penyebab dan berikan strategi untuk meningkatkan kehadiran.

Data kehadiran bermasalah:
${lowAttendanceStudents.slice(0, 10).map(student => 
  `- ${student.studentName} (${student.grade}): ${student.attendanceRate.toFixed(1)}% kehadiran`
).join('\n')}

Target kehadiran minimum: ${this.config.attendanceThreshold}%

Berikan rekomendasi dalam format JSON array yang mencakup:
1. Strategi khusus untuk meningkatkan kehadiran
2. Program intervensi untuk siswa bermasalah
3. Komunikasi dengan orangtua
4. Sistem monitoring dan follow-up
`;

    try {
      const aiResponse = await geminiService.generateContent({
        prompt,
        context: { lowAttendanceStudents: lowAttendanceStudents.slice(0, 10) },
        temperature: 0.4
      });

      if (aiResponse.success && Array.isArray(aiResponse.data)) {
        const aiRecommendations = aiResponse.data.map(rec => ({
          schoolId,
          category: RecommendationCategory.ACADEMIC,
          title: rec.title,
          description: rec.description,
          supportingData: {
            impactedStudents: lowAttendanceStudents.length,
            currentAttendance: attendanceStats.reduce((sum, stat) => sum + stat.attendanceRate, 0) / attendanceStats.length,
            targetAttendance: this.config.attendanceThreshold,
            criticalCases: lowAttendanceStudents.filter(s => s.attendanceRate < 70).length
          } as AcademicSupportingData,
          confidenceLevel: aiResponse.confidence || 0.7,
          generatedDate: new Date(),
          predictedImpact: rec.predictedImpact,
          implementationStatus: ImplementationStatus.PENDING,
          urgencyLevel: UrgencyLevel.HIGH
        }));

        recommendations.push(...aiRecommendations);
      }
    } catch (error) {
      console.error('Attendance pattern analysis error:', error);
    }

    return recommendations;
  }

  // Analyze class-level performance
  private async analyzeClassPerformance(data: AcademicAnalysisInput, schoolId: number): Promise<AIRecommendationData[]> {
    const recommendations: AIRecommendationData[] = [];

    // Group students by grade/class
    const classPerformance = new Map<string, any[]>();
    
    data.students.forEach(student => {
      const className = student.grade;
      if (!classPerformance.has(className)) {
        classPerformance.set(className, []);
      }
      
      const avgScore = student.academicRecords.length > 0
        ? student.academicRecords.reduce((sum, record) => sum + record.finalScore, 0) / student.academicRecords.length
        : 0;
        
      const attendanceRate = student.attendance.length > 0
        ? (student.attendance.filter(att => att.status === 'present').length / student.attendance.length) * 100
        : 100;

      classPerformance.get(className)!.push({
        studentId: student.studentId,
        avgScore,
        attendanceRate
      });
    });

    // Analyze each class
    const classAnalysis = Array.from(classPerformance.entries()).map(([className, students]) => {
      const classAvgScore = students.reduce((sum, s) => sum + s.avgScore, 0) / students.length;
      const classAvgAttendance = students.reduce((sum, s) => sum + s.attendanceRate, 0) / students.length;
      const lowPerformers = students.filter(s => s.avgScore < this.config.passingGradeThreshold).length;
      
      return {
        className,
        studentCount: students.length,
        averageScore: classAvgScore,
        averageAttendance: classAvgAttendance,
        lowPerformersCount: lowPerformers,
        needsIntervention: classAvgScore < this.config.passingGradeThreshold || classAvgAttendance < this.config.attendanceThreshold
      };
    }).filter(analysis => analysis.needsIntervention);

    if (classAnalysis.length === 0) {
      return recommendations;
    }

    const prompt = `
Analisis performa tingkat kelas yang memerlukan intervensi khusus.

Data kelas bermasalah:
${classAnalysis.map(cls => 
  `- Kelas ${cls.className}: ${cls.studentCount} siswa, rata-rata nilai ${cls.averageScore.toFixed(1)}, kehadiran ${cls.averageAttendance.toFixed(1)}%, ${cls.lowPerformersCount} siswa bermasalah`
).join('\n')}

Berikan rekomendasi dalam format JSON array untuk:
1. Strategi intervensi tingkat kelas
2. Pengembangan sistem pembelajaran yang lebih efektif
3. Koordinasi antara guru kelas dan guru mata pelajaran
4. Program remedial dan pengayaan
`;

    try {
      const aiResponse = await geminiService.generateContent({
        prompt,
        context: { classAnalysis },
        temperature: 0.3
      });

      if (aiResponse.success && Array.isArray(aiResponse.data)) {
        const aiRecommendations = aiResponse.data.map(rec => ({
          schoolId,
          category: RecommendationCategory.ACADEMIC,
          title: rec.title,
          description: rec.description,
          supportingData: {
            classBreakdown: classAnalysis,
            totalClassesAffected: classAnalysis.length,
            averageClassPerformance: classAnalysis.reduce((sum, cls) => sum + cls.averageScore, 0) / classAnalysis.length
          } as AcademicSupportingData,
          confidenceLevel: aiResponse.confidence || 0.7,
          generatedDate: new Date(),
          predictedImpact: rec.predictedImpact,
          implementationStatus: ImplementationStatus.PENDING,
          urgencyLevel: UrgencyLevel.MEDIUM
        }));

        recommendations.push(...aiRecommendations);
      }
    } catch (error) {
      console.error('Class performance analysis error:', error);
    }

    return recommendations;
  }

  // Helper methods
  private analyzeAbsentPattern(attendance: any[]): string {
    // Simple pattern analysis - can be enhanced
    const absents = attendance.filter(att => att.status !== 'present');
    if (absents.length === 0) return 'No pattern';
    
    // Check for day-of-week patterns, seasonal patterns, etc.
    return 'Pattern analysis needed'; // Placeholder
  }

  private determineUrgencyLevel(supportingData: any): UrgencyLevel {
    if (!supportingData) return UrgencyLevel.LOW;
    
    const score = supportingData.currentAverage || 0;
    const attendance = supportingData.attendanceRate || 100;
    
    if (score < 60 || attendance < 70) return UrgencyLevel.CRITICAL;
    if (score < 70 || attendance < 80) return UrgencyLevel.HIGH;
    if (score < 75 || attendance < 85) return UrgencyLevel.MEDIUM;
    
    return UrgencyLevel.LOW;
  }

  private generateSummary(data: AcademicAnalysisInput, recommendations: AIRecommendationData[]) {
    const totalStudents = data.students.length;
    const studentsWithRecords = data.students.filter(s => s.academicRecords.length > 0);
    
    const avgPerformance = studentsWithRecords.length > 0
      ? studentsWithRecords.reduce((sum, student) => {
          const studentAvg = student.academicRecords.reduce((s, record) => s + record.finalScore, 0) / student.academicRecords.length;
          return sum + studentAvg;
        }, 0) / studentsWithRecords.length
      : 0;

    const criticalRecommendations = recommendations.filter(r => r.urgencyLevel === UrgencyLevel.CRITICAL).length;
    
    // Get critical subjects
    const subjectPerformance = new Map<string, number[]>();
    data.students.forEach(student => {
      student.academicRecords.forEach(record => {
        if (!subjectPerformance.has(record.subject)) {
          subjectPerformance.set(record.subject, []);
        }
        subjectPerformance.get(record.subject)!.push(record.finalScore);
      });
    });

    const criticalSubjects = Array.from(subjectPerformance.entries())
      .filter(([_, scores]) => {
        const avg = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        return avg < this.config.passingGradeThreshold;
      })
      .map(([subject, _]) => subject);

    return {
      totalStudentsAnalyzed: totalStudents,
      studentsNeedingHelp: criticalRecommendations,
      averageClassPerformance: Math.round(avgPerformance * 10) / 10,
      criticalSubjects,
      attendanceIssues: recommendations.filter(r => 
        r.title && (r.title.toLowerCase().includes('kehadiran') || r.title.toLowerCase().includes('absen'))
      ).length
    };
  }

  private generateEmptySummary() {
    return {
      totalStudentsAnalyzed: 0,
      studentsNeedingHelp: 0,
      averageClassPerformance: 0,
      criticalSubjects: [],
      attendanceIssues: 0
    };
  }
}

export default AcademicAnalysisService;