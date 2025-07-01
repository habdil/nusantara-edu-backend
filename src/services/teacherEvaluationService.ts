import prisma from '../config/prisma';
import { Prisma } from '@prisma/client';

// Interfaces matching frontend API
export interface TeacherEvaluation {
  id: number;
  teacherId: number;
  teacherName: string;
  employeeId: string;
  subjectArea: string;
  position: string;
  evaluationPeriod: string;
  academicYear: string;
  overallScore: number;
  teachingQuality: number;
  classroomManagement: number;
  studentEngagement: number;
  professionalDevelopment: number;
  collaboration: number;
  punctuality: number;
  evaluatorId: number;
  evaluatorName: string;
  evaluationDate: string;
  notes: string;
  recommendations: string[];
  status: "draft" | "completed" | "reviewed" | "approved";
  developmentGoals: string[];
  attendanceRate: number;
  profilePhoto?: string;
}

export interface TeacherDevelopment {
  id: number;
  teacherId: number;
  programName: string;
  programType: "workshop" | "training" | "certification" | "seminar";
  startDate: string;
  endDate: string;
  status: "planned" | "ongoing" | "completed" | "cancelled";
  certificateUrl?: string;
  hours: number;
  provider: string;
  cost: number;
}

export interface EvaluationStats {
  totalTeachers: number;
  evaluatedTeachers: number;
  pendingEvaluations: number;
  averageScore: number;
  excellentPerformers: number;
  needsImprovement: number;
  developmentPrograms: number;
  completedTrainings: number;
}

// Filter interfaces
export interface GetEvaluationsParams {
  academicYear?: string;
  evaluationPeriod?: string;
  subjectArea?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
  schoolId: number;
}

export interface GetDevelopmentProgramsParams {
  teacherId?: number;
  programType?: string;
  status?: string;
  year?: number;
  schoolId: number;
}

export interface CreateEvaluationData {
  teacherId: number;
  evaluationPeriod: string;
  academicYear: string;
  teachingQuality: number;
  classroomManagement: number;
  studentEngagement: number;
  professionalDevelopment: number;
  collaboration: number;
  punctuality: number;
  notes?: string;
  recommendations?: string[];
  developmentGoals?: string[];
  status?: string;
}

export interface CreateDevelopmentProgramData {
  teacherId: number;
  programName: string;
  programType: string;
  startDate: string;
  endDate: string;
  hours: number;
  provider: string;
  cost: number;
  status?: string;
  certificateUrl?: string;
  description?: string;
}

export class TeacherEvaluationService {

  // Get evaluations with filters
  async getEvaluations(params: GetEvaluationsParams): Promise<TeacherEvaluation[]> {
    try {
      const { academicYear, evaluationPeriod, subjectArea, status, search, page = 1, limit = 10, schoolId } = params;
      const skip = (page - 1) * limit;

      // Build where clause for teacher performance
      const where: Prisma.TeacherPerformanceWhereInput = {
        teacher: {
          schoolId: schoolId
        }
      };

      if (academicYear) where.academicYear = academicYear;
      if (evaluationPeriod) where.evaluationPeriod = evaluationPeriod;
      if (subjectArea) {
        where.teacher = {
          ...where.teacher,
          subjectArea: { contains: subjectArea, mode: 'insensitive' }
        } as Prisma.TeacherWhereInput;
      }

      // Map frontend status to schema logic
      if (status) {
        if (status === 'draft') {
          where.evaluationDate = null;
        } else if (status === 'completed') {
          where.evaluationDate = { not: null };
          where.totalScore = { not: null };
        } else if (status === 'approved') {
          where.evaluationDate = { not: null };
          where.totalScore = { not: null };
          where.evaluatorId = { not: null };
        }
      }

      if (search) {
        where.teacher = {
          ...where.teacher,
          OR: [
            { fullName: { contains: search, mode: 'insensitive' } },
            { employeeId: { contains: search, mode: 'insensitive' } },
            { subjectArea: { contains: search, mode: 'insensitive' } }
          ]
        } as Prisma.TeacherWhereInput;
      }

      const evaluations = await prisma.teacherPerformance.findMany({
        where,
        skip,
        take: limit,
        include: {
          teacher: {
            select: {
              id: true,
              employeeId: true,
              fullName: true,
              subjectArea: true,
              position: true,
              profilePhoto: true
            }
          },
          evaluator: {
            select: {
              id: true,
              fullName: true
            }
          },
          teacherPerformanceDetails: true
        },
        orderBy: [
          { academicYear: 'desc' },
          { evaluationPeriod: 'desc' },
          { teacher: { fullName: 'asc' } }
        ]
      });

      // Transform to frontend format
      const transformedEvaluations = await Promise.all(
        evaluations.map(async (evaluation) => {
          // Calculate attendance rate
          const attendanceRate = await this.calculateAttendanceRate(evaluation.teacherId, evaluation.academicYear);
          
          // Calculate overall score
          const scores = [
            evaluation.teachingScore,
            evaluation.disciplineScore,
            evaluation.selfDevelopmentScore,
            evaluation.contributionScore
          ].filter(score => score !== null).map(score => Number(score));
          
          const overallScore = scores.length > 0 
            ? scores.reduce((sum, score) => sum + Number(score), 0) / scores.length 
            : 0;

          // Extract recommendations and development goals from performance details
          const recommendations = evaluation.teacherPerformanceDetails
            .filter(detail => detail.assessmentCategory === 'recommendations')
            .map(detail => detail.notes || detail.indicator)
            .filter(Boolean);

          const developmentGoals = evaluation.teacherPerformanceDetails
            .filter(detail => detail.assessmentCategory === 'development_goals')
            .map(detail => detail.notes || detail.indicator)
            .filter(Boolean);

          // Determine status based on data completeness
          let evaluationStatus: "draft" | "completed" | "reviewed" | "approved" = "draft";
          if (evaluation.evaluationDate && evaluation.totalScore) {
            if (evaluation.evaluatorId) {
              evaluationStatus = "approved";
            } else {
              evaluationStatus = "completed";
            }
          }

          return {
            id: evaluation.id,
            teacherId: evaluation.teacherId,
            teacherName: evaluation.teacher.fullName,
            employeeId: evaluation.teacher.employeeId || '',
            subjectArea: evaluation.teacher.subjectArea,
            position: evaluation.teacher.position || '',
            evaluationPeriod: evaluation.evaluationPeriod,
            academicYear: evaluation.academicYear,
            overallScore: Number(overallScore.toFixed(1)),
            teachingQuality: Number(evaluation.teachingScore) || 0,
            classroomManagement: Number(evaluation.disciplineScore) || 0,
            studentEngagement: Number(evaluation.selfDevelopmentScore) || 0,
            professionalDevelopment: Number(evaluation.contributionScore) || 0,
            collaboration: Number(evaluation.disciplineScore) || 0, // Map to available field
            punctuality: Number(evaluation.disciplineScore) || 0, // Map to available field
            evaluatorId: evaluation.evaluatorId || 0,
            evaluatorName: evaluation.evaluator?.fullName || '',
            evaluationDate: evaluation.evaluationDate?.toISOString().split('T')[0] || '',
            notes: evaluation.evaluationNotes || '',
            recommendations,
            status: evaluationStatus,
            developmentGoals,
            attendanceRate,
            profilePhoto: evaluation.teacher.profilePhoto || undefined || undefined || undefined || undefined || undefined
          };
        })
      );

      return transformedEvaluations;
    } catch (error: any) {
      throw new Error(error.message || 'Gagal mengambil data evaluasi guru');
    }
  }

  // Get evaluation statistics
  async getEvaluationStats(schoolId: number): Promise<EvaluationStats> {
    try {
      // Get total teachers in school
      const totalTeachers = await prisma.teacher.count({
        where: { schoolId }
      });

      // Get current academic year evaluations
      const currentYear = new Date().getFullYear();
      const academicYear = `${currentYear}/${currentYear + 1}`;

      const evaluatedTeachers = await prisma.teacherPerformance.count({
        where: {
          teacher: { schoolId },
          academicYear,
          totalScore: { not: null }
        }
      });

      const pendingEvaluations = totalTeachers - evaluatedTeachers;

      // Calculate average score
      const evaluationRecords = await prisma.teacherPerformance.findMany({
        where: {
          teacher: { schoolId },
          academicYear,
          totalScore: { not: null }
        },
        select: { totalScore: true }
      });

      const averageScore = evaluationRecords.length > 0
        ? evaluationRecords.reduce((sum, record) => sum + Number(record.totalScore), 0) / evaluationRecords.length
        : 0;

      // Count excellent performers (score >= 4.5)
      const excellentPerformers = evaluationRecords.filter(record => Number(record.totalScore) >= 4.5).length;

      // Count needs improvement (score < 4.0)
      const needsImprovement = evaluationRecords.filter(record => Number(record.totalScore) < 4.0).length;

      // Count development programs
      const developmentPrograms = await prisma.teacherDevelopment.count({
        where: {
          teacher: { schoolId },
          startDate: {
            gte: new Date(currentYear, 0, 1),
            lte: new Date(currentYear, 11, 31)
          }
        }
      });

      // Count completed trainings
      const completedTrainings = await prisma.teacherDevelopment.count({
        where: {
          teacher: { schoolId },
          endDate: {
            gte: new Date(currentYear, 0, 1),
            lte: new Date(currentYear, 11, 31)
          },
          certificate: { not: null }
        }
      });

      return {
        totalTeachers,
        evaluatedTeachers,
        pendingEvaluations,
        averageScore: Number(averageScore.toFixed(2)),
        excellentPerformers,
        needsImprovement,
        developmentPrograms,
        completedTrainings
      };
    } catch (error: any) {
      throw new Error(error.message || 'Gagal mengambil statistik evaluasi');
    }
  }

  // Get development programs
  async getDevelopmentPrograms(params: GetDevelopmentProgramsParams): Promise<TeacherDevelopment[]> {
    try {
      const { teacherId, programType, status, year, schoolId } = params;

      const where: Prisma.TeacherDevelopmentWhereInput = {
        teacher: { schoolId }
      };

      if (teacherId) where.teacherId = teacherId;
      if (programType) where.developmentType = programType;
      
      if (year) {
        where.startDate = {
          gte: new Date(year, 0, 1),
          lte: new Date(year, 11, 31)
        };
      }

      const programs = await prisma.teacherDevelopment.findMany({
        where,
        orderBy: [
          { startDate: 'desc' },
          { activityName: 'asc' }
        ]
      });

      // Transform to frontend format
      const transformedPrograms = programs.map(program => {
        // Map status based on dates and certificate
        let programStatus: "planned" | "ongoing" | "completed" | "cancelled" = "planned";
        const now = new Date();
        const startDate = program.startDate;
        const endDate = program.endDate;

        if (startDate && endDate) {
          if (now < startDate) {
            programStatus = "planned";
          } else if (now >= startDate && now <= endDate) {
            programStatus = "ongoing";
          } else if (now > endDate) {
            programStatus = program.certificate ? "completed" : "completed";
          }
        }

        return {
          id: program.id,
          teacherId: program.teacherId,
          programName: program.activityName,
          programType: program.developmentType as "workshop" | "training" | "certification" | "seminar",
          startDate: program.startDate?.toISOString().split('T')[0] || '',
          endDate: program.endDate?.toISOString().split('T')[0] || '',
          status: programStatus,
          certificateUrl: program.certificate || undefined,
          hours: program.totalHours || 0,
          provider: program.organizer || '',
          cost: 0 // Not available in schema, default to 0
        };
      });

      return transformedPrograms;
    } catch (error: any) {
      throw new Error(error.message || 'Gagal mengambil data program pengembangan');
    }
  }

  // Create evaluation
  async createEvaluation(data: CreateEvaluationData, schoolId: number, evaluatorId: number): Promise<TeacherEvaluation> {
    try {
      // Verify teacher belongs to school
      const teacher = await prisma.teacher.findFirst({
        where: { id: data.teacherId, schoolId }
      });

      if (!teacher) {
        throw new Error('Guru tidak ditemukan atau bukan bagian dari sekolah ini');
      }

      // Check if evaluation already exists
      const existingEvaluation = await prisma.teacherPerformance.findUnique({
        where: {
          teacher_evaluation_period: {
            teacherId: data.teacherId,
            evaluationPeriod: data.evaluationPeriod,
            academicYear: data.academicYear
          }
        }
      });

      if (existingEvaluation) {
        throw new Error('Evaluasi untuk guru, periode, dan tahun akademik ini sudah ada');
      }

      // Calculate overall score
      const overallScore = (
        data.teachingQuality +
        data.classroomManagement +
        data.studentEngagement +
        data.professionalDevelopment +
        data.collaboration +
        data.punctuality
      ) / 6;

      // Create performance record
      const evaluation = await prisma.teacherPerformance.create({
        data: {
          teacherId: data.teacherId,
          evaluationPeriod: data.evaluationPeriod,
          academicYear: data.academicYear,
          teachingScore: data.teachingQuality,
          disciplineScore: data.punctuality, // Map punctuality to discipline
          selfDevelopmentScore: data.professionalDevelopment,
          contributionScore: data.collaboration,
          totalScore: overallScore,
          evaluationNotes: data.notes,
          evaluatorId: evaluatorId,
          evaluationDate: data.status === 'draft' ? null : new Date()
        },
        include: {
          teacher: {
            select: {
              id: true,
              employeeId: true,
              fullName: true,
              subjectArea: true,
              position: true,
              profilePhoto: true
            }
          },
          evaluator: {
            select: {
              id: true,
              fullName: true
            }
          }
        }
      });

      // Create performance details for recommendations and goals
      const detailsToCreate: Array<{
        teacherPerformanceId: number;
        assessmentCategory: string;
        indicator: string;
        score: number;
        notes: string;
      }> = [];

      if (data.recommendations && data.recommendations.length > 0) {
        data.recommendations.forEach((recommendation, index) => {
          detailsToCreate.push({
            teacherPerformanceId: evaluation.id,
            assessmentCategory: 'recommendations',
            indicator: `Rekomendasi ${index + 1}`,
            score: 0,
            notes: recommendation
          });
        });
      }

      if (data.developmentGoals && data.developmentGoals.length > 0) {
        data.developmentGoals.forEach((goal, index) => {
          detailsToCreate.push({
            teacherPerformanceId: evaluation.id,
            assessmentCategory: 'development_goals',
            indicator: `Tujuan Pengembangan ${index + 1}`,
            score: 0,
            notes: goal
          });
        });
      }

      if (detailsToCreate.length > 0) {
        await prisma.teacherPerformanceDetail.createMany({
          data: detailsToCreate
        });
      }

      // Calculate attendance rate
      const attendanceRate = await this.calculateAttendanceRate(data.teacherId, data.academicYear);

      // Transform to frontend format
      const transformedEvaluation: TeacherEvaluation = {
        id: evaluation.id,
        teacherId: evaluation.teacherId,
        teacherName: evaluation.teacher.fullName,
        employeeId: evaluation.teacher.employeeId || '',
        subjectArea: evaluation.teacher.subjectArea,
        position: evaluation.teacher.position || '',
        evaluationPeriod: evaluation.evaluationPeriod,
        academicYear: evaluation.academicYear,
        overallScore: Number(overallScore.toFixed(1)),
        teachingQuality: data.teachingQuality,
        classroomManagement: data.classroomManagement,
        studentEngagement: data.studentEngagement,
        professionalDevelopment: data.professionalDevelopment,
        collaboration: data.collaboration,
        punctuality: data.punctuality,
        evaluatorId: evaluation.evaluatorId || 0,
        evaluatorName: evaluation.evaluator?.fullName || '',
        evaluationDate: evaluation.evaluationDate?.toISOString().split('T')[0] || '',
        notes: evaluation.evaluationNotes || '',
        recommendations: data.recommendations || [],
        status: data.status as "draft" | "completed" | "reviewed" | "approved" || "draft",
        developmentGoals: data.developmentGoals || [],
        attendanceRate,
        profilePhoto: evaluation.teacher.profilePhoto || undefined
      };

      return transformedEvaluation;
    } catch (error: any) {
      throw new Error(error.message || 'Gagal membuat evaluasi guru');
    }
  }

  // Update evaluation
  async updateEvaluation(id: number, data: Partial<CreateEvaluationData>, schoolId: number): Promise<TeacherEvaluation> {
    try {
      // Verify evaluation exists and belongs to school
      const existingEvaluation = await prisma.teacherPerformance.findFirst({
        where: {
          id,
          teacher: { schoolId }
        }
      });

      if (!existingEvaluation) {
        throw new Error('Evaluasi tidak ditemukan atau bukan bagian dari sekolah ini');
      }

      // Calculate new overall score if scores are provided
      let overallScore = Number(existingEvaluation.totalScore) || 0;
      if (data.teachingQuality || data.classroomManagement || data.studentEngagement || 
          data.professionalDevelopment || data.collaboration || data.punctuality) {
        
        const scores = [
          data.teachingQuality || Number(existingEvaluation.teachingScore) || 0,
          data.classroomManagement || Number(existingEvaluation.disciplineScore) || 0,
          data.studentEngagement || Number(existingEvaluation.selfDevelopmentScore) || 0,
          data.professionalDevelopment || Number(existingEvaluation.contributionScore) || 0,
          data.collaboration || Number(existingEvaluation.disciplineScore) || 0,
          data.punctuality || Number(existingEvaluation.disciplineScore) || 0
        ];
        
        overallScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      }

      // Update performance record
      const evaluation = await prisma.teacherPerformance.update({
        where: { id },
        data: {
          teachingScore: data.teachingQuality,
          disciplineScore: data.punctuality,
          selfDevelopmentScore: data.professionalDevelopment,
          contributionScore: data.collaboration,
          totalScore: overallScore,
          evaluationNotes: data.notes,
          evaluationDate: data.status === 'draft' ? null : (existingEvaluation.evaluationDate || new Date()),
          updatedAt: new Date()
        },
        include: {
          teacher: {
            select: {
              id: true,
              employeeId: true,
              fullName: true,
              subjectArea: true,
              position: true,
              profilePhoto: true
            }
          },
          evaluator: {
            select: {
              id: true,
              fullName: true
            }
          },
          teacherPerformanceDetails: true
        }
      });

      // Update recommendations and development goals if provided
      if (data.recommendations || data.developmentGoals) {
        // Delete existing details
        await prisma.teacherPerformanceDetail.deleteMany({
          where: {
            teacherPerformanceId: id,
            assessmentCategory: { in: ['recommendations', 'development_goals'] }
          }
        });

        const detailsToCreate: Array<{
          teacherPerformanceId: number;
          assessmentCategory: string;
          indicator: string;
          score: number;
          notes: string;
        }> = [];

        if (data.recommendations) {
          data.recommendations.forEach((recommendation, index) => {
            detailsToCreate.push({
              teacherPerformanceId: id,
              assessmentCategory: 'recommendations',
              indicator: `Rekomendasi ${index + 1}`,
              score: 0,
              notes: recommendation
            });
          });
        }

        if (data.developmentGoals) {
          data.developmentGoals.forEach((goal, index) => {
            detailsToCreate.push({
              teacherPerformanceId: id,
              assessmentCategory: 'development_goals',
              indicator: `Tujuan Pengembangan ${index + 1}`,
              score: 0,
              notes: goal
            });
          });
        }

        if (detailsToCreate.length > 0) {
          await prisma.teacherPerformanceDetail.createMany({
            data: detailsToCreate
          });
        }
      }

      // Get updated performance details
      const updatedDetails = await prisma.teacherPerformanceDetail.findMany({
        where: { teacherPerformanceId: id }
      });

      // Calculate attendance rate
      const attendanceRate = await this.calculateAttendanceRate(evaluation.teacherId, evaluation.academicYear);

      // Extract recommendations and development goals
      const recommendations = updatedDetails
        .filter(detail => detail.assessmentCategory === 'recommendations')
        .map(detail => detail.notes || detail.indicator)
        .filter(Boolean);

      const developmentGoals = updatedDetails
        .filter(detail => detail.assessmentCategory === 'development_goals')
        .map(detail => detail.notes || detail.indicator)
        .filter(Boolean);

      // Determine status
      let evaluationStatus: "draft" | "completed" | "reviewed" | "approved" = "draft";
      if (evaluation.evaluationDate && evaluation.totalScore) {
        if (evaluation.evaluatorId) {
          evaluationStatus = "approved";
        } else {
          evaluationStatus = "completed";
        }
      }

      // Transform to frontend format
      const transformedEvaluation: TeacherEvaluation = {
        id: evaluation.id,
        teacherId: evaluation.teacherId,
        teacherName: evaluation.teacher.fullName,
        employeeId: evaluation.teacher.employeeId || '',
        subjectArea: evaluation.teacher.subjectArea,
        position: evaluation.teacher.position || '',
        evaluationPeriod: evaluation.evaluationPeriod,
        academicYear: evaluation.academicYear,
        overallScore: Number(overallScore.toFixed(1)),
        teachingQuality: Number(evaluation.teachingScore) || 0,
        classroomManagement: Number(evaluation.disciplineScore) || 0,
        studentEngagement: Number(evaluation.selfDevelopmentScore) || 0,
        professionalDevelopment: Number(evaluation.contributionScore) || 0,
        collaboration: Number(evaluation.disciplineScore) || 0,
        punctuality: Number(evaluation.disciplineScore) || 0,
        evaluatorId: evaluation.evaluatorId || 0,
        evaluatorName: evaluation.evaluator?.fullName || '',
        evaluationDate: evaluation.evaluationDate?.toISOString().split('T')[0] || '',
        notes: evaluation.evaluationNotes || '',
        recommendations,
        status: evaluationStatus,
        developmentGoals,
        attendanceRate,
        profilePhoto: evaluation.teacher.profilePhoto || undefined
      };

      return transformedEvaluation;
    } catch (error: any) {
      throw new Error(error.message || 'Gagal memperbarui evaluasi guru');
    }
  }

  // Create development program
  async createDevelopmentProgram(data: CreateDevelopmentProgramData, schoolId: number): Promise<TeacherDevelopment> {
    try {
      // Verify teacher belongs to school
      const teacher = await prisma.teacher.findFirst({
        where: { id: data.teacherId, schoolId }
      });

      if (!teacher) {
        throw new Error('Guru tidak ditemukan atau bukan bagian dari sekolah ini');
      }

      const program = await prisma.teacherDevelopment.create({
        data: {
          teacherId: data.teacherId,
          developmentType: data.programType,
          activityName: data.programName,
          organizer: data.provider,
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
          totalHours: data.hours,
          certificate: data.certificateUrl,
          description: data.description
        }
      });

      // Map status based on dates
      let programStatus: "planned" | "ongoing" | "completed" | "cancelled" = "planned";
      const now = new Date();
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);

      if (now < startDate) {
        programStatus = "planned";
      } else if (now >= startDate && now <= endDate) {
        programStatus = "ongoing";
      } else if (now > endDate) {
        programStatus = data.certificateUrl ? "completed" : "completed";
      }

      return {
        id: program.id,
        teacherId: program.teacherId,
        programName: program.activityName,
        programType: program.developmentType as "workshop" | "training" | "certification" | "seminar",
        startDate: data.startDate,
        endDate: data.endDate,
        status: programStatus,
        certificateUrl: program.certificate || undefined,
        hours: program.totalHours || 0,
        provider: program.organizer || '',
        cost: data.cost
      };
    } catch (error: any) {
      throw new Error(error.message || 'Gagal membuat program pengembangan');
    }
  }

  // Calculate attendance rate for a teacher
  private async calculateAttendanceRate(teacherId: number, academicYear: string): Promise<number> {
    try {
      // Get current year for attendance calculation
      const currentYear = new Date().getFullYear();
      const startDate = new Date(currentYear, 6, 1); // July 1st
      const endDate = new Date(currentYear + 1, 5, 30); // June 30th next year

      const [totalAttendance, presentAttendance] = await Promise.all([
        prisma.teacherAttendance.count({
          where: {
            teacherId,
            date: { gte: startDate, lte: endDate }
          }
        }),
        prisma.teacherAttendance.count({
          where: {
            teacherId,
            date: { gte: startDate, lte: endDate },
            status: 'present'
          }
        })
      ]);

      return totalAttendance > 0 ? Number(((presentAttendance / totalAttendance) * 100).toFixed(1)) : 0;
    } catch (error) {
      console.error('Error calculating attendance rate:', error);
      return 0;
    }
  }
}