/**
 * Test script for Workflow API
 * 
 * This script tests the complete workflow execution and storage functionality.
 * 
 * Usage:
 *   npm run dev (in one terminal)
 *   node test-workflow-api.js (in another terminal)
 */

const BASE_URL = 'http://localhost:3001';

// Mock authentication token - replace with real token from login
const AUTH_TOKEN = 'your-jwt-token-here';

async function testWorkflowAPI() {
    console.log('🧪 Testing Workflow API...\n');

    try {
        // Test 1: Execute Workflow
        console.log('📝 Test 1: Execute Workflow');
        const executeResponse = await fetch(`${BASE_URL}/api/workflows/execute`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${AUTH_TOKEN}`,
            },
            body: JSON.stringify({
                prompt: 'Create a test to fill out the contact form',
                url: 'https://example.com/contact',
                options: {
                    verbose: true,
                    discoveryOptions: {
                        captureScreenshots: false, // Disable to speed up testing
                    },
                },
            }),
        });

        if (!executeResponse.ok) {
            const error = await executeResponse.json();
            console.error('❌ Execute failed:', error);
            return;
        }

        const executeResult = await executeResponse.json();
        console.log('✅ Workflow executed successfully');
        console.log('   Workflow ID:', executeResult.data.workflow.id);
        console.log('   Status:', executeResult.data.workflow.status);
        console.log('   Activities:', executeResult.data.workflow.activities.length);
        console.log('   Total Time:', executeResult.data.workflow.totalTime, 'ms\n');

        const workflowId = executeResult.data.workflow.id;

        // Test 2: List Workflows
        console.log('📋 Test 2: List Workflows');
        const listResponse = await fetch(`${BASE_URL}/api/workflows?limit=10`, {
            headers: {
                'Authorization': `Bearer ${AUTH_TOKEN}`,
            },
        });

        const listResult = await listResponse.json();
        console.log('✅ Workflows listed successfully');
        console.log('   Total:', listResult.data.pagination.total);
        console.log('   Returned:', listResult.data.workflows.length, '\n');

        // Test 3: Get Workflow Details
        console.log('🔍 Test 3: Get Workflow Details');
        const detailsResponse = await fetch(`${BASE_URL}/api/workflows/${workflowId}`, {
            headers: {
                'Authorization': `Bearer ${AUTH_TOKEN}`,
            },
        });

        const detailsResult = await detailsResponse.json();
        console.log('✅ Workflow details retrieved');
        console.log('   Prompt:', detailsResult.data.userPrompt);
        console.log('   Activities:', detailsResult.data.activities.length, '\n');

        // Test 4: Get Test Model
        console.log('📄 Test 4: Get Test Model');
        const testModelResponse = await fetch(`${BASE_URL}/api/workflows/${workflowId}/test-model`, {
            headers: {
                'Authorization': `Bearer ${AUTH_TOKEN}`,
            },
        });

        const testModelResult = await testModelResponse.json();
        if (testModelResponse.ok) {
            console.log('✅ Test model retrieved');
            console.log('   Test Cases:', testModelResult.data.testCases?.length || 0);
            console.log('   Model Version:', testModelResult.data.modelVersion, '\n');
        } else {
            console.log('ℹ️  No test model generated for this workflow\n');
        }

        // Test 5: Get Discovery Results
        console.log('🔎 Test 5: Get Discovery Results');
        const discoveryResponse = await fetch(`${BASE_URL}/api/workflows/${workflowId}/discovery`, {
            headers: {
                'Authorization': `Bearer ${AUTH_TOKEN}`,
            },
        });

        const discoveryResult = await discoveryResponse.json();
        if (discoveryResponse.ok) {
            console.log('✅ Discovery results retrieved');
            console.log('   URL:', discoveryResult.data.url);
            console.log('   Title:', discoveryResult.data.title);
            console.log('   Element Count:', discoveryResult.data.metadataJson?.elementCount || 0, '\n');
        } else {
            console.log('ℹ️  No discovery results for this workflow\n');
        }

        // Test 6: Get Activities
        console.log('📊 Test 6: Get Workflow Activities');
        const activitiesResponse = await fetch(`${BASE_URL}/api/workflows/${workflowId}/activities`, {
            headers: {
                'Authorization': `Bearer ${AUTH_TOKEN}`,
            },
        });

        const activitiesResult = await activitiesResponse.json();
        console.log('✅ Activities retrieved');
        activitiesResult.data.forEach((activity, index) => {
            console.log(`   ${index + 1}. ${activity.activityType}: ${activity.status} (${activity.duration}ms)`);
        });
        console.log();

        // Test 7: Delete Workflow (optional - uncomment to test)
        // console.log('🗑️  Test 7: Delete Workflow');
        // const deleteResponse = await fetch(`${BASE_URL}/api/workflows/${workflowId}`, {
        //   method: 'DELETE',
        //   headers: {
        //     'Authorization': `Bearer ${AUTH_TOKEN}`,
        //   },
        // });
        // const deleteResult = await deleteResponse.json();
        // console.log('✅ Workflow deleted:', deleteResult.message, '\n');

        console.log('✨ All tests completed successfully!');
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Run tests
testWorkflowAPI();
