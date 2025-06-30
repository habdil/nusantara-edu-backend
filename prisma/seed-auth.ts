import { PrismaClient, UserRoles } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create sample schools
  const school1 = await prisma.school.upsert({
    where: { npsn: '12345678' },
    update: {},
    create: {
      npsn: '12345678',
      schoolName: 'SDN 01 Jakarta Pusat',
      fullAddress: 'Jl. Merdeka No. 1, Jakarta Pusat, DKI Jakarta',
      postalCode: '10110',
      phoneNumber: '021-12345678',
      email: 'sdn01jakpus@example.com',
      totalStudents: 240,
      totalTeachers: 12,
      totalStaff: 5,
      establishedYear: 1975,
      accreditation: 'A',
      latitude: -6.1751,
      longitude: 106.8650,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  });

  const school2 = await prisma.school.upsert({
    where: { npsn: '87654321' },
    update: {},
    create: {
      npsn: '87654321',
      schoolName: 'SDN 02 Bandung Kota',
      fullAddress: 'Jl. Asia Afrika No. 25, Bandung, Jawa Barat',
      postalCode: '40111',
      phoneNumber: '022-87654321',
      email: 'sdn02bandung@example.com',
      totalStudents: 180,
      totalTeachers: 10,
      totalStaff: 4,
      establishedYear: 1982,
      accreditation: 'B',
      latitude: -6.9175,
      longitude: 107.6191,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  });

  const school3 = await prisma.school.upsert({
    where: { npsn: '11223344' },
    update: {},
    create: {
      npsn: '11223344',
      schoolName: 'SDN 01 Surabaya Timur',
      fullAddress: 'Jl. Raya Gubeng No. 15, Surabaya, Jawa Timur',
      postalCode: '60271',
      phoneNumber: '031-11223344',
      email: 'sdn01sby@example.com',
      totalStudents: 320,
      totalTeachers: 16,
      totalStaff: 6,
      establishedYear: 1978,
      accreditation: 'A',
      latitude: -7.2575,
      longitude: 112.7521,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  });

  // Create admin user
  const hashedAdminPassword = await bcrypt.hash('Admin123!', 12);
  
  const adminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@nusantaraedu.id',
      passwordHash: hashedAdminPassword,
      role: UserRoles.admin,
      fullName: 'Administrator NusantaraEdu',
      phoneNumber: '+6281234567890',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  });

  // Create sample principal users (without assigning to schools yet)
  const hashedPassword = await bcrypt.hash('Principal123!', 12);

  const principal1 = await prisma.user.upsert({
    where: { username: 'principal_jakarta' },
    update: {},
    create: {
      username: 'principal_jakarta',
      email: 'kepala.sdn01jakpus@example.com',
      passwordHash: hashedPassword,
      role: UserRoles.principal,
      fullName: 'Dr. Budi Santoso, S.Pd., M.Pd',
      phoneNumber: '+6281234567891',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  });

  const principal2 = await prisma.user.upsert({
    where: { username: 'principal_bandung' },
    update: {},
    create: {
      username: 'principal_bandung',
      email: 'kepala.sdn02bandung@example.com',
      passwordHash: hashedPassword,
      role: UserRoles.principal,
      fullName: 'Siti Nurhaliza, S.Pd',
      phoneNumber: '+6281234567892',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  });

  // Note: school3 sengaja tidak diberi principal untuk testing registrasi

  // Update schools with principals
  await prisma.school.update({
    where: { id: school1.id },
    data: { 
      principalId: principal1.id,
      updatedAt: new Date()
    }
  });

  await prisma.school.update({
    where: { id: school2.id },
    data: { 
      principalId: principal2.id,
      updatedAt: new Date()
    }
  });

  console.log('✅ Database seeding completed!');
  console.log('\n📊 Created data:');
  console.log(`- ${3} schools`);
  console.log(`- ${1} admin user`);
  console.log(`- ${2} principal users`);
  console.log('\n🔑 Test credentials:');
  console.log('Admin:');
  console.log('  Username: admin');
  console.log('  Password: Admin123!');
  console.log('\nPrincipals:');
  console.log('  Jakarta - Username: principal_jakarta, Password: Principal123!');
  console.log('  Bandung - Username: principal_bandung, Password: Principal123!');
  console.log('\n🏫 Available schools for registration:');
  console.log('  NPSN: 11223344 (SDN 01 Surabaya Timur) - Available for new principal');
  console.log('\n💡 You can register a new principal using NPSN: 11223344');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });