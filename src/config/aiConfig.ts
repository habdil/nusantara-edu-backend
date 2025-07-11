// src/config/aiConfig.ts
import dotenv from 'dotenv';
import { HarmCategory, HarmBlockThreshold, SafetySetting } from '@google/generative-ai';

dotenv.config();

export interface GeminiConfig {
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  topK: number;
  safetySettings: SafetySetting[];
  generationConfig: GenerationConfig;
}

export interface GenerationConfig {
  temperature: number;
  topP: number;
  topK: number;
  maxOutputTokens: number;
  responseMimeType: string;
}

export interface AIAnalysisConfig {
  enabled: boolean;
  batchSize: number;
  retryAttempts: number;
  retryDelay: number;
  requestTimeout: number;
  rateLimitPerMinute: number;
  confidenceThreshold: number;
  analysisFrequency: {
    academic: string; // cron expression
    financial: string;
    asset: string;
    teacher: string;
    attendance: string;
  };
}

// Gemini AI Configuration
export const geminiConfig: GeminiConfig = {
  apiKey: process.env.GEMINI_API_KEY || '',
  model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
  temperature: parseFloat(process.env.GEMINI_TEMPERATURE || '0.7'),
  maxTokens: parseInt(process.env.GEMINI_MAX_TOKENS || '2048'),
  topP: parseFloat(process.env.GEMINI_TOP_P || '0.9'),
  topK: parseInt(process.env.GEMINI_TOP_K || '40'),
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
    }
  ],
  generationConfig: {
    temperature: parseFloat(process.env.GEMINI_TEMPERATURE || '0.7'),
    topP: parseFloat(process.env.GEMINI_TOP_P || '0.9'),
    topK: parseInt(process.env.GEMINI_TOP_K || '40'),
    maxOutputTokens: parseInt(process.env.GEMINI_MAX_TOKENS || '2048'),
    responseMimeType: 'application/json'
  }
};

// AI Analysis Configuration
export const aiAnalysisConfig: AIAnalysisConfig = {
  enabled: process.env.AI_ANALYSIS_ENABLED === 'true' || true,
  batchSize: parseInt(process.env.AI_BATCH_SIZE || '10'),
  retryAttempts: parseInt(process.env.AI_RETRY_ATTEMPTS || '3'),
  retryDelay: parseInt(process.env.AI_RETRY_DELAY || '1000'), // milliseconds
  requestTimeout: parseInt(process.env.AI_REQUEST_TIMEOUT || '30000'), // milliseconds
  rateLimitPerMinute: parseInt(process.env.AI_RATE_LIMIT || '60'),
  confidenceThreshold: parseFloat(process.env.AI_CONFIDENCE_THRESHOLD || '0.7'),
  analysisFrequency: {
    academic: process.env.AI_ACADEMIC_CRON || '0 6 * * *', // Daily at 6 AM
    financial: process.env.AI_FINANCIAL_CRON || '0 7 * * MON', // Weekly Monday 7 AM
    asset: process.env.AI_ASSET_CRON || '0 8 * * TUE', // Weekly Tuesday 8 AM
    teacher: process.env.AI_TEACHER_CRON || '0 9 * * WED', // Weekly Wednesday 9 AM
    attendance: process.env.AI_ATTENDANCE_CRON || '0 10 * * *' // Daily at 10 AM
  }
};

// Validation functions
export const validateGeminiConfig = (): void => {
  if (!geminiConfig.apiKey) {
    throw new Error('GEMINI_API_KEY is required in environment variables');
  }

  if (geminiConfig.temperature < 0 || geminiConfig.temperature > 2) {
    throw new Error('GEMINI_TEMPERATURE must be between 0 and 2');
  }

  if (geminiConfig.topP < 0 || geminiConfig.topP > 1) {
    throw new Error('GEMINI_TOP_P must be between 0 and 1');
  }

  if (geminiConfig.topK < 1 || geminiConfig.topK > 100) {
    throw new Error('GEMINI_TOP_K must be between 1 and 100');
  }

  if (geminiConfig.maxTokens < 1 || geminiConfig.maxTokens > 8192) {
    throw new Error('GEMINI_MAX_TOKENS must be between 1 and 8192');
  }
};

export const validateAIAnalysisConfig = (): void => {
  if (aiAnalysisConfig.batchSize < 1 || aiAnalysisConfig.batchSize > 100) {
    throw new Error('AI_BATCH_SIZE must be between 1 and 100');
  }

  if (aiAnalysisConfig.retryAttempts < 0 || aiAnalysisConfig.retryAttempts > 10) {
    throw new Error('AI_RETRY_ATTEMPTS must be between 0 and 10');
  }

  if (aiAnalysisConfig.confidenceThreshold < 0 || aiAnalysisConfig.confidenceThreshold > 1) {
    throw new Error('AI_CONFIDENCE_THRESHOLD must be between 0 and 1');
  }

  if (aiAnalysisConfig.rateLimitPerMinute < 1 || aiAnalysisConfig.rateLimitPerMinute > 1000) {
    throw new Error('AI_RATE_LIMIT must be between 1 and 1000');
  }
};

// Initialize and validate configurations
export const initializeAIConfig = (): void => {
  try {
    validateGeminiConfig();
    validateAIAnalysisConfig();
    console.log('✅ AI Configuration initialized successfully');
  } catch (error) {
    console.error('❌ AI Configuration validation failed:', error);
    throw error;
  }
};

// Helper functions
export const isAIAnalysisEnabled = (): boolean => {
  return aiAnalysisConfig.enabled && !!geminiConfig.apiKey;
};

export const getAnalysisFrequency = (type: keyof AIAnalysisConfig['analysisFrequency']): string => {
  return aiAnalysisConfig.analysisFrequency[type];
};

export const shouldRunAnalysis = (confidence: number): boolean => {
  return confidence >= aiAnalysisConfig.confidenceThreshold;
};

export default {
  geminiConfig,
  aiAnalysisConfig,
  validateGeminiConfig,
  validateAIAnalysisConfig,
  initializeAIConfig,
  isAIAnalysisEnabled,
  getAnalysisFrequency,
  shouldRunAnalysis
};