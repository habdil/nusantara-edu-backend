"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetController = void 0;
const assetService_1 = require("../services/assetService");
const resourceValidation_1 = require("../validation/resourceValidation");
class AssetController {
    constructor() {
        // Get all assets - equivalent to assetsApi.getAssets()
        this.getAssets = async (req, res) => {
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
                const { error, value } = resourceValidation_1.getAssetsValidation.validate(req.query);
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
                const result = await this.assetService.getAssets({
                    ...value,
                    schoolId: req.user.schoolId
                });
                res.status(200).json({
                    success: true,
                    message: 'Data aset berhasil diambil',
                    data: result
                });
            }
            catch (error) {
                console.error('Get assets error:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || 'Gagal mengambil data aset',
                    error: 'GET_ASSETS_FAILED'
                });
            }
        };
        // Get asset by ID - equivalent to assetsApi.getAssetById()
        this.getAssetById = async (req, res) => {
            try {
                if (!req.user?.schoolId) {
                    res.status(400).json({
                        success: false,
                        message: 'Informasi sekolah tidak ditemukan',
                        error: 'SCHOOL_INFO_MISSING'
                    });
                    return;
                }
                const assetId = parseInt(req.params.id);
                if (isNaN(assetId)) {
                    res.status(400).json({
                        success: false,
                        message: 'ID aset tidak valid',
                        error: 'INVALID_ASSET_ID'
                    });
                    return;
                }
                const result = await this.assetService.getAssetById(assetId, req.user.schoolId);
                if (!result) {
                    res.status(404).json({
                        success: false,
                        message: 'Aset tidak ditemukan',
                        error: 'ASSET_NOT_FOUND'
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    message: 'Data aset berhasil diambil',
                    data: result
                });
            }
            catch (error) {
                console.error('Get asset by ID error:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || 'Gagal mengambil data aset',
                    error: 'GET_ASSET_FAILED'
                });
            }
        };
        // Get assets by category - equivalent to assetsApi.getAssetsByCategory()
        this.getAssetsByCategory = async (req, res) => {
            try {
                if (!req.user?.schoolId) {
                    res.status(400).json({
                        success: false,
                        message: 'Informasi sekolah tidak ditemukan',
                        error: 'SCHOOL_INFO_MISSING'
                    });
                    return;
                }
                const category = req.params.category;
                if (!category) {
                    res.status(400).json({
                        success: false,
                        message: 'Kategori aset tidak boleh kosong',
                        error: 'CATEGORY_REQUIRED'
                    });
                    return;
                }
                const result = await this.assetService.getAssetsByCategory(category, req.user.schoolId);
                res.status(200).json({
                    success: true,
                    message: 'Data aset berdasarkan kategori berhasil diambil',
                    data: result
                });
            }
            catch (error) {
                console.error('Get assets by category error:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || 'Gagal mengambil data aset berdasarkan kategori',
                    error: 'GET_ASSETS_BY_CATEGORY_FAILED'
                });
            }
        };
        // Add new asset - equivalent to assetsApi.addAsset()
        this.addAsset = async (req, res) => {
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
                const { error, value } = resourceValidation_1.createAssetValidation.validate(req.body);
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
                const result = await this.assetService.addAsset(value, req.user.schoolId);
                res.status(201).json({
                    success: true,
                    message: 'Aset berhasil ditambahkan',
                    data: result
                });
            }
            catch (error) {
                console.error('Add asset error:', error);
                res.status(400).json({
                    success: false,
                    message: error.message || 'Gagal menambahkan aset',
                    error: 'ADD_ASSET_FAILED'
                });
            }
        };
        // Update asset - equivalent to assetsApi.updateAsset()
        this.updateAsset = async (req, res) => {
            try {
                if (!req.user?.schoolId) {
                    res.status(400).json({
                        success: false,
                        message: 'Informasi sekolah tidak ditemukan',
                        error: 'SCHOOL_INFO_MISSING'
                    });
                    return;
                }
                const assetId = parseInt(req.params.id);
                if (isNaN(assetId)) {
                    res.status(400).json({
                        success: false,
                        message: 'ID aset tidak valid',
                        error: 'INVALID_ASSET_ID'
                    });
                    return;
                }
                // Validate request body
                const { error, value } = resourceValidation_1.updateAssetValidation.validate(req.body);
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
                const result = await this.assetService.updateAsset(assetId, value, req.user.schoolId);
                if (!result) {
                    res.status(404).json({
                        success: false,
                        message: 'Aset tidak ditemukan',
                        error: 'ASSET_NOT_FOUND'
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    message: 'Aset berhasil diperbarui',
                    data: result
                });
            }
            catch (error) {
                console.error('Update asset error:', error);
                res.status(400).json({
                    success: false,
                    message: error.message || 'Gagal memperbarui aset',
                    error: 'UPDATE_ASSET_FAILED'
                });
            }
        };
        // Delete asset - equivalent to assetsApi.deleteAsset()
        this.deleteAsset = async (req, res) => {
            try {
                if (!req.user?.schoolId) {
                    res.status(400).json({
                        success: false,
                        message: 'Informasi sekolah tidak ditemukan',
                        error: 'SCHOOL_INFO_MISSING'
                    });
                    return;
                }
                const assetId = parseInt(req.params.id);
                if (isNaN(assetId)) {
                    res.status(400).json({
                        success: false,
                        message: 'ID aset tidak valid',
                        error: 'INVALID_ASSET_ID'
                    });
                    return;
                }
                const result = await this.assetService.deleteAsset(assetId, req.user.schoolId);
                if (!result) {
                    res.status(404).json({
                        success: false,
                        message: 'Aset tidak ditemukan',
                        error: 'ASSET_NOT_FOUND'
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    message: 'Aset berhasil dihapus',
                    data: null
                });
            }
            catch (error) {
                console.error('Delete asset error:', error);
                res.status(400).json({
                    success: false,
                    message: error.message || 'Gagal menghapus aset',
                    error: 'DELETE_ASSET_FAILED'
                });
            }
        };
        // Get maintenance records for an asset - equivalent to assetsApi.getMaintenanceRecords()
        this.getMaintenanceRecords = async (req, res) => {
            try {
                if (!req.user?.schoolId) {
                    res.status(400).json({
                        success: false,
                        message: 'Informasi sekolah tidak ditemukan',
                        error: 'SCHOOL_INFO_MISSING'
                    });
                    return;
                }
                const assetId = parseInt(req.params.assetId);
                if (isNaN(assetId)) {
                    res.status(400).json({
                        success: false,
                        message: 'ID aset tidak valid',
                        error: 'INVALID_ASSET_ID'
                    });
                    return;
                }
                const result = await this.assetService.getMaintenanceRecords(assetId, req.user.schoolId);
                res.status(200).json({
                    success: true,
                    message: 'Data pemeliharaan aset berhasil diambil',
                    data: result
                });
            }
            catch (error) {
                console.error('Get maintenance records error:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || 'Gagal mengambil data pemeliharaan aset',
                    error: 'GET_MAINTENANCE_RECORDS_FAILED'
                });
            }
        };
        // Get all maintenance records - equivalent to assetsApi.getAllMaintenanceRecords()
        this.getAllMaintenanceRecords = async (req, res) => {
            try {
                if (!req.user?.schoolId) {
                    res.status(400).json({
                        success: false,
                        message: 'Informasi sekolah tidak ditemukan',
                        error: 'SCHOOL_INFO_MISSING'
                    });
                    return;
                }
                // Validate query parameters if any
                const { error, value } = resourceValidation_1.getMaintenanceValidation.validate(req.query);
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
                const result = await this.assetService.getAllMaintenanceRecords(req.user.schoolId);
                res.status(200).json({
                    success: true,
                    message: 'Semua data pemeliharaan aset berhasil diambil',
                    data: result
                });
            }
            catch (error) {
                console.error('Get all maintenance records error:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || 'Gagal mengambil semua data pemeliharaan aset',
                    error: 'GET_ALL_MAINTENANCE_RECORDS_FAILED'
                });
            }
        };
        // Add maintenance record
        this.addMaintenanceRecord = async (req, res) => {
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
                const { error, value } = resourceValidation_1.createMaintenanceValidation.validate(req.body);
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
                const result = await this.assetService.addMaintenanceRecord(value, req.user.schoolId);
                res.status(201).json({
                    success: true,
                    message: 'Data pemeliharaan berhasil ditambahkan',
                    data: result
                });
            }
            catch (error) {
                console.error('Add maintenance record error:', error);
                res.status(400).json({
                    success: false,
                    message: error.message || 'Gagal menambahkan data pemeliharaan',
                    error: 'ADD_MAINTENANCE_RECORD_FAILED'
                });
            }
        };
        // Get asset statistics
        this.getAssetStats = async (req, res) => {
            try {
                if (!req.user?.schoolId) {
                    res.status(400).json({
                        success: false,
                        message: 'Informasi sekolah tidak ditemukan',
                        error: 'SCHOOL_INFO_MISSING'
                    });
                    return;
                }
                const result = await this.assetService.getAssetStats(req.user.schoolId);
                res.status(200).json({
                    success: true,
                    message: 'Statistik aset berhasil diambil',
                    data: result
                });
            }
            catch (error) {
                console.error('Get asset stats error:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || 'Gagal mengambil statistik aset',
                    error: 'GET_ASSET_STATS_FAILED'
                });
            }
        };
        this.assetService = new assetService_1.AssetService();
    }
}
exports.AssetController = AssetController;
