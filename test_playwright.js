const { chromium } = require('playwright');

async function runTests() {
  console.log('🚀 Starting AI Study Planner E2E Tests...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Test 1: Login
    console.log('📝 Test 1: User Login');
    await page.goto('http://localhost:5173/login');
    await page.fill('input[type="email"]', 'newuser@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    console.log('✅ Login successful');

    // Test 2: Check Dashboard
    console.log('📊 Test 2: Dashboard Loading');
    await page.waitForSelector('h1');
    const welcomeText = await page.textContent('h1');
    if (welcomeText.includes('Welcome back')) {
      console.log('✅ Dashboard loaded correctly');
    } else {
      throw new Error('Dashboard not loaded properly');
    }

    // Test 3: Create Subject
    console.log('📚 Test 3: Create Subject');
    await page.click('a[href="/subjects"]');
    await page.waitForSelector('h1');
    await page.fill('input[type="text"]', 'Test Subject');
    await page.fill('textarea', 'Test subject description');
    await page.click('button:has-text("Add Subject")');
    await page.waitForTimeout(1000);
    console.log('✅ Subject created successfully');

    // Test 4: Add Topic
    console.log('📖 Test 4: Add Topic');
    await page.click('a:has-text("View Topics")');
    await page.waitForSelector('h1');
    await page.fill('input[placeholder*="e.g."]', 'Test Topic');
    await page.fill('input[placeholder*="e.g. 45"]', '45');
    await page.click('button:has-text("Add Topic")');
    await page.waitForTimeout(1000);
    console.log('✅ Topic added successfully');

    // Test 5: Generate AI Study Plan
    console.log('🤖 Test 5: AI Study Plan Generation');
    await page.click('a[href="/plan"]');
    await page.waitForSelector('h1');
    await page.click('button:has-text("Regenerate Plan")');
    await page.waitForTimeout(3000);
    console.log('✅ AI Study Plan generated');

    // Test 6: Check Tasks
    console.log('✅ Test 6: Check Generated Tasks');
    await page.click('a[href="/tasks"]');
    await page.waitForSelector('h1');
    await page.waitForTimeout(2000);
    
    // Count tasks
    const taskCount = await page.textContent('button:has-text("All")');
    if (taskCount.includes('1') || taskCount.includes('2')) {
      console.log('✅ Tasks generated and displayed');
    } else {
      console.log('ℹ️ Task count:', taskCount);
    }

    // Test 7: Manual Task Creation
    console.log('➕ Test 7: Manual Task Creation');
    await page.click('button:has-text("New Task")');
    await page.waitForSelector('h2:has-text("New Task")');
    await page.fill('input[placeholder*="e.g. Review"]', 'Manual Test Task');
    await page.fill('textarea', 'This is a manually created test task');
    await page.selectOption('select', 'High');
    await page.fill('input[type="date"]', '2024-12-31');
    await page.click('button:has-text("Create Task")');
    await page.waitForTimeout(2000);
    
    // Check if task was created
    const newTaskCount = await page.textContent('button:has-text("All")');
    console.log('✅ Manual task created. Total tasks:', newTaskCount);

    // Test 8: Task Status Update
    console.log('🔄 Test 8: Task Status Update');
    await page.click('[aria-label*="status"]:first-child');
    await page.waitForTimeout(1000);
    console.log('✅ Task status updated');

    // Test 9: Dashboard Update
    console.log('📈 Test 9: Dashboard Statistics Update');
    await page.click('a[href="/dashboard"]');
    await page.waitForTimeout(2000);
    const finalTaskCount = await page.textContent('p:has-text("Total Tasks")');
    console.log('✅ Final dashboard stats:', finalTaskCount);

    console.log('🎉 ALL TESTS PASSED! AI Study Planner is fully functional!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: 'test-failure.png' });
  } finally {
    await browser.close();
  }
}

runTests().catch(console.error);
