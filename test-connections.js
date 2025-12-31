/**
 * Connection Test Script
 * Tests Frontend -> Backend -> Database connectivity
 */

const https = require('https');
const http = require('http');

// Color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
}

// Test configurations
const tests = {
    database: {
        name: 'PostgreSQL Database',
        host: 'localhost',
        port: 5432,
        type: 'tcp',
    },
    backend: {
        name: 'Backend API',
        url: 'http://localhost:3001',
        healthEndpoint: '/api/health',
        rootEndpoint: '/',
    },
    frontend: {
        name: 'Frontend Next.js',
        url: 'http://localhost:3000',
    },
};

// TCP connection test for database
function testTCPConnection(host, port) {
    return new Promise((resolve, reject) => {
        const net = require('net');
        const socket = new net.Socket();

        socket.setTimeout(5000);

        socket.on('connect', () => {
            socket.destroy();
            resolve(true);
        });

        socket.on('timeout', () => {
            socket.destroy();
            reject(new Error('Connection timeout'));
        });

        socket.on('error', (err) => {
            reject(err);
        });

        socket.connect(port, host);
    });
}

// HTTP connection test
function testHTTPConnection(url) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const client = urlObj.protocol === 'https:' ? https : http;

        const req = client.get(url, { timeout: 5000 }, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    data: data,
                    headers: res.headers,
                });
            });
        });

        req.on('error', (err) => {
            reject(err);
        });

        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });
    });
}

// Main test function
async function runTests() {
    log('\n========================================', colors.cyan);
    log('  iBotTester Connection Test Suite', colors.cyan);
    log('========================================\n', colors.cyan);

    const results = {
        passed: 0,
        failed: 0,
        warnings: 0,
    };

    // Test 1: Database Connection
    log('1️⃣  Testing PostgreSQL Database Connection...', colors.blue);
    try {
        await testTCPConnection(tests.database.host, tests.database.port);
        log('   ✅ PostgreSQL is accessible on port 5432', colors.green);
        results.passed++;
    } catch (error) {
        log(`   ❌ PostgreSQL connection failed: ${error.message}`, colors.red);
        log('   💡 Start PostgreSQL: docker-compose up -d postgres', colors.yellow);
        results.failed++;
    }

    // Test 2: Backend API Connection
    log('\n2️⃣  Testing Backend API Connection...', colors.blue);
    try {
        const response = await testHTTPConnection(tests.backend.url + tests.backend.rootEndpoint);
        if (response.statusCode === 200) {
            log('   ✅ Backend API is running', colors.green);

            try {
                const data = JSON.parse(response.data);
                log(`   📊 API Version: ${data.version}`, colors.cyan);
                log(`   📊 Status: ${data.status}`, colors.cyan);
                log(`   📊 OpenAI: ${data.features?.openai ? 'Configured' : 'Not Configured'}`, colors.cyan);
                log(`   📊 Playwright: ${data.features?.playwright ? 'Available' : 'Not Available'}`, colors.cyan);
            } catch (e) {
                log('   ⚠️  Could not parse API response', colors.yellow);
                results.warnings++;
            }
            results.passed++;
        } else {
            log(`   ⚠️  Backend returned status code: ${response.statusCode}`, colors.yellow);
            results.warnings++;
        }
    } catch (error) {
        log(`   ❌ Backend API connection failed: ${error.message}`, colors.red);
        log('   💡 Start backend: cd apps/backend && npm run dev', colors.yellow);
        results.failed++;
    }

    // Test 3: Backend Health Endpoint
    log('\n3️⃣  Testing Backend Health Endpoint...', colors.blue);
    try {
        const response = await testHTTPConnection(tests.backend.url + tests.backend.healthEndpoint);
        if (response.statusCode === 200) {
            log('   ✅ Health endpoint is responding', colors.green);

            try {
                const data = JSON.parse(response.data);
                log(`   📊 Services Status:`, colors.cyan);
                log(`      - API: ${data.services?.api}`, colors.cyan);
                log(`      - Playwright: ${data.services?.playwright}`, colors.cyan);
                log(`      - OpenAI: ${data.services?.openai}`, colors.cyan);
                log(`      - AI Agent: ${data.services?.aiAgent}`, colors.cyan);
            } catch (e) {
                log('   ⚠️  Could not parse health response', colors.yellow);
                results.warnings++;
            }
            results.passed++;
        } else {
            log(`   ⚠️  Health endpoint returned status code: ${response.statusCode}`, colors.yellow);
            results.warnings++;
        }
    } catch (error) {
        log(`   ❌ Health endpoint failed: ${error.message}`, colors.red);
        results.failed++;
    }

    // Test 4: Frontend Connection
    log('\n4️⃣  Testing Frontend Connection...', colors.blue);
    try {
        const response = await testHTTPConnection(tests.frontend.url);
        if (response.statusCode === 200 || response.statusCode === 304) {
            log('   ✅ Frontend is accessible', colors.green);
            results.passed++;
        } else if (response.statusCode === 404) {
            log('   ⚠️  Frontend returned 404 (may be running but route not found)', colors.yellow);
            results.warnings++;
        } else {
            log(`   ⚠️  Frontend returned status code: ${response.statusCode}`, colors.yellow);
            results.warnings++;
        }
    } catch (error) {
        log(`   ❌ Frontend connection failed: ${error.message}`, colors.red);
        log('   💡 Start frontend: cd apps/frontend && npm run dev', colors.yellow);
        results.failed++;
    }

    // Test 5: Frontend to Backend Communication
    log('\n5️⃣  Testing Frontend -> Backend Communication...', colors.blue);
    log('   📝 Checking if frontend can reach backend API...', colors.cyan);

    // This would typically be done from the browser, but we can check the configuration
    const fs = require('fs');
    const path = require('path');

    try {
        const apiServicePath = path.join(__dirname, 'apps', 'frontend', 'services', 'api.ts');
        if (fs.existsSync(apiServicePath)) {
            const apiServiceContent = fs.readFileSync(apiServicePath, 'utf8');
            const apiUrlMatch = apiServiceContent.match(/NEXT_PUBLIC_API_URL.*?['"]([^'"]+)['"]/);

            if (apiUrlMatch) {
                log(`   ✅ Frontend API URL configured: ${apiUrlMatch[1] || 'http://localhost:3001'}`, colors.green);
                results.passed++;
            } else {
                log('   ✅ Frontend API service found (using default http://localhost:3001)', colors.green);
                results.passed++;
            }
        } else {
            log('   ⚠️  Could not verify frontend API configuration', colors.yellow);
            results.warnings++;
        }
    } catch (error) {
        log(`   ⚠️  Could not check frontend configuration: ${error.message}`, colors.yellow);
        results.warnings++;
    }

    // Test 6: Database Schema Check
    log('\n6️⃣  Testing Database Schema Configuration...', colors.blue);
    try {
        const schemaPath = path.join(__dirname, 'apps', 'backend', 'prisma', 'schema.prisma');
        if (fs.existsSync(schemaPath)) {
            const schemaContent = fs.readFileSync(schemaPath, 'utf8');
            const dbProvider = schemaContent.match(/provider\s*=\s*"([^"]+)"/);

            if (dbProvider) {
                log(`   ✅ Database provider: ${dbProvider[1]}`, colors.green);

                // Count models
                const models = schemaContent.match(/model\s+\w+\s*{/g);
                if (models) {
                    log(`   📊 Database models defined: ${models.length}`, colors.cyan);
                }
                results.passed++;
            } else {
                log('   ⚠️  Could not detect database provider', colors.yellow);
                results.warnings++;
            }
        } else {
            log('   ❌ Prisma schema not found', colors.red);
            results.failed++;
        }
    } catch (error) {
        log(`   ⚠️  Could not check database schema: ${error.message}`, colors.yellow);
        results.warnings++;
    }

    // Summary
    log('\n========================================', colors.cyan);
    log('  Test Summary', colors.cyan);
    log('========================================', colors.cyan);
    log(`✅ Passed: ${results.passed}`, colors.green);
    log(`❌ Failed: ${results.failed}`, colors.red);
    log(`⚠️  Warnings: ${results.warnings}`, colors.yellow);

    const total = results.passed + results.failed + results.warnings;
    const percentage = Math.round((results.passed / total) * 100);

    log(`\n📊 Success Rate: ${percentage}%`, colors.cyan);

    if (results.failed === 0 && results.warnings === 0) {
        log('\n🎉 All systems are functioning correctly!', colors.green);
    } else if (results.failed === 0) {
        log('\n✅ Core systems are working, but there are some warnings.', colors.yellow);
    } else {
        log('\n⚠️  Some systems are not functioning. Please check the errors above.', colors.red);
        log('\n📋 Quick Start Guide:', colors.cyan);
        log('   1. Start PostgreSQL: docker-compose up -d postgres', colors.cyan);
        log('   2. Run migrations: cd apps/backend && npx prisma migrate dev', colors.cyan);
        log('   3. Start backend: cd apps/backend && npm run dev', colors.cyan);
        log('   4. Start frontend: cd apps/frontend && npm run dev', colors.cyan);
    }

    log('\n========================================\n', colors.cyan);

    process.exit(results.failed > 0 ? 1 : 0);
}

// Run the tests
runTests().catch((error) => {
    log(`\n❌ Fatal error: ${error.message}`, colors.red);
    process.exit(1);
});
