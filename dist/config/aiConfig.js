"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.shouldRunAnalysis = exports.getAnalysisFrequency = exports.isAIAnalysisEnabled = exports.initializeAIConfig = exports.validateAIAnalysisConfig = exports.validateGeminiConfig = exports.aiAnalysisConfig = exports.geminiConfig = void 0;
// src/config/aiConfig.ts
const dotenv_1 = __importDefault(require("dotenv"));
const generative_ai_1 = require("@google/generative-ai");
dotenv_1.default.config();
// Gemini AI Configuration
exports.geminiConfig = {
    apiKey: process.env.GEMINI_API_KEY || '',
    model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
    temperature: parseFloat(process.env.GEMINI_TEMPERATURE || '0.7'),
    maxTokens: parseInt(process.env.GEMINI_MAX_TOKENS || '2048'),
    topP: parseFloat(process.env.GEMINI_TOP_P || '0.9'),
    topK: parseInt(process.env.GEMINI_TOP_K || '40'),
    safetySettings: [
        {
            category: generative_ai_1.HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: generative_ai_1.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
        },
        {
            category: generative_ai_1.HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: generative_ai_1.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
        },
        {
            category: generative_ai_1.HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: generative_ai_1.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
        },
        {
            category: generative_ai_1.HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: generative_ai_1.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
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
exports.aiAnalysisConfig = {
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
const validateGeminiConfig = () => {
    if (!exports.geminiConfig.apiKey) {
        throw new Error('GEMINI_API_KEY is required in environment variables');
    }
    if (exports.geminiConfig.temperature < 0 || exports.geminiConfig.temperature > 2) {
        throw new Error('GEMINI_TEMPERATURE must be between 0 and 2');
    }
    if (exports.geminiConfig.topP < 0 || exports.geminiConfig.topP > 1) {
        throw new Error('GEMINI_TOP_P must be between 0 and 1');
    }
    if (exports.geminiConfig.topK < 1 || exports.geminiConfig.topK > 100) {
        throw new Error('GEMINI_TOP_K must be between 1 and 100');
    }
    if (exports.geminiConfig.maxTokens < 1 || exports.geminiConfig.maxTokens > 8192) {
        throw new Error('GEMINI_MAX_TOKENS must be between 1 and 8192');
    }
};
exports.validateGeminiConfig = validateGeminiConfig;
const validateAIAnalysisConfig = () => {
    if (exports.aiAnalysisConfig.batchSize < 1 || exports.aiAnalysisConfig.batchSize > 100) {
        throw new Error('AI_BATCH_SIZE must be between 1 and 100');
    }
    if (exports.aiAnalysisConfig.retryAttempts < 0 || exports.aiAnalysisConfig.retryAttempts > 10) {
        throw new Error('AI_RETRY_ATTEMPTS must be between 0 and 10');
    }
    if (exports.aiAnalysisConfig.confidenceThreshold < 0 || exports.aiAnalysisConfig.confidenceThreshold > 1) {
        throw new Error('AI_CONFIDENCE_THRESHOLD must be between 0 and 1');
    }
    if (exports.aiAnalysisConfig.rateLimitPerMinute < 1 || exports.aiAnalysisConfig.rateLimitPerMinute > 1000) {
        throw new Error('AI_RATE_LIMIT must be between 1 and 1000');
    }
};
exports.validateAIAnalysisConfig = validateAIAnalysisConfig;
// Initialize and validate configurations
const initializeAIConfig = () => {
    try {
        (0, exports.validateGeminiConfig)();
        (0, exports.validateAIAnalysisConfig)();
        console.log('✅ AI Configuration initialized successfully');
    }
    catch (error) {
        console.error('❌ AI Configuration validation failed:', error);
        throw error;
    }
};
exports.initializeAIConfig = initializeAIConfig;
// Helper functions
const isAIAnalysisEnabled = () => {
    return exports.aiAnalysisConfig.enabled && !!exports.geminiConfig.apiKey;
};
exports.isAIAnalysisEnabled = isAIAnalysisEnabled;
const getAnalysisFrequency = (type) => {
    return exports.aiAnalysisConfig.analysisFrequency[type];
};
exports.getAnalysisFrequency = getAnalysisFrequency;
const shouldRunAnalysis = (confidence) => {
    return confidence >= exports.aiAnalysisConfig.confidenceThreshold;
};
exports.shouldRunAnalysis = shouldRunAnalysis;
exports.default = {
    geminiConfig: exports.geminiConfig,
    aiAnalysisConfig: exports.aiAnalysisConfig,
    validateGeminiConfig: exports.validateGeminiConfig,
    validateAIAnalysisConfig: exports.validateAIAnalysisConfig,
    initializeAIConfig: exports.initializeAIConfig,
    isAIAnalysisEnabled: exports.isAIAnalysisEnabled,
    getAnalysisFrequency: exports.getAnalysisFrequency,
    shouldRunAnalysis: exports.shouldRunAnalysis
};
