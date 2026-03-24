const axios = require('axios');

// Simulate the frontend API setup
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Add the same interceptor as frontend
api.interceptors.request.use((config) => {
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5YzJhNmExNGE3YTU0Y2JkMTgzNjVkMSIsImlhdCI6MTc3NDM2NTQ2NCwiZXhwIjoxNzc0OTcwMjY0fQ.PKq37HEnmhXkkYE0ZaS4gcjXSN-euOC8Ily7bh-6LCw'; // Simulate localStorage token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log('API Request:', config.method?.toUpperCase(), config.url, config.data);
  return config;
});

async function testFrontendFlow() {
  try {
    console.log('🔍 Step 1: Check authentication (like checkAuth)...');
    try {
      const profileResponse = await api.get('/user/profile');
      console.log('✅ Auth check successful:', profileResponse.data.email);
      console.log('   User ID:', profileResponse.data._id);
    } catch (authError) {
      console.log('❌ Auth check failed:', authError.response?.data || authError.message);
      return;
    }

    console.log('\n📋 Step 2: Fetch tasks (like fetchTasks)...');
    try {
      const tasksResponse = await api.get('/tasks');
      console.log('✅ Tasks fetched:', tasksResponse.data.length);
      
      // Simulate the frontend normalization
      const normalizedTasks = tasksResponse.data.map(task => ({
        ...task,
        title: task.title || task.topic,
        dueDate: task.deadline
      }));
      
      console.log('✅ Normalized tasks:');
      normalizedTasks.forEach((task, i) => {
        console.log(`  ${i+1}. ${task.title} (${task.status})`);
        if (task.dueDate) console.log(`     Due: ${task.dueDate}`);
        if (task.description) console.log(`     Desc: ${task.description}`);
      });
      
    } catch (tasksError) {
      console.log('❌ Tasks fetch failed:', tasksError.response?.data || tasksError.message);
    }

    console.log('\n➕ Step 3: Create a new task (like addTask)...');
    try {
      const createResponse = await api.post('/tasks', {
        title: 'Frontend Test Task',
        description: 'Created via frontend simulation',
        priority: 2,
        deadline: '2024-12-31'
      });
      console.log('✅ Task created:', createResponse.data.topic);
      console.log('   Task ID:', createResponse.data._id);
    } catch (createError) {
      console.log('❌ Task creation failed:', createError.response?.data || createError.message);
    }

    console.log('\n🔄 Step 4: Fetch tasks again to see if new task appears...');
    try {
      const tasksResponse2 = await api.get('/tasks');
      console.log('✅ Tasks after creation:', tasksResponse2.data.length);
      
      const newTask = tasksResponse2.data.find(t => t.topic === 'Frontend Test Task');
      if (newTask) {
        console.log('✅ New task found in database!');
        console.log('   Status:', newTask.status);
        console.log('   Priority:', newTask.priority);
      } else {
        console.log('❌ New task not found in database');
      }
      
    } catch (tasksError2) {
      console.log('❌ Second tasks fetch failed:', tasksError2.response?.data || tasksError2.message);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

testFrontendFlow();
