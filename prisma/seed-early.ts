// scripts/warningDataSeeder.ts
// Script untuk mengisi data dummy yang diperlukan untuk analisis early warning

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedWarningData() {
  try {
    console.log('🌱 Starting to seed warning analysis data...');

    // 1. Seed some students with attendance issues
    const students = await prisma.student.findMany({
      take: 10,
      include: { school: true }
    });

    if (students.length > 0) {
      console.log('📚 Creating attendance records...');
      
      // Create attendance records for last 30 days
      for (const student of students.slice(0, 5)) {
        for (let i = 0; i < 30; i++) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          
          // Simulate some students with poor attendance
          const attendanceRate = student.id % 3 === 0 ? 0.6 : 0.9; // 60% vs 90%
          const status = Math.random() < attendanceRate ? 'present' : 'unexcused';
          
          try {
            await prisma.studentAttendance.create({
              data: {
                studentId: student.id,
                date: date,
                status: status as any,
                recordedBy: 1 // Assuming user ID 1 exists
              }
            });
          } catch (error) {
            // Skip if already exists
          }
        }
      }
    }

    // 2. Seed some academic records with poor performance
    const subjects = await prisma.subject.findMany({ take: 5 });
    
    if (subjects.length > 0 && students.length > 0) {
      console.log('📊 Creating academic records...');
      
      const currentYear = new Date().getFullYear();
      const academicYear = `${currentYear}/${currentYear + 1}`;
      
      for (const student of students.slice(0, 5)) {
        for (const subject of subjects) {
          // Simulate some subjects with low scores
          const baseScore = subject.id % 2 === 0 ? 60 : 80; // 60 vs 80 base
          const finalScore = baseScore + (Math.random() * 20 - 10); // ±10 variance
          
          try {
            await prisma.academicRecord.create({
              data: {
                studentId: student.id,
                subjectId: subject.id,
                teacherId: 1, // Assuming teacher ID 1 exists
                semester: '1',
                academicYear: academicYear,
                finalScore: Math.max(0, Math.min(100, finalScore))
              }
            });
          } catch (error) {
            // Skip if already exists
          }
        }
      }
    }

    // 3. Seed school finances with budget issues
    const schools = await prisma.school.findMany({ take: 3 });
    
    if (schools.length > 0) {
      console.log('💰 Creating finance records...');
      
      const currentYear = new Date().getFullYear().toString();
      const categories = ['Operasional', 'Pemeliharaan', 'Pengembangan'];
      
      for (const school of schools) {
        for (const category of categories) {
          const budgetAmount = 100000000; // 100 million
          const usedAmount = category === 'Pemeliharaan' ? 85000000 : 50000000; // High usage for maintenance
          
          try {
            await prisma.schoolFinance.create({
              data: {
                schoolId: school.id,
                budgetYear: currentYear,
                period: 'Tahunan',
                budgetCategory: category,
                budgetAmount: budgetAmount,
                usedAmount: usedAmount,
                remainingAmount: budgetAmount - usedAmount,
                approvalStatus: true
              }
            });
          } catch (error) {
            // Skip if already exists
          }
        }
      }
    }

    // 4. Seed assets with maintenance needs
    if (schools.length > 0) {
      console.log('🏢 Creating asset records...');
      
      const assetTypes = [
        { name: 'AC Ruang Kelas 1A', category: 'Elektronik', condition: 'minor_damage' },
        { name: 'Proyektor Aula', category: 'Elektronik', condition: 'major_damage' },
        { name: 'Meja Guru Kelas 2B', category: 'Furniture', condition: 'under_repair' },
        { name: 'Komputer Lab', category: 'Elektronik', condition: 'minor_damage' },
        { name: 'Papan Tulis Kelas 3A', category: 'Peralatan', condition: 'good' }
      ];
      
      for (const school of schools) {
        for (const asset of assetTypes) {
          try {
            await prisma.asset.create({
              data: {
                schoolId: school.id,
                assetCode: `${school.id}-${asset.category}-${Date.now()}`,
                assetName: asset.name,
                assetCategory: asset.category,
                condition: asset.condition as any,
                acquisitionDate: new Date('2023-01-01'),
                acquisitionValue: 5000000
              }
            });
          } catch (error) {
            // Skip if already exists
          }
        }
      }
    }

    // 5. Seed reports with pending deadlines
    if (schools.length > 0) {
      console.log('📋 Creating report records...');
      
      const reportTypes = [
        { title: 'Laporan Bulanan Dinas', type: 'Bulanan', status: 'pending', daysFromNow: 2 },
        { title: 'Evaluasi Semester', type: 'Semester', status: 'draft', daysFromNow: 5 },
        { title: 'Laporan Keuangan', type: 'Triwulan', status: 'pending', daysFromNow: 1 }
      ];
      
      const currentYear = new Date().getFullYear().toString();
      
      for (const school of schools) {
        for (const report of reportTypes) {
          const submissionDate = new Date();
          submissionDate.setDate(submissionDate.getDate() + report.daysFromNow);
          
          try {
            await prisma.report.create({
              data: {
                schoolId: school.id,
                reportTitle: report.title,
                reportType: report.type,
                reportPeriod: 'Current',
                academicYear: currentYear,
                submissionStatus: report.status,
                submissionDate: submissionDate,
                createdBy: 1 // Assuming user ID 1 exists
              }
            });
          } catch (error) {
            // Skip if already exists
          }
        }
      }
    }

    console.log('✅ Warning analysis data seeding completed!');
    console.log('🔍 You can now run early warning analysis on schools');

  } catch (error) {
    console.error('❌ Seeding error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run seeder if called directly
if (require.main === module) {
  seedWarningData()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export default seedWarningData;