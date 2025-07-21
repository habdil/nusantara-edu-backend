"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AcademicService = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
class AcademicService {
    // Get students with pagination and filters
    async getStudents(params) {
        try {
            const { gradeLevel, className, search, page = 1, limit = 10, schoolId } = params;
            const skip = (page - 1) * limit;
            // Build where clause
            const where = {
                schoolId: schoolId,
                isActive: true
            };
            if (gradeLevel) {
                where.grade = gradeLevel;
            }
            if (search) {
                where.OR = [
                    { fullName: { contains: search, mode: 'insensitive' } },
                    { studentId: { contains: search, mode: 'insensitive' } },
                    { nationalStudentId: { contains: search, mode: 'insensitive' } }
                ];
            }
            // If className is provided, we need to filter by grade + class combination
            // Assuming className format like "6A" where grade="6" and class="A"
            if (className) {
                where.grade = className.charAt(0); // Extract grade from className
            }
            const [students, total] = await Promise.all([
                prisma_1.default.student.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: [
                        { grade: 'asc' },
                        { fullName: 'asc' }
                    ],
                    select: {
                        id: true,
                        studentId: true,
                        nationalStudentId: true,
                        fullName: true,
                        grade: true,
                        gender: true,
                        birthDate: true,
                        address: true,
                        parentName: true,
                        parentContact: true,
                        enrollmentDate: true,
                        isActive: true,
                        createdAt: true,
                        updatedAt: true
                    }
                }),
                prisma_1.default.student.count({ where })
            ]);
            // Transform data to match frontend interface
            const transformedStudents = students.map(student => ({
                id: student.id,
                studentId: student.studentId,
                fullName: student.fullName,
                gradeLevel: student.grade,
                className: student.grade + 'A', // Default class naming, adjust as needed
                gender: student.gender,
                dateOfBirth: student.birthDate?.toISOString().split('T')[0] || '',
                enrollmentDate: student.enrollmentDate.toISOString().split('T')[0],
                isActive: student.isActive
            }));
            return {
                data: transformedStudents,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            };
        }
        catch (error) {
            throw new Error(error.message || 'Gagal mengambil data siswa');
        }
    }
    // Get attendance summary with class breakdown
    async getAttendanceSummary(params) {
        try {
            const { academicYear, semester, schoolId } = params;
            // First, get all distinct grades/classes from students table
            const allGrades = await prisma_1.default.student.findMany({
                where: {
                    schoolId: schoolId,
                    isActive: true
                },
                select: {
                    grade: true
                },
                distinct: ['grade']
            });
            // Build where clause for attendance
            const attendanceWhere = {
                student: {
                    schoolId: schoolId,
                    isActive: true
                }
            };
            // Add date filtering if needed
            if (academicYear || semester) {
                // For simplicity, filter by current academic year
                const currentYear = new Date().getFullYear();
                const startDate = new Date(currentYear, 6, 1); // July 1st
                const endDate = new Date(currentYear + 1, 5, 30); // June 30th next year
                attendanceWhere.date = {
                    gte: startDate,
                    lte: endDate
                };
            }
            // Get all attendance records
            const attendanceRecords = await prisma_1.default.studentAttendance.findMany({
                where: attendanceWhere,
                include: {
                    student: {
                        select: {
                            id: true,
                            studentId: true,
                            fullName: true,
                            grade: true
                        }
                    }
                }
            });
            // Calculate overall statistics
            const totalRecords = attendanceRecords.length;
            const presentCount = attendanceRecords.filter(r => r.status === 'present').length;
            const excusedCount = attendanceRecords.filter(r => r.status === 'excused').length;
            const sickCount = attendanceRecords.filter(r => r.status === 'sick').length;
            const unexcusedCount = attendanceRecords.filter(r => r.status === 'unexcused').length;
            const overallStats = {
                totalDays: totalRecords,
                presentDays: presentCount,
                excusedDays: excusedCount,
                sickDays: sickCount,
                unexcusedDays: unexcusedCount,
                attendanceRate: totalRecords > 0 ? Number(((presentCount / totalRecords) * 100).toFixed(1)) : 0
            };
            // Group attendance records by class
            const attendanceByClass = new Map();
            attendanceRecords.forEach(record => {
                const className = record.student.grade;
                if (!attendanceByClass.has(className)) {
                    attendanceByClass.set(className, []);
                }
                attendanceByClass.get(className).push(record);
            });
            // Create class attendance array including all grades, even those without attendance data
            const classAttendance = allGrades.map(gradeObj => {
                const grade = gradeObj.grade;
                const records = attendanceByClass.get(grade) || [];
                const totalClassRecords = records.length;
                const presentClassRecords = records.filter(r => r.status === 'present').length;
                const rate = totalClassRecords > 0 ? Number(((presentClassRecords / totalClassRecords) * 100).toFixed(1)) : 0;
                let status = 'poor';
                if (totalClassRecords === 0) {
                    status = 'poor'; // No data available
                }
                else if (rate >= 95) {
                    status = 'excellent';
                }
                else if (rate >= 90) {
                    status = 'good';
                }
                else if (rate >= 80) {
                    status = 'fair';
                }
                return {
                    className: grade,
                    rate,
                    status
                };
            }).sort((a, b) => {
                // Sort by grade number (1, 2, 3, 4, 5, 6)
                const gradeA = parseInt(a.className) || 0;
                const gradeB = parseInt(b.className) || 0;
                return gradeA - gradeB;
            });
            return {
                overallStats,
                classAttendance
            };
        }
        catch (error) {
            throw new Error(error.message || 'Gagal mengambil ringkasan kehadiran');
        }
    }
    async getGradeDistribution(params) {
        try {
            const { academicYear, semester, gradeLevel, schoolId } = params;
            const academicWhere = {
                student: {
                    schoolId: schoolId,
                    isActive: true
                }
            };
            if (academicYear)
                academicWhere.academicYear = academicYear;
            if (semester)
                academicWhere.semester = semester;
            if (gradeLevel) {
                academicWhere.student = {
                    ...academicWhere.student,
                    grade: gradeLevel
                };
            }
            const academicRecords = await prisma_1.default.academicRecord.findMany({
                where: academicWhere,
                select: {
                    finalScore: true
                }
            });
            // Filter valid scores and categorize
            const validScores = academicRecords
                .filter(record => record.finalScore !== null)
                .map(record => Number(record.finalScore));
            const total = validScores.length;
            const gradeCategories = [
                { grade: "A (90-100)", min: 90, max: 100, count: 0, color: "bg-green-500" },
                { grade: "B (80-89)", min: 80, max: 89, count: 0, color: "bg-blue-500" },
                { grade: "C (70-79)", min: 70, max: 79, count: 0, color: "bg-yellow-500" },
                { grade: "D (60-69)", min: 60, max: 69, count: 0, color: "bg-orange-500" },
                { grade: "E (<60)", min: 0, max: 59, count: 0, color: "bg-red-500" }
            ];
            // Count scores in each category
            validScores.forEach(score => {
                gradeCategories.forEach(category => {
                    if (score >= category.min && score <= category.max) {
                        category.count++;
                    }
                });
            });
            // Calculate percentages
            const gradeDistribution = gradeCategories.map(category => ({
                grade: category.grade,
                count: category.count,
                percentage: total > 0 ? Number(((category.count / total) * 100).toFixed(1)) : 0,
                color: category.color
            }));
            return gradeDistribution;
        }
        catch (error) {
            throw new Error(error.message || 'Gagal mengambil distribusi nilai');
        }
    }
    // Get subject averages with trends
    async getSubjectAverages(params) {
        try {
            const { academicYear, semester, gradeLevel, schoolId } = params;
            const academicWhere = {
                student: {
                    schoolId: schoolId,
                    isActive: true
                }
            };
            if (academicYear)
                academicWhere.academicYear = academicYear;
            if (semester)
                academicWhere.semester = semester;
            if (gradeLevel) {
                academicWhere.student = {
                    ...academicWhere.student,
                    grade: gradeLevel
                };
            }
            const academicRecords = await prisma_1.default.academicRecord.findMany({
                where: academicWhere,
                include: {
                    subject: {
                        select: {
                            id: true,
                            subjectName: true
                        }
                    }
                }
            });
            // Group by subject and calculate averages
            const subjectGroups = new Map();
            academicRecords.forEach(record => {
                if (record.finalScore !== null) {
                    const subjectName = record.subject.subjectName;
                    if (!subjectGroups.has(subjectName)) {
                        subjectGroups.set(subjectName, []);
                    }
                    subjectGroups.get(subjectName).push(Number(record.finalScore));
                }
            });
            // For trend calculation, get previous period data (simplified)
            // In real implementation, you might want to compare with previous semester/year
            const previousWhere = {
                ...academicWhere,
                // Adjust for previous period comparison
                semester: semester === '2' ? '1' : '2' // Simple previous semester logic
            };
            const previousRecords = await prisma_1.default.academicRecord.findMany({
                where: previousWhere,
                include: {
                    subject: {
                        select: {
                            subjectName: true
                        }
                    }
                }
            });
            const previousSubjectGroups = new Map();
            previousRecords.forEach(record => {
                if (record.finalScore !== null) {
                    const subjectName = record.subject.subjectName;
                    if (!previousSubjectGroups.has(subjectName)) {
                        previousSubjectGroups.set(subjectName, []);
                    }
                    previousSubjectGroups.get(subjectName).push(Number(record.finalScore));
                }
            });
            const subjectAverages = Array.from(subjectGroups.entries()).map(([subject, scores]) => {
                const currentAverage = scores.reduce((sum, score) => sum + score, 0) / scores.length;
                // Calculate trend
                let trend = 'stable';
                const previousScores = previousSubjectGroups.get(subject);
                if (previousScores && previousScores.length > 0) {
                    const previousAverage = previousScores.reduce((sum, score) => sum + score, 0) / previousScores.length;
                    const difference = currentAverage - previousAverage;
                    if (difference > 2)
                        trend = 'up';
                    else if (difference < -2)
                        trend = 'down';
                }
                return {
                    subject,
                    average: Number(currentAverage.toFixed(1)),
                    trend
                };
            }).sort((a, b) => a.subject.localeCompare(b.subject));
            return subjectAverages;
        }
        catch (error) {
            throw new Error(error.message || 'Gagal mengambil rata-rata nilai per mata pelajaran');
        }
    }
    // Get academic records with filters
    async getAcademicRecords(params) {
        try {
            const { studentId, subjectId, semester, academicYear, gradeLevel, schoolId } = params;
            const where = {
                student: {
                    schoolId: schoolId,
                    isActive: true
                }
            };
            if (studentId)
                where.studentId = studentId;
            if (subjectId)
                where.subjectId = subjectId;
            if (semester)
                where.semester = semester;
            if (academicYear)
                where.academicYear = academicYear;
            if (gradeLevel) {
                if (!where.student) {
                    where.student = {};
                }
                where.student.grade = gradeLevel;
            }
            const records = await prisma_1.default.academicRecord.findMany({
                where,
                include: {
                    student: {
                        select: {
                            id: true,
                            studentId: true,
                            fullName: true,
                            grade: true,
                            gender: true,
                            birthDate: true,
                            enrollmentDate: true,
                            isActive: true
                        }
                    },
                    subject: {
                        select: {
                            id: true,
                            subjectCode: true,
                            subjectName: true,
                            gradeLevel: true,
                            weeklyHours: true,
                            description: true
                        }
                    },
                    teacher: {
                        select: {
                            id: true,
                            employeeId: true,
                            fullName: true,
                            email: true,
                            phoneNumber: true,
                            subjectArea: true
                        }
                    }
                },
                orderBy: [
                    { academicYear: 'desc' },
                    { semester: 'desc' },
                    { subject: { subjectName: 'asc' } }
                ]
            });
            // Transform data to match frontend interface
            const transformedRecords = records.map(record => ({
                id: record.id,
                studentId: record.studentId,
                subjectId: record.subjectId,
                teacherId: record.teacherId,
                semester: record.semester,
                academicYear: record.academicYear,
                knowledgeScore: record.knowledgeScore ? Number(record.knowledgeScore) : undefined,
                skillScore: record.skillScore ? Number(record.skillScore) : undefined,
                attitudeScore: record.attitudeScore,
                midtermExamScore: record.midtermExamScore ? Number(record.midtermExamScore) : undefined,
                finalExamScore: record.finalExamScore ? Number(record.finalExamScore) : undefined,
                finalScore: record.finalScore ? Number(record.finalScore) : undefined,
                teacherNotes: record.teacherNotes,
                student: {
                    ...record.student,
                    gradeLevel: record.student.grade,
                    className: record.student.grade + 'A',
                    gender: record.student.gender,
                    dateOfBirth: record.student.birthDate?.toISOString().split('T')[0] || '',
                    enrollmentDate: record.student.enrollmentDate.toISOString().split('T')[0]
                },
                subject: {
                    ...record.subject,
                    creditHours: record.subject.weeklyHours
                },
                teacher: {
                    ...record.teacher,
                    teacherId: record.teacher.employeeId || '',
                    subjects: [record.teacher.subjectArea]
                }
            }));
            return transformedRecords;
        }
        catch (error) {
            throw new Error(error.message || 'Gagal mengambil data nilai akademik');
        }
    }
    // Get subjects by grade level
    async getSubjects(gradeLevel) {
        try {
            const where = {};
            if (gradeLevel) {
                where.gradeLevel = gradeLevel;
            }
            const subjects = await prisma_1.default.subject.findMany({
                where,
                orderBy: { subjectName: 'asc' },
                select: {
                    id: true,
                    subjectCode: true,
                    subjectName: true,
                    gradeLevel: true,
                    weeklyHours: true,
                    description: true
                }
            });
            // Transform data to match frontend interface
            const transformedSubjects = subjects.map(subject => ({
                id: subject.id,
                subjectCode: subject.subjectCode,
                subjectName: subject.subjectName,
                gradeLevel: subject.gradeLevel,
                creditHours: subject.weeklyHours,
                description: subject.description
            }));
            return transformedSubjects;
        }
        catch (error) {
            throw new Error(error.message || 'Gagal mengambil data mata pelajaran');
        }
    }
    // Get teachers
    async getTeachers(schoolId) {
        try {
            const teachers = await prisma_1.default.teacher.findMany({
                where: {
                    schoolId: schoolId
                },
                orderBy: { fullName: 'asc' },
                select: {
                    id: true,
                    employeeId: true,
                    fullName: true,
                    email: true,
                    phoneNumber: true,
                    subjectArea: true,
                    position: true
                }
            });
            // Transform data to match frontend interface
            const transformedTeachers = teachers.map(teacher => ({
                id: teacher.id,
                teacherId: teacher.employeeId || '',
                fullName: teacher.fullName,
                email: teacher.email || '',
                phoneNumber: teacher.phoneNumber,
                subjects: [teacher.subjectArea] // Convert single subject to array
            }));
            return transformedTeachers;
        }
        catch (error) {
            throw new Error(error.message || 'Gagal mengambil data guru');
        }
    }
    // Get basic competencies by subject
    async getBasicCompetencies(subjectId) {
        try {
            const where = {};
            if (subjectId) {
                where.subjectId = subjectId;
            }
            const competencies = await prisma_1.default.basicCompetency.findMany({
                where,
                include: {
                    subject: {
                        select: {
                            id: true,
                            subjectCode: true,
                            subjectName: true,
                            gradeLevel: true,
                            weeklyHours: true,
                            description: true
                        }
                    }
                },
                orderBy: { competencyCode: 'asc' }
            });
            // Transform data to match frontend interface
            const transformedCompetencies = competencies.map(competency => ({
                id: competency.id,
                subjectId: competency.subjectId,
                competencyCode: competency.competencyCode,
                competencyDescription: competency.competencyDescription,
                difficultyLevel: competency.difficultyLevel,
                subject: {
                    ...competency.subject,
                    creditHours: competency.subject.weeklyHours
                }
            }));
            return transformedCompetencies;
        }
        catch (error) {
            throw new Error(error.message || 'Gagal mengambil data kompetensi dasar');
        }
    }
    // Get student attendance
    async getStudentAttendance(params) {
        try {
            const { studentId, dateFrom, dateTo, status, schoolId } = params;
            const where = {
                student: {
                    schoolId: schoolId,
                    isActive: true
                }
            };
            if (studentId)
                where.studentId = studentId;
            if (status)
                where.status = status;
            if (dateFrom || dateTo) {
                where.date = {};
                if (dateFrom)
                    where.date.gte = new Date(dateFrom);
                if (dateTo)
                    where.date.lte = new Date(dateTo);
            }
            const attendance = await prisma_1.default.studentAttendance.findMany({
                where,
                include: {
                    student: {
                        select: {
                            id: true,
                            studentId: true,
                            fullName: true,
                            grade: true,
                            gender: true,
                            birthDate: true,
                            enrollmentDate: true,
                            isActive: true
                        }
                    }
                },
                orderBy: [
                    { date: 'desc' },
                    { student: { fullName: 'asc' } }
                ]
            });
            // Transform data to match frontend interface
            const transformedAttendance = attendance.map(record => ({
                id: record.id,
                studentId: record.studentId,
                attendanceDate: record.date.toISOString().split('T')[0],
                status: record.status,
                notes: record.notes,
                student: {
                    ...record.student,
                    gradeLevel: record.student.grade,
                    className: record.student.grade + 'A',
                    gender: record.student.gender,
                    dateOfBirth: record.student.birthDate?.toISOString().split('T')[0] || '',
                    enrollmentDate: record.student.enrollmentDate.toISOString().split('T')[0]
                }
            }));
            return transformedAttendance;
        }
        catch (error) {
            throw new Error(error.message || 'Gagal mengambil data kehadiran siswa');
        }
    }
    // Get academic statistics
    async getAcademicStats(params) {
        try {
            const { academicYear, semester, gradeLevel, schoolId } = params;
            // Build where clause for academic records
            const academicWhere = {
                student: {
                    schoolId: schoolId,
                    isActive: true
                }
            };
            if (academicYear)
                academicWhere.academicYear = academicYear;
            if (semester)
                academicWhere.semester = semester;
            if (gradeLevel) {
                academicWhere.student = {
                    ...academicWhere.student,
                    ...(gradeLevel ? { grade: gradeLevel } : {})
                };
            }
            // Get total students
            const totalStudents = await prisma_1.default.student.count({
                where: {
                    schoolId: schoolId,
                    isActive: true,
                    ...(gradeLevel && { grade: gradeLevel })
                }
            });
            // Get academic records for calculations
            const academicRecords = await prisma_1.default.academicRecord.findMany({
                where: academicWhere,
                include: {
                    subject: {
                        select: {
                            subjectName: true
                        }
                    }
                }
            });
            // Calculate average score
            const validScores = academicRecords
                .filter(record => record.finalScore !== null)
                .map(record => Number(record.finalScore));
            const averageScore = validScores.length > 0
                ? validScores.reduce((sum, score) => sum + score, 0) / validScores.length
                : 0;
            // Calculate pass rate (assuming passing score is 75)
            const passingGrade = 75;
            const passedStudents = validScores.filter(score => score >= passingGrade).length;
            const passRate = validScores.length > 0 ? (passedStudents / validScores.length) * 100 : 0;
            // Get attendance rate
            const attendanceWhere = {
                student: {
                    schoolId: schoolId,
                    isActive: true,
                    ...(gradeLevel && { grade: gradeLevel })
                }
            };
            // For current month if no specific date range
            const now = new Date();
            const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            attendanceWhere.date = {
                gte: firstDayOfMonth,
                lte: now
            };
            const [totalAttendance, presentAttendance] = await Promise.all([
                prisma_1.default.studentAttendance.count({ where: attendanceWhere }),
                prisma_1.default.studentAttendance.count({
                    where: { ...attendanceWhere, status: 'present' }
                })
            ]);
            const attendanceRate = totalAttendance > 0 ? (presentAttendance / totalAttendance) * 100 : 0;
            // Calculate subject performance
            const subjectStats = new Map();
            academicRecords.forEach(record => {
                if (record.finalScore !== null) {
                    const subjectName = record.subject.subjectName;
                    if (!subjectStats.has(subjectName)) {
                        subjectStats.set(subjectName, { scores: [], total: 0 });
                    }
                    const stats = subjectStats.get(subjectName);
                    stats.scores.push(Number(record.finalScore));
                    stats.total++;
                }
            });
            const subjectPerformance = Array.from(subjectStats.entries()).map(([subject, stats]) => {
                const averageScore = stats.scores.reduce((sum, score) => sum + score, 0) / stats.scores.length;
                const passed = stats.scores.filter(score => score >= passingGrade).length;
                const passRate = (passed / stats.scores.length) * 100;
                return {
                    subject,
                    averageScore: Math.round(averageScore * 10) / 10,
                    passRate: Math.round(passRate * 10) / 10
                };
            });
            return {
                totalStudents,
                averageScore: Math.round(averageScore * 10) / 10,
                passRate: Math.round(passRate * 10) / 10,
                attendanceRate: Math.round(attendanceRate * 10) / 10,
                subjectPerformance: subjectPerformance.sort((a, b) => a.subject.localeCompare(b.subject))
            };
        }
        catch (error) {
            throw new Error(error.message || 'Gagal mengambil statistik akademik');
        }
    }
    // Create academic record
    async createAcademicRecord(data, schoolId) {
        try {
            // Verify that student, subject, and teacher belong to the school
            const [student, subject, teacher] = await Promise.all([
                prisma_1.default.student.findFirst({
                    where: { id: data.studentId, schoolId: schoolId, isActive: true }
                }),
                prisma_1.default.subject.findUnique({
                    where: { id: data.subjectId }
                }),
                prisma_1.default.teacher.findFirst({
                    where: { id: data.teacherId, schoolId: schoolId }
                })
            ]);
            if (!student) {
                throw new Error('Siswa tidak ditemukan atau bukan bagian dari sekolah ini');
            }
            if (!subject) {
                throw new Error('Mata pelajaran tidak ditemukan');
            }
            if (!teacher) {
                throw new Error('Guru tidak ditemukan atau bukan bagian dari sekolah ini');
            }
            // Check if record already exists
            const existingRecord = await prisma_1.default.academicRecord.findUnique({
                where: {
                    student_subject_period: {
                        studentId: data.studentId,
                        subjectId: data.subjectId,
                        semester: data.semester,
                        academicYear: data.academicYear
                    }
                }
            });
            if (existingRecord) {
                throw new Error('Nilai untuk siswa, mata pelajaran, semester, dan tahun akademik ini sudah ada');
            }
            const record = await prisma_1.default.academicRecord.create({
                data: {
                    studentId: data.studentId,
                    subjectId: data.subjectId,
                    teacherId: data.teacherId,
                    semester: data.semester,
                    academicYear: data.academicYear,
                    knowledgeScore: data.knowledgeScore,
                    skillScore: data.skillScore,
                    attitudeScore: data.attitudeScore,
                    midtermExamScore: data.midtermExamScore,
                    finalExamScore: data.finalExamScore,
                    finalScore: data.finalScore,
                    teacherNotes: data.teacherNotes
                },
                include: {
                    student: {
                        select: {
                            id: true,
                            studentId: true,
                            fullName: true,
                            grade: true
                        }
                    },
                    subject: {
                        select: {
                            id: true,
                            subjectCode: true,
                            subjectName: true
                        }
                    },
                    teacher: {
                        select: {
                            id: true,
                            fullName: true
                        }
                    }
                }
            });
            return {
                id: record.id,
                studentId: record.studentId,
                subjectId: record.subjectId,
                teacherId: record.teacherId,
                semester: record.semester,
                academicYear: record.academicYear,
                knowledgeScore: record.knowledgeScore ? Number(record.knowledgeScore) : undefined,
                skillScore: record.skillScore ? Number(record.skillScore) : undefined,
                attitudeScore: record.attitudeScore,
                midtermExamScore: record.midtermExamScore ? Number(record.midtermExamScore) : undefined,
                finalExamScore: record.finalExamScore ? Number(record.finalExamScore) : undefined,
                finalScore: record.finalScore ? Number(record.finalScore) : undefined,
                teacherNotes: record.teacherNotes,
                student: {
                    ...record.student,
                    gradeLevel: record.student.grade,
                    className: record.student.grade + 'A'
                },
                subject: record.subject,
                teacher: record.teacher
            };
        }
        catch (error) {
            throw new Error(error.message || 'Gagal membuat data nilai akademik');
        }
    }
    // Update academic record
    async updateAcademicRecord(id, data, schoolId) {
        try {
            // Verify record exists and belongs to the school
            const existingRecord = await prisma_1.default.academicRecord.findFirst({
                where: {
                    id: id,
                    student: {
                        schoolId: schoolId,
                        isActive: true
                    }
                }
            });
            if (!existingRecord) {
                throw new Error('Data nilai tidak ditemukan atau bukan bagian dari sekolah ini');
            }
            const record = await prisma_1.default.academicRecord.update({
                where: { id: id },
                data: {
                    knowledgeScore: data.knowledgeScore,
                    skillScore: data.skillScore,
                    attitudeScore: data.attitudeScore,
                    midtermExamScore: data.midtermExamScore,
                    finalExamScore: data.finalExamScore,
                    finalScore: data.finalScore,
                    teacherNotes: data.teacherNotes,
                    updatedAt: new Date()
                },
                include: {
                    student: {
                        select: {
                            id: true,
                            studentId: true,
                            fullName: true,
                            grade: true
                        }
                    },
                    subject: {
                        select: {
                            id: true,
                            subjectCode: true,
                            subjectName: true
                        }
                    },
                    teacher: {
                        select: {
                            id: true,
                            fullName: true
                        }
                    }
                }
            });
            return {
                id: record.id,
                studentId: record.studentId,
                subjectId: record.subjectId,
                teacherId: record.teacherId,
                semester: record.semester,
                academicYear: record.academicYear,
                knowledgeScore: record.knowledgeScore ? Number(record.knowledgeScore) : undefined,
                skillScore: record.skillScore ? Number(record.skillScore) : undefined,
                attitudeScore: record.attitudeScore,
                midtermExamScore: record.midtermExamScore ? Number(record.midtermExamScore) : undefined,
                finalExamScore: record.finalExamScore ? Number(record.finalExamScore) : undefined,
                finalScore: record.finalScore ? Number(record.finalScore) : undefined,
                teacherNotes: record.teacherNotes,
                student: {
                    ...record.student,
                    gradeLevel: record.student.grade,
                    className: record.student.grade + 'A'
                },
                subject: record.subject,
                teacher: record.teacher
            };
        }
        catch (error) {
            throw new Error(error.message || 'Gagal memperbarui data nilai akademik');
        }
    }
    // Delete academic record
    async deleteAcademicRecord(id, schoolId) {
        try {
            // Verify record exists and belongs to the school
            const existingRecord = await prisma_1.default.academicRecord.findFirst({
                where: {
                    id: id,
                    student: {
                        schoolId: schoolId,
                        isActive: true
                    }
                }
            });
            if (!existingRecord) {
                throw new Error('Data nilai tidak ditemukan atau bukan bagian dari sekolah ini');
            }
            await prisma_1.default.academicRecord.delete({
                where: { id: id }
            });
            return { message: 'Data nilai berhasil dihapus' };
        }
        catch (error) {
            throw new Error(error.message || 'Gagal menghapus data nilai akademik');
        }
    }
}
exports.AcademicService = AcademicService;
