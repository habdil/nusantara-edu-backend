"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EarlyWarningController = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
class EarlyWarningController {
    constructor() {
        // Get all early warnings for a school
        this.getWarnings = async (req, res) => {
            try {
                if (!req.user?.schoolId) {
                    res.status(400).json({
                        success: false,
                        message: 'Informasi sekolah tidak ditemukan',
                        error: 'SCHOOL_INFO_MISSING'
                    });
                    return;
                }
                console.log('🔍 Getting warnings for school:', req.user.schoolId);
                // Get warnings from database
                const warnings = await prisma_1.default.earlyWarning.findMany({
                    where: {
                        schoolId: req.user.schoolId
                    },
                    orderBy: [
                        { urgencyLevel: 'desc' }, // Critical first
                        { detectedDate: 'desc' } // Newest first
                    ]
                });
                console.log('📊 Found warnings:', warnings.length);
                // Transform data to match frontend format
                const transformedWarnings = warnings.map(warning => ({
                    id: warning.id,
                    category: warning.category,
                    title: warning.title,
                    description: warning.description,
                    urgency: warning.urgencyLevel,
                    detectedDate: warning.detectedDate.toISOString().split('T')[0],
                    targetValue: warning.targetValue ? Number(warning.targetValue) : undefined,
                    actualValue: warning.actualValue ? Number(warning.actualValue) : undefined,
                    handlingStatus: warning.handlingStatus,
                    // Add icon and color based on category
                    icon: this.getCategoryIcon(warning.category),
                    color: this.getUrgencyColor(warning.urgencyLevel)
                }));
                // Calculate stats
                const stats = {
                    total: warnings.length,
                    critical: warnings.filter(w => w.urgencyLevel === 'critical').length,
                    high: warnings.filter(w => w.urgencyLevel === 'high').length,
                    medium: warnings.filter(w => w.urgencyLevel === 'medium').length,
                    low: warnings.filter(w => w.urgencyLevel === 'low').length,
                    byCategory: this.groupByCategory(warnings)
                };
                res.status(200).json({
                    success: true,
                    message: 'Peringatan dini berhasil diambil',
                    data: transformedWarnings,
                    stats
                });
            }
            catch (error) {
                console.error('Get warnings error:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || 'Gagal mengambil peringatan dini',
                    error: 'GET_WARNINGS_FAILED'
                });
            }
        };
        // Get warning statistics only
        this.getStats = async (req, res) => {
            try {
                if (!req.user?.schoolId) {
                    res.status(400).json({
                        success: false,
                        message: 'Informasi sekolah tidak ditemukan',
                        error: 'SCHOOL_INFO_MISSING'
                    });
                    return;
                }
                const warnings = await prisma_1.default.earlyWarning.findMany({
                    where: {
                        schoolId: req.user.schoolId
                    },
                    select: {
                        category: true,
                        urgencyLevel: true,
                        detectedDate: true,
                        handlingStatus: true
                    }
                });
                const stats = {
                    total: warnings.length,
                    critical: warnings.filter(w => w.urgencyLevel === 'critical').length,
                    high: warnings.filter(w => w.urgencyLevel === 'high').length,
                    medium: warnings.filter(w => w.urgencyLevel === 'medium').length,
                    low: warnings.filter(w => w.urgencyLevel === 'low').length,
                    byCategory: this.groupByCategory(warnings),
                    recent: warnings.filter(w => {
                        const daysDiff = (new Date().getTime() - new Date(w.detectedDate).getTime()) / (1000 * 60 * 60 * 24);
                        return daysDiff <= 7;
                    }).length
                };
                res.status(200).json({
                    success: true,
                    message: 'Statistik peringatan berhasil diambil',
                    data: stats
                });
            }
            catch (error) {
                console.error('Get warning stats error:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || 'Gagal mengambil statistik peringatan',
                    error: 'GET_STATS_FAILED'
                });
            }
        };
        // Generate early warnings based on school data analysis
        this.generateWarnings = async (req, res) => {
            try {
                if (!req.user?.schoolId) {
                    res.status(400).json({
                        success: false,
                        message: 'Informasi sekolah tidak ditemukan',
                        error: 'SCHOOL_INFO_MISSING'
                    });
                    return;
                }
                // Check if user has admin/principal role
                if (req.user.role !== 'admin' && req.user.role !== 'principal') {
                    res.status(403).json({
                        success: false,
                        message: 'Hanya admin dan kepala sekolah yang dapat generate peringatan',
                        error: 'INSUFFICIENT_PERMISSION'
                    });
                    return;
                }
                console.log('🔍 Generating warnings for school:', req.user.schoolId);
                // Import early warning analysis service
                const { default: EarlyWarningAnalysisService } = await Promise.resolve().then(() => __importStar(require('../services/earlyWarningAnalysisService')));
                const analysisService = new EarlyWarningAnalysisService();
                // Run warning analysis
                const analysisResult = await analysisService.analyzeSchoolWarnings(req.user.schoolId);
                if (!analysisResult.success) {
                    res.status(400).json({
                        success: false,
                        message: 'Gagal melakukan analisis peringatan dini',
                        error: 'ANALYSIS_FAILED',
                        details: analysisResult.errors
                    });
                    return;
                }
                if (analysisResult.warnings.length === 0) {
                    res.status(200).json({
                        success: true,
                        message: 'Analisis selesai, tidak ada peringatan yang perlu diberikan',
                        data: {
                            generated: 0,
                            saved: 0,
                            message: 'Semua indikator sekolah dalam kondisi baik'
                        }
                    });
                    return;
                }
                // Save warnings to database
                const saveResult = await analysisService.saveWarnings(analysisResult.warnings);
                res.status(200).json({
                    success: true,
                    message: `Berhasil generate dan simpan ${saveResult.saved} peringatan dini`,
                    data: {
                        generated: analysisResult.warnings.length,
                        saved: saveResult.saved,
                        skipped: saveResult.skipped,
                        errors: saveResult.errors,
                        summary: analysisResult.summary,
                        metadata: analysisResult.metadata
                    }
                });
            }
            catch (error) {
                console.error('Generate warnings error:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || 'Gagal generate peringatan dini',
                    error: 'GENERATE_WARNINGS_FAILED'
                });
            }
        };
    }
    getCategoryIcon(category) {
        const iconMap = {
            attendance: 'Users',
            academic: 'BookOpen',
            financial: 'DollarSign',
            asset: 'Building',
            teacher: 'Users',
            deadline: 'Clock',
            system: 'AlertCircle'
        };
        return iconMap[category] || 'AlertTriangle';
    }
    getUrgencyColor(urgency) {
        const colorMap = {
            critical: 'red',
            high: 'red',
            medium: 'yellow',
            low: 'blue'
        };
        return colorMap[urgency] || 'gray';
    }
    groupByCategory(warnings) {
        const grouped = {};
        warnings.forEach(warning => {
            const category = warning.category;
            grouped[category] = (grouped[category] || 0) + 1;
        });
        return grouped;
    }
}
exports.EarlyWarningController = EarlyWarningController;
