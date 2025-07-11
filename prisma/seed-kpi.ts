import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedKPI() {
  console.log('🌱 Seeding KPI data...');

  try {
    // Get existing schools to use their IDs
    const schools = await prisma.school.findMany({
      select: { id: true, schoolName: true }
    });

    if (schools.length === 0) {
      console.log('❌ No schools found. Please run auth and academic seeds first.');
      return;
    }

    console.log(`📊 Found ${schools.length} schools, creating KPI data...`);

    // KPI data for each school
    for (const school of schools) {
      console.log(`📈 Creating KPI data for ${school.schoolName}...`);

      const kpiData = [
        // Academic KPIs - Semester 1, 2024
        {
          schoolId: school.id,
          academicYear: "2024",
          period: "Semester 1",
          kpiCategory: "Academic",
          kpiName: "Tingkat Kelulusan Siswa",
          targetValue: 95,
          achievedValue: 92,
          achievementPercentage: 96.84,
          trend: "increasing",
          priority: 1,
          analysis: "Tingkat kelulusan mencapai 92% dari target 95%. Peningkatan 3% dari semester sebelumnya menunjukkan efektivitas program remedial."
        },
        {
          schoolId: school.id,
          academicYear: "2024",
          period: "Semester 1",
          kpiCategory: "Academic",
          kpiName: "Rata-rata Nilai UN/AKM",
          targetValue: 75,
          achievedValue: 78,
          achievementPercentage: 104,
          trend: "increasing",
          priority: 1,
          analysis: "Nilai rata-rata UN/AKM melampaui target dengan pencapaian 78 dari target 75. Program intensif matematika dan literasi memberikan hasil positif."
        },
        {
          schoolId: school.id,
          academicYear: "2024",
          period: "Semester 1",
          kpiCategory: "Academic",
          kpiName: "Persentase Siswa Remedial",
          targetValue: 15,
          achievedValue: 18,
          achievementPercentage: 83.33,
          trend: "stable",
          priority: 2,
          analysis: "Persentase siswa remedial sedikit di atas target. Perlu evaluasi metode pembelajaran dan identifikasi siswa berisiko lebih awal."
        },

        // Operational KPIs - Semester 1, 2024
        {
          schoolId: school.id,
          academicYear: "2024",
          period: "Semester 1",
          kpiCategory: "Operational",
          kpiName: "Tingkat Kehadiran Siswa",
          targetValue: 95,
          achievedValue: 89,
          achievementPercentage: 93.68,
          trend: "decreasing",
          priority: 2,
          analysis: "Kehadiran siswa turun menjadi 89% dari target 95%. Perlu program khusus untuk meningkatkan motivasi siswa hadir ke sekolah."
        },
        {
          schoolId: school.id,
          academicYear: "2024",
          period: "Semester 1",
          kpiCategory: "Operational",
          kpiName: "Tingkat Kehadiran Guru",
          targetValue: 98,
          achievedValue: 96,
          achievementPercentage: 97.96,
          trend: "stable",
          priority: 1,
          analysis: "Kehadiran guru mencapai 96% dari target 98%. Masih dalam batas toleransi namun perlu monitoring ketat untuk mempertahankan kualitas."
        },
        {
          schoolId: school.id,
          academicYear: "2024",
          period: "Semester 1",
          kpiCategory: "Operational",
          kpiName: "Efisiensi Penyelesaian Administrasi",
          targetValue: 90,
          achievedValue: 85,
          achievementPercentage: 94.44,
          trend: "stable",
          priority: 3,
          analysis: "Efisiensi administrasi mencapai 85% dari target 90%. Implementasi sistem digital dapat meningkatkan efisiensi lebih lanjut."
        },

        // Financial KPIs - Semester 1, 2024
        {
          schoolId: school.id,
          academicYear: "2024",
          period: "Semester 1",
          kpiCategory: "Financial",
          kpiName: "Tingkat Realisasi Anggaran",
          targetValue: 85,
          achievedValue: 78,
          achievementPercentage: 91.76,
          trend: "stable",
          priority: 2,
          analysis: "Realisasi anggaran mencapai 78% dari target 85%. Masih dalam koridor yang wajar namun perlu optimalisasi perencanaan anggaran."
        },
        {
          schoolId: school.id,
          academicYear: "2024",
          period: "Semester 1",
          kpiCategory: "Financial",
          kpiName: "Efisiensi Biaya Operasional",
          targetValue: 80,
          achievedValue: 75,
          achievementPercentage: 93.75,
          trend: "increasing",
          priority: 3,
          analysis: "Efisiensi biaya operasional mencapai 75% dari target 80%. Penghematan listrik dan kertas memberikan kontribusi positif."
        },
        {
          schoolId: school.id,
          academicYear: "2024",
          period: "Semester 1",
          kpiCategory: "Financial",
          kpiName: "Tingkat Kolektibilitas SPP",
          targetValue: 95,
          achievedValue: 88,
          achievementPercentage: 92.63,
          trend: "decreasing",
          priority: 1,
          analysis: "Kolektibilitas SPP turun menjadi 88% dari target 95%. Perlu strategi komunikasi dan program bantuan untuk orang tua siswa."
        },

        // Resource KPIs - Semester 1, 2024
        {
          schoolId: school.id,
          academicYear: "2024",
          period: "Semester 1",
          kpiCategory: "Resource",
          kpiName: "Tingkat Pemanfaatan Fasilitas",
          targetValue: 85,
          achievedValue: 82,
          achievementPercentage: 96.47,
          trend: "stable",
          priority: 3,
          analysis: "Pemanfaatan fasilitas mencapai 82% dari target 85%. Lab komputer dan perpustakaan masih bisa dioptimalkan penggunaannya."
        },
        {
          schoolId: school.id,
          academicYear: "2024",
          period: "Semester 1",
          kpiCategory: "Resource",
          kpiName: "Kondisi Aset Sekolah",
          targetValue: 90,
          achievedValue: 87,
          achievementPercentage: 96.67,
          trend: "stable",
          priority: 2,
          analysis: "Kondisi aset sekolah dalam kategori baik dengan 87% dari target 90%. Perawatan rutin perlu ditingkatkan untuk menjaga kualitas."
        },
        {
          schoolId: school.id,
          academicYear: "2024",
          period: "Semester 1",
          kpiCategory: "Resource",
          kpiName: "Tingkat Kepuasan Stakeholder",
          targetValue: 85,
          achievedValue: 79,
          achievementPercentage: 92.94,
          trend: "increasing",
          priority: 2,
          analysis: "Kepuasan stakeholder mencapai 79% dari target 85%. Survey menunjukkan peningkatan kepuasan orang tua terhadap komunikasi sekolah."
        },

        // Previous Period Data - Semester 2, 2023 (for comparison)
        {
          schoolId: school.id,
          academicYear: "2023",
          period: "Semester 2",
          kpiCategory: "Academic",
          kpiName: "Tingkat Kelulusan Siswa",
          targetValue: 95,
          achievedValue: 89,
          achievementPercentage: 93.68,
          trend: "stable",
          priority: 1,
          analysis: "Data periode sebelumnya untuk perbandingan trend."
        },
        {
          schoolId: school.id,
          academicYear: "2023",
          period: "Semester 2",
          kpiCategory: "Academic",
          kpiName: "Rata-rata Nilai UN/AKM",
          targetValue: 75,
          achievedValue: 73,
          achievementPercentage: 97.33,
          trend: "stable",
          priority: 1,
          analysis: "Data periode sebelumnya untuk perbandingan trend."
        },
        {
          schoolId: school.id,
          academicYear: "2023",
          period: "Semester 2",
          kpiCategory: "Operational",
          kpiName: "Tingkat Kehadiran Siswa",
          targetValue: 95,
          achievedValue: 91,
          achievementPercentage: 95.79,
          trend: "stable",
          priority: 2,
          analysis: "Data periode sebelumnya untuk perbandingan trend."
        },
        {
          schoolId: school.id,
          academicYear: "2023",
          period: "Semester 2",
          kpiCategory: "Financial",
          kpiName: "Tingkat Kolektibilitas SPP",
          targetValue: 95,
          achievedValue: 92,
          achievementPercentage: 96.84,
          trend: "stable",
          priority: 1,
          analysis: "Data periode sebelumnya untuk perbandingan trend."
        },

        // Additional KPIs for Semester 2, 2024 (future projections)
        {
          schoolId: school.id,
          academicYear: "2024",
          period: "Semester 2",
          kpiCategory: "Academic",
          kpiName: "Tingkat Kelulusan Siswa",
          targetValue: 95,
          achievedValue: 94,
          achievementPercentage: 98.95,
          trend: "increasing",
          priority: 1,
          analysis: "Target semester 2 dengan proyeksi peningkatan berdasarkan perbaikan semester 1."
        },
        {
          schoolId: school.id,
          academicYear: "2024",
          period: "Semester 2",
          kpiCategory: "Operational",
          kpiName: "Tingkat Kehadiran Siswa",
          targetValue: 95,
          achievedValue: 92,
          achievementPercentage: 96.84,
          trend: "increasing",
          priority: 2,
          analysis: "Target semester 2 dengan program motivasi yang telah diperbaiki."
        }
      ];

      // Insert KPI data in batches to avoid overwhelming the database
      for (const kpi of kpiData) {
        try {
          await prisma.schoolKpi.create({
            data: kpi
          });
        } catch (error: any) {
          if (error.code === 'P2002') {
            console.log(`⚠️  KPI '${kpi.kpiName}' for ${kpi.academicYear}/${kpi.period} already exists, skipping...`);
          } else {
            console.error(`❌ Error creating KPI '${kpi.kpiName}':`, error.message);
          }
        }
      }

      console.log(`✅ Created KPI data for ${school.schoolName}`);
    }

    // Summary
    const totalKPIs = await prisma.schoolKpi.count();
    const kpisByCategory = await prisma.schoolKpi.groupBy({
      by: ['kpiCategory'],
      _count: {
        id: true
      }
    });

    console.log('\n📊 KPI Seeding Summary:');
    console.log(`📈 Total KPIs created: ${totalKPIs}`);
    console.log('📊 KPIs by category:');
    kpisByCategory.forEach(category => {
      console.log(`   - ${category.kpiCategory}: ${category._count.id} KPIs`);
    });

    console.log('\n✅ KPI seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding KPI data:', error);
    throw error;
  }
}

async function main() {
  try {
    await seedKPI();
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
if (require.main === module) {
  main();
}

export { seedKPI };