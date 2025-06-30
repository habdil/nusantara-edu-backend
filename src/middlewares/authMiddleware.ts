import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma';

interface JwtPayload {
  userId: number;
  username: string;
  role: string;
  schoolId?: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Token akses tidak ditemukan',
        error: 'UNAUTHORIZED'
      });
      return;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      res.status(500).json({
        success: false,
        message: 'Konfigurasi server tidak lengkap',
        error: 'SERVER_ERROR'
      });
      return;
    }

    const decoded = jwt.verify(token, secret) as JwtPayload;
    
    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { 
        id: decoded.userId,
        isActive: true 
      },
      select: {
        id: true,
        username: true,
        role: true,
        fullName: true,
        email: true,
        principalSchools: {
          select: {
            id: true,
            npsn: true,
            schoolName: true
          }
        }
      }
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Token tidak valid atau user tidak aktif',
        error: 'INVALID_TOKEN'
      });
      return;
    }

    // Add user info to request
    req.user = {
      userId: user.id,
      username: user.username,
      role: user.role,
      schoolId: user.principalSchools[0]?.id
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: 'Token tidak valid',
        error: 'INVALID_TOKEN'
      });
      return;
    }

    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: 'Token telah kadaluarsa',
        error: 'TOKEN_EXPIRED'
      });
      return;
    }

    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server',
      error: 'SERVER_ERROR'
    });
  }
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User tidak terautentikasi',
        error: 'UNAUTHORIZED'
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Akses ditolak. Role tidak memiliki izin',
        error: 'FORBIDDEN'
      });
      return;
    }

    next();
  };
};

export const requirePrincipal = requireRole(['principal']);
export const requireAdmin = requireRole(['admin']);
export const requirePrincipalOrAdmin = requireRole(['principal', 'admin']);