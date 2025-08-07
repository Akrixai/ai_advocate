const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');

// Test JWT verification
async function testJWTVerification() {
  try {
    // First, get a valid token by logging in
    console.log('Testing login with testadmin@example.com and password: Admin@123');
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'testadmin@example.com',
        password: 'Admin@123',
        userType: 'admin',
      }),
    });

    const loginData = await loginResponse.json();
    console.log('Login response status:', loginResponse.status);
    
    if (!loginResponse.ok) {
      console.error('Login failed:', loginData.message);
      return;
    }

    const token = loginData.token;
    console.log('Token received:', token);

    // Now test the templates API with this token
    console.log('\nTesting templates API with the token');
    const templatesResponse = await fetch('http://localhost:3000/api/admin/templates', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const templatesData = await templatesResponse.json();
    console.log('Templates API response status:', templatesResponse.status);
    
    if (templatesResponse.ok) {
      console.log('Templates API call successful');
      console.log(`Retrieved ${templatesData.templates ? templatesData.templates.length : 0} templates`);
    } else {
      console.error('Templates API call failed:', templatesData.message);
    }

    // Test with a malformed token
    console.log('\nTesting with a malformed token');
    const badTokenResponse = await fetch('http://localhost:3000/api/admin/templates', {
      headers: {
        'Authorization': 'Bearer badtoken',
      },
    });

    const badTokenData = await badTokenResponse.json();
    console.log('Bad token response status:', badTokenResponse.status);
    console.log('Bad token response message:', badTokenData.message);

  } catch (error) {
    console.error('Test error:', error);
  }
}

testJWTVerification();