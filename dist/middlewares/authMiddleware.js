"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requirePrincipalOrAdmin = exports.requireAdmin = exports.requirePrincipal = exports.requireRole = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../config/prisma"));
const authenticateToken = async (req, res, next) => {
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
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        // Verify user still exists and is active
        const user = await prisma_1.default.user.findUnique({
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
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            res.status(401).json({
                success: false,
                message: 'Token tidak valid',
                error: 'INVALID_TOKEN'
            });
            return;
        }
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
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
exports.authenticateToken = authenticateToken;
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
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
exports.requireRole = requireRole;
exports.requirePrincipal = (0, exports.requireRole)(['principal']);
exports.requireAdmin = (0, exports.requireRole)(['admin']);
exports.requirePrincipalOrAdmin = (0, exports.requireRole)(['principal', 'admin']);
