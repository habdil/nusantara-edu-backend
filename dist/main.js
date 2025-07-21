"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
// Import configurations
const CORSConfig_1 = __importDefault(require("./config/CORSConfig"));
const prisma_1 = __importDefault(require("./config/prisma"));
// Import existing routes
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const academicRoutes_1 = __importDefault(require("./routes/academicRoutes"));
const teacherEvaluationRoutes_1 = __importDefault(require("./routes/teacherEvaluationRoutes"));
// Import new resource routes
const assetRoutes_1 = __importDefault(require("./routes/assetRoutes"));
const financeRoutes_1 = __importDefault(require("./routes/financeRoutes"));
const facilityRoutes_1 = __importDefault(require("./routes/facilityRoutes"));
const kpiRoutes_1 = __importDefault(require("./routes/kpiRoutes"));
const aiRecommendationRoutes_1 = __importDefault(require("./routes/aiRecommendationRoutes"));
const earlyWarningRoutes_1 = __importDefault(require("./routes/earlyWarningRoutes"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Global rate limiting
const globalLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 menit
    max: 99999999999, // maksimal 100 request per 15 menit per IP
    message: {
        success: false,
        message: 'Terlalu banyak request. Silakan coba lagi nanti.',
        error: 'GLOBAL_RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
// Security middlewares
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));
app.use(globalLimiter);
app.use((0, cors_1.default)(CORSConfig_1.default));
app.use((0, compression_1.default)());
// Logging
app.use((0, morgan_1.default)(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
// Body parsing
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        // Test database connection
        await prisma_1.default.$queryRaw `SELECT 1`;
        res.status(200).json({
            success: true,
            message: 'NusantaraEdu API is healthy',
            data: {
                status: 'healthy',
                timestamp: new Date().toISOString(),
                environment: process.env.NODE_ENV || 'development',
                version: '1.0.0',
                services: {
                    database: 'connected',
                    auth: 'active',
                    academic: 'active',
                    teacherEvaluation: 'active',
                    resources: 'active'
                }
            }
        });
    }
    catch (error) {
        console.error('Health check failed:', error);
        res.status(503).json({
            success: false,
            message: 'Service unavailable',
            error: 'DATABASE_CONNECTION_FAILED'
        });
    }
});
// API Documentation endpoint
app.get('/api', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'NusantaraEdu API - Management Information System for Elementary School Principals',
        data: {
            version: '1.0.0',
            documentation: 'https://docs.nusantaraedu.id',
            endpoints: {
                auth: '/api/auth',
                academic: '/api/academic',
                teacherEvaluation: '/api/teacher-evaluation',
                assets: '/api/assets',
                finance: '/api/finance',
                facilities: '/api/facilities'
            },
            support: 'support@nusantaraedu.id'
        }
    });
});
// ===== API ROUTES =====
// Existing routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/academic', academicRoutes_1.default);
app.use('/api/teacher-evaluation', teacherEvaluationRoutes_1.default);
// New resource management routes
app.use('/api/assets', assetRoutes_1.default);
app.use('/api/finance', financeRoutes_1.default);
app.use('/api/facilities', facilityRoutes_1.default);
app.use('/api/kpi', kpiRoutes_1.default);
app.use('/api/ai-recommendations', aiRecommendationRoutes_1.default);
app.use('/api/early-warnings', earlyWarningRoutes_1.default);
// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint tidak ditemukan',
        error: 'NOT_FOUND',
        availableEndpoints: [
            '/api/auth',
            '/api/academic',
            '/api/teacher-evaluation',
            '/api/assets',
            '/api/finance',
            '/api/facilities'
        ]
    });
});
// Global error handler
app.use((error, req, res, next) => {
    console.error('Global error handler:', error);
    // Handle Prisma errors
    if (error.code === 'P2002') {
        res.status(400).json({
            success: false,
            message: 'Data sudah ada',
            error: 'DUPLICATE_DATA'
        });
        return;
    }
    if (error.code === 'P2025') {
        res.status(404).json({
            success: false,
            message: 'Data tidak ditemukan',
            error: 'DATA_NOT_FOUND'
        });
        return;
    }
    // Handle validation errors
    if (error.name === 'ValidationError') {
        res.status(400).json({
            success: false,
            message: 'Data tidak valid',
            error: 'VALIDATION_ERROR',
            details: error.details
        });
        return;
    }
    // Handle JWT errors
    if (error.name === 'JsonWebTokenError') {
        res.status(401).json({
            success: false,
            message: 'Token tidak valid',
            error: 'INVALID_TOKEN'
        });
        return;
    }
    if (error.name === 'TokenExpiredError') {
        res.status(401).json({
            success: false,
            message: 'Token telah kadaluarsa',
            error: 'TOKEN_EXPIRED'
        });
        return;
    }
    // Default error
    res.status(500).json({
        success: false,
        message: process.env.NODE_ENV === 'production'
            ? 'Terjadi kesalahan server'
            : error.message,
        error: 'INTERNAL_SERVER_ERROR'
    });
});
// Start server
const startServer = async () => {
    try {
        // Test database connection
        await prisma_1.default.$connect();
        console.log('✅ Database connected successfully');
        app.listen(PORT, () => {
            console.log(`🚀 NusantaraEdu API running on port ${PORT}`);
            console.log(`📚 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🔗 Health check: http://localhost:${PORT}/health`);
            console.log(`📖 API info: http://localhost:${PORT}/api`);
            console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`);
            console.log(`🎓 Academic endpoints: http://localhost:${PORT}/api/academic`);
            console.log(`👨‍🏫 Teacher evaluation: http://localhost:${PORT}/api/teacher-evaluation`);
            console.log(`📦 Asset management: http://localhost:${PORT}/api/assets`);
            console.log(`💰 Finance management: http://localhost:${PORT}/api/finance`);
            console.log(`🏢 Facility management: http://localhost:${PORT}/api/facilities`);
        });
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};
// Handle graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully...');
    await prisma_1.default.$disconnect();
    process.exit(0);
});
process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully...');
    await prisma_1.default.$disconnect();
    process.exit(0);
});
startServer();
