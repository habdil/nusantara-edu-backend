import prisma from '../config/prisma';
import { Prisma } from '@prisma/client';

// Types based on frontend interface
export interface FacilityResponse {
  id: number;
  schoolId: number;
  facilityName: string;
  facilityType: string;
  capacity?: number;
  location?: string;
  condition?: "good" | "minor_damage" | "major_damage" | "under_repair";
  notes?: string;
  facilityPhoto?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface FacilityUsageResponse {
  id: number;
  facilityId: number;
  date: Date;
  startTime: Date;
  endTime: Date;
  purpose: string;
  userId?: number;
  approvalStatus?: string;
  notes?: string;
  createdAt: Date;
  updatedAt?: Date;
  facility?: {
    facilityName: string;
    facilityType: string;
  };
  user?: {
    fullName: string;
  };
}

export interface GetFacilitiesParams {
  facilityType?: string;
  condition?: string;
  search?: string;
  page?: number;
  limit?: number;
  schoolId: number;
}

export interface GetFacilityUsageParams {
  facilityId?: number;
  dateFrom?: Date;
  dateTo?: Date;
  approvalStatus?: string;
  page?: number;
  limit?: number;
  schoolId: number;
}

export interface CreateFacilityData {
  facilityName: string;
  facilityType: string;
  capacity?: number;
  location?: string;
  condition?: "good" | "minor_damage" | "major_damage" | "under_repair";
  notes?: string;
  facilityPhoto?: string;
}

export interface CreateFacilityUsageData {
  facilityId: number;
  date: Date;
  startTime: Date;
  endTime: Date;
  purpose: string;
  notes?: string;
}

export class FacilityService {
  // Transform database facility to frontend format
  private transformFacility(facility: any): FacilityResponse {
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
  private transformFacilityUsage(usage: any): FacilityUsageResponse {
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
  async getFacilities(params: GetFacilitiesParams): Promise<FacilityResponse[]> {
    try {
      const { facilityType, condition, search, schoolId } = params;

      // Build where clause
      const where: Prisma.FacilityWhereInput = {
        schoolId: schoolId
      };

      if (facilityType) {
        where.facilityType = { contains: facilityType, mode: 'insensitive' };
      }

      if (condition) {
        where.condition = condition as any;
      }

      if (search) {
        where.OR = [
          { facilityName: { contains: search, mode: 'insensitive' } },
          { facilityType: { contains: search, mode: 'insensitive' } },
          { location: { contains: search, mode: 'insensitive' } }
        ];
      }

      const facilities = await prisma.facility.findMany({
        where,
        orderBy: [
          { facilityType: 'asc' },
          { facilityName: 'asc' }
        ]
      });

      return facilities.map(facility => this.transformFacility(facility));
    } catch (error: any) {
      throw new Error(error.message || 'Gagal mengambil data fasilitas');
    }
  }

  // Get facility by ID - equivalent to facilitiesApi.getFacilityById()
  async getFacilityById(id: number, schoolId: number): Promise<FacilityResponse | null> {
    try {
      const facility = await prisma.facility.findFirst({
        where: {
          id: id,
          schoolId: schoolId
        }
      });

      if (!facility) {
        return null;
      }

      return this.transformFacility(facility);
    } catch (error: any) {
      throw new Error(error.message || 'Gagal mengambil data fasilitas');
    }
  }

  // Get facilities by type - equivalent to facilitiesApi.getFacilitiesByType()
  async getFacilitiesByType(type: string, schoolId: number): Promise<FacilityResponse[]> {
    try {
      const facilities = await prisma.facility.findMany({
        where: {
          schoolId: schoolId,
          facilityType: { contains: type, mode: 'insensitive' }
        },
        orderBy: [
          { facilityName: 'asc' }
        ]
      });

      return facilities.map(facility => this.transformFacility(facility));
    } catch (error: any) {
      throw new Error(error.message || 'Gagal mengambil data fasilitas berdasarkan tipe');
    }
  }

  // Add new facility - equivalent to facilitiesApi.addFacility()
  async addFacility(data: CreateFacilityData, schoolId: number): Promise<FacilityResponse> {
    try {
      // Check if facility name already exists in the school
      const existingFacility = await prisma.facility.findFirst({
        where: {
          schoolId: schoolId,
          facilityName: data.facilityName
        }
      });

      if (existingFacility) {
        throw new Error('Nama fasilitas sudah digunakan di sekolah ini');
      }

      const facility = await prisma.facility.create({
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
    } catch (error: any) {
      throw new Error(error.message || 'Gagal menambahkan fasilitas');
    }
  }

  // Update facility - equivalent to facilitiesApi.updateFacility()
  async updateFacility(id: number, updates: Partial<CreateFacilityData>, schoolId: number): Promise<FacilityResponse | null> {
    try {
      // Verify facility exists and belongs to school
      const existingFacility = await prisma.facility.findFirst({
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
        const duplicateFacility = await prisma.facility.findFirst({
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

      const updateData: Prisma.FacilityUpdateInput = {};
      
      if (updates.facilityName !== undefined) updateData.facilityName = updates.facilityName;
      if (updates.facilityType !== undefined) updateData.facilityType = updates.facilityType;
      if (updates.capacity !== undefined) updateData.capacity = updates.capacity;
      if (updates.location !== undefined) updateData.location = updates.location;
      if (updates.condition !== undefined) updateData.condition = updates.condition;
      if (updates.notes !== undefined) updateData.notes = updates.notes;
      if (updates.facilityPhoto !== undefined) updateData.facilityPhoto = updates.facilityPhoto;

      const facility = await prisma.facility.update({
        where: { id: id },
        data: updateData
      });

      return this.transformFacility(facility);
    } catch (error: any) {
      throw new Error(error.message || 'Gagal memperbarui fasilitas');
    }
  }

  // Delete facility - equivalent to facilitiesApi.deleteFacility()
  async deleteFacility(id: number, schoolId: number): Promise<boolean> {
    try {
      // Verify facility exists and belongs to school
      const existingFacility = await prisma.facility.findFirst({
        where: {
          id: id,
          schoolId: schoolId
        }
      });

      if (!existingFacility) {
        return false;
      }

      // Check if facility has usage records
      const usageCount = await prisma.facilityUsage.count({
        where: { facilityId: id }
      });

      if (usageCount > 0) {
        throw new Error('Tidak dapat menghapus fasilitas yang memiliki riwayat penggunaan');
      }

      await prisma.facility.delete({
        where: { id: id }
      });

      return true;
    } catch (error: any) {
      if (error.message.includes('Tidak dapat menghapus')) {
        throw error;
      }
      throw new Error(error.message || 'Gagal menghapus fasilitas');
    }
  }

  // Get facility usage records
  async getFacilityUsage(params: GetFacilityUsageParams): Promise<FacilityUsageResponse[]> {
    try {
      const { facilityId, dateFrom, dateTo, approvalStatus, schoolId } = params;

      // Build where clause
      const where: Prisma.FacilityUsageWhereInput = {
        facility: {
          schoolId: schoolId
        }
      };

      if (facilityId) {
        where.facilityId = facilityId;
      }

      if (dateFrom || dateTo) {
        where.date = {};
        if (dateFrom) where.date.gte = dateFrom;
        if (dateTo) where.date.lte = dateTo;
      }

      if (approvalStatus) {
        where.approvalStatus = approvalStatus;
      }

      const usageRecords = await prisma.facilityUsage.findMany({
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
    } catch (error: any) {
      throw new Error(error.message || 'Gagal mengambil data penggunaan fasilitas');
    }
  }

  // Get facility usage for specific facility
  async getFacilityUsageByFacilityId(facilityId: number, schoolId: number): Promise<FacilityUsageResponse[]> {
    try {
      // Verify facility belongs to school
      const facility = await prisma.facility.findFirst({
        where: {
          id: facilityId,
          schoolId: schoolId
        }
      });

      if (!facility) {
        throw new Error('Fasilitas tidak ditemukan atau bukan bagian dari sekolah ini');
      }

      const usageRecords = await prisma.facilityUsage.findMany({
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
    } catch (error: any) {
      throw new Error(error.message || 'Gagal mengambil data penggunaan fasilitas');
    }
  }

  // Add facility usage record
  async addFacilityUsage(data: CreateFacilityUsageData, userId: number, schoolId: number): Promise<FacilityUsageResponse> {
    try {
      // Verify facility exists and belongs to school
      const facility = await prisma.facility.findFirst({
        where: {
          id: data.facilityId,
          schoolId: schoolId
        }
      });

      if (!facility) {
        throw new Error('Fasilitas tidak ditemukan atau bukan bagian dari sekolah ini');
      }

      // Check for time conflicts
      const conflictingUsage = await prisma.facilityUsage.findFirst({
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

      const usage = await prisma.facilityUsage.create({
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
    } catch (error: any) {
      throw new Error(error.message || 'Gagal menambahkan penggunaan fasilitas');
    }
  }

  // Approve/reject facility usage
  async updateFacilityUsageApproval(usageId: number, approvalStatus: string, schoolId: number): Promise<FacilityUsageResponse> {
    try {
      // Verify usage exists and facility belongs to school
      const existingUsage = await prisma.facilityUsage.findFirst({
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

      const usage = await prisma.facilityUsage.update({
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
    } catch (error: any) {
      throw new Error(error.message || 'Gagal memperbarui status persetujuan');
    }
  }

  // Get facility statistics
  async getFacilityStats(schoolId: number) {
    try {
      const [totalFacilities, facilitiesByType, facilitiesByCondition, usageStats] = await Promise.all([
        // Total facilities
        prisma.facility.count({
          where: { schoolId: schoolId }
        }),

        // Facilities by type
        prisma.facility.groupBy({
          by: ['facilityType'],
          where: { schoolId: schoolId },
          _count: {
            facilityType: true
          }
        }),

        // Facilities by condition
        prisma.facility.groupBy({
          by: ['condition'],
          where: { schoolId: schoolId },
          _count: {
            condition: true
          }
        }),

        // Usage statistics for current month
        prisma.facilityUsage.count({
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
      const capacitySum = await prisma.facility.aggregate({
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
    } catch (error: any) {
      throw new Error(error.message || 'Gagal mengambil statistik fasilitas');
    }
  }

  // Get facility utilization report
  async getFacilityUtilizationReport(schoolId: number, dateFrom?: Date, dateTo?: Date) {
    try {
      const where: Prisma.FacilityUsageWhereInput = {
        facility: {
          schoolId: schoolId
        }
      };

      if (dateFrom || dateTo) {
        where.date = {};
        if (dateFrom) where.date.gte = dateFrom;
        if (dateTo) where.date.lte = dateTo;
      }

      // Get usage by facility
      const usageByFacility = await prisma.facilityUsage.groupBy({
        by: ['facilityId'],
        where,
        _count: {
          facilityId: true
        }
      });

      // Get facility details
      const facilityDetails = await prisma.facility.findMany({
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
    } catch (error: any) {
      throw new Error(error.message || 'Gagal mengambil laporan pemanfaatan fasilitas');
    }
  }
}