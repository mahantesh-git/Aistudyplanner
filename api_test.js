const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';
let authToken = '';

// Test functions
async function testLogin() {
  console.log('🔐 Testing Authentication...');
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email: 'newuser@example.com',
      password: 'password123'
    });
    authToken = response.data.token;
    console.log('✅ Login successful');
    return true;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    return false;
  }
}

async function testCreateSubject() {
  console.log('📚 Testing Subject Creation...');
  try {
    const response = await axios.post(`${API_BASE}/subjects`, 
      { name: 'Test Subject', priority: 3 },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    console.log('✅ Subject created:', response.data.name);
    return response.data._id;
  } catch (error) {
    console.error('❌ Subject creation failed:', error.response?.data || error.message);
    return null;
  }
}

async function testAddTopic(subjectId) {
  console.log('📖 Testing Topic Addition...');
  try {
    const response = await axios.post(`${API_BASE}/subjects/${subjectId}/topics`,
      { title: 'Test Topic', difficulty: 3, estimatedTime: 45 },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    console.log('✅ Topic added:', response.data.topics[0].title);
    return true;
  } catch (error) {
    console.error('❌ Topic addition failed:', error.response?.data || error.message);
    return false;
  }
}

async function testCreateManualTask() {
  console.log('➕ Testing Manual Task Creation...');
  try {
    const response = await axios.post(`${API_BASE}/tasks`,
      {
        title: 'Manual Test Task',
        description: 'This is a manually created task',
        priority: 2,
        deadline: '2024-12-31'
      },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    console.log('✅ Manual task created:', response.data.topic);
    console.log('   - Status:', response.data.status);
    console.log('   - Priority:', response.data.priority);
    console.log('   - Description:', response.data.description);
    return response.data._id;
  } catch (error) {
    console.error('❌ Manual task creation failed:', error.response?.data || error.message);
    return null;
  }
}

async function testGenerateStudyPlan() {
  console.log('🤖 Testing AI Study Plan Generation...');
  try {
    const response = await axios.post(`${API_BASE}/study-plan/generate`,
      { date: '2026-03-24', overwrite: true },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    console.log('✅ Study plan generated:');
    console.log('   - Tasks created:', response.data.tasksCreated);
    console.log('   - Date:', response.data.date);
    if (response.data.tasks && response.data.tasks.length > 0) {
      console.log('   - First task:', response.data.tasks[0].topic);
      console.log('   - Task status:', response.data.tasks[0].status);
      console.log('   - Task priority:', response.data.tasks[0].priority);
    }
    return true;
  } catch (error) {
    console.error('❌ Study plan generation failed:', error.response?.data || error.message);
    return false;
  }
}

async function testGetTasks() {
  console.log('📋 Testing Task Retrieval...');
  try {
    const response = await axios.get(`${API_BASE}/tasks`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    console.log('✅ Tasks retrieved:');
    console.log('   - Total tasks:', response.data.length);
    response.data.forEach((task, index) => {
      console.log(`   ${index + 1}. ${task.topic} (${task.status}, priority: ${task.priority})`);
      if (task.description) console.log(`      Description: ${task.description}`);
      if (task.deadline) console.log(`      Deadline: ${task.deadline}`);
    });
    return true;
  } catch (error) {
    console.error('❌ Task retrieval failed:', error.response?.data || error.message);
    return false;
  }
}

async function testUpdateTaskStatus(taskId) {
  console.log('🔄 Testing Task Status Update...');
  try {
    const response = await axios.put(`${API_BASE}/tasks/${taskId}`,
      { status: 'completed' },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    console.log('✅ Task status updated:', response.data.status);
    return true;
  } catch (error) {
    console.error('❌ Task status update failed:', error.response?.data || error.message);
    return false;
  }
}

async function testGetSubjects() {
  console.log('📚 Testing Subject Retrieval...');
  try {
    const response = await axios.get(`${API_BASE}/subjects`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    console.log('✅ Subjects retrieved:');
    response.data.forEach((subject, index) => {
      console.log(`   ${index + 1}. ${subject.name} (Priority: ${subject.priority})`);
      console.log(`      Topics: ${subject.topics.length}`);
    });
    return true;
  } catch (error) {
    console.error('❌ Subject retrieval failed:', error.response?.data || error.message);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Comprehensive API Tests...\n');
  
  const results = [];
  
  // Run tests in sequence
  results.push(await testLogin());
  
  if (authToken) {
    const subjectId = await testCreateSubject();
    results.push(!!subjectId);
    
    if (subjectId) {
      results.push(await testAddTopic(subjectId));
    }
    
    results.push(await testCreateManualTask());
    results.push(await testGenerateStudyPlan());
    results.push(await testGetTasks());
    results.push(await testGetSubjects());
    
    // Get a task ID for status update test
    try {
      const tasksResponse = await axios.get(`${API_BASE}/tasks`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      if (tasksResponse.data.length > 0) {
        results.push(await testUpdateTaskStatus(tasksResponse.data[0]._id));
      }
    } catch (error) {
      console.log('⚠️ Could not test task status update');
      results.push(false);
    }
  }
  
  // Summary
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log('\n📊 Test Results:');
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${total - passed}/${total}`);
  
  if (passed === total) {
    console.log('\n🎉 ALL TESTS PASSED! AI Study Planner is fully functional!');
  } else {
    console.log('\n⚠️ Some tests failed. Check the logs above for details.');
  }
}

// Install axios if needed and run tests
async function main() {
  try {
    await axios.get(`${API_BASE}/health`);
    await runAllTests();
  } catch (error) {
    console.error('❌ Cannot connect to backend. Make sure it\'s running on port 5000.');
  }
}

main().catch(console.error);
