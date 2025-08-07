// Test script for admin login functionality

async function testAdminLogin() {
  try {
    console.log('Testing login with testadmin@example.com and password: Admin@123');
    const response = await fetch('http://localhost:3000/api/auth/login', {
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

    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', data);

    if (response.ok) {
      console.log('Login successful!');
      console.log('User:', data.user);
      console.log('Token:', data.token);
    } else {
      console.log('Login failed:', data.message);
    }
  } catch (error) {
    console.error('Error during login test:', error);
  }
}

testAdminLogin();