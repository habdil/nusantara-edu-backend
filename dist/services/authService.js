"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../config/prisma"));
const client_1 = require("@prisma/client");
class AuthService {
    generateToken(userId, username, role, schoolId) {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('JWT_SECRET not configured');
        }
        const payload = {
            userId,
            username,
            role,
            schoolId
        };
        return jsonwebtoken_1.default.sign(payload, secret, {
            expiresIn: (process.env.JWT_EXPIRES_IN || '7d')
        });
    }
    async register(data) {
        try {
            // Check if username already exists
            const existingUser = await prisma_1.default.user.findUnique({
                where: { username: data.username }
            });
            if (existingUser) {
                throw new Error('Username sudah digunakan');
            }
            // Check if email already exists
            const existingEmail = await prisma_1.default.user.findUnique({
                where: { email: data.email }
            });
            if (existingEmail) {
                throw new Error('Email sudah digunakan');
            }
            // Check if school exists
            const school = await prisma_1.default.school.findUnique({
                where: { npsn: data.npsn }
            });
            if (!school) {
                throw new Error('NPSN sekolah tidak ditemukan');
            }
            // Check if school already has a principal
            if (school.principalId) {
                throw new Error('Sekolah sudah memiliki kepala sekolah');
            }
            // Hash password
            const saltRounds = 12;
            const hashedPassword = await bcryptjs_1.default.hash(data.password, saltRounds);
            // Create user and update school in transaction
            const result = await prisma_1.default.$transaction(async (tx) => {
                // Create user
                const user = await tx.user.create({
                    data: {
                        username: data.username,
                        email: data.email,
                        passwordHash: hashedPassword,
                        role: client_1.UserRoles.principal,
                        fullName: data.fullName,
                        phoneNumber: data.phoneNumber || null,
                        isActive: true,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    }
                });
                // Update school principal
                await tx.school.update({
                    where: { id: school.id },
                    data: {
                        principalId: user.id,
                        updatedAt: new Date()
                    }
                });
                return user;
            });
            // Generate token
            const token = this.generateToken(result.id, result.username, result.role, school.id);
            return {
                success: true,
                message: 'Registrasi berhasil',
                data: {
                    user: {
                        id: result.id,
                        username: result.username,
                        email: result.email,
                        role: result.role,
                        fullName: result.fullName,
                        phoneNumber: result.phoneNumber,
                        profilePicture: result.profilePicture
                    },
                    school: {
                        id: school.id,
                        npsn: school.npsn,
                        schoolName: school.schoolName,
                        fullAddress: school.fullAddress
                    },
                    token
                }
            };
        }
        catch (error) {
            throw new Error(error.message || 'Gagal melakukan registrasi');
        }
    }
    async login(data) {
        try {
            // Find user with school info
            const user = await prisma_1.default.user.findUnique({
                where: {
                    username: data.username,
                    isActive: true
                },
                include: {
                    principalSchools: {
                        select: {
                            id: true,
                            npsn: true,
                            schoolName: true,
                            fullAddress: true,
                            accreditation: true,
                            logoUrl: true
                        }
                    }
                }
            });
            if (!user) {
                throw new Error('Username atau password salah');
            }
            // Verify password
            const isPasswordValid = await bcryptjs_1.default.compare(data.password, user.passwordHash);
            if (!isPasswordValid) {
                throw new Error('Username atau password salah');
            }
            // Update last login
            await prisma_1.default.user.update({
                where: { id: user.id },
                data: {
                    lastLogin: new Date(),
                    updatedAt: new Date()
                }
            });
            // Generate token - get first school (since principal should only have one)
            const school = user.principalSchools[0] || null;
            const token = this.generateToken(user.id, user.username, user.role, school?.id);
            return {
                success: true,
                message: 'Login berhasil',
                data: {
                    user: {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        role: user.role,
                        fullName: user.fullName,
                        phoneNumber: user.phoneNumber,
                        profilePicture: user.profilePicture,
                        lastLogin: user.lastLogin
                    },
                    school: school,
                    token
                }
            };
        }
        catch (error) {
            throw new Error(error.message || 'Gagal melakukan login');
        }
    }
    async getProfile(userId) {
        try {
            const user = await prisma_1.default.user.findUnique({
                where: {
                    id: userId,
                    isActive: true
                },
                include: {
                    principalSchools: {
                        select: {
                            id: true,
                            npsn: true,
                            schoolName: true,
                            fullAddress: true,
                            accreditation: true,
                            logoUrl: true
                        }
                    }
                }
            });
            if (!user) {
                throw new Error('User tidak ditemukan');
            }
            // Get first school (principal should only have one)
            const school = user.principalSchools[0] || null;
            return {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                fullName: user.fullName,
                phoneNumber: user.phoneNumber,
                profilePicture: user.profilePicture,
                lastLogin: user.lastLogin,
                createdAt: user.createdAt,
                school: school
            };
        }
        catch (error) {
            throw new Error(error.message || 'Gagal mengambil profil user');
        }
    }
    async updateProfile(userId, data) {
        try {
            const user = await prisma_1.default.user.update({
                where: {
                    id: userId,
                    isActive: true
                },
                data: {
                    ...data,
                    updatedAt: new Date()
                },
                select: {
                    id: true,
                    username: true,
                    email: true,
                    role: true,
                    fullName: true,
                    phoneNumber: true,
                    profilePicture: true,
                    lastLogin: true,
                    createdAt: true
                }
            });
            return {
                success: true,
                message: 'Profil berhasil diperbarui',
                data: user
            };
        }
        catch (error) {
            throw new Error(error.message || 'Gagal memperbarui profil');
        }
    }
    async changePassword(userId, currentPassword, newPassword) {
        try {
            // Get current user
            const user = await prisma_1.default.user.findUnique({
                where: {
                    id: userId,
                    isActive: true
                }
            });
            if (!user) {
                throw new Error('User tidak ditemukan');
            }
            // Verify current password
            const isCurrentPasswordValid = await bcryptjs_1.default.compare(currentPassword, user.passwordHash);
            if (!isCurrentPasswordValid) {
                throw new Error('Password saat ini salah');
            }
            // Hash new password
            const saltRounds = 12;
            const hashedNewPassword = await bcryptjs_1.default.hash(newPassword, saltRounds);
            // Update password
            await prisma_1.default.user.update({
                where: { id: userId },
                data: {
                    passwordHash: hashedNewPassword,
                    updatedAt: new Date()
                }
            });
            return {
                success: true,
                message: 'Password berhasil diubah'
            };
        }
        catch (error) {
            throw new Error(error.message || 'Gagal mengubah password');
        }
    }
}
exports.AuthService = AuthService;
