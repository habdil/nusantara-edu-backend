"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FacilityController = void 0;
const facilityService_1 = require("../services/facilityService");
const resourceValidation_1 = require("../validation/resourceValidation");
class FacilityController {
    constructor() {
        // Get all facilities - equivalent to facilitiesApi.getFacilities()
        this.getFacilities = async (req, res) => {
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
                const { error, value } = resourceValidation_1.getFacilitiesValidation.validate(req.query);
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
                const result = await this.facilityService.getFacilities({
                    ...value,
                    schoolId: req.user.schoolId
                });
                res.status(200).json({
                    success: true,
                    message: 'Data fasilitas berhasil diambil',
                    data: result
                });
            }
            catch (error) {
                console.error('Get facilities error:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || 'Gagal mengambil data fasilitas',
                    error: 'GET_FACILITIES_FAILED'
                });
            }
        };
        // Get facility by ID - equivalent to facilitiesApi.getFacilityById()
        this.getFacilityById = async (req, res) => {
            try {
                if (!req.user?.schoolId) {
                    res.status(400).json({
                        success: false,
                        message: 'Informasi sekolah tidak ditemukan',
                        error: 'SCHOOL_INFO_MISSING'
                    });
                    return;
                }
                const facilityId = parseInt(req.params.id);
                if (isNaN(facilityId)) {
                    res.status(400).json({
                        success: false,
                        message: 'ID fasilitas tidak valid',
                        error: 'INVALID_FACILITY_ID'
                    });
                    return;
                }
                const result = await this.facilityService.getFacilityById(facilityId, req.user.schoolId);
                if (!result) {
                    res.status(404).json({
                        success: false,
                        message: 'Fasilitas tidak ditemukan',
                        error: 'FACILITY_NOT_FOUND'
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    message: 'Data fasilitas berhasil diambil',
                    data: result
                });
            }
            catch (error) {
                console.error('Get facility by ID error:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || 'Gagal mengambil data fasilitas',
                    error: 'GET_FACILITY_FAILED'
                });
            }
        };
        // Get facilities by type - equivalent to facilitiesApi.getFacilitiesByType()
        this.getFacilitiesByType = async (req, res) => {
            try {
                if (!req.user?.schoolId) {
                    res.status(400).json({
                        success: false,
                        message: 'Informasi sekolah tidak ditemukan',
                        error: 'SCHOOL_INFO_MISSING'
                    });
                    return;
                }
                const type = req.params.type;
                if (!type) {
                    res.status(400).json({
                        success: false,
                        message: 'Tipe fasilitas tidak boleh kosong',
                        error: 'TYPE_REQUIRED'
                    });
                    return;
                }
                const result = await this.facilityService.getFacilitiesByType(type, req.user.schoolId);
                res.status(200).json({
                    success: true,
                    message: 'Data fasilitas berdasarkan tipe berhasil diambil',
                    data: result
                });
            }
            catch (error) {
                console.error('Get facilities by type error:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || 'Gagal mengambil data fasilitas berdasarkan tipe',
                    error: 'GET_FACILITIES_BY_TYPE_FAILED'
                });
            }
        };
        // Add new facility - equivalent to facilitiesApi.addFacility()
        this.addFacility = async (req, res) => {
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
                const { error, value } = resourceValidation_1.createFacilityValidation.validate(req.body);
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
                const result = await this.facilityService.addFacility(value, req.user.schoolId);
                res.status(201).json({
                    success: true,
                    message: 'Fasilitas berhasil ditambahkan',
                    data: result
                });
            }
            catch (error) {
                console.error('Add facility error:', error);
                res.status(400).json({
                    success: false,
                    message: error.message || 'Gagal menambahkan fasilitas',
                    error: 'ADD_FACILITY_FAILED'
                });
            }
        };
        // Update facility - equivalent to facilitiesApi.updateFacility()
        this.updateFacility = async (req, res) => {
            try {
                if (!req.user?.schoolId) {
                    res.status(400).json({
                        success: false,
                        message: 'Informasi sekolah tidak ditemukan',
                        error: 'SCHOOL_INFO_MISSING'
                    });
                    return;
                }
                const facilityId = parseInt(req.params.id);
                if (isNaN(facilityId)) {
                    res.status(400).json({
                        success: false,
                        message: 'ID fasilitas tidak valid',
                        error: 'INVALID_FACILITY_ID'
                    });
                    return;
                }
                // Validate request body
                const { error, value } = resourceValidation_1.updateFacilityValidation.validate(req.body);
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
                const result = await this.facilityService.updateFacility(facilityId, value, req.user.schoolId);
                if (!result) {
                    res.status(404).json({
                        success: false,
                        message: 'Fasilitas tidak ditemukan',
                        error: 'FACILITY_NOT_FOUND'
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    message: 'Fasilitas berhasil diperbarui',
                    data: result
                });
            }
            catch (error) {
                console.error('Update facility error:', error);
                res.status(400).json({
                    success: false,
                    message: error.message || 'Gagal memperbarui fasilitas',
                    error: 'UPDATE_FACILITY_FAILED'
                });
            }
        };
        // Delete facility - equivalent to facilitiesApi.deleteFacility()
        this.deleteFacility = async (req, res) => {
            try {
                if (!req.user?.schoolId) {
                    res.status(400).json({
                        success: false,
                        message: 'Informasi sekolah tidak ditemukan',
                        error: 'SCHOOL_INFO_MISSING'
                    });
                    return;
                }
                const facilityId = parseInt(req.params.id);
                if (isNaN(facilityId)) {
                    res.status(400).json({
                        success: false,
                        message: 'ID fasilitas tidak valid',
                        error: 'INVALID_FACILITY_ID'
                    });
                    return;
                }
                const result = await this.facilityService.deleteFacility(facilityId, req.user.schoolId);
                if (!result) {
                    res.status(404).json({
                        success: false,
                        message: 'Fasilitas tidak ditemukan',
                        error: 'FACILITY_NOT_FOUND'
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    message: 'Fasilitas berhasil dihapus',
                    data: null
                });
            }
            catch (error) {
                console.error('Delete facility error:', error);
                res.status(400).json({
                    success: false,
                    message: error.message || 'Gagal menghapus fasilitas',
                    error: 'DELETE_FACILITY_FAILED'
                });
            }
        };
        // Get facility usage records
        this.getFacilityUsage = async (req, res) => {
            try {
                if (!req.user?.schoolId) {
                    res.status(400).json({
                        success: false,
                        message: 'Informasi sekolah tidak ditemukan',
                        error: 'SCHOOL_INFO_MISSING'
                    });
                    return;
                }
                // Parse query parameters
                const facilityId = req.query.facilityId ? parseInt(req.query.facilityId) : undefined;
                const dateFrom = req.query.dateFrom ? new Date(req.query.dateFrom) : undefined;
                const dateTo = req.query.dateTo ? new Date(req.query.dateTo) : undefined;
                const approvalStatus = req.query.approvalStatus;
                const page = req.query.page ? parseInt(req.query.page) : 1;
                const limit = req.query.limit ? parseInt(req.query.limit) : 10;
                const result = await this.facilityService.getFacilityUsage({
                    facilityId,
                    dateFrom,
                    dateTo,
                    approvalStatus,
                    page,
                    limit,
                    schoolId: req.user.schoolId
                });
                res.status(200).json({
                    success: true,
                    message: 'Data penggunaan fasilitas berhasil diambil',
                    data: result
                });
            }
            catch (error) {
                console.error('Get facility usage error:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || 'Gagal mengambil data penggunaan fasilitas',
                    error: 'GET_FACILITY_USAGE_FAILED'
                });
            }
        };
        // Get facility usage for specific facility
        this.getFacilityUsageByFacilityId = async (req, res) => {
            try {
                if (!req.user?.schoolId) {
                    res.status(400).json({
                        success: false,
                        message: 'Informasi sekolah tidak ditemukan',
                        error: 'SCHOOL_INFO_MISSING'
                    });
                    return;
                }
                const facilityId = parseInt(req.params.facilityId);
                if (isNaN(facilityId)) {
                    res.status(400).json({
                        success: false,
                        message: 'ID fasilitas tidak valid',
                        error: 'INVALID_FACILITY_ID'
                    });
                    return;
                }
                const result = await this.facilityService.getFacilityUsageByFacilityId(facilityId, req.user.schoolId);
                res.status(200).json({
                    success: true,
                    message: 'Data penggunaan fasilitas berhasil diambil',
                    data: result
                });
            }
            catch (error) {
                console.error('Get facility usage by facility ID error:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || 'Gagal mengambil data penggunaan fasilitas',
                    error: 'GET_FACILITY_USAGE_BY_ID_FAILED'
                });
            }
        };
        // Add facility usage record (booking)
        this.addFacilityUsage = async (req, res) => {
            try {
                if (!req.user?.schoolId || !req.user?.userId) {
                    res.status(400).json({
                        success: false,
                        message: 'Informasi user tidak lengkap',
                        error: 'USER_INFO_MISSING'
                    });
                    return;
                }
                // Basic validation for required fields
                const { facilityId, date, startTime, endTime, purpose, notes } = req.body;
                if (!facilityId || !date || !startTime || !endTime || !purpose) {
                    res.status(400).json({
                        success: false,
                        message: 'Data tidak lengkap. FacilityId, date, startTime, endTime, dan purpose wajib diisi',
                        error: 'INCOMPLETE_DATA'
                    });
                    return;
                }
                // Parse and validate data
                const parsedFacilityId = parseInt(facilityId);
                if (isNaN(parsedFacilityId)) {
                    res.status(400).json({
                        success: false,
                        message: 'ID fasilitas tidak valid',
                        error: 'INVALID_FACILITY_ID'
                    });
                    return;
                }
                const facilityUsageData = {
                    facilityId: parsedFacilityId,
                    date: new Date(date),
                    startTime: new Date(startTime),
                    endTime: new Date(endTime),
                    purpose: purpose.toString(),
                    notes: notes ? notes.toString() : undefined
                };
                const result = await this.facilityService.addFacilityUsage(facilityUsageData, req.user.userId, req.user.schoolId);
                res.status(201).json({
                    success: true,
                    message: 'Booking fasilitas berhasil ditambahkan',
                    data: result
                });
            }
            catch (error) {
                console.error('Add facility usage error:', error);
                res.status(400).json({
                    success: false,
                    message: error.message || 'Gagal menambahkan booking fasilitas',
                    error: 'ADD_FACILITY_USAGE_FAILED'
                });
            }
        };
        // Approve/reject facility usage
        this.updateFacilityUsageApproval = async (req, res) => {
            try {
                if (!req.user?.schoolId) {
                    res.status(400).json({
                        success: false,
                        message: 'Informasi sekolah tidak ditemukan',
                        error: 'SCHOOL_INFO_MISSING'
                    });
                    return;
                }
                const usageId = parseInt(req.params.usageId);
                if (isNaN(usageId)) {
                    res.status(400).json({
                        success: false,
                        message: 'ID penggunaan fasilitas tidak valid',
                        error: 'INVALID_USAGE_ID'
                    });
                    return;
                }
                const { approvalStatus } = req.body;
                if (!approvalStatus || !['approved', 'rejected', 'pending'].includes(approvalStatus)) {
                    res.status(400).json({
                        success: false,
                        message: 'Status persetujuan tidak valid. Harus approved, rejected, atau pending',
                        error: 'INVALID_APPROVAL_STATUS'
                    });
                    return;
                }
                // Check if user has permission to approve (principal, admin, or school_admin_staff)
                if (!['principal', 'admin', 'school_admin_staff'].includes(req.user.role)) {
                    res.status(403).json({
                        success: false,
                        message: 'Tidak memiliki izin untuk mengubah status persetujuan',
                        error: 'INSUFFICIENT_PERMISSION'
                    });
                    return;
                }
                const result = await this.facilityService.updateFacilityUsageApproval(usageId, approvalStatus, req.user.schoolId);
                res.status(200).json({
                    success: true,
                    message: `Penggunaan fasilitas berhasil ${approvalStatus === 'approved' ? 'disetujui' : approvalStatus === 'rejected' ? 'ditolak' : 'diubah statusnya'}`,
                    data: result
                });
            }
            catch (error) {
                console.error('Update facility usage approval error:', error);
                res.status(400).json({
                    success: false,
                    message: error.message || 'Gagal mengubah status persetujuan',
                    error: 'UPDATE_APPROVAL_FAILED'
                });
            }
        };
        // Get facility statistics
        this.getFacilityStats = async (req, res) => {
            try {
                if (!req.user?.schoolId) {
                    res.status(400).json({
                        success: false,
                        message: 'Informasi sekolah tidak ditemukan',
                        error: 'SCHOOL_INFO_MISSING'
                    });
                    return;
                }
                const result = await this.facilityService.getFacilityStats(req.user.schoolId);
                res.status(200).json({
                    success: true,
                    message: 'Statistik fasilitas berhasil diambil',
                    data: result
                });
            }
            catch (error) {
                console.error('Get facility stats error:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || 'Gagal mengambil statistik fasilitas',
                    error: 'GET_FACILITY_STATS_FAILED'
                });
            }
        };
        // Get facility utilization report
        this.getFacilityUtilizationReport = async (req, res) => {
            try {
                if (!req.user?.schoolId) {
                    res.status(400).json({
                        success: false,
                        message: 'Informasi sekolah tidak ditemukan',
                        error: 'SCHOOL_INFO_MISSING'
                    });
                    return;
                }
                const dateFrom = req.query.dateFrom ? new Date(req.query.dateFrom) : undefined;
                const dateTo = req.query.dateTo ? new Date(req.query.dateTo) : undefined;
                const result = await this.facilityService.getFacilityUtilizationReport(req.user.schoolId, dateFrom, dateTo);
                res.status(200).json({
                    success: true,
                    message: 'Laporan pemanfaatan fasilitas berhasil diambil',
                    data: result
                });
            }
            catch (error) {
                console.error('Get facility utilization report error:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || 'Gagal mengambil laporan pemanfaatan fasilitas',
                    error: 'GET_UTILIZATION_REPORT_FAILED'
                });
            }
        };
        // Get facility types (helper endpoint)
        this.getFacilityTypes = async (req, res) => {
            try {
                if (!req.user?.schoolId) {
                    res.status(400).json({
                        success: false,
                        message: 'Informasi sekolah tidak ditemukan',
                        error: 'SCHOOL_INFO_MISSING'
                    });
                    return;
                }
                // Get distinct facility types for this school
                const facilities = await this.facilityService.getFacilities({
                    schoolId: req.user.schoolId
                });
                const types = [...new Set(facilities.map(facility => facility.facilityType))];
                res.status(200).json({
                    success: true,
                    message: 'Tipe fasilitas berhasil diambil',
                    data: types
                });
            }
            catch (error) {
                console.error('Get facility types error:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || 'Gagal mengambil tipe fasilitas',
                    error: 'GET_FACILITY_TYPES_FAILED'
                });
            }
        };
        this.facilityService = new facilityService_1.FacilityService();
    }
}
exports.FacilityController = FacilityController;
