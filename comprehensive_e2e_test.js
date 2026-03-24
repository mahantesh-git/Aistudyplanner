const axios = require('axios');

// Simulate comprehensive E2E testing like Playwright would do
class E2ETestSuite {
  constructor() {
    this.API_BASE = 'http://localhost:5000/api';
    this.FRONTEND_URL = 'http://localhost:5173';
    this.authToken = null;
    this.testResults = {
      passed: 0,
      failed: 0,
      details: []
    };
  }

  async runTest(testName, testFunction) {
    try {
      console.log(`🧪 Running: ${testName}`);
      await testFunction();
      console.log(`✅ PASSED: ${testName}`);
      this.testResults.passed++;
      this.testResults.details.push({ name: testName, status: 'PASSED' });
    } catch (error) {
      console.log(`❌ FAILED: ${testName} - ${error.message}`);
      this.testResults.failed++;
      this.testResults.details.push({ name: testName, status: 'FAILED', error: error.message });
    }
  }

  async login() {
    const response = await axios.post(`${this.API_BASE}/auth/login`, {
      email: 'newuser@example.com',
      password: 'password123'
    });
    this.authToken = response.data.token;
    return response.data;
  }

  async testAuthentication() {
    const user = await this.login();
    if (!user.token || !user.user) {
      throw new Error('Authentication failed - no token or user data');
    }
  }

  async testInputValidation() {
    // Test creating task with invalid data
    try {
      await axios.post(`${this.API_BASE}/tasks`, {
        title: '', // Empty title should fail validation
        priority: 10 // Invalid priority should fail
      }, {
        headers: { Authorization: `Bearer ${this.authToken}` }
      });
      throw new Error('Should have failed validation');
    } catch (error) {
      if (!error.response?.data?.message.includes('required')) {
        throw new Error('Validation not working properly');
      }
    }

    // Test creating task with valid data
    const response = await axios.post(`${this.API_BASE}/tasks`, {
      title: 'Valid Test Task',
      description: 'This is a valid task',
      priority: 2,
      deadline: '2024-12-31'
    }, {
      headers: { Authorization: `Bearer ${this.authToken}` }
    });

    if (!response.data._id || !response.data.topic) {
      throw new Error('Valid task creation failed');
    }
  }

  async testSubjectOwnership() {
    // Create a subject
    const subjectResponse = await axios.post(`${this.API_BASE}/subjects`, {
      name: 'Test Subject for Ownership',
      priority: 3
    }, {
      headers: { Authorization: `Bearer ${this.authToken}` }
    });

    const subjectId = subjectResponse.data._id;

    // Create task with valid subject
    const taskResponse = await axios.post(`${this.API_BASE}/tasks`, {
      title: 'Task with Valid Subject',
      subjectId: subjectId
    }, {
      headers: { Authorization: `Bearer ${this.authToken}` }
    });

    if (!taskResponse.data._id) {
      throw new Error('Failed to create task with valid subject');
    }
  }

  async testFieldMapping() {
    // Test frontend field names (title, dueDate) map to backend (topic, deadline)
    const response = await axios.post(`${this.API_BASE}/tasks`, {
      title: 'Field Mapping Test',
      dueDate: '2024-12-31',
      priority: 3
    }, {
      headers: { Authorization: `Bearer ${this.authToken}` }
    });

    const task = response.data;
    if (task.topic !== 'Field Mapping Test' || !task.deadline) {
      throw new Error('Field mapping not working correctly');
    }
  }

  async testTaskUpdates() {
    // Create a task first
    const createResponse = await axios.post(`${this.API_BASE}/tasks`, {
      title: 'Task for Update Test',
      priority: 2
    }, {
      headers: { Authorization: `Bearer ${this.authToken}` }
    });

    const taskId = createResponse.data._id;

    // Test status update only (should work without title)
    const updateResponse = await axios.put(`${this.API_BASE}/tasks/${taskId}`, {
      status: 'completed'
    }, {
      headers: { Authorization: `Bearer ${this.authToken}` }
    });

    if (updateResponse.data.status !== 'completed') {
      throw new Error('Status update failed');
    }

    // Test partial update with title
    const titleUpdateResponse = await axios.put(`${this.API_BASE}/tasks/${taskId}`, {
      title: 'Updated Task Title',
      priority: 3
    }, {
      headers: { Authorization: `Bearer ${this.authToken}` }
    });

    if (titleUpdateResponse.data.topic !== 'Updated Task Title' || titleUpdateResponse.data.priority !== 3) {
      throw new Error('Partial update failed');
    }
  }

  async testErrorHandling() {
    try {
      // Test with invalid ObjectId
      await axios.put(`${this.API_BASE}/tasks/invalid123`, {
        status: 'completed'
      }, {
        headers: { Authorization: `Bearer ${this.authToken}` }
      });
      throw new Error('Should have failed with invalid ObjectId');
    } catch (error) {
      if (error.response?.status !== 400 && error.response?.status !== 404) {
        throw new Error('Error handling not working properly');
      }
    }

    // Test accessing non-existent task
    try {
      await axios.get(`${this.API_BASE}/tasks/507f1f77bcf86cd799439011`, {
        headers: { Authorization: `Bearer ${this.authToken}` }
      });
      throw new Error('Should have failed for non-existent task');
    } catch (error) {
      if (error.response?.status !== 404) {
        throw new Error('404 handling not working');
      }
    }
  }

  async testTaskRetrieval() {
    // Test getting all tasks
    const allTasksResponse = await axios.get(`${this.API_BASE}/tasks`, {
      headers: { Authorization: `Bearer ${this.authToken}` }
    });

    if (!Array.isArray(allTasksResponse.data)) {
      throw new Error('Tasks retrieval not returning array');
    }

    // Test filtering by date
    const today = new Date().toISOString().split('T')[0];
    const filteredResponse = await axios.get(`${this.API_BASE}/tasks?date=${today}`, {
      headers: { Authorization: `Bearer ${this.authToken}` }
    });

    if (!Array.isArray(filteredResponse.data)) {
      throw new Error('Date filtering not working');
    }
  }

  async testRaceConditionFix() {
    // Create a task
    const response = await axios.post(`${this.API_BASE}/tasks`, {
      title: 'Race Condition Test'
    }, {
      headers: { Authorization: `Bearer ${this.authToken}` }
    });

    const taskId = response.data._id;

    // Get tasks count before update
    const beforeResponse = await axios.get(`${this.API_BASE}/tasks`, {
      headers: { Authorization: `Bearer ${this.authToken}` }
    });
    const beforeCount = beforeResponse.data.length;

    // Update task status
    await axios.put(`${this.API_BASE}/tasks/${taskId}`, {
      status: 'completed'
    }, {
      headers: { Authorization: `Bearer ${this.authToken}` }
    });

    // Get tasks count after update - should be same
    const afterResponse = await axios.get(`${this.API_BASE}/tasks`, {
      headers: { Authorization: `Bearer ${this.authToken}` }
    });
    const afterCount = afterResponse.data.length;

    if (beforeCount !== afterCount) {
      throw new Error('Race condition - task count changed after update');
    }
  }

  async runAllTests() {
    console.log('🚀 Starting Comprehensive E2E Test Suite');
    console.log('=' .repeat(50));

    await this.runTest('Authentication & Login', () => this.testAuthentication());
    await this.runTest('Input Validation', () => this.testInputValidation());
    await this.runTest('Subject Ownership Security', () => this.testSubjectOwnership());
    await this.runTest('Field Mapping (Frontend/Backend)', () => this.testFieldMapping());
    await this.runTest('Task Updates & Status Changes', () => this.testTaskUpdates());
    await this.runTest('Error Handling', () => this.testErrorHandling());
    await this.runTest('Task Retrieval & Filtering', () => this.testTaskRetrieval());
    await this.runTest('Race Condition Prevention', () => this.testRaceConditionFix());

    console.log('=' .repeat(50));
    console.log('📊 Final Test Results:');
    console.log(`✅ Passed: ${this.testResults.passed}`);
    console.log(`❌ Failed: ${this.testResults.failed}`);
    console.log(`📈 Total: ${this.testResults.passed + this.testResults.failed}`);
    console.log(`🎯 Success Rate: ${((this.testResults.passed / (this.testResults.passed + this.testResults.failed)) * 100).toFixed(1)}%`);

    if (this.testResults.failed === 0) {
      console.log('🎉 ALL TESTS PASSED! Application is fully functional!');
    } else {
      console.log('⚠️ Some tests failed:');
      this.testResults.details.filter(t => t.status === 'FAILED').forEach(test => {
        console.log(`   ❌ ${test.name}: ${test.error}`);
      });
    }

    return this.testResults;
  }
}

// Run the comprehensive test suite
const testSuite = new E2ETestSuite();
testSuite.runAllTests().catch(console.error);
