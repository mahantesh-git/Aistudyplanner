const axios = require('axios');

async function testDemo1Delete() {
  try {
    console.log('🔐 Testing demo1@gmail.com login with common passwords...');
    
    // Try common passwords
    const passwords = ['password123', 'demo123', '123456', 'demo', 'password'];
    
    for (const password of passwords) {
      try {
        const login = await axios.post('http://localhost:5000/api/auth/login', {
          email: 'demo1@gmail.com',
          password: password
        });
        console.log('✅ Login successful with password:', password);
        console.log('User ID:', login.data.user.id);
        
        const token = login.data.token;
        
        // Get their tasks
        const tasks = await axios.get('http://localhost:5000/api/tasks', {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Their tasks:', tasks.data.length);
        tasks.data.forEach((task, i) => {
          console.log(`  ${i+1}. ${task.topic} (ID: ${task._id})`);
        });
        
        // Try to delete their first task
        if (tasks.data.length > 0) {
          const firstTaskId = tasks.data[0]._id;
          console.log(`Trying to delete task ${firstTaskId}...`);
          const deleteResponse = await axios.delete(`http://localhost:5000/api/tasks/${firstTaskId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          console.log('✅ Delete successful!');
        }
        
        break;
      } catch (error) {
        console.log('❌ Failed with password:', password);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testDemo1Delete();
