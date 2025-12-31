// Test backend API connection
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function testConnection() {
    console.log('Testing API Connection...');
    console.log('API URL:', API_BASE_URL);
    console.log('---');

    // Test 1: Root endpoint
    console.log('Test 1: GET / (Root endpoint)');
    try {
        const response = await fetch(`${API_BASE_URL}/`);
        const contentType = response.headers.get('content-type');
        console.log('Status:', response.status);
        console.log('Content-Type:', contentType);

        if (contentType?.includes('application/json')) {
            const data = await response.json();
            console.log('Response:', JSON.stringify(data, null, 2));
        } else {
            const text = await response.text();
            console.log('Response (text):', text.substring(0, 200));
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
    console.log('---');

    // Test 2: Register endpoint
    console.log('Test 2: POST /api/auth/register');
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'password123',
                firstName: 'Test',
                lastName: 'User'
            })
        });

        const contentType = response.headers.get('content-type');
        console.log('Status:', response.status);
        console.log('Content-Type:', contentType);

        if (contentType?.includes('application/json')) {
            const data = await response.json();
            console.log('Response:', JSON.stringify(data, null, 2));
        } else {
            const text = await response.text();
            console.log('Response (text):', text.substring(0, 200));
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
    console.log('---');

    // Test 3: Login endpoint
    console.log('Test 3: POST /api/auth/login');
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'password123'
            })
        });

        const contentType = response.headers.get('content-type');
        console.log('Status:', response.status);
        console.log('Content-Type:', contentType);

        if (contentType?.includes('application/json')) {
            const data = await response.json();
            console.log('Response:', JSON.stringify(data, null, 2));
        } else {
            const text = await response.text();
            console.log('Response (text):', text.substring(0, 200));
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testConnection();
