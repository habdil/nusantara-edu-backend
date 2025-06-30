import { PrismaClient, Gender, AttendanceStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting academic data seeding...');

  // Get existing schools
  const schools = await prisma.school.findMany({
    where: {
      principalId: { not: null }
    },
    select: { id: true, schoolName: true, npsn: true }
  });

  if (schools.length === 0) {
    console.log('❌ No schools with principals found. Please run auth seeder first.');
    return;
  }

  console.log(`📚 Found ${schools.length} schools. Creating academic data...`);

  // Create subjects for elementary school
  const subjects = await Promise.all([
    prisma.subject.upsert({
      where: { subjectCode: 'MTK' },
      update: {},
      create: {
        subjectCode: 'MTK',
        subjectName: 'Matematika',
        description: 'Mata pelajaran matematika untuk sekolah dasar',
        gradeLevel: '1,2,3,4,5,6',
        weeklyHours: 6,
        curriculum: 'Kurikulum Merdeka',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }),
    prisma.subject.upsert({
      where: { subjectCode: 'IPA' },
      update: {},
      create: {
        subjectCode: 'IPA',
        subjectName: 'Ilmu Pengetahuan Alam',
        description: 'Mata pelajaran sains untuk sekolah dasar',
        gradeLevel: '4,5,6',
        weeklyHours: 5,
        curriculum: 'Kurikulum Merdeka',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }),
    prisma.subject.upsert({
      where: { subjectCode: 'IPS' },
      update: {},
      create: {
        subjectCode: 'IPS',
        subjectName: 'Ilmu Pengetahuan Sosial',
        description: 'Mata pelajaran sosial untuk sekolah dasar',
        gradeLevel: '4,5,6',
        weeklyHours: 4,
        curriculum: 'Kurikulum Merdeka',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }),
    prisma.subject.upsert({
      where: { subjectCode: 'BIN' },
      update: {},
      create: {
        subjectCode: 'BIN',
        subjectName: 'Bahasa Indonesia',
        description: 'Mata pelajaran bahasa Indonesia',
        gradeLevel: '1,2,3,4,5,6',
        weeklyHours: 8,
        curriculum: 'Kurikulum Merdeka',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }),
    prisma.subject.upsert({
      where: { subjectCode: 'BING' },
      update: {},
      create: {
        subjectCode: 'BING',
        subjectName: 'Bahasa Inggris',
        description: 'Mata pelajaran bahasa Inggris',
        gradeLevel: '4,5,6',
        weeklyHours: 2,
        curriculum: 'Kurikulum Merdeka',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }),
    prisma.subject.upsert({
      where: { subjectCode: 'PJOK' },
      update: {},
      create: {
        subjectCode: 'PJOK',
        subjectName: 'Pendidikan Jasmani, Olahraga dan Kesehatan',
        description: 'Mata pelajaran olahraga dan kesehatan',
        gradeLevel: '1,2,3,4,5,6',
        weeklyHours: 4,
        curriculum: 'Kurikulum Merdeka',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }),
    prisma.subject.upsert({
      where: { subjectCode: 'PAI' },
      update: {},
      create: {
        subjectCode: 'PAI',
        subjectName: 'Pendidikan Agama Islam',
        description: 'Mata pelajaran pendidikan agama Islam',
        gradeLevel: '1,2,3,4,5,6',
        weeklyHours: 3,
        curriculum: 'Kurikulum Merdeka',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }),
    prisma.subject.upsert({
      where: { subjectCode: 'PPKN' },
      update: {},
      create: {
        subjectCode: 'PPKN',
        subjectName: 'Pendidikan Pancasila dan Kewarganegaraan',
        description: 'Mata pelajaran pendidikan kewarganegaraan',
        gradeLevel: '1,2,3,4,5,6',
        weeklyHours: 2,
        curriculum: 'Kurikulum Merdeka',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
  ]);

  console.log(`✅ Created ${subjects.length} subjects`);

  // Create basic competencies for each subject
  const competencies: Awaited<ReturnType<typeof prisma.basicCompetency.upsert>>[] = [];
  for (const subject of subjects) {
    if (subject.subjectCode === 'MTK') {
      const mathCompetencies = await Promise.all([
        prisma.basicCompetency.upsert({
          where: { 
            subject_competency: { 
              subjectId: subject.id, 
              competencyCode: '3.1' 
            } 
          },
          update: {},
          create: {
            subjectId: subject.id,
            competencyCode: '3.1',
            competencyDescription: 'Memahami bilangan cacah dan pecahan sederhana',
            difficultyLevel: 'basic',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        }),
        prisma.basicCompetency.upsert({
          where: { 
            subject_competency: { 
              subjectId: subject.id, 
              competencyCode: '3.2' 
            } 
          },
          update: {},
          create: {
            subjectId: subject.id,
            competencyCode: '3.2',
            competencyDescription: 'Memahami operasi hitung penjumlahan dan pengurangan',
            difficultyLevel: 'intermediate',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        }),
        prisma.basicCompetency.upsert({
          where: { 
            subject_competency: { 
              subjectId: subject.id, 
              competencyCode: '3.3' 
            } 
          },
          update: {},
          create: {
            subjectId: subject.id,
            competencyCode: '3.3',
            competencyDescription: 'Memahami konsep geometri sederhana',
            difficultyLevel: 'advanced',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        })
      ]);
      competencies.push(...mathCompetencies);
    }
  }

  console.log(`✅ Created ${competencies.length} basic competencies`);

  // Create academic data for each school
  let totalTeachers = 0;
  let totalStudents = 0;
  let totalAcademicRecords = 0;
  let totalAttendanceRecords = 0;

  for (const school of schools) {
    console.log(`\n🏫 Creating data for ${school.schoolName}...`);

    // Create teachers for this school
    const teachers = await Promise.all([
      prisma.teacher.upsert({
        where: { employeeId: `T${school.id}001` },
        update: {},
        create: {
          employeeId: `T${school.id}001`,
          fullName: 'Budi Santoso, S.Pd',
          schoolId: school.id,
          gender: Gender.male,
          birthDate: new Date('1985-03-15'),
          address: 'Jl. Pendidikan No. 10, Jakarta',
          email: `budi.santoso@${school.npsn}.sch.id`,
          phoneNumber: '+62812345671' + school.id,
          subjectArea: 'Matematika',
          position: 'Guru Kelas',
          employmentStatus: 'PNS',
          educationLevel: 'S1',
          teachingStartYear: 2010,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      }),
      prisma.teacher.upsert({
        where: { employeeId: `T${school.id}002` },
        update: {},
        create: {
          employeeId: `T${school.id}002`,
          fullName: 'Sari Dewi, S.Pd',
          schoolId: school.id,
          gender: Gender.female,
          birthDate: new Date('1987-07-22'),
          address: 'Jl. Guru No. 5, Jakarta',
          email: `sari.dewi@${school.npsn}.sch.id`,
          phoneNumber: '+62812345672' + school.id,
          subjectArea: 'Bahasa Indonesia',
          position: 'Guru Kelas',
          employmentStatus: 'PNS',
          educationLevel: 'S1',
          teachingStartYear: 2012,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      }),
      prisma.teacher.upsert({
        where: { employeeId: `T${school.id}003` },
        update: {},
        create: {
          employeeId: `T${school.id}003`,
          fullName: 'Ahmad Hidayat, S.Pd',
          schoolId: school.id,
          gender: Gender.male,
          birthDate: new Date('1983-11-08'),
          address: 'Jl. Ilmu No. 15, Jakarta',
          email: `ahmad.hidayat@${school.npsn}.sch.id`,
          phoneNumber: '+62812345673' + school.id,
          subjectArea: 'IPA',
          position: 'Guru Mata Pelajaran',
          employmentStatus: 'PNS',
          educationLevel: 'S1',
          teachingStartYear: 2008,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      }),
      prisma.teacher.upsert({
        where: { employeeId: `T${school.id}004` },
        update: {},
        create: {
          employeeId: `T${school.id}004`,
          fullName: 'Rina Wati, S.Pd',
          schoolId: school.id,
          gender: Gender.female,
          birthDate: new Date('1989-04-12'),
          address: 'Jl. Sosial No. 8, Jakarta',
          email: `rina.wati@${school.npsn}.sch.id`,
          phoneNumber: '+62812345674' + school.id,
          subjectArea: 'IPS',
          position: 'Guru Mata Pelajaran',
          employmentStatus: 'Honorer',
          educationLevel: 'S1',
          teachingStartYear: 2015,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      }),
      prisma.teacher.upsert({
        where: { employeeId: `T${school.id}005` },
        update: {},
        create: {
          employeeId: `T${school.id}005`,
          fullName: 'Doni Pratama, S.Pd',
          schoolId: school.id,
          gender: Gender.male,
          birthDate: new Date('1986-09-03'),
          address: 'Jl. Olahraga No. 12, Jakarta',
          email: `doni.pratama@${school.npsn}.sch.id`,
          phoneNumber: '+62812345675' + school.id,
          subjectArea: 'PJOK',
          position: 'Guru Mata Pelajaran',
          employmentStatus: 'PNS',
          educationLevel: 'S1',
          teachingStartYear: 2011,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
    ]);

    totalTeachers += teachers.length;

    // Create students for each grade (1-6)
    const students: Awaited<ReturnType<typeof prisma.student.upsert>>[] = [];
    for (let grade = 1; grade <= 6; grade++) {
      const studentsPerGrade = Math.floor(Math.random() * 10) + 15; // 15-25 students per grade
      
      for (let i = 1; i <= studentsPerGrade; i++) {
        const studentNumber = String(grade) + String(i).padStart(2, '0');
        const student = await prisma.student.upsert({
          where: { studentId: `${school.npsn}${studentNumber}` },
          update: {},
          create: {
            studentId: `${school.npsn}${studentNumber}`,
            nationalStudentId: `${school.npsn}${grade}${String(i).padStart(3, '0')}`,
            fullName: generateStudentName(),
            schoolId: school.id,
            grade: String(grade),
            gender: Math.random() > 0.5 ? Gender.male : Gender.female,
            birthDate: new Date(`${2018 - grade}-${Math.floor(Math.random() * 12) + 1}-${Math.floor(Math.random() * 28) + 1}`),
            address: `Jl. Siswa No. ${i}, Jakarta`,
            parentName: generateParentName(),
            parentContact: `+6281234567${String(school.id) + String(grade) + String(i).padStart(2, '0')}`,
            enrollmentDate: new Date(`${2024 - grade + 1}-07-01`),
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
        students.push(student);
      }
    }

    totalStudents += students.length;

    // Create academic records for students in grades 4, 5, 6 (who have more subjects)
    const academicRecords: Awaited<ReturnType<typeof prisma.academicRecord.upsert>>[] = [];
    const currentYear = '2024/2025';
    
    for (const student of students) {
      if (['4', '5', '6'].includes(student.grade)) {
        // Get subjects appropriate for this grade
        const gradeSubjects = subjects.filter(subject => 
          subject.gradeLevel.includes(student.grade)
        );

        for (const subject of gradeSubjects) {
          // Find appropriate teacher for this subject
          const teacher = teachers.find(t => t.subjectArea === subject.subjectName) || teachers[0];

          // Create records for both semesters
          for (const semester of ['1', '2']) {
            const record = await prisma.academicRecord.upsert({
              where: {
                student_subject_period: {
                  studentId: student.id,
                  subjectId: subject.id,
                  semester: semester,
                  academicYear: currentYear
                }
              },
              update: {},
              create: {
                studentId: student.id,
                subjectId: subject.id,
                teacherId: teacher.id,
                semester: semester,
                academicYear: currentYear,
                knowledgeScore: generateScore(),
                skillScore: generateScore(),
                attitudeScore: generateAttitudeScore(),
                midtermExamScore: generateScore(),
                finalExamScore: generateScore(),
                finalScore: generateScore(),
                teacherNotes: generateTeacherNotes(),
                createdAt: new Date(),
                updatedAt: new Date()
              }
            });
            academicRecords.push(record);
          }
        }
      }
    }

    totalAcademicRecords += academicRecords.length;

    // Create attendance records for the last 30 days
    const attendanceRecords: Awaited<ReturnType<typeof prisma.studentAttendance.upsert>>[] = [];
    const today = new Date();
    
    for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
      const attendanceDate = new Date(today);
      attendanceDate.setDate(today.getDate() - dayOffset);
      
      // Skip weekends
      if (attendanceDate.getDay() === 0 || attendanceDate.getDay() === 6) continue;

      for (const student of students.slice(0, Math.min(students.length, 50))) { // Limit to 50 students for performance
        const attendance = await prisma.studentAttendance.upsert({
          where: {
            student_date: {
              studentId: student.id,
              date: attendanceDate
            }
          },
          update: {},
          create: {
            studentId: student.id,
            date: attendanceDate,
            status: generateAttendanceStatus(),
            checkInTime: new Date(attendanceDate.setHours(7 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60), 0, 0)),
            checkOutTime: new Date(attendanceDate.setHours(12 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60), 0, 0)),
            notes: Math.random() > 0.8 ? 'Catatan kehadiran' : null,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
        attendanceRecords.push(attendance);
      }
    }

    totalAttendanceRecords += attendanceRecords.length;

    console.log(`  ✅ ${teachers.length} teachers`);
    console.log(`  ✅ ${students.length} students`);
    console.log(`  ✅ ${academicRecords.length} academic records`);
    console.log(`  ✅ ${attendanceRecords.length} attendance records`);
  }

  console.log('\n🎉 Academic data seeding completed!');
  console.log('\n📊 Summary:');
  console.log(`- ${subjects.length} subjects created`);
  console.log(`- ${competencies.length} basic competencies created`);
  console.log(`- ${totalTeachers} teachers created across all schools`);
  console.log(`- ${totalStudents} students created across all schools`);
  console.log(`- ${totalAcademicRecords} academic records created`);
  console.log(`- ${totalAttendanceRecords} attendance records created`);
  
  console.log('\n🔍 You can now test the academic endpoints with real data!');
  console.log('💡 Use Postman to test endpoints like:');
  console.log('  - GET /api/academic/students');
  console.log('  - GET /api/academic/subjects');
  console.log('  - GET /api/academic/teachers');
  console.log('  - GET /api/academic/academic-records');
  console.log('  - GET /api/academic/stats');
}

// Helper functions to generate realistic data
function generateStudentName(): string {
  const firstNames = [
    'Ahmad', 'Budi', 'Citra', 'Dewi', 'Eka', 'Fajar', 'Gita', 'Hani', 'Indra', 'Joko',
    'Kartika', 'Lina', 'Maya', 'Nuri', 'Omar', 'Putri', 'Qori', 'Rina', 'Sari', 'Taufik',
    'Ulfa', 'Vina', 'Wira', 'Yanti', 'Zaki'
  ];
  
  const lastNames = [
    'Pratama', 'Sari', 'Putra', 'Wati', 'Hidayat', 'Santoso', 'Dewi', 'Rahman', 'Fitri', 'Anwar',
    'Kusuma', 'Lestari', 'Wijaya', 'Sartika', 'Nugroho', 'Maharani', 'Surya', 'Permata', 'Hakim', 'Safitri'
  ];
  
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  
  return `${firstName} ${lastName}`;
}

function generateParentName(): string {
  const titles = ['Bapak', 'Ibu'];
  const names = [
    'Agus', 'Siti', 'Bambang', 'Endang', 'Dedi', 'Umi', 'Wahyu', 'Sri', 'Hendra', 'Yuni'
  ];
  
  const title = titles[Math.floor(Math.random() * titles.length)];
  const name = names[Math.floor(Math.random() * names.length)];
  
  return `${title} ${name}`;
}

function generateScore(): number {
  // Generate realistic school scores (65-95)
  return Math.floor(Math.random() * 31) + 65;
}

function generateAttitudeScore(): string {
  const scores = ['A', 'B', 'C'];
  const weights = [0.6, 0.3, 0.1]; // 60% A, 30% B, 10% C
  
  const random = Math.random();
  if (random < weights[0]) return 'A';
  if (random < weights[0] + weights[1]) return 'B';
  return 'C';
}

function generateAttendanceStatus(): AttendanceStatus {
  const statuses = [AttendanceStatus.present, AttendanceStatus.excused, AttendanceStatus.sick, AttendanceStatus.unexcused];
  const weights = [0.85, 0.08, 0.05, 0.02]; // 85% present, 8% excused, 5% sick, 2% unexcused
  
  const random = Math.random();
  if (random < weights[0]) return AttendanceStatus.present;
  if (random < weights[0] + weights[1]) return AttendanceStatus.excused;
  if (random < weights[0] + weights[1] + weights[2]) return AttendanceStatus.sick;
  return AttendanceStatus.unexcused;
}

function generateTeacherNotes(): string {
  const notes = [
    'Siswa menunjukkan perkembangan yang baik',
    'Perlu meningkatkan fokus dalam belajar',
    'Aktif dalam diskusi kelas',
    'Memiliki potensi yang baik',
    'Rajin mengerjakan tugas',
    'Perlu bimbingan lebih intensif',
    'Menguasai materi dengan baik',
    'Kreatif dalam menyelesaikan masalah'
  ];
  
  return notes[Math.floor(Math.random() * notes.length)];
}

main()
  .catch((e) => {
    console.error('❌ Academic seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });