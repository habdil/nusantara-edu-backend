"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FacilityService = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
class FacilityService {
    // Transform database facility to frontend format
    transformFacility(facility) {
        return {
            id: facility.id,
            schoolId: facility.schoolId,
            facilityName: facility.facilityName,
            facilityType: facility.facilityType,
            capacity: facility.capacity || undefined,
            location: facility.location || undefined,
            condition: facility.condition || undefined,
            notes: facility.notes || undefined,
            facilityPhoto: facility.facilityPhoto || undefined,
            createdAt: facility.createdAt,
            updatedAt: facility.updatedAt
        };
    }
    // Transform database facility usage to frontend format
    transformFacilityUsage(usage) {
        return {
            id: usage.id,
            facilityId: usage.facilityId,
            date: usage.date,
            startTime: usage.startTime,
            endTime: usage.endTime,
            purpose: usage.purpose,
            userId: usage.userId || undefined,
            approvalStatus: usage.approvalStatus || undefined,
            notes: usage.notes || undefined,
            createdAt: usage.createdAt,
            updatedAt: usage.updatedAt,
            facility: usage.facility ? {
                facilityName: usage.facility.facilityName,
                facilityType: usage.facility.facilityType
            } : undefined,
            user: usage.user ? {
                fullName: usage.user.fullName
            } : undefined
        };
    }
    // Get all facilities - equivalent to facilitiesApi.getFacilities()
    async getFacilities(params) {
        try {
            const { facilityType, condition, search, schoolId } = params;
            // Build where clause
            const where = {
                schoolId: schoolId
            };
            if (facilityType) {
                where.facilityType = { contains: facilityType, mode: 'insensitive' };
            }
            if (condition) {
                where.condition = condition;
            }
            if (search) {
                where.OR = [
                    { facilityName: { contains: search, mode: 'insensitive' } },
                    { facilityType: { contains: search, mode: 'insensitive' } },
                    { location: { contains: search, mode: 'insensitive' } }
                ];
            }
            const facilities = await prisma_1.default.facility.findMany({
                where,
                orderBy: [
                    { facilityType: 'asc' },
                    { facilityName: 'asc' }
                ]
            });
            return facilities.map(facility => this.transformFacility(facility));
        }
        catch (error) {
            throw new Error(error.message || 'Gagal mengambil data fasilitas');
        }
    }
    // Get facility by ID - equivalent to facilitiesApi.getFacilityById()
    async getFacilityById(id, schoolId) {
        try {
            const facility = await prisma_1.default.facility.findFirst({
                where: {
                    id: id,
                    schoolId: schoolId
                }
            });
            if (!facility) {
                return null;
            }
            return this.transformFacility(facility);
        }
        catch (error) {
            throw new Error(error.message || 'Gagal mengambil data fasilitas');
        }
    }
    // Get facilities by type - equivalent to facilitiesApi.getFacilitiesByType()
    async getFacilitiesByType(type, schoolId) {
        try {
            const facilities = await prisma_1.default.facility.findMany({
                where: {
                    schoolId: schoolId,
                    facilityType: { contains: type, mode: 'insensitive' }
                },
                orderBy: [
                    { facilityName: 'asc' }
                ]
            });
            return facilities.map(facility => this.transformFacility(facility));
        }
        catch (error) {
            throw new Error(error.message || 'Gagal mengambil data fasilitas berdasarkan tipe');
        }
    }
    // Add new facility - equivalent to facilitiesApi.addFacility()
    async addFacility(data, schoolId) {
        try {
            // Check if facility name already exists in the school
            const existingFacility = await prisma_1.default.facility.findFirst({
                where: {
                    schoolId: schoolId,
                    facilityName: data.facilityName
                }
            });
            if (existingFacility) {
                throw new Error('Nama fasilitas sudah digunakan di sekolah ini');
            }
            const facility = await prisma_1.default.facility.create({
                data: {
                    schoolId: schoolId,
                    facilityName: data.facilityName,
                    facilityType: data.facilityType,
                    capacity: data.capacity,
                    location: data.location,
                    condition: data.condition,
                    notes: data.notes,
                    facilityPhoto: data.facilityPhoto
                }
            });
            return this.transformFacility(facility);
        }
        catch (error) {
            throw new Error(error.message || 'Gagal menambahkan fasilitas');
        }
    }
    // Update facility - equivalent to facilitiesApi.updateFacility()
    async updateFacility(id, updates, schoolId) {
        try {
            // Verify facility exists and belongs to school
            const existingFacility = await prisma_1.default.facility.findFirst({
                where: {
                    id: id,
                    schoolId: schoolId
                }
            });
            if (!existingFacility) {
                throw new Error('Fasilitas tidak ditemukan atau bukan bagian dari sekolah ini');
            }
            // If updating facility name, check uniqueness
            if (updates.facilityName && updates.facilityName !== existingFacility.facilityName) {
                const duplicateFacility = await prisma_1.default.facility.findFirst({
                    where: {
                        schoolId: schoolId,
                        facilityName: updates.facilityName,
                        id: { not: id }
                    }
                });
                if (duplicateFacility) {
                    throw new Error('Nama fasilitas sudah digunakan di sekolah ini');
                }
            }
            const updateData = {};
            if (updates.facilityName !== undefined)
                updateData.facilityName = updates.facilityName;
            if (updates.facilityType !== undefined)
                updateData.facilityType = updates.facilityType;
            if (updates.capacity !== undefined)
                updateData.capacity = updates.capacity;
            if (updates.location !== undefined)
                updateData.location = updates.location;
            if (updates.condition !== undefined)
                updateData.condition = updates.condition;
            if (updates.notes !== undefined)
                updateData.notes = updates.notes;
            if (updates.facilityPhoto !== undefined)
                updateData.facilityPhoto = updates.facilityPhoto;
            const facility = await prisma_1.default.facility.update({
                where: { id: id },
                data: updateData
            });
            return this.transformFacility(facility);
        }
        catch (error) {
            throw new Error(error.message || 'Gagal memperbarui fasilitas');
        }
    }
    // Delete facility - equivalent to facilitiesApi.deleteFacility()
    async deleteFacility(id, schoolId) {
        try {
            // Verify facility exists and belongs to school
            const existingFacility = await prisma_1.default.facility.findFirst({
                where: {
                    id: id,
                    schoolId: schoolId
                }
            });
            if (!existingFacility) {
                return false;
            }
            // Check if facility has usage records
            const usageCount = await prisma_1.default.facilityUsage.count({
                where: { facilityId: id }
            });
            if (usageCount > 0) {
                throw new Error('Tidak dapat menghapus fasilitas yang memiliki riwayat penggunaan');
            }
            await prisma_1.default.facility.delete({
                where: { id: id }
            });
            return true;
        }
        catch (error) {
            if (error.message.includes('Tidak dapat menghapus')) {
                throw error;
            }
            throw new Error(error.message || 'Gagal menghapus fasilitas');
        }
    }
    // Get facility usage records
    async getFacilityUsage(params) {
        try {
            const { facilityId, dateFrom, dateTo, approvalStatus, schoolId } = params;
            // Build where clause
            const where = {
                facility: {
                    schoolId: schoolId
                }
            };
            if (facilityId) {
                where.facilityId = facilityId;
            }
            if (dateFrom || dateTo) {
                where.date = {};
                if (dateFrom)
                    where.date.gte = dateFrom;
                if (dateTo)
                    where.date.lte = dateTo;
            }
            if (approvalStatus) {
                where.approvalStatus = approvalStatus;
            }
            const usageRecords = await prisma_1.default.facilityUsage.findMany({
                where,
                include: {
                    facility: {
                        select: {
                            facilityName: true,
                            facilityType: true
                        }
                    },
                    user: {
                        select: {
                            fullName: true
                        }
                    }
                },
                orderBy: [
                    { date: 'desc' },
                    { startTime: 'asc' }
                ]
            });
            return usageRecords.map(usage => this.transformFacilityUsage(usage));
        }
        catch (error) {
            throw new Error(error.message || 'Gagal mengambil data penggunaan fasilitas');
        }
    }
    // Get facility usage for specific facility
    async getFacilityUsageByFacilityId(facilityId, schoolId) {
        try {
            // Verify facility belongs to school
            const facility = await prisma_1.default.facility.findFirst({
                where: {
                    id: facilityId,
                    schoolId: schoolId
                }
            });
            if (!facility) {
                throw new Error('Fasilitas tidak ditemukan atau bukan bagian dari sekolah ini');
            }
            const usageRecords = await prisma_1.default.facilityUsage.findMany({
                where: { facilityId: facilityId },
                include: {
                    facility: {
                        select: {
                            facilityName: true,
                            facilityType: true
                        }
                    },
                    user: {
                        select: {
                            fullName: true
                        }
                    }
                },
                orderBy: [
                    { date: 'desc' },
                    { startTime: 'asc' }
                ]
            });
            return usageRecords.map(usage => this.transformFacilityUsage(usage));
        }
        catch (error) {
            throw new Error(error.message || 'Gagal mengambil data penggunaan fasilitas');
        }
    }
    // Add facility usage record
    async addFacilityUsage(data, userId, schoolId) {
        try {
            // Verify facility exists and belongs to school
            const facility = await prisma_1.default.facility.findFirst({
                where: {
                    id: data.facilityId,
                    schoolId: schoolId
                }
            });
            if (!facility) {
                throw new Error('Fasilitas tidak ditemukan atau bukan bagian dari sekolah ini');
            }
            // Check for time conflicts
            const conflictingUsage = await prisma_1.default.facilityUsage.findFirst({
                where: {
                    facilityId: data.facilityId,
                    date: data.date,
                    OR: [
                        // New usage starts during existing usage
                        {
                            AND: [
                                { startTime: { lte: data.startTime } },
                                { endTime: { gt: data.startTime } }
                            ]
                        },
                        // New usage ends during existing usage
                        {
                            AND: [
                                { startTime: { lt: data.endTime } },
                                { endTime: { gte: data.endTime } }
                            ]
                        },
                        // New usage completely contains existing usage
                        {
                            AND: [
                                { startTime: { gte: data.startTime } },
                                { endTime: { lte: data.endTime } }
                            ]
                        }
                    ]
                }
            });
            if (conflictingUsage) {
                throw new Error('Terdapat konflik waktu dengan penggunaan fasilitas yang sudah ada');
            }
            // Validate time logic
            if (data.startTime >= data.endTime) {
                throw new Error('Waktu mulai harus lebih awal dari waktu selesai');
            }
            const usage = await prisma_1.default.facilityUsage.create({
                data: {
                    facilityId: data.facilityId,
                    date: data.date,
                    startTime: data.startTime,
                    endTime: data.endTime,
                    purpose: data.purpose,
                    userId: userId,
                    approvalStatus: 'pending', // Default status
                    notes: data.notes
                },
                include: {
                    facility: {
                        select: {
                            facilityName: true,
                            facilityType: true
                        }
                    },
                    user: {
                        select: {
                            fullName: true
                        }
                    }
                }
            });
            return this.transformFacilityUsage(usage);
        }
        catch (error) {
            throw new Error(error.message || 'Gagal menambahkan penggunaan fasilitas');
        }
    }
    // Approve/reject facility usage
    async updateFacilityUsageApproval(usageId, approvalStatus, schoolId) {
        try {
            // Verify usage exists and facility belongs to school
            const existingUsage = await prisma_1.default.facilityUsage.findFirst({
                where: {
                    id: usageId,
                    facility: {
                        schoolId: schoolId
                    }
                }
            });
            if (!existingUsage) {
                throw new Error('Penggunaan fasilitas tidak ditemukan atau bukan bagian dari sekolah ini');
            }
            const usage = await prisma_1.default.facilityUsage.update({
                where: { id: usageId },
                data: {
                    approvalStatus: approvalStatus,
                    updatedAt: new Date()
                },
                include: {
                    facility: {
                        select: {
                            facilityName: true,
                            facilityType: true
                        }
                    },
                    user: {
                        select: {
                            fullName: true
                        }
                    }
                }
            });
            return this.transformFacilityUsage(usage);
        }
        catch (error) {
            throw new Error(error.message || 'Gagal memperbarui status persetujuan');
        }
    }
    // Get facility statistics
    async getFacilityStats(schoolId) {
        try {
            const [totalFacilities, facilitiesByType, facilitiesByCondition, usageStats] = await Promise.all([
                // Total facilities
                prisma_1.default.facility.count({
                    where: { schoolId: schoolId }
                }),
                // Facilities by type
                prisma_1.default.facility.groupBy({
                    by: ['facilityType'],
                    where: { schoolId: schoolId },
                    _count: {
                        facilityType: true
                    }
                }),
                // Facilities by condition
                prisma_1.default.facility.groupBy({
                    by: ['condition'],
                    where: { schoolId: schoolId },
                    _count: {
                        condition: true
                    }
                }),
                // Usage statistics for current month
                prisma_1.default.facilityUsage.count({
                    where: {
                        facility: {
                            schoolId: schoolId
                        },
                        date: {
                            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                            lte: new Date()
                        }
                    }
                })
            ]);
            // Calculate total capacity
            const capacitySum = await prisma_1.default.facility.aggregate({
                where: { schoolId: schoolId },
                _sum: {
                    capacity: true
                }
            });
            return {
                totalFacilities,
                totalCapacity: capacitySum._sum.capacity || 0,
                facilitiesByType: facilitiesByType.map(item => ({
                    type: item.facilityType,
                    count: item._count.facilityType
                })),
                facilitiesByCondition: facilitiesByCondition.map(item => ({
                    condition: item.condition || 'unknown',
                    count: item._count.condition
                })),
                currentMonthUsage: usageStats
            };
        }
        catch (error) {
            throw new Error(error.message || 'Gagal mengambil statistik fasilitas');
        }
    }
    // Get facility utilization report
    async getFacilityUtilizationReport(schoolId, dateFrom, dateTo) {
        try {
            const where = {
                facility: {
                    schoolId: schoolId
                }
            };
            if (dateFrom || dateTo) {
                where.date = {};
                if (dateFrom)
                    where.date.gte = dateFrom;
                if (dateTo)
                    where.date.lte = dateTo;
            }
            // Get usage by facility
            const usageByFacility = await prisma_1.default.facilityUsage.groupBy({
                by: ['facilityId'],
                where,
                _count: {
                    facilityId: true
                }
            });
            // Get facility details
            const facilityDetails = await prisma_1.default.facility.findMany({
                where: { schoolId: schoolId },
                select: {
                    id: true,
                    facilityName: true,
                    facilityType: true,
                    capacity: true
                }
            });
            // Combine data
            const utilizationData = facilityDetails.map(facility => {
                const usage = usageByFacility.find(u => u.facilityId === facility.id);
                return {
                    facilityId: facility.id,
                    facilityName: facility.facilityName,
                    facilityType: facility.facilityType,
                    capacity: facility.capacity,
                    usageCount: usage ? usage._count.facilityId : 0
                };
            });
            return utilizationData.sort((a, b) => b.usageCount - a.usageCount);
        }
        catch (error) {
            throw new Error(error.message || 'Gagal mengambil laporan pemanfaatan fasilitas');
        }
    }
}
exports.FacilityService = FacilityService;
