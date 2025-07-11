import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting resource data seeding for 2025...');

  try {
    // Clear existing resource data (in correct order due to foreign key constraints)
    console.log('🧹 Cleaning existing resource data...');
    
    await prisma.assetMaintenance.deleteMany({});
    await prisma.asset.deleteMany({});
    await prisma.financialTransaction.deleteMany({});
    await prisma.schoolFinance.deleteMany({});
    await prisma.facilityUsage.deleteMany({});
    await prisma.facility.deleteMany({});

    console.log('✅ Existing resource data cleared');

    // Get school ID (assuming school exists from auth seed)
    const school = await prisma.school.findFirst();
    if (!school) {
      throw new Error('No school found. Please run auth seed first.');
    }

    console.log(`📚 Seeding resources for school: ${school.schoolName}`);

    // ===== SEED ASSETS =====
    console.log('📦 Seeding assets...');

    const assets = await prisma.asset.createMany({
      data: [
        {
          schoolId: school.id,
          assetCode: 'AST-001',
          assetName: 'Laptop Dell Inspiron 15',
          assetCategory: 'Electronics',
          acquisitionDate: new Date('2025-01-15'), // Changed to 2025
          acquisitionValue: 8500000,
          usefulLife: 60,
          condition: 'good',
          location: 'Ruang Kepala Sekolah',
          notes: 'Laptop untuk kegiatan administrasi',
          qrCode: 'QR-AST-001'
        },
        {
          schoolId: school.id,
          assetCode: 'AST-002',
          assetName: 'Proyektor Epson EB-X41',
          assetCategory: 'Electronics',
          acquisitionDate: new Date('2025-03-20'), // Changed to 2025
          acquisitionValue: 4500000,
          usefulLife: 72,
          condition: 'good',
          location: 'Ruang Kelas 6A',
          notes: 'Proyektor untuk presentasi kelas',
          qrCode: 'QR-AST-002'
        },
        {
          schoolId: school.id,
          assetCode: 'AST-003',
          assetName: 'Meja Guru Kayu Jati',
          assetCategory: 'Furniture',
          acquisitionDate: new Date('2025-08-10'), // Changed to 2025
          acquisitionValue: 1200000,
          usefulLife: 120,
          condition: 'minor_damage',
          location: 'Ruang Kelas 5B',
          notes: 'Meja guru untuk ruang kelas',
          qrCode: 'QR-AST-003'
        },
        {
          schoolId: school.id,
          assetCode: 'AST-004',
          assetName: 'AC Split 1.5 PK',
          assetCategory: 'Electronics',
          acquisitionDate: new Date('2025-06-15'), // Changed to 2025
          acquisitionValue: 3200000,
          usefulLife: 84,
          condition: 'good',
          location: 'Ruang Kepala Sekolah',
          notes: 'Air conditioner untuk ruang kepala sekolah',
          qrCode: 'QR-AST-004'
        },
        {
          schoolId: school.id,
          assetCode: 'AST-005',
          assetName: 'Papan Tulis Interaktif',
          assetCategory: 'Electronics',
          acquisitionDate: new Date('2025-09-10'), // Changed to 2025
          acquisitionValue: 12000000,
          usefulLife: 96,
          condition: 'good',
          location: 'Ruang Kelas 6B',
          notes: 'Smart board untuk pembelajaran interaktif',
          qrCode: 'QR-AST-005'
        },
        {
          schoolId: school.id,
          assetCode: 'AST-006',
          assetName: 'Kursi Siswa (Set 30)',
          assetCategory: 'Furniture',
          acquisitionDate: new Date('2025-07-01'), // Changed to 2025
          acquisitionValue: 4500000,
          usefulLife: 120,
          condition: 'good',
          location: 'Ruang Kelas 5A',
          notes: 'Set kursi untuk 30 siswa',
          qrCode: 'QR-AST-006'
        },
        {
          schoolId: school.id,
          assetCode: 'AST-007',
          assetName: 'Printer HP LaserJet',
          assetCategory: 'Electronics',
          acquisitionDate: new Date('2025-04-25'), // Changed to 2025
          acquisitionValue: 2800000,
          usefulLife: 60,
          condition: 'good',
          location: 'Ruang Administrasi',
          notes: 'Printer untuk kebutuhan administrasi',
          qrCode: 'QR-AST-007'
        },
        {
          schoolId: school.id,
          assetCode: 'AST-008',
          assetName: 'Lemari Arsip Besi',
          assetCategory: 'Furniture',
          acquisitionDate: new Date('2025-11-15'), // Changed to 2025
          acquisitionValue: 1800000,
          usefulLife: 180,
          condition: 'good',
          location: 'Ruang Administrasi',
          notes: 'Lemari untuk penyimpanan dokumen',
          qrCode: 'QR-AST-008'
        }
      ]
    });

    console.log(`✅ Created ${assets.count} assets`);

    // Get created assets for maintenance records
    const createdAssets = await prisma.asset.findMany({
      where: { schoolId: school.id }
    });

    // ===== SEED ASSET MAINTENANCE =====
    console.log('🔧 Seeding asset maintenance records...');

    const maintenanceRecords = await prisma.assetMaintenance.createMany({
      data: [
        {
          assetId: createdAssets[0].id, // Laptop
          maintenanceDate: new Date('2025-01-15'), // Changed to 2025
          maintenanceType: 'Preventive',
          description: 'Pembersihan dan update software',
          cost: 150000,
          technician: 'Ahmad Teknisi',
          maintenanceResult: 'Berhasil, laptop berjalan normal',
          nextMaintenanceDate: new Date('2025-07-15') // Changed to 2025
        },
        {
          assetId: createdAssets[2].id, // Meja Guru
          maintenanceDate: new Date('2025-02-20'), // Changed to 2025
          maintenanceType: 'Corrective',
          description: 'Perbaikan laci yang rusak',
          cost: 200000,
          technician: 'Budi Furniture',
          maintenanceResult: 'Laci sudah diperbaiki',
          nextMaintenanceDate: new Date('2025-08-20') // Changed to 2025
        },
        {
          assetId: createdAssets[1].id, // Proyektor
          maintenanceDate: new Date('2025-03-10'), // Changed to 2025
          maintenanceType: 'Preventive',
          description: 'Pembersihan filter dan kalibrasi',
          cost: 100000,
          technician: 'CV. Service Elektronik',
          maintenanceResult: 'Proyektor berfungsi optimal',
          nextMaintenanceDate: new Date('2025-09-10') // Changed to 2025
        },
        {
          assetId: createdAssets[3].id, // AC
          maintenanceDate: new Date('2025-04-05'), // Changed to 2025
          maintenanceType: 'Preventive',
          description: 'Pembersihan evaporator dan isi freon',
          cost: 300000,
          technician: 'Tukang AC Jaya',
          maintenanceResult: 'AC dingin optimal',
          nextMaintenanceDate: new Date('2025-10-05') // Changed to 2025
        }
      ]
    });

    console.log(`✅ Created ${maintenanceRecords.count} maintenance records`);

    // ===== SEED SCHOOL FINANCES (BUDGETS) =====
    console.log('💰 Seeding school finances (budgets)...');

    const budgets = await prisma.schoolFinance.createMany({
      data: [
        {
          schoolId: school.id,
          budgetYear: '2025', // Changed to 2025
          period: 'Semester 1',
          budgetCategory: 'Operasional',
          budgetAmount: 50000000,
          usedAmount: 32000000,
          remainingAmount: 18000000,
          notes: 'Anggaran operasional semester 1',
          approvalStatus: true,
          approvedBy: 1
        },
        {
          schoolId: school.id,
          budgetYear: '2025', // Changed to 2025
          period: 'Semester 1',
          budgetCategory: 'Sarana Prasarana',
          budgetAmount: 75000000,
          usedAmount: 45000000,
          remainingAmount: 30000000,
          notes: 'Anggaran untuk pembelian dan pemeliharaan sarana prasarana',
          approvalStatus: true,
          approvedBy: 1
        },
        {
          schoolId: school.id,
          budgetYear: '2025', // Changed to 2025
          period: 'Semester 1',
          budgetCategory: 'Pengembangan SDM',
          budgetAmount: 25000000,
          usedAmount: 15000000,
          remainingAmount: 10000000,
          notes: 'Anggaran untuk pelatihan dan pengembangan guru',
          approvalStatus: true,
          approvedBy: 1
        },
        {
          schoolId: school.id,
          budgetYear: '2025', // Changed to 2025
          period: 'Semester 2',
          budgetCategory: 'Operasional',
          budgetAmount: 55000000,
          usedAmount: 20000000,
          remainingAmount: 35000000,
          notes: 'Anggaran operasional semester 2',
          approvalStatus: true,
          approvedBy: 1
        },
        {
          schoolId: school.id,
          budgetYear: '2025', // Changed to 2025
          period: 'Semester 2',
          budgetCategory: 'Teknologi Pendidikan',
          budgetAmount: 40000000,
          usedAmount: 12000000,
          remainingAmount: 28000000,
          notes: 'Anggaran untuk pembelian perangkat teknologi pendidikan',
          approvalStatus: false // Belum disetujui
        }
      ]
    });

    console.log(`✅ Created ${budgets.count} budget records`);

    // Get created budgets for transactions
    const createdBudgets = await prisma.schoolFinance.findMany({
      where: { schoolId: school.id }
    });

    // ===== SEED FINANCIAL TRANSACTIONS =====
    console.log('💳 Seeding financial transactions...');

    const transactions = await prisma.financialTransaction.createMany({
      data: [
        {
          schoolFinanceId: createdBudgets[0].id, // Operasional S1
          transactionDate: new Date('2025-02-15'), // Changed to 2025
          transactionType: 'expense',
          amount: 5000000,
          description: 'Pembelian alat tulis kantor',
          transactionCategory: 'Operasional',
          transactionProof: 'Nota pembelian ATK-001',
          recordedBy: 1
        },
        {
          schoolFinanceId: createdBudgets[1].id, // Sarana Prasarana S1
          transactionDate: new Date('2025-03-10'), // Changed to 2025
          transactionType: 'expense',
          amount: 8500000,
          description: 'Pembelian laptop untuk administrasi',
          transactionCategory: 'Electronics',
          transactionProof: 'Invoice laptop-001',
          recordedBy: 1
        },
        {
          schoolFinanceId: createdBudgets[2].id, // Pengembangan SDM S1
          transactionDate: new Date('2025-04-05'), // Changed to 2025
          transactionType: 'expense',
          amount: 3000000,
          description: 'Pelatihan guru matematika',
          transactionCategory: 'Training',
          transactionProof: 'Bukti pembayaran pelatihan-001',
          recordedBy: 1
        },
        {
          schoolFinanceId: createdBudgets[0].id, // Operasional S1
          transactionDate: new Date('2025-04-20'), // Changed to 2025
          transactionType: 'expense',
          amount: 2500000,
          description: 'Biaya listrik dan air bulan Maret',
          transactionCategory: 'Utilities',
          transactionProof: 'Tagihan PLN-PDAM Maret',
          recordedBy: 1
        },
        {
          schoolFinanceId: createdBudgets[1].id, // Sarana Prasarana S1
          transactionDate: new Date('2025-05-15'), // Changed to 2025
          transactionType: 'expense',
          amount: 4500000,
          description: 'Pembelian proyektor untuk kelas',
          transactionCategory: 'Electronics',
          transactionProof: 'Invoice proyektor-001',
          recordedBy: 1
        },
        {
          schoolFinanceId: createdBudgets[3].id, // Operasional S2
          transactionDate: new Date('2025-06-10'), // Changed to 2025
          transactionType: 'expense',
          amount: 3500000,
          description: 'Pembelian buku pelajaran baru',
          transactionCategory: 'Educational Materials',
          transactionProof: 'Invoice buku-001',
          recordedBy: 1
        },
        {
          schoolFinanceId: createdBudgets[2].id, // Pengembangan SDM S1
          transactionDate: new Date('2025-05-25'), // Changed to 2025
          transactionType: 'expense',
          amount: 2000000,
          description: 'Workshop penggunaan teknologi dalam pembelajaran',
          transactionCategory: 'Training',
          transactionProof: 'Bukti pembayaran workshop-001',
          recordedBy: 1
        }
      ]
    });

    console.log(`✅ Created ${transactions.count} financial transactions`);

    // ===== SEED FACILITIES =====
    console.log('🏢 Seeding facilities...');

    const facilities = await prisma.facility.createMany({
      data: [
        {
          schoolId: school.id,
          facilityName: 'Ruang Kelas 6A',
          facilityType: 'Classroom',
          capacity: 30,
          location: 'Lantai 2, Gedung Utama',
          condition: 'good',
          notes: 'Ruang kelas dengan fasilitas lengkap untuk kelas 6A'
        },
        {
          schoolId: school.id,
          facilityName: 'Ruang Kelas 6B',
          facilityType: 'Classroom',
          capacity: 30,
          location: 'Lantai 2, Gedung Utama',
          condition: 'good',
          notes: 'Ruang kelas dengan smart board untuk kelas 6B'
        },
        {
          schoolId: school.id,
          facilityName: 'Ruang Kelas 5A',
          facilityType: 'Classroom',
          capacity: 28,
          location: 'Lantai 1, Gedung Utama',
          condition: 'good',
          notes: 'Ruang kelas untuk kelas 5A'
        },
        {
          schoolId: school.id,
          facilityName: 'Ruang Kelas 5B',
          facilityType: 'Classroom',
          capacity: 28,
          location: 'Lantai 1, Gedung Utama',
          condition: 'minor_damage',
          notes: 'Ruang kelas untuk kelas 5B, perlu perbaikan cat dinding'
        },
        {
          schoolId: school.id,
          facilityName: 'Laboratorium Komputer',
          facilityType: 'Laboratory',
          capacity: 25,
          location: 'Lantai 1, Gedung Utama',
          condition: 'good',
          notes: 'Lab komputer dengan 25 unit PC untuk pembelajaran TIK'
        },
        {
          schoolId: school.id,
          facilityName: 'Perpustakaan',
          facilityType: 'Library',
          capacity: 50,
          location: 'Lantai 1, Gedung Utama',
          condition: 'minor_damage',
          notes: 'Perpustakaan sekolah, perlu perbaikan rak buku bagian belakang'
        },
        {
          schoolId: school.id,
          facilityName: 'Lapangan Olahraga',
          facilityType: 'Sports Field',
          capacity: 100,
          location: 'Area Belakang Sekolah',
          condition: 'good',
          notes: 'Lapangan serbaguna untuk berbagai kegiatan olahraga'
        },
        {
          schoolId: school.id,
          facilityName: 'Aula Serbaguna',
          facilityType: 'Hall',
          capacity: 200,
          location: 'Lantai 2, Gedung Utama',
          condition: 'good',
          notes: 'Aula untuk kegiatan upacara dan acara sekolah'
        },
        {
          schoolId: school.id,
          facilityName: 'Ruang Guru',
          facilityType: 'Office',
          capacity: 20,
          location: 'Lantai 1, Gedung Utama',
          condition: 'good',
          notes: 'Ruang kerja untuk para guru'
        },
        {
          schoolId: school.id,
          facilityName: 'Ruang Kepala Sekolah',
          facilityType: 'Office',
          capacity: 10,
          location: 'Lantai 1, Gedung Utama',
          condition: 'good',
          notes: 'Ruang kerja kepala sekolah dan meeting'
        }
      ]
    });

    console.log(`✅ Created ${facilities.count} facilities`);

    // Get created facilities for usage records
    const createdFacilities = await prisma.facility.findMany({
      where: { schoolId: school.id }
    });

    // Get users for facility usage
    const users = await prisma.user.findMany({
      where: { 
        OR: [
          { role: 'principal' },
          { role: 'teacher' }
        ]
      }
    });

    if (users.length === 0) {
      console.log('⚠️ No users found for facility usage. Skipping facility usage seeding.');
    } else {
      // ===== SEED FACILITY USAGE =====
      console.log('📅 Seeding facility usage records...');

      const facilityUsages = await prisma.facilityUsage.createMany({
        data: [
          {
            facilityId: createdFacilities.find(f => f.facilityName === 'Aula Serbaguna')?.id || createdFacilities[0].id,
            date: new Date('2025-07-15'), // Changed to 2025
            startTime: new Date('2025-07-15T08:00:00.000Z'), // Changed to 2025
            endTime: new Date('2025-07-15T10:00:00.000Z'), // Changed to 2025
            purpose: 'Upacara Bendera Hari Senin',
            userId: users[0].id,
            approvalStatus: 'approved',
            notes: 'Upacara rutin setiap hari Senin'
          },
          {
            facilityId: createdFacilities.find(f => f.facilityName === 'Laboratorium Komputer')?.id || createdFacilities[1].id,
            date: new Date('2025-07-16'), // Changed to 2025
            startTime: new Date('2025-07-16T10:00:00.000Z'), // Changed to 2025
            endTime: new Date('2025-07-16T12:00:00.000Z'), // Changed to 2025
            purpose: 'Pembelajaran TIK Kelas 6A',
            userId: users[0].id,
            approvalStatus: 'approved',
            notes: 'Pembelajaran komputer untuk kelas 6A'
          },
          {
            facilityId: createdFacilities.find(f => f.facilityName === 'Lapangan Olahraga')?.id || createdFacilities[2].id,
            date: new Date('2025-07-17'), // Changed to 2025
            startTime: new Date('2025-07-17T07:00:00.000Z'), // Changed to 2025
            endTime: new Date('2025-07-17T09:00:00.000Z'), // Changed to 2025
            purpose: 'Olahraga Kelas 5A dan 5B',
            userId: users[0].id,
            approvalStatus: 'approved',
            notes: 'Pelajaran olahraga gabungan kelas 5'
          },
          {
            facilityId: createdFacilities.find(f => f.facilityName === 'Perpustakaan')?.id || createdFacilities[3].id,
            date: new Date('2025-07-18'), // Changed to 2025
            startTime: new Date('2025-07-18T13:00:00.000Z'), // Changed to 2025
            endTime: new Date('2025-07-18T15:00:00.000Z'), // Changed to 2025
            purpose: 'Kegiatan Membaca Bersama',
            userId: users[0].id,
            approvalStatus: 'pending',
            notes: 'Program literasi untuk semua kelas'
          },
          {
            facilityId: createdFacilities.find(f => f.facilityName === 'Aula Serbaguna')?.id || createdFacilities[0].id,
            date: new Date('2025-07-20'), // Changed to 2025
            startTime: new Date('2025-07-20T19:00:00.000Z'), // Changed to 2025
            endTime: new Date('2025-07-20T21:00:00.000Z'), // Changed to 2025
            purpose: 'Rapat Komite Sekolah',
            userId: users[0].id,
            approvalStatus: 'pending',
            notes: 'Rapat evaluasi semester dengan komite sekolah'
          },
          {
            facilityId: createdFacilities.find(f => f.facilityName === 'Ruang Kepala Sekolah')?.id || createdFacilities[4].id,
            date: new Date('2025-07-19'), // Changed to 2025
            startTime: new Date('2025-07-19T14:00:00.000Z'), // Changed to 2025
            endTime: new Date('2025-07-19T16:00:00.000Z'), // Changed to 2025
            purpose: 'Meeting dengan Pengawas Sekolah',
            userId: users[0].id,
            approvalStatus: 'approved',
            notes: 'Supervisi akademik dan manajerial'
          }
        ]
      });

      console.log(`✅ Created ${facilityUsages.count} facility usage records`);
    }

    console.log('🎉 Resource data seeding completed successfully!');

    // ===== SUMMARY =====
    console.log('\n📊 SEEDING SUMMARY:');
    console.log('='.repeat(50));
    console.log(`🏫 School: ${school.schoolName}`);
    console.log(`📦 Assets: ${assets.count}`);
    console.log(`🔧 Maintenance Records: ${maintenanceRecords.count}`);
    console.log(`💰 Budget Records: ${budgets.count}`);
    console.log(`💳 Financial Transactions: ${transactions.count}`);
    console.log(`🏢 Facilities: ${facilities.count}`);
    
    if (users.length > 0) {
      console.log(`📅 Facility Usage Records: ${await prisma.facilityUsage.count()}`);
    }
    
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ Error during resource seeding:', error);
    throw error;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });