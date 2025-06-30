"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const authService_1 = require("../services/authService");
const authValidation_1 = require("../validation/authValidation");
class AuthController {
    constructor() {
        this.register = async (req, res) => {
            try {
                // Validate request body
                const { error, value } = authValidation_1.registerValidation.validate(req.body);
                if (error) {
                    res.status(400).json({
                        success: false,
                        message: 'Data registrasi tidak valid',
                        errors: error.details.map(detail => ({
                            field: detail.path.join('.'),
                            message: detail.message
                        }))
                    });
                    return;
                }
                const result = await this.authService.register(value);
                res.status(201).json(result);
            }
            catch (error) {
                console.error('Register error:', error);
                res.status(400).json({
                    success: false,
                    message: error.message || 'Gagal melakukan registrasi',
                    error: 'REGISTRATION_FAILED'
                });
            }
        };
        this.login = async (req, res) => {
            try {
                // Validate request body
                const { error, value } = authValidation_1.loginValidation.validate(req.body);
                if (error) {
                    res.status(400).json({
                        success: false,
                        message: 'Data login tidak valid',
                        errors: error.details.map(detail => ({
                            field: detail.path.join('.'),
                            message: detail.message
                        }))
                    });
                    return;
                }
                const result = await this.authService.login(value);
                res.status(200).json(result);
            }
            catch (error) {
                console.error('Login error:', error);
                res.status(401).json({
                    success: false,
                    message: error.message || 'Gagal melakukan login',
                    error: 'LOGIN_FAILED'
                });
            }
        };
        this.logout = async (req, res) => {
            try {
                // In JWT implementation, logout is handled on client side by removing token
                // Here we can optionally log the logout activity
                res.status(200).json({
                    success: true,
                    message: 'Logout berhasil'
                });
            }
            catch (error) {
                console.error('Logout error:', error);
                res.status(500).json({
                    success: false,
                    message: 'Terjadi kesalahan saat logout',
                    error: 'LOGOUT_FAILED'
                });
            }
        };
        this.getProfile = async (req, res) => {
            try {
                if (!req.user) {
                    res.status(401).json({
                        success: false,
                        message: 'User tidak terautentikasi',
                        error: 'UNAUTHORIZED'
                    });
                    return;
                }
                const profile = await this.authService.getProfile(req.user.userId);
                res.status(200).json({
                    success: true,
                    message: 'Profil berhasil diambil',
                    data: profile
                });
            }
            catch (error) {
                console.error('Get profile error:', error);
                res.status(404).json({
                    success: false,
                    message: error.message || 'Gagal mengambil profil user',
                    error: 'PROFILE_NOT_FOUND'
                });
            }
        };
        this.updateProfile = async (req, res) => {
            try {
                if (!req.user) {
                    res.status(401).json({
                        success: false,
                        message: 'User tidak terautentikasi',
                        error: 'UNAUTHORIZED'
                    });
                    return;
                }
                // Validate request body
                const { error, value } = authValidation_1.updateProfileValidation.validate(req.body);
                if (error) {
                    res.status(400).json({
                        success: false,
                        message: 'Data update profil tidak valid',
                        errors: error.details.map(detail => ({
                            field: detail.path.join('.'),
                            message: detail.message
                        }))
                    });
                    return;
                }
                const result = await this.authService.updateProfile(req.user.userId, value);
                res.status(200).json(result);
            }
            catch (error) {
                console.error('Update profile error:', error);
                res.status(400).json({
                    success: false,
                    message: error.message || 'Gagal memperbarui profil',
                    error: 'UPDATE_PROFILE_FAILED'
                });
            }
        };
        this.changePassword = async (req, res) => {
            try {
                if (!req.user) {
                    res.status(401).json({
                        success: false,
                        message: 'User tidak terautentikasi',
                        error: 'UNAUTHORIZED'
                    });
                    return;
                }
                // Validate request body
                const { error, value } = authValidation_1.changePasswordValidation.validate(req.body);
                if (error) {
                    res.status(400).json({
                        success: false,
                        message: 'Data ubah password tidak valid',
                        errors: error.details.map(detail => ({
                            field: detail.path.join('.'),
                            message: detail.message
                        }))
                    });
                    return;
                }
                const result = await this.authService.changePassword(req.user.userId, value.current_password, value.new_password);
                res.status(200).json(result);
            }
            catch (error) {
                console.error('Change password error:', error);
                res.status(400).json({
                    success: false,
                    message: error.message || 'Gagal mengubah password',
                    error: 'CHANGE_PASSWORD_FAILED'
                });
            }
        };
        // Method untuk mendapatkan informasi dashboard header
        this.getDashboardInfo = async (req, res) => {
            try {
                if (!req.user) {
                    res.status(401).json({
                        success: false,
                        message: 'User tidak terautentikasi',
                        error: 'UNAUTHORIZED'
                    });
                    return;
                }
                const profile = await this.authService.getProfile(req.user.userId);
                // Return minimal info for dashboard header
                res.status(200).json({
                    success: true,
                    message: 'Info dashboard berhasil diambil',
                    data: {
                        user: {
                            fullName: profile.fullName,
                            role: profile.role,
                            profilePicture: profile.profilePicture
                        },
                        school: profile.school ? {
                            schoolName: profile.school.schoolName,
                            logoUrl: profile.school.logoUrl
                        } : null
                    }
                });
            }
            catch (error) {
                console.error('Get dashboard info error:', error);
                res.status(404).json({
                    success: false,
                    message: error.message || 'Gagal mengambil info dashboard',
                    error: 'DASHBOARD_INFO_FAILED'
                });
            }
        };
        this.authService = new authService_1.AuthService();
    }
}
exports.AuthController = AuthController;
