import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Import configurations
import corsOptions from './config/CORSConfig';
import prisma from './config/prisma';

// Import existing routes
import authRoutes from './routes/authRoutes';
import academicRoutes from './routes/academicRoutes';
import teacherEvaluationRoutes from './routes/teacherEvaluationRoutes';

// Import new resource routes
import assetRoutes from './routes/assetRoutes';
import financeRoutes from './routes/financeRoutes';
import facilityRoutes from './routes/facilityRoutes';
import kpiRoutes from './routes/kpiRoutes';
import aiRecommendationRoutes from './routes/aiRecommendationRoutes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Global rate limiting
const globalLimiter = rateLimit({
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
app.use(helmet({
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
app.use(cors(corsOptions));
app.use(compression());

// Logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
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
  } catch (error) {
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
app.use('/api/auth', authRoutes);
app.use('/api/academic', academicRoutes);
app.use('/api/teacher-evaluation', teacherEvaluationRoutes);

// New resource management routes
app.use('/api/assets', assetRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/facilities', facilityRoutes);
app.use('/api/kpi', kpiRoutes);

app.use('/api/ai-recommendations', aiRecommendationRoutes);

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
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction): void => {
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
    await prisma.$connect();
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
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();