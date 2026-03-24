const mongoose = require('mongoose');
const User = require('./src/models/User');

require('dotenv').config();

async function checkUsers() {
  try {
    console.log('🔍 Checking users in database...');
    
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    // Find all users
    const users = await User.find({});
    console.log('✅ Total users found:', users.length);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email}, ID: ${user._id}, Name: ${user.name}`);
    });
    
    // Check specifically for demo1@gmail.com
    const demoUser = await User.findOne({ email: 'demo1@gmail.com' });
    if (demoUser) {
      console.log('✅ Found demo1@gmail.com user:', demoUser._id);
    } else {
      console.log('❌ demo1@gmail.com user not found');
    }
    
    // Check for newuser@example.com
    const newUser = await User.findOne({ email: 'newuser@example.com' });
    if (newUser) {
      console.log('✅ Found newuser@example.com user:', newUser._id);
    } else {
      console.log('❌ newuser@example.com user not found');
    }
    
    await mongoose.connection.close();
    console.log('✅ Check completed');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkUsers();
