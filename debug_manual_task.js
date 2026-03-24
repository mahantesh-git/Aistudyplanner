const axios = require('axios');

async function debugManualTaskCreation() {
  try {
    console.log('🔐 Step 1: Login...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'newuser@example.com',
      password: 'password123'
    });
    const token = loginResponse.data.token;
    console.log('✅ Login successful');

    console.log('📊 Step 2: Check current tasks before creation...');
    const beforeResponse = await axios.get('http://localhost:5000/api/tasks', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Current tasks:', beforeResponse.data.length);
    beforeResponse.data.forEach((task, i) => {
      console.log(`  ${i+1}. ${task.topic} (${task.status})`);
    });

    console.log('➕ Step 3: Create manual task...');
    const createResponse = await axios.post('http://localhost:5000/api/tasks', {
      title: 'DEBUG Manual Task',
      description: 'Testing manual task creation',
      priority: 3,
      deadline: '2024-12-31'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Task created:', createResponse.data.topic);
    console.log('   Task ID:', createResponse.data._id);
    console.log('   Full response:', JSON.stringify(createResponse.data, null, 2));

    console.log('📋 Step 4: Check tasks after creation...');
    const afterResponse = await axios.get('http://localhost:5000/api/tasks', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Tasks after creation:', afterResponse.data.length);
    afterResponse.data.forEach((task, i) => {
      console.log(`  ${i+1}. ${task.topic} (${task.status})`);
    });

    if (afterResponse.data.length > beforeResponse.data.length) {
      console.log('🎉 SUCCESS: Task was stored in database!');
      const newTask = afterResponse.data.find(t => t._id === createResponse.data._id);
      if (newTask) {
        console.log('✅ New task details:', {
          topic: newTask.topic,
          description: newTask.description,
          priority: newTask.priority,
          status: newTask.status,
          deadline: newTask.deadline
        });
      }
    } else {
      console.log('❌ ISSUE: Task count did not increase');
      console.log('Expected:', beforeResponse.data.length + 1);
      console.log('Actual:', afterResponse.data.length);
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
  }
}

debugManualTaskCreation();
