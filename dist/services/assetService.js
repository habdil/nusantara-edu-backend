"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetService = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
class AssetService {
    // Transform database asset to frontend format
    transformAsset(asset) {
        return {
            id: asset.id,
            schoolId: asset.schoolId,
            assetCode: asset.assetCode,
            assetName: asset.assetName,
            assetCategory: asset.assetCategory,
            description: asset.notes || undefined,
            purchaseDate: asset.acquisitionDate,
            purchasePrice: asset.acquisitionValue ? Number(asset.acquisitionValue) : 0,
            currentValue: asset.acquisitionValue ? Number(asset.acquisitionValue) : undefined, // Simplified calculation
            condition: asset.condition,
            location: asset.location || undefined,
            supplier: undefined, // Not in database schema
            warrantyExpiry: undefined, // Not in database schema
            qrCode: asset.qrCode || undefined,
            assetPhoto: asset.assetPhoto || undefined,
            createdAt: asset.createdAt,
            updatedAt: asset.updatedAt
        };
    }
    // Transform database maintenance to frontend format
    transformMaintenance(maintenance) {
        return {
            id: maintenance.id,
            assetId: maintenance.assetId,
            maintenanceDate: maintenance.maintenanceDate,
            maintenanceType: maintenance.maintenanceType,
            description: maintenance.description || undefined,
            cost: maintenance.cost ? Number(maintenance.cost) : undefined,
            technician: maintenance.technician || undefined,
            maintenanceResult: maintenance.maintenanceResult || undefined,
            nextMaintenanceDate: maintenance.nextMaintenanceDate || undefined,
            createdAt: maintenance.createdAt,
            updatedAt: maintenance.updatedAt
        };
    }
    // Get all assets - equivalent to assetsApi.getAssets()
    async getAssets(params) {
        try {
            const { category, condition, location, search, schoolId } = params;
            // Build where clause
            const where = {
                schoolId: schoolId
            };
            if (category) {
                where.assetCategory = { contains: category, mode: 'insensitive' };
            }
            if (condition) {
                where.condition = condition;
            }
            if (location) {
                where.location = { contains: location, mode: 'insensitive' };
            }
            if (search) {
                where.OR = [
                    { assetName: { contains: search, mode: 'insensitive' } },
                    { assetCode: { contains: search, mode: 'insensitive' } },
                    { assetCategory: { contains: search, mode: 'insensitive' } }
                ];
            }
            const assets = await prisma_1.default.asset.findMany({
                where,
                orderBy: [
                    { createdAt: 'desc' }
                ]
            });
            return assets.map(asset => this.transformAsset(asset));
        }
        catch (error) {
            throw new Error(error.message || 'Gagal mengambil data aset');
        }
    }
    // Get asset by ID - equivalent to assetsApi.getAssetById()
    async getAssetById(id, schoolId) {
        try {
            const asset = await prisma_1.default.asset.findFirst({
                where: {
                    id: id,
                    schoolId: schoolId
                }
            });
            if (!asset) {
                return null;
            }
            return this.transformAsset(asset);
        }
        catch (error) {
            throw new Error(error.message || 'Gagal mengambil data aset');
        }
    }
    // Get assets by category - equivalent to assetsApi.getAssetsByCategory()
    async getAssetsByCategory(category, schoolId) {
        try {
            const assets = await prisma_1.default.asset.findMany({
                where: {
                    schoolId: schoolId,
                    assetCategory: { contains: category, mode: 'insensitive' }
                },
                orderBy: [
                    { assetName: 'asc' }
                ]
            });
            return assets.map(asset => this.transformAsset(asset));
        }
        catch (error) {
            throw new Error(error.message || 'Gagal mengambil data aset berdasarkan kategori');
        }
    }
    // Add new asset - equivalent to assetsApi.addAsset()
    async addAsset(data, schoolId) {
        try {
            // Check if asset code already exists
            const existingAsset = await prisma_1.default.asset.findFirst({
                where: {
                    assetCode: data.assetCode,
                    schoolId: schoolId
                }
            });
            if (existingAsset) {
                throw new Error('Kode aset sudah digunakan');
            }
            const asset = await prisma_1.default.asset.create({
                data: {
                    schoolId: schoolId,
                    assetCode: data.assetCode,
                    assetName: data.assetName,
                    assetCategory: data.assetCategory,
                    acquisitionDate: data.acquisitionDate,
                    acquisitionValue: data.acquisitionValue,
                    usefulLife: data.usefulLife,
                    condition: data.condition,
                    location: data.location,
                    notes: data.description, // Map description to notes
                    qrCode: data.qrCode,
                    assetPhoto: data.assetPhoto
                }
            });
            return this.transformAsset(asset);
        }
        catch (error) {
            throw new Error(error.message || 'Gagal menambahkan aset');
        }
    }
    // Update asset - equivalent to assetsApi.updateAsset()
    async updateAsset(id, updates, schoolId) {
        try {
            // Verify asset exists and belongs to school
            const existingAsset = await prisma_1.default.asset.findFirst({
                where: {
                    id: id,
                    schoolId: schoolId
                }
            });
            if (!existingAsset) {
                throw new Error('Aset tidak ditemukan atau bukan bagian dari sekolah ini');
            }
            // If updating asset code, check uniqueness
            if (updates.assetCode && updates.assetCode !== existingAsset.assetCode) {
                const duplicateAsset = await prisma_1.default.asset.findFirst({
                    where: {
                        assetCode: updates.assetCode,
                        schoolId: schoolId,
                        id: { not: id }
                    }
                });
                if (duplicateAsset) {
                    throw new Error('Kode aset sudah digunakan');
                }
            }
            const updateData = {};
            if (updates.assetName !== undefined)
                updateData.assetName = updates.assetName;
            if (updates.assetCategory !== undefined)
                updateData.assetCategory = updates.assetCategory;
            if (updates.description !== undefined)
                updateData.notes = updates.description;
            if (updates.condition !== undefined)
                updateData.condition = updates.condition;
            if (updates.location !== undefined)
                updateData.location = updates.location;
            if (updates.qrCode !== undefined)
                updateData.qrCode = updates.qrCode;
            if (updates.assetPhoto !== undefined)
                updateData.assetPhoto = updates.assetPhoto;
            const asset = await prisma_1.default.asset.update({
                where: { id: id },
                data: updateData
            });
            return this.transformAsset(asset);
        }
        catch (error) {
            throw new Error(error.message || 'Gagal memperbarui aset');
        }
    }
    // Delete asset - equivalent to assetsApi.deleteAsset()
    async deleteAsset(id, schoolId) {
        try {
            // Verify asset exists and belongs to school
            const existingAsset = await prisma_1.default.asset.findFirst({
                where: {
                    id: id,
                    schoolId: schoolId
                }
            });
            if (!existingAsset) {
                return false;
            }
            // Check if asset has maintenance records
            const maintenanceCount = await prisma_1.default.assetMaintenance.count({
                where: { assetId: id }
            });
            if (maintenanceCount > 0) {
                throw new Error('Tidak dapat menghapus aset yang memiliki riwayat pemeliharaan');
            }
            await prisma_1.default.asset.delete({
                where: { id: id }
            });
            return true;
        }
        catch (error) {
            if (error.message.includes('Tidak dapat menghapus')) {
                throw error;
            }
            throw new Error(error.message || 'Gagal menghapus aset');
        }
    }
    // Get maintenance records for an asset - equivalent to assetsApi.getMaintenanceRecords()
    async getMaintenanceRecords(assetId, schoolId) {
        try {
            // Verify asset belongs to school
            const asset = await prisma_1.default.asset.findFirst({
                where: {
                    id: assetId,
                    schoolId: schoolId
                }
            });
            if (!asset) {
                throw new Error('Aset tidak ditemukan atau bukan bagian dari sekolah ini');
            }
            const maintenanceRecords = await prisma_1.default.assetMaintenance.findMany({
                where: { assetId: assetId },
                orderBy: [
                    { maintenanceDate: 'desc' }
                ]
            });
            return maintenanceRecords.map(record => this.transformMaintenance(record));
        }
        catch (error) {
            throw new Error(error.message || 'Gagal mengambil data pemeliharaan aset');
        }
    }
    // Get all maintenance records - equivalent to assetsApi.getAllMaintenanceRecords()
    async getAllMaintenanceRecords(schoolId) {
        try {
            const maintenanceRecords = await prisma_1.default.assetMaintenance.findMany({
                where: {
                    asset: {
                        schoolId: schoolId
                    }
                },
                include: {
                    asset: {
                        select: {
                            assetName: true,
                            assetCode: true
                        }
                    }
                },
                orderBy: [
                    { maintenanceDate: 'desc' }
                ]
            });
            return maintenanceRecords.map(record => this.transformMaintenance(record));
        }
        catch (error) {
            throw new Error(error.message || 'Gagal mengambil semua data pemeliharaan aset');
        }
    }
    // Add maintenance record
    async addMaintenanceRecord(data, schoolId) {
        try {
            // Verify asset exists and belongs to school
            const asset = await prisma_1.default.asset.findFirst({
                where: {
                    id: data.assetId,
                    schoolId: schoolId
                }
            });
            if (!asset) {
                throw new Error('Aset tidak ditemukan atau bukan bagian dari sekolah ini');
            }
            const maintenance = await prisma_1.default.assetMaintenance.create({
                data: {
                    assetId: data.assetId,
                    maintenanceDate: data.maintenanceDate,
                    maintenanceType: data.maintenanceType,
                    description: data.description,
                    cost: data.cost,
                    technician: data.technician,
                    maintenanceResult: data.maintenanceResult,
                    nextMaintenanceDate: data.nextMaintenanceDate
                }
            });
            return this.transformMaintenance(maintenance);
        }
        catch (error) {
            throw new Error(error.message || 'Gagal menambahkan data pemeliharaan');
        }
    }
    // Get asset statistics
    async getAssetStats(schoolId) {
        try {
            const [totalAssets, assetsByCondition, assetsByCategory] = await Promise.all([
                // Total assets
                prisma_1.default.asset.count({
                    where: { schoolId: schoolId }
                }),
                // Assets by condition
                prisma_1.default.asset.groupBy({
                    by: ['condition'],
                    where: { schoolId: schoolId },
                    _count: {
                        condition: true
                    }
                }),
                // Assets by category
                prisma_1.default.asset.groupBy({
                    by: ['assetCategory'],
                    where: { schoolId: schoolId },
                    _count: {
                        assetCategory: true
                    }
                })
            ]);
            // Calculate total value
            const assetValues = await prisma_1.default.asset.aggregate({
                where: { schoolId: schoolId },
                _sum: {
                    acquisitionValue: true
                }
            });
            return {
                totalAssets,
                totalValue: assetValues._sum.acquisitionValue ? Number(assetValues._sum.acquisitionValue) : 0,
                assetsByCondition: assetsByCondition.map(item => ({
                    condition: item.condition,
                    count: item._count.condition
                })),
                assetsByCategory: assetsByCategory.map(item => ({
                    category: item.assetCategory,
                    count: item._count.assetCategory
                }))
            };
        }
        catch (error) {
            throw new Error(error.message || 'Gagal mengambil statistik aset');
        }
    }
}
exports.AssetService = AssetService;
