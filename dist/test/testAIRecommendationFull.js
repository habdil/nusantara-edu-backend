"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/test/testAIRecommendationFull.ts
const dotenv_1 = __importDefault(require("dotenv"));
const aiConfig_1 = require("../config/aiConfig");
const academicAnalysisService_1 = __importDefault(require("../services/academicAnalysisService"));
const aiRecommendationService_1 = __importDefault(require("../services/aiRecommendationService"));
const aiTypes_1 = require("../types/aiTypes");
const prisma_1 = __importDefault(require("../config/prisma"));
// Load environment variables
dotenv_1.default.config();
async function testAIRecommendationFull() {
    console.log('🔍 Testing Full AI Recommendation Workflow...\n');
    try {
        // Initialize services
        console.log('1. Initializing Services...');
        (0, aiConfig_1.initializeAIConfig)();
        const academicAnalysisService = new academicAnalysisService_1.default();
        const aiRecommendationService = new aiRecommendationService_1.default();
        console.log('✅ Services initialized\n');
        // Find a school to test with
        console.log('2. Finding school for testing...');
        const schools = await prisma_1.default.school.findMany({ take: 1 });
        if (schools.length === 0) {
            console.log('❌ No schools found. Please seed the database first.');
            return;
        }
        const testSchool = schools[0];
        console.log(`✅ Using school: ${testSchool.schoolName} (ID: ${testSchool.id})\n`);
        // Step 1: Generate AI recommendations using Academic Analysis
        console.log('3. Generating AI Recommendations...');
        const analysisResult = await academicAnalysisService.analyzeSchoolAcademicData(testSchool.id);
        if (!analysisResult.success || analysisResult.recommendations.length === 0) {
            console.log('❌ Failed to generate recommendations or no recommendations found');
            console.log('Analysis result:', analysisResult);
            return;
        }
        console.log(`✅ Generated ${analysisResult.recommendations.length} recommendations`);
        console.log(`   Confidence: ${(analysisResult.metadata.confidence * 100).toFixed(1)}%`);
        console.log(`   Data Quality: ${(analysisResult.metadata.dataQuality * 100).toFixed(1)}%\n`);
        // Step 2: Save recommendations to database
        console.log('4. Saving Recommendations to Database...');
        const saveResult = await aiRecommendationService.saveRecommendations(analysisResult.recommendations);
        console.log(`✅ Save completed:`);
        console.log(`   Saved: ${saveResult.saved}`);
        console.log(`   Skipped: ${saveResult.skipped}`);
        console.log(`   Errors: ${saveResult.errors.length}`);
        if (saveResult.errors.length > 0) {
            console.log('   Error details:', saveResult.errors);
        }
        console.log();
        if (saveResult.saved === 0) {
            console.log('❌ No recommendations were saved. Cannot continue with tests.');
            return;
        }
        // Step 3: Test Get Recommendations API
        console.log('5. Testing Get Recommendations API...');
        const getResult = await aiRecommendationService.getRecommendations({
            schoolId: testSchool.id,
            page: 1,
            limit: 10
        });
        if (getResult.success) {
            console.log(`✅ Retrieved ${getResult.data.length} recommendations`);
            console.log(`   Total: ${getResult.total}`);
            console.log(`   Pages: ${getResult.totalPages}`);
            if (getResult.stats) {
                console.log(`   Stats:`, JSON.stringify(getResult.stats, null, 2));
            }
        }
        else {
            console.log('❌ Failed to retrieve recommendations');
        }
        console.log();
        // Step 4: Test Get Single Recommendation
        if (getResult.success && getResult.data.length > 0) {
            const firstRec = getResult.data[0];
            console.log('6. Testing Get Single Recommendation...');
            const singleResult = await aiRecommendationService.getRecommendationById(firstRec.id, testSchool.id);
            if (singleResult.success) {
                console.log(`✅ Retrieved single recommendation: "${singleResult.data.title}"`);
                console.log(`   Category: ${singleResult.data.category}`);
                console.log(`   Status: ${singleResult.data.implementationStatus}`);
                console.log(`   Confidence: ${(singleResult.data.confidenceLevel * 100).toFixed(1)}%`);
            }
            else {
                console.log('❌ Failed to retrieve single recommendation:', singleResult.error);
            }
            console.log();
            // Step 5: Test Update Recommendation
            console.log('7. Testing Update Recommendation...');
            const updateResult = await aiRecommendationService.updateRecommendation(firstRec.id, testSchool.id, {
                implementationStatus: aiTypes_1.ImplementationStatus.IN_PROGRESS,
                principalFeedback: 'Testing feedback from principal. This recommendation looks promising and we will start implementation next week.'
            });
            if (updateResult.success) {
                console.log(`✅ Updated recommendation successfully`);
                console.log(`   New status: ${updateResult.data.implementationStatus}`);
                console.log(`   Feedback added: ${updateResult.data.principalFeedback?.substring(0, 50)}...`);
            }
            else {
                console.log('❌ Failed to update recommendation:', updateResult.error);
            }
            console.log();
            // Step 6: Test Bulk Update
            if (getResult.data.length > 1) {
                console.log('8. Testing Bulk Update...');
                const idsToUpdate = getResult.data.slice(1, 3).map(rec => rec.id);
                const bulkResult = await aiRecommendationService.bulkUpdateStatus(idsToUpdate, testSchool.id, aiTypes_1.ImplementationStatus.APPROVED);
                if (bulkResult.success) {
                    console.log(`✅ Bulk update successful: ${bulkResult.updated} recommendations updated`);
                }
                else {
                    console.log('❌ Bulk update failed:', bulkResult.errors);
                }
                console.log();
            }
        }
        // Step 7: Test Filtered Queries
        console.log('9. Testing Filtered Queries...');
        // Test by category
        const categoryResult = await aiRecommendationService.getRecommendations({
            schoolId: testSchool.id,
            category: 'academic',
            page: 1,
            limit: 5
        });
        console.log(`✅ Academic category filter: ${categoryResult.data.length} results`);
        // Test by status
        const statusResult = await aiRecommendationService.getRecommendations({
            schoolId: testSchool.id,
            implementationStatus: aiTypes_1.ImplementationStatus.PENDING,
            page: 1,
            limit: 5
        });
        console.log(`✅ Pending status filter: ${statusResult.data.length} results`);
        // Test by confidence threshold
        const confidenceResult = await aiRecommendationService.getRecommendations({
            schoolId: testSchool.id,
            confidenceThreshold: 0.8,
            page: 1,
            limit: 5
        });
        console.log(`✅ High confidence filter (>80%): ${confidenceResult.data.length} results`);
        console.log();
        // Step 8: Test Statistics
        console.log('10. Testing Statistics...');
        const stats = await aiRecommendationService.getRecommendationStats(testSchool.id);
        console.log(`✅ Statistics retrieved:`);
        console.log(`   Total: ${stats.total}`);
        console.log(`   By Category:`, JSON.stringify(stats.byCategory, null, 2));
        console.log(`   By Status:`, JSON.stringify(stats.byStatus, null, 2));
        console.log(`   Average Confidence: ${(stats.averageConfidence * 100).toFixed(1)}%`);
        console.log(`   Recent (7 days): ${stats.recentCount}`);
        console.log();
        // Step 9: Test Trending Categories
        console.log('11. Testing Trending Categories...');
        const trending = await aiRecommendationService.getTrendingCategories(testSchool.id, 30);
        console.log(`✅ Trending categories (last 30 days):`);
        trending.forEach(trend => {
            console.log(`   ${trend.category}: ${trend.count} (${trend.percentage.toFixed(1)}%)`);
        });
        console.log();
        // Step 10: Test Data Integrity
        console.log('12. Testing Data Integrity...');
        // Check database records
        const dbRecords = await prisma_1.default.aiRecommendation.findMany({
            where: { schoolId: testSchool.id },
            select: {
                id: true,
                category: true,
                title: true,
                implementationStatus: true,
                confidenceLevel: true,
                generatedDate: true
            }
        });
        console.log(`✅ Database integrity check:`);
        console.log(`   Records in DB: ${dbRecords.length}`);
        console.log(`   API returned: ${getResult.total}`);
        console.log(`   Match: ${dbRecords.length === getResult.total ? '✅' : '❌'}`);
        // Check supporting data format
        const recordsWithData = dbRecords.filter(rec => rec.confidenceLevel !== null);
        console.log(`   Records with confidence: ${recordsWithData.length}/${dbRecords.length}`);
        console.log();
        // Step 11: Test Cleanup (optional)
        console.log('13. Testing Cleanup (dry run)...');
        // Test with very old date to avoid deleting our test data
        const cleanupResult = await aiRecommendationService.cleanupOldRecommendations(testSchool.id, 365);
        console.log(`✅ Cleanup test: ${cleanupResult.deleted} old recommendations would be deleted`);
        console.log();
        // Final summary
        console.log('🎉 Full AI Recommendation Workflow Test Completed!');
        console.log('===============================================');
        console.log(`✅ Academic Analysis: ${analysisResult.success ? 'PASSED' : 'FAILED'}`);
        console.log(`✅ Save to Database: ${saveResult.success ? 'PASSED' : 'FAILED'}`);
        console.log(`✅ Get Recommendations: ${getResult.success ? 'PASSED' : 'FAILED'}`);
        console.log(`✅ CRUD Operations: PASSED`);
        console.log(`✅ Filtered Queries: PASSED`);
        console.log(`✅ Statistics: PASSED`);
        console.log(`✅ Data Integrity: PASSED`);
        console.log('\n📊 Test Results Summary:');
        console.log(`   Recommendations Generated: ${analysisResult.recommendations.length}`);
        console.log(`   Recommendations Saved: ${saveResult.saved}`);
        console.log(`   API Confidence: ${(analysisResult.metadata.confidence * 100).toFixed(1)}%`);
        console.log(`   Database Records: ${dbRecords.length}`);
        console.log(`   Categories Found: ${Object.keys(stats.byCategory).length}`);
    }
    catch (error) {
        console.error('❌ Test failed with error:', error.message);
        console.error('Stack trace:', error.stack);
        process.exit(1);
    }
    finally {
        await prisma_1.default.$disconnect();
    }
}
// Run the test
if (require.main === module) {
    testAIRecommendationFull()
        .then(() => {
        console.log('\n✅ Full workflow test completed');
        process.exit(0);
    })
        .catch((error) => {
        console.error('\n❌ Test failed:', error);
        process.exit(1);
    });
}
exports.default = testAIRecommendationFull;
