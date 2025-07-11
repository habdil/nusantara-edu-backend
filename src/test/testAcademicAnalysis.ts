// src/test/testAcademicAnalysis.ts
import dotenv from 'dotenv';
import { initializeAIConfig } from '../config/aiConfig';
import AcademicAnalysisService from '../services/academicAnalysisService';
import prisma from '../config/prisma';

// Load environment variables
dotenv.config();

async function testAcademicAnalysis() {
  console.log('🔍 Testing Academic Analysis Service...\n');

  try {
    // Initialize AI config
    console.log('1. Initializing AI Configuration...');
    initializeAIConfig();
    console.log('✅ AI Configuration loaded successfully\n');

    // Initialize Academic Analysis Service
    console.log('2. Initializing Academic Analysis Service...');
    const academicAnalysisService = new AcademicAnalysisService({
      passingGradeThreshold: 75,
      attendanceThreshold: 85,
      improvementTargetPercentage: 15,
      minimumSampleSize: 3,
      analysisDepthLevel: 'detailed'
    });
    console.log('✅ Academic Analysis Service initialized\n');

    // Find a school to test with
    console.log('3. Finding school data for testing...');
    const schools = await prisma.school.findMany({
      take: 1,
      include: {
        students: {
          take: 5,
          include: {
            academicRecords: {
              take: 3
            },
            attendance: {
              take: 20
            }
          }
        }
      }
    });

    if (schools.length === 0) {
      console.log('❌ No schools found in database. Please seed the database first.');
      return;
    }

    const testSchool = schools[0];
    console.log(`✅ Found test school: ${testSchool.schoolName} (ID: ${testSchool.id})`);
    console.log(`   Students: ${testSchool.students.length}`);
    console.log(`   Academic records: ${testSchool.students.reduce((sum, s) => sum + s.academicRecords.length, 0)}`);
    console.log(`   Attendance records: ${testSchool.students.reduce((sum, s) => sum + s.attendance.length, 0)}\n`);

    // Test academic analysis
    console.log('4. Running Academic Analysis...');
    const startTime = Date.now();
    
    const analysisResult = await academicAnalysisService.analyzeSchoolAcademicData(testSchool.id);
    
    const processingTime = Date.now() - startTime;
    
    console.log('🎯 Analysis Results:');
    console.log('==================');
    console.log(`✅ Success: ${analysisResult.success}`);
    console.log(`📊 Recommendations Generated: ${analysisResult.recommendations.length}`);
    console.log(`⏱️  Processing Time: ${processingTime}ms`);
    console.log(`📈 Data Quality: ${(analysisResult.metadata.dataQuality * 100).toFixed(1)}%`);
    console.log(`🎯 Overall Confidence: ${(analysisResult.metadata.confidence * 100).toFixed(1)}%`);

    // Show summary
    console.log('\n📋 Analysis Summary:');
    console.log('===================');
    console.log(`Students Analyzed: ${analysisResult.summary.totalStudentsAnalyzed}`);
    console.log(`Students Needing Help: ${analysisResult.summary.studentsNeedingHelp}`);
    console.log(`Average Class Performance: ${analysisResult.summary.averageClassPerformance}`);
    console.log(`Critical Subjects: ${analysisResult.summary.criticalSubjects.join(', ') || 'None'}`);
    console.log(`Attendance Issues: ${analysisResult.summary.attendanceIssues}`);

    // Show detailed recommendations
    if (analysisResult.recommendations.length > 0) {
      console.log('\n🎯 Generated Recommendations:');
      console.log('=============================');
      
      analysisResult.recommendations.forEach((rec, index) => {
        console.log(`\n${index + 1}. ${rec.title}`);
        console.log(`   Category: ${rec.category}`);
        console.log(`   Urgency: ${rec.urgencyLevel || 'medium'}`);
        console.log(`   Confidence: ${(rec.confidenceLevel * 100).toFixed(1)}%`);
        console.log(`   Description: ${rec.description.substring(0, 100)}...`);
        console.log(`   Predicted Impact: ${rec.predictedImpact || 'Impact assessment needed'}`);
        
        if (rec.supportingData) {
          console.log(`   Supporting Data:`);
          Object.entries(rec.supportingData).forEach(([key, value]) => {
            if (typeof value === 'object') {
              console.log(`     ${key}: ${JSON.stringify(value)}`);
            } else {
              console.log(`     ${key}: ${value}`);
            }
          });
        }
      });
    } else {
      console.log('\n🎉 No critical issues found - school performance is good!');
    }

    // Show errors if any
    if (analysisResult.errors && analysisResult.errors.length > 0) {
      console.log('\n⚠️  Errors encountered:');
      analysisResult.errors.forEach(error => {
        console.log(`   - ${error}`);
      });
    }

    // Test with different configurations
    console.log('\n5. Testing with Different Configurations...');
    
    // Test with stricter thresholds
    const strictService = new AcademicAnalysisService({
      passingGradeThreshold: 80,
      attendanceThreshold: 90,
      improvementTargetPercentage: 20,
      minimumSampleSize: 2,
      analysisDepthLevel: 'comprehensive'
    });

    const strictResult = await strictService.analyzeSchoolAcademicData(testSchool.id);
    console.log(`✅ Strict Analysis: ${strictResult.recommendations.length} recommendations (vs ${analysisResult.recommendations.length} normal)`);

    // Test with lenient thresholds
    const lenientService = new AcademicAnalysisService({
      passingGradeThreshold: 70,
      attendanceThreshold: 80,
      improvementTargetPercentage: 10,
      minimumSampleSize: 1,
      analysisDepthLevel: 'basic'
    });

    const lenientResult = await lenientService.analyzeSchoolAcademicData(testSchool.id);
    console.log(`✅ Lenient Analysis: ${lenientResult.recommendations.length} recommendations`);

    console.log('\n🎉 All Academic Analysis tests completed successfully!');

  } catch (error: any) {
    console.error('❌ Test failed with error:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
if (require.main === module) {
  testAcademicAnalysis()
    .then(() => {
      console.log('\n✅ Test completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Test failed:', error);
      process.exit(1);
    });
}

export default testAcademicAnalysis;