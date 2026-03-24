const axios = require('axios');

async function debugDateFormat() {
  try {
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'newuser@example.com',
      password: 'password123'
    });
    const token = loginResponse.data.token;
    
    console.log('🔍 Testing different date formats...');
    
    // Test with ISO date string
    console.log('\n1. Testing with ISO date string:');
    const response1 = await axios.post('http://localhost:5000/api/tasks', {
      title: 'Date Test 1',
      dueDate: '2024-12-31T23:59:59.999Z'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Deadline:', response1.data.deadline);
    
    // Test with date object format
    console.log('\n2. Testing with date string:');
    const response2 = await axios.post('http://localhost:5000/api/tasks', {
      title: 'Date Test 2',
      dueDate: '2024-12-31'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Deadline:', response2.data.deadline);
    
    // Test with timestamp
    console.log('\n3. Testing with timestamp:');
    const response3 = await axios.post('http://localhost:5000/api/tasks', {
      title: 'Date Test 3',
      dueDate: new Date('2024-12-31').getTime()
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Deadline:', response3.data.deadline);
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

debugDateFormat();
