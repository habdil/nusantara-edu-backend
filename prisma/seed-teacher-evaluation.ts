import { PrismaClient, AttendanceStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting teacher evaluation data seeding...');

  // Get existing schools with teachers
  const schools = await prisma.school.findMany({
    where: {
      principalId: { not: null }
    },
    include: {
      teachers: true,
      principal: true
    }
  });

  if (schools.length === 0) {
    console.log('❌ No schools with principals found. Please run auth and academic seeders first.');
    return;
  }

  let totalEvaluations = 0;
  let totalDevelopmentPrograms = 0;
  let totalTeacherAttendance = 0;

  console.log(`📚 Found ${schools.length} schools. Creating teacher evaluation data...`);

  for (const school of schools) {
    if (school.teachers.length === 0) {
      console.log(`⚠️  Skipping ${school.schoolName} - no teachers found`);
      continue;
    }

    console.log(`\n🏫 Creating teacher evaluation data for ${school.schoolName}...`);
    console.log(`   👨‍🏫 Found ${school.teachers.length} teachers`);

    // Create teacher performance evaluations
    const currentYear = '2024/2025';
    const previousYear = '2023/2024';
    const evaluationPeriods = ['Semester 1', 'Semester 2', 'Tahunan'];
    
    for (const teacher of school.teachers) {
      // Create evaluations for current and previous year
      for (const academicYear of [currentYear, previousYear]) {
        for (const period of evaluationPeriods) {
          // Skip if already exists
          const existingEvaluation = await prisma.teacherPerformance.findUnique({
            where: {
              teacher_evaluation_period: {
                teacherId: teacher.id,
                evaluationPeriod: period,
                academicYear: academicYear
              }
            }
          });

          if (existingEvaluation) continue;

          // Generate realistic scores
          const baseScore = generateBaseScore(teacher.employmentStatus);
          const scores = generateEvaluationScores(baseScore);
          const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.keys(scores).length;

          const evaluation = await prisma.teacherPerformance.create({
            data: {
              teacherId: teacher.id,
              evaluationPeriod: period,
              academicYear: academicYear,
              disciplineScore: scores.discipline,
              teachingScore: scores.teaching,
              selfDevelopmentScore: scores.selfDevelopment,
              contributionScore: scores.contribution,
              totalScore: Number(totalScore.toFixed(2)),
              evaluationNotes: generateEvaluationNotes(totalScore),
              evaluatorId: school.principalId,
              evaluationDate: generateEvaluationDate(academicYear, period),
              createdAt: new Date(),
              updatedAt: new Date()
            }
          });

          // Create performance details (recommendations and development goals)
          const recommendations = generateRecommendations(totalScore);
          const developmentGoals = generateDevelopmentGoals(teacher.subjectArea);

          // Add recommendations as performance details
          for (let i = 0; i < recommendations.length; i++) {
            await prisma.teacherPerformanceDetail.create({
              data: {
                teacherPerformanceId: evaluation.id,
                assessmentCategory: 'recommendations',
                indicator: `Rekomendasi ${i + 1}`,
                score: 0,
                notes: recommendations[i],
                createdAt: new Date(),
                updatedAt: new Date()
              }
            });
          }

          // Add development goals as performance details
          for (let i = 0; i < developmentGoals.length; i++) {
            await prisma.teacherPerformanceDetail.create({
              data: {
                teacherPerformanceId: evaluation.id,
                assessmentCategory: 'development_goals',
                indicator: `Tujuan Pengembangan ${i + 1}`,
                score: 0,
                notes: developmentGoals[i],
                createdAt: new Date(),
                updatedAt: new Date()
              }
            });
          }

          totalEvaluations++;
        }
      }
    }

    // Create teacher development programs
    for (const teacher of school.teachers) {
      const programCount = Math.floor(Math.random() * 4) + 2; // 2-5 programs per teacher
      
      for (let i = 0; i < programCount; i++) {
        const programData = generateDevelopmentProgram(teacher.subjectArea);
        
        await prisma.teacherDevelopment.upsert({
          where: {
            id: -1 // Use impossible ID so it always creates
          },
          update: {},
          create: {
            teacherId: teacher.id,
            developmentType: programData.developmentType,
            activityName: programData.activityName,
            organizer: programData.organizer,
            startDate: programData.startDate,
            endDate: programData.endDate,
            totalHours: programData.totalHours,
            certificate: programData.certificate,
            description: programData.description,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });

        totalDevelopmentPrograms++;
      }
    }

    // Create teacher attendance records for the last 60 days
    const today = new Date();
    
    for (const teacher of school.teachers) {
      for (let dayOffset = 0; dayOffset < 60; dayOffset++) {
        const attendanceDate = new Date(today);
        attendanceDate.setDate(today.getDate() - dayOffset);
        
        // Skip weekends
        if (attendanceDate.getDay() === 0 || attendanceDate.getDay() === 6) continue;

        const status = generateTeacherAttendanceStatus(teacher.employmentStatus);
        
        await prisma.teacherAttendance.upsert({
          where: {
            teacher_date: {
              teacherId: teacher.id,
              date: attendanceDate
            }
          },
          update: {}, // Don't update if exists
          create: {
            teacherId: teacher.id,
            date: attendanceDate,
            status: status,
            checkInTime: status === AttendanceStatus.present ? 
              new Date(attendanceDate.setHours(7 + Math.floor(Math.random() * 1), Math.floor(Math.random() * 60), 0, 0)) : 
              null,
            checkOutTime: status === AttendanceStatus.present ? 
              new Date(attendanceDate.setHours(14 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60), 0, 0)) : 
              null,
            notes: status !== AttendanceStatus.present ? generateAttendanceNotes(status) : null,
            recordedBy: school.principalId,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });

        totalTeacherAttendance++;
      }
    }

    console.log(`  ✅ ${school.teachers.length * evaluationPeriods.length * 2} evaluations (current + previous year)`);
    console.log(`  ✅ ${school.teachers.length * 3} development programs (avg)`);
    console.log(`  ✅ Teacher attendance records for 60 days`);
  }

  console.log('\n🎉 Teacher evaluation data seeding completed!');
  console.log('\n📊 Summary:');
  console.log(`- ${totalEvaluations} teacher evaluations created`);
  console.log(`- ${totalDevelopmentPrograms} development programs created`);
  console.log(`- ${totalTeacherAttendance} teacher attendance records created`);
  
  console.log('\n🔍 You can now test the teacher evaluation endpoints with real data!');
  console.log('💡 Use Postman to test endpoints like:');
  console.log('  - GET /api/teacher-evaluation/stats');
  console.log('  - GET /api/teacher-evaluation/evaluations');
  console.log('  - GET /api/teacher-evaluation/development-programs');
  console.log('  - POST /api/teacher-evaluation/evaluations');
}

// Helper functions to generate realistic teacher evaluation data

function generateBaseScore(employmentStatus: string | null): number {
  // PNS teachers tend to have slightly higher scores
  if (employmentStatus === 'PNS') {
    return 3.8 + Math.random() * 1.2; // 3.8 - 5.0
  } else {
    return 3.5 + Math.random() * 1.3; // 3.5 - 4.8
  }
}

function generateEvaluationScores(baseScore: number) {
  const variation = 0.3;
  return {
    discipline: Math.min(5, Math.max(1, baseScore + (Math.random() - 0.5) * variation)),
    teaching: Math.min(5, Math.max(1, baseScore + (Math.random() - 0.5) * variation)),
    selfDevelopment: Math.min(5, Math.max(1, baseScore + (Math.random() - 0.5) * variation)),
    contribution: Math.min(5, Math.max(1, baseScore + (Math.random() - 0.5) * variation))
  };
}

function generateEvaluationNotes(totalScore: number): string {
  if (totalScore >= 4.5) {
    const excellentNotes = [
      'Guru yang sangat berdedikasi dengan metode pengajaran yang inovatif',
      'Menunjukkan komitmen tinggi terhadap pengembangan siswa',
      'Prestasi mengajar yang sangat memuaskan dan konsisten',
      'Menjadi teladan bagi guru-guru lainnya'
    ];
    return excellentNotes[Math.floor(Math.random() * excellentNotes.length)];
  } else if (totalScore >= 4.0) {
    const goodNotes = [
      'Performa mengajar yang baik dan stabil',
      'Menunjukkan dedikasi yang baik terhadap profesi',
      'Perlu sedikit peningkatan dalam beberapa aspek',
      'Guru yang dapat diandalkan dengan hasil yang memuaskan'
    ];
    return goodNotes[Math.floor(Math.random() * goodNotes.length)];
  } else {
    const improvementNotes = [
      'Perlu peningkatan dalam metode pengajaran',
      'Memerlukan bimbingan lebih intensif',
      'Potensi baik namun perlu pengembangan lebih lanjut',
      'Membutuhkan pelatihan tambahan untuk meningkatkan kinerja'
    ];
    return improvementNotes[Math.floor(Math.random() * improvementNotes.length)];
  }
}

function generateRecommendations(totalScore: number): string[] {
  const recommendations = [];
  
  if (totalScore >= 4.5) {
    const excellentRecommendations = [
      'Lanjutkan penggunaan metode mengajar yang inovatif',
      'Berbagi best practice dengan guru lain',
      'Menjadi mentor untuk guru junior',
      'Ikuti pelatihan tingkat lanjut untuk pengembangan karir'
    ];
    recommendations.push(...excellentRecommendations.slice(0, 2));
  } else if (totalScore >= 4.0) {
    const goodRecommendations = [
      'Tingkatkan variasi metode pembelajaran',
      'Ikuti workshop pengembangan kurikulum',
      'Perbanyak kolaborasi dengan sesama guru',
      'Manfaatkan teknologi dalam pembelajaran'
    ];
    recommendations.push(...goodRecommendations.slice(0, 2));
  } else {
    const improvementRecommendations = [
      'Ikuti pelatihan classroom management',
      'Perbaiki teknik penyampaian materi',
      'Tingkatkan interaksi dengan siswa',
      'Konsultasi rutin dengan kepala sekolah'
    ];
    recommendations.push(...improvementRecommendations.slice(0, 3));
  }
  
  return recommendations;
}

function generateDevelopmentGoals(subjectArea: string): string[] {
  const generalGoals = [
    'Meningkatkan kemampuan mengajar yang efektif',
    'Mengembangkan keterampilan penilaian autentik',
    'Memperkuat manajemen kelas',
    'Meningkatkan kemampuan komunikasi dengan siswa'
  ];
  
  const subjectSpecificGoals: { [key: string]: string[] } = {
    'Matematika': [
      'Menguasai pendekatan matematika kontekstual',
      'Mengembangkan media pembelajaran matematika interaktif'
    ],
    'Bahasa Indonesia': [
      'Meningkatkan kemampuan membimbing literasi siswa',
      'Mengembangkan teknik storytelling yang menarik'
    ],
    'IPA': [
      'Menguasai metode eksperimen sederhana',
      'Mengintegrasikan sains dan teknologi dalam pembelajaran'
    ],
    'IPS': [
      'Mengembangkan pembelajaran berbasis lingkungan sekitar',
      'Meningkatkan kemampuan mengajar sejarah lokal'
    ],
    'PJOK': [
      'Meningkatkan variasi permainan edukatif',
      'Mengembangkan program kesehatan siswa'
    ]
  };
  
  const goals = [...generalGoals.slice(0, 1)];
  const specificGoals = subjectSpecificGoals[subjectArea] || [];
  goals.push(...specificGoals.slice(0, 1));
  
  return goals;
}

function generateDevelopmentProgram(subjectArea: string) {
  const currentYear = new Date().getFullYear();
  const developmentTypes = ['Pelatihan', 'Workshop', 'Sertifikasi', 'Seminar'];
  const organizers = ['Kemendikbud', 'LPMP', 'LPTK', 'Universitas Negeri'];
  
  const activities = [
    'Pelatihan Kurikulum Merdeka',
    'Workshop Pembelajaran Digital', 
    'Sertifikasi Guru Profesional',
    'Seminar Pendidikan Karakter',
    'Pelatihan Teknologi Pendidikan',
    'Workshop Classroom Management',
    'Sertifikasi Kompetensi Guru'
  ];

  const activity = activities[Math.floor(Math.random() * activities.length)];
  const devType = developmentTypes[Math.floor(Math.random() * developmentTypes.length)];
  const organizer = organizers[Math.floor(Math.random() * organizers.length)];
  
  const startMonth = Math.floor(Math.random() * 12) + 1;
  const startDay = Math.floor(Math.random() * 28) + 1;
  const startDate = new Date(currentYear - 1 + Math.floor(Math.random() * 2), startMonth - 1, startDay);
  const endDate = new Date(startDate);
  const totalHours = [8, 16, 24, 32, 40, 80][Math.floor(Math.random() * 6)];
  endDate.setDate(startDate.getDate() + Math.floor(totalHours / 8) + 1);

  return {
    activityName: activity,
    developmentType: devType,
    organizer: organizer,
    startDate,
    endDate,
    totalHours,
    certificate: Math.random() > 0.3 ? `https://example.com/certificate-${Math.random().toString(36).substr(2, 9)}.pdf` : null,
    description: `${devType} untuk meningkatkan kompetensi guru dalam bidang ${subjectArea}`
  };
}

function generateEvaluationDate(academicYear: string, period: string): Date {
  const year = parseInt(academicYear.split('/')[0]);
  
  if (period === 'Semester 1') {
    return new Date(year, 11, 15); // December 15
  } else if (period === 'Semester 2') {
    return new Date(year + 1, 5, 15); // June 15
  } else { // Tahunan
    return new Date(year + 1, 6, 1); // July 1
  }
}

function generateTeacherAttendanceStatus(employmentStatus: string | null): AttendanceStatus {
  // PNS teachers have better attendance
  if (employmentStatus === 'PNS') {
    const statuses = [AttendanceStatus.present, AttendanceStatus.excused, AttendanceStatus.sick];
    const weights = [0.92, 0.05, 0.03]; // 92% present, 5% excused, 3% sick
    
    const random = Math.random();
    if (random < weights[0]) return AttendanceStatus.present;
    if (random < weights[0] + weights[1]) return AttendanceStatus.excused;
    return AttendanceStatus.sick;
  } else {
    const statuses = [AttendanceStatus.present, AttendanceStatus.excused, AttendanceStatus.sick, AttendanceStatus.unexcused];
    const weights = [0.88, 0.06, 0.04, 0.02]; // 88% present, 6% excused, 4% sick, 2% unexcused
    
    const random = Math.random();
    if (random < weights[0]) return AttendanceStatus.present;
    if (random < weights[0] + weights[1]) return AttendanceStatus.excused;
    if (random < weights[0] + weights[1] + weights[2]) return AttendanceStatus.sick;
    return AttendanceStatus.unexcused;
  }
}

function generateAttendanceNotes(status: AttendanceStatus): string {
  const notes: { [key in AttendanceStatus]?: string[] } = {
    [AttendanceStatus.excused]: [
      'Menghadiri rapat dinas',
      'Pelatihan di luar sekolah',
      'Urusan keluarga mendesak'
    ],
    [AttendanceStatus.sick]: [
      'Sakit demam',
      'Konsultasi dokter',
      'Istirahat medis'
    ],
    [AttendanceStatus.unexcused]: [
      'Tidak ada keterangan',
      'Terlambat tanpa izin'
    ]
  };

  const statusNotes = notes[status] || [''];
  return statusNotes[Math.floor(Math.random() * statusNotes.length)];
}

main()
  .catch((e) => {
    console.error('❌ Teacher evaluation seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });