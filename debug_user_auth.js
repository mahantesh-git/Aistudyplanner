const axios = require('axios');

async function debugUserAuth() {
  try {
    console.log('🔐 Testing different user logins...');
    
    // Test with newuser@example.com
    console.log('\n--- Testing with newuser@example.com ---');
    const login1 = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'newuser@example.com',
      password: 'password123'
    });
    console.log('✅ Login successful - User ID:', login1.data.user.id);
    console.log('   Email:', login1.data.user.email);
    
    const token1 = login1.data.token;
    const tasks1 = await axios.get('http://localhost:5000/api/tasks', {
      headers: { Authorization: `Bearer ${token1}` }
    });
    console.log('✅ Tasks for this user:', tasks1.data.length);
    tasks1.data.forEach((task, i) => {
      console.log(`  ${i+1}. ${task.topic} (ID: ${task._id})`);
    });

    // Test with demo1@gmail.com
    console.log('\n--- Testing with demo1@gmail.com ---');
    try {
      const login2 = await axios.post('http://localhost:5000/api/auth/login', {
        email: 'demo1@gmail.com',
        password: 'password123'
      });
      console.log('✅ Login successful - User ID:', login2.data.user.id);
      console.log('   Email:', login2.data.user.email);
      
      const token2 = login2.data.token;
      const tasks2 = await axios.get('http://localhost:5000/api/tasks', {
        headers: { Authorization: `Bearer ${token2}` }
      });
      console.log('✅ Tasks for this user:', tasks2.data.length);
      tasks2.data.forEach((task, i) => {
        console.log(`  ${i+1}. ${task.topic} (ID: ${task._id})`);
      });
      
      // Try to delete the task that was shown in the error
      const taskIdToDelete = '69c2ab949bbf4f303412095f';
      console.log(`\n--- Trying to delete task ${taskIdToDelete} ---`);
      try {
        const deleteResponse = await axios.delete(`http://localhost:5000/api/tasks/${taskIdToDelete}`, {
          headers: { Authorization: `Bearer ${token2}` }
        });
        console.log('✅ Delete successful');
      } catch (deleteError) {
        console.log('❌ Delete failed:', deleteError.response?.data || deleteError.message);
      }
      
    } catch (loginError) {
      console.log('❌ Login failed for demo1@gmail.com:', loginError.response?.data || loginError.message);
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

debugUserAuth();
