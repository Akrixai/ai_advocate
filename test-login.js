// Test script for login functionality

async function testLogin() {
  // Use the known working password
  const passwords = [
    'Test@123'
  ];

  for (const password of passwords) {
    try {
      console.log(`Testing login with testlawyer@example.com and password: ${password}`);
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'testlawyer@example.com',
          password: password,
          userType: 'lawyer',
        }),
      });

      const data = await response.json();
      console.log('Response status:', response.status);
      console.log('Response data:', data);

      if (response.ok) {
        console.log('Login successful!');
        console.log('User:', data.user);
        console.log('Token:', data.token);
        break; // Stop trying passwords if one works
      } else {
        console.log('Login failed:', data.message);
      }
      
      // Add a small delay between attempts
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error('Error during login test:', error);
    }
  }
}

testLogin();