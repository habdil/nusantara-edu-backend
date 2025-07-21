"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KPIController = void 0;
const kpiService_1 = require("../services/kpiService");
const kpiValidation_1 = require("../validation/kpiValidation");
class KPIController {
    constructor() {
        // Get KPIs with filters
        this.getKPIs = async (req, res) => {
            try {
                if (!req.user?.schoolId) {
                    res.status(400).json({
                        success: false,
                        message: 'Informasi sekolah tidak ditemukan',
                        error: 'SCHOOL_INFO_MISSING'
                    });
                    return;
                }
                // Validate query parameters
                const { error, value } = kpiValidation_1.getKPIsValidation.validate(req.query);
                if (error) {
                    res.status(400).json({
                        success: false,
                        message: 'Parameter tidak valid',
                        errors: error.details.map(detail => ({
                            field: detail.path.join('.'),
                            message: detail.message
                        }))
                    });
                    return;
                }
                const result = await this.kpiService.getKPIs({
                    ...value,
                    schoolId: req.user.schoolId
                });
                res.status(200).json({
                    success: true,
                    message: 'Data KPI berhasil diambil',
                    data: result
                });
            }
            catch (error) {
                console.error('Get KPIs error:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || 'Gagal mengambil data KPI',
                    error: 'GET_KPIS_FAILED'
                });
            }
        };
        // Get KPI by ID
        this.getKPIById = async (req, res) => {
            try {
                if (!req.user?.schoolId) {
                    res.status(400).json({
                        success: false,
                        message: 'Informasi sekolah tidak ditemukan',
                        error: 'SCHOOL_INFO_MISSING'
                    });
                    return;
                }
                // Validate ID parameter
                const { error, value } = kpiValidation_1.kpiIdValidation.validate({ id: parseInt(req.params.id) });
                if (error) {
                    res.status(400).json({
                        success: false,
                        message: 'ID KPI tidak valid',
                        errors: error.details.map(detail => ({
                            field: detail.path.join('.'),
                            message: detail.message
                        }))
                    });
                    return;
                }
                const result = await this.kpiService.getKPIById(value.id, req.user.schoolId);
                res.status(200).json({
                    success: true,
                    message: 'Data KPI berhasil diambil',
                    data: result
                });
            }
            catch (error) {
                console.error('Get KPI by ID error:', error);
                const statusCode = error.message.includes('tidak ditemukan') ? 404 : 500;
                res.status(statusCode).json({
                    success: false,
                    message: error.message || 'Gagal mengambil data KPI',
                    error: 'GET_KPI_BY_ID_FAILED'
                });
            }
        };
        // Get KPIs by category
        this.getKPIsByCategory = async (req, res) => {
            try {
                if (!req.user?.schoolId) {
                    res.status(400).json({
                        success: false,
                        message: 'Informasi sekolah tidak ditemukan',
                        error: 'SCHOOL_INFO_MISSING'
                    });
                    return;
                }
                // Validate category parameter
                const { error, value } = kpiValidation_1.getKPIsByCategoryValidation.validate({ category: req.params.category });
                if (error) {
                    res.status(400).json({
                        success: false,
                        message: 'Kategori tidak valid',
                        errors: error.details.map(detail => ({
                            field: detail.path.join('.'),
                            message: detail.message
                        }))
                    });
                    return;
                }
                const result = await this.kpiService.getKPIsByCategory(value.category, req.user.schoolId);
                res.status(200).json({
                    success: true,
                    message: `Data KPI kategori ${value.category} berhasil diambil`,
                    data: result
                });
            }
            catch (error) {
                console.error('Get KPIs by category error:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || 'Gagal mengambil data KPI berdasarkan kategori',
                    error: 'GET_KPIS_BY_CATEGORY_FAILED'
                });
            }
        };
        // Get KPIs by priority
        this.getKPIsByPriority = async (req, res) => {
            try {
                if (!req.user?.schoolId) {
                    res.status(400).json({
                        success: false,
                        message: 'Informasi sekolah tidak ditemukan',
                        error: 'SCHOOL_INFO_MISSING'
                    });
                    return;
                }
                // Validate priority parameter
                const { error, value } = kpiValidation_1.getKPIsByPriorityValidation.validate({ priority: parseInt(req.params.priority) });
                if (error) {
                    res.status(400).json({
                        success: false,
                        message: 'Prioritas tidak valid',
                        errors: error.details.map(detail => ({
                            field: detail.path.join('.'),
                            message: detail.message
                        }))
                    });
                    return;
                }
                const result = await this.kpiService.getKPIsByPriority(value.priority, req.user.schoolId);
                res.status(200).json({
                    success: true,
                    message: `Data KPI prioritas ${value.priority} berhasil diambil`,
                    data: result
                });
            }
            catch (error) {
                console.error('Get KPIs by priority error:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || 'Gagal mengambil data KPI berdasarkan prioritas',
                    error: 'GET_KPIS_BY_PRIORITY_FAILED'
                });
            }
        };
        // Get critical KPIs
        this.getCriticalKPIs = async (req, res) => {
            try {
                if (!req.user?.schoolId) {
                    res.status(400).json({
                        success: false,
                        message: 'Informasi sekolah tidak ditemukan',
                        error: 'SCHOOL_INFO_MISSING'
                    });
                    return;
                }
                const result = await this.kpiService.getCriticalKPIs(req.user.schoolId);
                res.status(200).json({
                    success: true,
                    message: 'Data KPI kritis berhasil diambil',
                    data: result
                });
            }
            catch (error) {
                console.error('Get critical KPIs error:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || 'Gagal mengambil data KPI kritis',
                    error: 'GET_CRITICAL_KPIS_FAILED'
                });
            }
        };
        // Create new KPI
        this.createKPI = async (req, res) => {
            try {
                if (!req.user?.schoolId) {
                    res.status(400).json({
                        success: false,
                        message: 'Informasi sekolah tidak ditemukan',
                        error: 'SCHOOL_INFO_MISSING'
                    });
                    return;
                }
                // Validate request body
                const { error, value } = kpiValidation_1.createKPIValidation.validate(req.body);
                if (error) {
                    res.status(400).json({
                        success: false,
                        message: 'Data tidak valid',
                        errors: error.details.map(detail => ({
                            field: detail.path.join('.'),
                            message: detail.message
                        }))
                    });
                    return;
                }
                const result = await this.kpiService.createKPI(value, req.user.schoolId);
                res.status(201).json({
                    success: true,
                    message: 'KPI berhasil dibuat',
                    data: result
                });
            }
            catch (error) {
                console.error('Create KPI error:', error);
                const statusCode = error.message.includes('sudah ada') ? 400 : 500;
                res.status(statusCode).json({
                    success: false,
                    message: error.message || 'Gagal membuat KPI',
                    error: 'CREATE_KPI_FAILED'
                });
            }
        };
        // Update KPI
        this.updateKPI = async (req, res) => {
            try {
                if (!req.user?.schoolId) {
                    res.status(400).json({
                        success: false,
                        message: 'Informasi sekolah tidak ditemukan',
                        error: 'SCHOOL_INFO_MISSING'
                    });
                    return;
                }
                // Validate ID parameter
                const { error: idError, value: idValue } = kpiValidation_1.kpiIdValidation.validate({ id: parseInt(req.params.id) });
                if (idError) {
                    res.status(400).json({
                        success: false,
                        message: 'ID KPI tidak valid',
                        errors: idError.details.map(detail => ({
                            field: detail.path.join('.'),
                            message: detail.message
                        }))
                    });
                    return;
                }
                // Validate request body
                const { error, value } = kpiValidation_1.updateKPIValidation.validate(req.body);
                if (error) {
                    res.status(400).json({
                        success: false,
                        message: 'Data tidak valid',
                        errors: error.details.map(detail => ({
                            field: detail.path.join('.'),
                            message: detail.message
                        }))
                    });
                    return;
                }
                const result = await this.kpiService.updateKPI(idValue.id, value, req.user.schoolId);
                res.status(200).json({
                    success: true,
                    message: 'KPI berhasil diperbarui',
                    data: result
                });
            }
            catch (error) {
                console.error('Update KPI error:', error);
                let statusCode = 500;
                if (error.message.includes('tidak ditemukan'))
                    statusCode = 404;
                else if (error.message.includes('sudah ada'))
                    statusCode = 400;
                res.status(statusCode).json({
                    success: false,
                    message: error.message || 'Gagal memperbarui KPI',
                    error: 'UPDATE_KPI_FAILED'
                });
            }
        };
        // Delete KPI
        this.deleteKPI = async (req, res) => {
            try {
                if (!req.user?.schoolId) {
                    res.status(400).json({
                        success: false,
                        message: 'Informasi sekolah tidak ditemukan',
                        error: 'SCHOOL_INFO_MISSING'
                    });
                    return;
                }
                // Validate ID parameter
                const { error, value } = kpiValidation_1.kpiIdValidation.validate({ id: parseInt(req.params.id) });
                if (error) {
                    res.status(400).json({
                        success: false,
                        message: 'ID KPI tidak valid',
                        errors: error.details.map(detail => ({
                            field: detail.path.join('.'),
                            message: detail.message
                        }))
                    });
                    return;
                }
                const result = await this.kpiService.deleteKPI(value.id, req.user.schoolId);
                res.status(200).json({
                    success: true,
                    message: result.message,
                    data: null
                });
            }
            catch (error) {
                console.error('Delete KPI error:', error);
                const statusCode = error.message.includes('tidak ditemukan') ? 404 : 500;
                res.status(statusCode).json({
                    success: false,
                    message: error.message || 'Gagal menghapus KPI',
                    error: 'DELETE_KPI_FAILED'
                });
            }
        };
        // Get KPI statistics
        this.getKPIStatistics = async (req, res) => {
            try {
                if (!req.user?.schoolId) {
                    res.status(400).json({
                        success: false,
                        message: 'Informasi sekolah tidak ditemukan',
                        error: 'SCHOOL_INFO_MISSING'
                    });
                    return;
                }
                // Validate query parameters
                const { error, value } = kpiValidation_1.getKPIStatisticsValidation.validate(req.query);
                if (error) {
                    res.status(400).json({
                        success: false,
                        message: 'Parameter tidak valid',
                        errors: error.details.map(detail => ({
                            field: detail.path.join('.'),
                            message: detail.message
                        }))
                    });
                    return;
                }
                const result = await this.kpiService.getKPIStatistics(req.user.schoolId, value.academicYear, value.period);
                res.status(200).json({
                    success: true,
                    message: 'Statistik KPI berhasil diambil',
                    data: result
                });
            }
            catch (error) {
                console.error('Get KPI statistics error:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || 'Gagal mengambil statistik KPI',
                    error: 'GET_KPI_STATISTICS_FAILED'
                });
            }
        };
        // Export KPI report
        this.exportKPIReport = async (req, res) => {
            try {
                if (!req.user?.schoolId) {
                    res.status(400).json({
                        success: false,
                        message: 'Informasi sekolah tidak ditemukan',
                        error: 'SCHOOL_INFO_MISSING'
                    });
                    return;
                }
                // Validate query parameters
                const { error, value } = kpiValidation_1.exportKPIReportValidation.validate(req.query);
                if (error) {
                    res.status(400).json({
                        success: false,
                        message: 'Parameter tidak valid',
                        errors: error.details.map(detail => ({
                            field: detail.path.join('.'),
                            message: detail.message
                        }))
                    });
                    return;
                }
                const data = await this.kpiService.exportKPIReport(value.academicYear, value.period, req.user.schoolId, value.categories);
                // Generate CSV content
                if (value.format === 'csv' || !value.format) {
                    const csvHeader = [
                        'KPI Name',
                        'Category',
                        'Academic Year',
                        'Period',
                        'Target Value',
                        'Achieved Value',
                        'Achievement %',
                        'Priority',
                        'Trend',
                        'Analysis'
                    ].join(',');
                    const csvRows = data.map(kpi => [
                        `"${kpi.kpiName}"`,
                        kpi.kpiCategory,
                        kpi.academicYear,
                        kpi.period,
                        kpi.targetValue?.toString() || '',
                        kpi.achievedValue?.toString() || '',
                        kpi.achievementPercentage?.toString() || '',
                        kpi.priority?.toString() || '',
                        kpi.trend || '',
                        `"${(kpi.analysis || '').replace(/"/g, '""')}"`
                    ].join(','));
                    const csvContent = [csvHeader, ...csvRows].join('\n');
                    res.setHeader('Content-Type', 'text/csv');
                    res.setHeader('Content-Disposition', `attachment; filename="KPI_Report_${value.academicYear}_${value.period.replace(' ', '_')}.csv"`);
                    res.status(200).send(csvContent);
                }
                else {
                    // For now, return JSON data for other formats
                    res.status(200).json({
                        success: true,
                        message: 'Data KPI untuk export berhasil diambil',
                        data: data,
                        metadata: {
                            format: value.format,
                            academicYear: value.academicYear,
                            period: value.period,
                            categories: value.categories,
                            totalRecords: data.length
                        }
                    });
                }
            }
            catch (error) {
                console.error('Export KPI report error:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || 'Gagal mengexport laporan KPI',
                    error: 'EXPORT_KPI_REPORT_FAILED'
                });
            }
        };
        this.kpiService = new kpiService_1.KPIService();
    }
}
exports.KPIController = KPIController;
