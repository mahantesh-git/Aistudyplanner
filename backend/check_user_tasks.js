const mongoose = require('mongoose');
const Task = require('./src/models/Task');
const User = require('./src/models/User');

require('dotenv').config();

async function checkUserTasks() {
  try {
    console.log('🔍 Checking tasks for each user...');
    
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    // Get demo1@gmail.com user
    const demo1User = await User.findOne({ email: 'demo1@gmail.com' });
    if (demo1User) {
      const demo1Tasks = await Task.find({ userId: demo1User._id });
      console.log(`✅ demo1@gmail.com (${demo1User._id}) has ${demo1Tasks.length} tasks:`);
      demo1Tasks.forEach((task, i) => {
        console.log(`  ${i+1}. ${task.topic} (ID: ${task._id})`);
      });
    }
    
    // Get newuser@example.com user
    const newUser = await User.findOne({ email: 'newuser@example.com' });
    if (newUser) {
      const newTasks = await Task.find({ userId: newUser._id });
      console.log(`✅ newuser@example.com (${newUser._id}) has ${newTasks.length} tasks:`);
      newTasks.forEach((task, i) => {
        console.log(`  ${i+1}. ${task.topic} (ID: ${task._id})`);
      });
    }
    
    // Check the specific task ID from the error
    const taskIdToDelete = '69c2ab949bbf4f303412095f';
    const specificTask = await Task.findById(taskIdToDelete);
    if (specificTask) {
      console.log(`✅ Task ${taskIdToDelete} belongs to user: ${specificTask.userId}`);
      console.log(`   Task topic: ${specificTask.topic}`);
    } else {
      console.log(`❌ Task ${taskIdToDelete} not found`);
    }
    
    await mongoose.connection.close();
    console.log('✅ Check completed');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkUserTasks();
