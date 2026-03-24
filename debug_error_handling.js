const axios = require('axios');

async function debugErrorHandling() {
  try {
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'newuser@example.com',
      password: 'password123'
    });
    const token = loginResponse.data.token;
    
    console.log('🔍 Testing error handling...');
    
    // Test 1: Invalid ObjectId
    console.log('\n1. Testing invalid ObjectId:');
    try {
      await axios.put('http://localhost:5000/api/tasks/invalid123', {
        status: 'completed'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('❌ Should have failed');
    } catch (error) {
      console.log('Status:', error.response?.status);
      console.log('Data:', error.response?.data);
      console.log('Expected 400 or 404, got:', error.response?.status);
    }
    
    // Test 2: Non-existent task
    console.log('\n2. Testing non-existent task:');
    try {
      await axios.get('http://localhost:5000/api/tasks/507f1f77bcf86cd799439011', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('❌ Should have failed');
    } catch (error) {
      console.log('Status:', error.response?.status);
      console.log('Data:', error.response?.data);
      console.log('Expected 404, got:', error.response?.status);
    }
    
    // Test 3: Invalid status
    console.log('\n3. Testing invalid status:');
    try {
      await axios.put('http://localhost:5000/api/tasks/507f1f77bcf86cd799439011', {
        status: 'invalid_status'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('❌ Should have failed');
    } catch (error) {
      console.log('Status:', error.response?.status);
      console.log('Data:', error.response?.data);
      console.log('Expected 400 or 404, got:', error.response?.status);
    }
    
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
  }
}

debugErrorHandling();
