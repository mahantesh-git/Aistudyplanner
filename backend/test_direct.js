const mongoose = require('mongoose');
const Task = require('./src/models/Task');

require('dotenv').config();

async function testDirect() {
  try {
    console.log('🔍 Testing direct database connection...');
    
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    // Count all tasks
    const totalTasks = await Task.countDocuments();
    console.log('✅ Total tasks in database:', totalTasks);
    
    // Find all tasks
    const allTasks = await Task.find({});
    console.log('✅ Found', allTasks.length, 'tasks');
    
    // Find tasks for specific user
    const userId = '69c2a6a14a7a54cbd18365d1';
    const userTasks = await Task.find({ userId });
    console.log('✅ Tasks for user:', userTasks.length);
    
    userTasks.forEach((task, index) => {
      console.log(`  ${index + 1}. ${task.topic} (${task.status})`);
    });
    
    // Test with sort
    const sortedTasks = await Task.find({ userId }).sort({ scheduledTime: 1 });
    console.log('✅ Sorted tasks:', sortedTasks.length);
    
    await mongoose.connection.close();
    console.log('✅ Test completed successfully');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testDirect();
