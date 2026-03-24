const axios = require('axios');

async function debugFieldMapping() {
  try {
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'newuser@example.com',
      password: 'password123'
    });
    const token = loginResponse.data.token;
    
    console.log('🔍 Testing field mapping...');
    const response = await axios.post('http://localhost:5000/api/tasks', {
      title: 'Field Mapping Test',
      dueDate: '2024-12-31',
      priority: 3
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    console.log('Has topic:', !!response.data.topic);
    console.log('Has title:', !!response.data.title);
    console.log('Has deadline:', !!response.data.deadline);
    console.log('Has dueDate:', !!response.data.dueDate);
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

debugFieldMapping();
