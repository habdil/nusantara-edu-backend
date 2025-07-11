// src/test/testGemini.ts
import dotenv from 'dotenv';
import { initializeAIConfig } from '../config/aiConfig';
import { geminiService } from '../services/geminiService';

// Load environment variables
dotenv.config();

async function testGeminiConnection() {
  console.log('🔍 Testing Gemini AI Connection...\n');

  try {
    // Initialize AI config
    console.log('1. Initializing AI Configuration...');
    initializeAIConfig();
    console.log('✅ AI Configuration loaded successfully\n');

    // Test basic health check
    console.log('2. Testing AI Service Health Check...');
    const healthResult = await geminiService.healthCheck();
    
    if (healthResult.success) {
      console.log('✅ Health check passed:', healthResult.data);
    } else {
      console.log('❌ Health check failed:', healthResult.error);
      return;
    }

    // Test basic content generation
    console.log('\n3. Testing Basic Content Generation...');
    const basicTest = await geminiService.generateContent({
      prompt: 'Berikan response dalam format JSON dengan struktur: {"message": "AI service berjalan dengan baik", "timestamp": "waktu saat ini", "status": "success"}',
      temperature: 0.1
    });

    if (basicTest.success) {
      console.log('✅ Basic generation test passed:');
      console.log('Response:', JSON.stringify(basicTest.data, null, 2));
      console.log('Confidence:', basicTest.confidence);
      console.log('Metadata:', basicTest.metadata);
    } else {
      console.log('❌ Basic generation test failed:', basicTest.error);
    }

    // Test academic analysis (with dummy data)
    console.log('\n4. Testing Academic Analysis...');
    const dummyAcademicData = {
      students: [
        {
          id: 1,
          name: "Budi Santoso",
          grade: "5A",
          subjects: [
            { name: "Matematika", score: 65 },
            { name: "Bahasa Indonesia", score: 70 },
            { name: "IPA", score: 60 }
          ],
          attendance: { rate: 85, totalDays: 100, presentDays: 85 }
        },
        {
          id: 2,
          name: "Siti Aminah", 
          grade: "5A",
          subjects: [
            { name: "Matematika", score: 55 },
            { name: "Bahasa Indonesia", score: 60 },
            { name: "IPA", score: 50 }
          ],
          attendance: { rate: 78, totalDays: 100, presentDays: 78 }
        }
      ],
      classAverage: {
        matematika: 67,
        bahasaIndonesia: 72,
        ipa: 68
      },
      schoolTarget: {
        minimumScore: 75,
        attendanceRate: 90
      }
    };

    const academicResult = await geminiService.analyzeAcademicData(dummyAcademicData);
    
    if (academicResult.success) {
      console.log('✅ Academic analysis test passed:');
      console.log('Recommendations count:', academicResult.data?.length || 0);
      if (academicResult.data && academicResult.data.length > 0) {
        console.log('First recommendation:', JSON.stringify(academicResult.data[0], null, 2));
      }
    } else {
      console.log('❌ Academic analysis test failed:', academicResult.error);
    }

    // Test financial analysis (with dummy data)
    console.log('\n5. Testing Financial Analysis...');
    const dummyFinancialData = {
      budget: {
        totalBudget: 500000000, // 500 juta
        categories: [
          { name: "Operasional", budget: 200000000, used: 180000000 },
          { name: "Pemeliharaan", budget: 100000000, used: 95000000 },
          { name: "Pengembangan", budget: 150000000, used: 120000000 },
          { name: "ATK", budget: 50000000, used: 55000000 } // over budget
        ]
      },
      monthlyExpenses: [
        { category: "Listrik", amount: 15000000 },
        { category: "Air", amount: 3000000 },
        { category: "Internet", amount: 2000000 },
        { category: "Kebersihan", amount: 8000000 }
      ]
    };

    const financialResult = await geminiService.analyzeFinancialData(dummyFinancialData);
    
    if (financialResult.success) {
      console.log('✅ Financial analysis test passed:');
      console.log('Recommendations count:', financialResult.data?.length || 0);
      if (financialResult.data && financialResult.data.length > 0) {
        console.log('First recommendation:', JSON.stringify(financialResult.data[0], null, 2));
      }
    } else {
      console.log('❌ Financial analysis test failed:', financialResult.error);
    }

    // Show service statistics
    console.log('\n6. Service Statistics:');
    const stats = geminiService.getStats();
    console.log(stats);

    console.log('\n🎉 All tests completed successfully!');

  } catch (error: any) {
    console.error('❌ Test failed with error:', error.message);
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testGeminiConnection()
    .then(() => {
      console.log('\n✅ Test completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Test failed:', error);
      process.exit(1);
    });
}

export default testGeminiConnection;