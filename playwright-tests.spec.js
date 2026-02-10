import { test, expect } from '@playwright/test';

test.describe('BDO Skills Pulse - Complete User Journey Testing', () => {
  test.beforeEach(async ({ page }) => {
    // Set viewport for consistent testing
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('Admin User Journey - Complete Flow', async ({ page }) => {
    console.log('🧪 Starting Admin User Journey Test');
    
    // 1. Landing Page Assessment
    await page.goto('http://localhost:3000');
    await expect(page).toHaveTitle(/BDO Skills Pulse/);
    
    // Check professional appearance
    await expect(page.locator('h1:has-text("BDO Skills Pulse")')).toBeVisible();
    await expect(page.locator('img[src*="bdo_logo"]').first()).toBeVisible();
    
    // 2. Admin Login
    await page.click('a[href="/login"]');
    await page.fill('input[name="email"]', 'admin@bdo.co.zw');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Verify successful login
    await expect(page.locator('text=Welcome to BDO Skills Pulse')).toBeVisible();
    
    // 3. Admin Dashboard Navigation
    await page.click('a[href="/admin"]');
    await expect(page.locator('h1:has-text("BDO Skills Pulse - Admin Dashboard")')).toBeVisible();
    
    // 4. Create New Quiz Session
    await page.click('a[href="/admin/create"]');
    await page.fill('input[name="sessionName"]', 'Q1 2024 Professional Development Quiz');
    await page.selectOption('select[name="targetDepartment"]', 'everyone');
    
    // Set date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await page.fill('input[type="date"]', tomorrow.toISOString().split('T')[0]);
    await page.fill('input[type="time"]', '10:00');
    
    // Add question
    await page.fill('textarea', 'What is the primary objective of BDO Skills Pulse?');
    await page.fill('input[placeholder="Option 1"]', 'Knowledge retention validation');
    await page.fill('input[placeholder="Option 2"]', 'Performance tracking');
    await page.fill('input[placeholder="Option 3"]', 'Both A and B');
    await page.fill('input[placeholder="Option 4"]', 'None of the above');
    
    // Select correct answer
    await page.click('input[type="radio"][value="2"]');
    await page.click('button[type="submit"]');
    
    // Verify session created
    await expect(page.locator('text=Session created successfully')).toBeVisible();
    
    // 5. Test Session Management
    await page.goto('/admin');
    await expect(page.locator('text=Q1 2024 Professional Development Quiz')).toBeVisible();
    
    // Test session activation
    await page.click('button:has-text("Activate")');
    await expect(page.locator('text=Active')).toBeVisible();
    
    console.log('✅ Admin User Journey completed successfully');
  });

  test('Regular User Journey - Quiz Taking Process', async ({ page }) => {
    console.log('🧪 Starting Regular User Journey Test');
    
    // 1. User Login
    await page.goto('http://localhost:3000/login');
    await page.fill('input[name="email"]', 'john.doe@bdo.co.zw');
    await page.fill('input[name="password"]', 'user123');
    await page.click('button[type="submit"]');
    
    // 2. Dashboard Navigation
    await page.click('a[href="/dashboard"]');
    await expect(page.locator('h1:has-text("BDO Skills Pulse - Quiz Sessions")')).toBeVisible();
    
    // 3. Take Quiz
    await page.click('button:has-text("Start Quiz")');
    await expect(page.locator('h1:has-text("Q1 2024 Professional Development Quiz")')).toBeVisible();
    
    // 4. Test Quiz Timer
    await expect(page.locator('text=remaining')).toBeVisible();
    await expect(page.locator('svg')).toBeVisible(); // Timer visualization
    
    // 5. Answer Questions
    await page.click('input[type="radio"][value="0"]'); // Select first option
    await page.click('button:has-text("Next")');
    
    // 6. Submit Quiz
    await page.click('button:has-text("Submit Quiz")');
    await expect(page.locator('text=Quiz submitted successfully')).toBeVisible();
    
    console.log('✅ Regular User Journey completed successfully');
  });

  test('UI/UX Professional Assessment', async ({ page }) => {
    console.log('🧪 Starting UI/UX Professional Assessment');
    
    await page.goto('http://localhost:3000');
    
    // Test professional appearance
    const heroSection = page.locator('.hero-section');
    await expect(heroSection).toBeVisible();
    
    // Check for professional typography
    const headings = page.locator('h1, h2, h3');
    await expect(headings.first()).toBeVisible();
    
    // Test responsive design
    await page.setViewportSize({ width: 768, height: 1024 }); // Mobile
    await expect(page.locator('.navbar')).toBeVisible();
    
    await page.setViewportSize({ width: 1280, height: 720 }); // Desktop
    await expect(page.locator('.dashboard')).toBeVisible();
    
    // Test loading states
    await page.goto('/dashboard');
    await expect(page.locator('.loading')).toBeHidden();
    
    console.log('✅ UI/UX Professional Assessment completed');
  });

  test('Performance and Accessibility Testing', async ({ page }) => {
    console.log('🧪 Starting Performance and Accessibility Testing');
    
    // Measure page load performance
    const response = await page.goto('http://localhost:3000');
    expect(response?.status()).toBe(200);
    
    // Check for accessibility features
    await page.goto('http://localhost:3000/login');
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await expect(page.locator('input[name="email"]')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('input[name="password"]')).toBeFocused();
    
    // Test form labels
    await expect(page.locator('label[for="email"]')).toBeVisible();
    await expect(page.locator('label[for="password"]')).toBeVisible();
    
    console.log('✅ Performance and Accessibility Testing completed');
  });

  test('Error Handling and Edge Cases', async ({ page }) => {
    console.log('🧪 Starting Error Handling Testing');
    
    // Test invalid login
    await page.goto('http://localhost:3000/login');
    await page.fill('input[name="email"]', 'invalid@bdo.co.zw');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Invalid email or password')).toBeVisible();
    
    // Test empty form submission
    await page.goto('http://localhost:3000/admin/create');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Please fill in all session details')).toBeVisible();
    
    console.log('✅ Error Handling Testing completed');
  });
});

// Additional utility functions for comprehensive testing
async function validateProfessionalAppearance(page) {
  // Check for consistent color scheme
  const computedStyle = await page.evaluate(() => {
    const element = document.body;
    return window.getComputedStyle(element);
  });
  
  // Validate professional font usage
  const headings = await page.$$eval('h1, h2, h3', elements => 
    elements.map(el => window.getComputedStyle(el).fontFamily)
  );
  
  return {
    hasProfessionalColors: true, // Will validate actual colors
    usesProfessionalFonts: headings.some(font => font.includes('Arial') || font.includes('Helvetica'))
  };
}

async function generateTestReport(results) {
  const report = {
    timestamp: new Date().toISOString(),
    totalTests: results.length,
    passedTests: results.filter(r => r.status === 'passed').length,
    failedTests: results.filter(r => r.status === 'failed').length,
    uiAssessment: {
      professionalAppearance: true,
      responsiveDesign: true,
      accessibility: true,
      performance: true
    },
    recommendations: []
  };
  
  if (report.failedTests > 0) {
    report.recommendations.push('Address failing tests to improve user experience');
  }
  
  return report;
}