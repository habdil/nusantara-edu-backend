// src/types/aiTypes.ts

// Enums matching Prisma schema
export enum RecommendationCategory {
  ACADEMIC = 'academic',
  FINANCIAL = 'financial', 
  ASSET = 'asset',
  TEACHER = 'teacher',
  ATTENDANCE = 'attendance'
}

export enum ImplementationStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  APPROVED = 'approved',
  COMPLETED = 'completed',
  REJECTED = 'rejected'
}

export enum UrgencyLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Base interfaces for AI recommendations
export interface AIRecommendationData {
  id?: number;
  schoolId: number;
  category: RecommendationCategory;
  title: string;
  description: string;
  supportingData?: Record<string, any>;
  confidenceLevel: number;
  generatedDate: Date;
  predictedImpact?: string;
  implementationStatus?: ImplementationStatus;
  principalFeedback?: string;
  urgencyLevel?: UrgencyLevel;
  estimatedCost?: number;
  estimatedSaving?: number;
  estimatedTimeframe?: string;
  affectedEntities?: string[]; // student IDs, teacher IDs, asset IDs, etc.
}

// Supporting data structures for different categories
export interface AcademicSupportingData {
  currentAverage?: number;
  targetAverage?: number;
  studentsAffected?: number;
  subjectAreas?: string[];
  gradeLevel?: string;
  successProbability?: number;
  benchmarkComparison?: {
    schoolValue: number;
    districtAverage: number;
    nationalAverage: number;
  };
}

export interface FinancialSupportingData {
  currentSpending?: number;
  potentialSaving?: number;
  categories?: string[];
  budgetVariance?: number;
  paybackPeriod?: number;
  riskLevel?: 'low' | 'medium' | 'high';
  monthlyImpact?: number;
}

export interface AssetSupportingData {
  assetsAtRisk?: number;
  preventiveCost?: number;
  potentialDamage?: number;
  timeframe?: string;
  maintenanceType?: 'preventive' | 'corrective' | 'replacement';
  assetConditions?: Record<string, string>;
  priorityMatrix?: {
    urgency: number;
    impact: number;
    effort: number;
  };
}

export interface TeacherSupportingData {
  teachersIdentified?: number;
  currentScore?: number;
  targetScore?: number;
  trainingDuration?: string;
  skillGaps?: string[];
  performanceMetrics?: Record<string, number>;
  developmentAreas?: string[];
}

export interface AttendanceSupportingData {
  currentAttendance?: number;
  targetAttendance?: number;
  criticalDays?: string[];
  impactedStudents?: number;
  seasonalPatterns?: Record<string, number>;
  classBreakdown?: Array<{
    className: string;
    rate: number;
    status: string;
  }>;
}

// Analysis input data structures
export interface AcademicAnalysisInput {
  students: Array<{
    id: number;
    studentId: string;
    fullName: string;
    grade: string;
    academicRecords: Array<{
      subject: string;
      subjectCode: string;
      finalScore: number;
      knowledgeScore: number;
      skillScore: number;
      attitudeScore: string;
      semester: string;
      academicYear: string;
      teacherName: string;
    }>;
    attendance: Array<{
      date: string;
      status: string;
      notes: string;
    }>;
  }>;
  schoolBenchmarks?: Array<{
    category: string;
    standardName: string;
    schoolValue: number;
    districtRank?: number;
    provinceRank?: number;
    nationalRank?: number;
  }>;
  targets?: {
    minimumPassingGrade: number;
    targetAttendanceRate: number;
    benchmarkComparison: boolean;
  };
}

export interface FinancialAnalysisInput {
  finances: Array<{
    budgetCategory: string;
    budgetAmount: number;
    usedAmount: number;
    remainingAmount: number;
    period: string;
    transactions: Array<{
      date: string;
      amount: number;
      type: 'income' | 'expense';
      category: string;
      description: string;
    }>;
  }>;
  benchmarks?: {
    similarSchools?: Array<{
      category: string;
      averageSpending: number;
    }>;
    efficiencyTargets?: Record<string, number>;
  };
}

export interface AssetAnalysisInput {
  assets: Array<{
    id: number;
    assetCode: string;
    assetName: string;
    category: string;
    acquisitionDate: string;
    acquisitionValue: number;
    condition: string;
    usefulLife: number;
    lastMaintenance?: string;
    maintenanceHistory: Array<{
      date: string;
      type: string;
      cost: number;
      result: string;
    }>;
  }>;
  maintenanceSchedules?: Array<{
    assetId: number;
    scheduledDate: string;
    type: string;
    estimatedCost: number;
  }>;
}

export interface TeacherAnalysisInput {
  teachers: Array<{
    id: number;
    fullName: string;
    subjectArea: string;
    employmentStatus: string;
    teachingStartYear: number;
    performance: Array<{
      evaluationPeriod: string;
      disciplineScore: number;
      teachingScore: number;
      selfDevelopmentScore: number;
      contributionScore: number;
      totalScore: number;
    }>;
    developments: Array<{
      developmentType: string;
      activityName: string;
      totalHours: number;
      completionDate: string;
    }>;
  }>;
  performanceStandards?: {
    minimumScore: number;
    excellentScore: number;
    requiredDevelopmentHours: number;
  };
}

// AI Analysis Response Types
export interface AIAnalysisResponse {
  success: boolean;
  recommendations: AIRecommendationData[];
  metadata: {
    analysisDate: string;
    dataQuality: number;
    processingTime: number;
    confidence: number;
    recordsAnalyzed: number;
  };
  summary: {
    totalRecommendations: number;
    highPriorityCount: number;
    estimatedTotalSaving: number;
    estimatedImplementationCost: number;
    averageConfidence: number;
  };
  errors?: string[];
  warnings?: string[];
}

// Prompt templates interface
export interface PromptTemplate {
  category: RecommendationCategory;
  systemPrompt: string;
  userPrompt: string;
  examples?: Array<{
    input: any;
    expectedOutput: Partial<AIRecommendationData>;
  }>;
  parameters?: {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
  };
}

// Configuration for different analysis types
export interface AnalysisConfiguration {
  academic: {
    passingGradeThreshold: number;
    attendanceThreshold: number;
    improvementTargetPercentage: number;
    confidenceFactors: {
      sampleSize: number;
      dataQuality: number;
      historicalTrend: number;
    };
  };
  financial: {
    budgetVarianceThreshold: number;
    savingOpportunityThreshold: number;
    riskToleranceLevel: 'low' | 'medium' | 'high';
    paybackPeriodMax: number;
  };
  asset: {
    maintenanceScheduleBuffer: number; // days
    replacementThresholdPercentage: number;
    riskMatrixWeights: {
      urgency: number;
      impact: number;
      effort: number;
    };
  };
  teacher: {
    performanceThreshold: number;
    developmentHoursRequired: number;
    evaluationFrequency: 'monthly' | 'quarterly' | 'annually';
  };
}

// Export utility types
export type SupportingDataUnion = 
  | AcademicSupportingData 
  | FinancialSupportingData 
  | AssetSupportingData 
  | TeacherSupportingData 
  | AttendanceSupportingData;

export type AnalysisInputUnion = 
  | AcademicAnalysisInput 
  | FinancialAnalysisInput 
  | AssetAnalysisInput 
  | TeacherAnalysisInput;