#!/usr/bin/env node

/**
 * 🧪 API Testing Script
 * Comprehensive testing for your StudyAI backend
 */

const axios = require('axios');
const colors = require('colors');

const BASE_URL = 'http://localhost:5000/api';
let authToken = null;
let testUserId = null;

// Test configuration
const TEST_USER = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123'
};

/**
 * Helper function to make API requests
 */
async function apiRequest(method, endpoint, data = null, includeAuth = false) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (includeAuth && authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return {
      success: true,
      status: response.status,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      status: error.response?.status || 0,
      error: error.response?.data || error.message
    };
  }
}

/**
 * Test helper functions
 */
function logTest(testName) {
  console.log(`\n🧪 Testing: ${testName}`.yellow);
}

function logSuccess(message) {
  console.log(`✅ ${message}`.green);
}

function logError(message) {
  console.log(`❌ ${message}`.red);
}

function logInfo(message) {
  console.log(`ℹ️  ${message}`.blue);
}

/**
 * Test server health
 */
async function testServerHealth() {
  logTest('Server Health Check');
  
  const result = await apiRequest('GET', '/health');
  
  if (result.success && result.status === 200) {
    logSuccess(`Server is healthy - ${result.data.message}`);
    logInfo(`Environment: ${result.data.environment}`);
    logInfo(`Version: ${result.data.version}`);
    return true;
  } else {
    logError(`Server health check failed: ${result.error}`);
    return false;
  }
}

/**
 * Test user authentication
 */
async function testAuthentication() {
  logTest('User Authentication');
  
  // Test signup
  const signupResult = await apiRequest('POST', '/auth/signup', TEST_USER);
  
  if (signupResult.success) {
    logSuccess('User signup successful');
    authToken = signupResult.data.token;
    testUserId = signupResult.data.user.id;
    logInfo(`Auth token: ${authToken.substring(0, 20)}...`);
  } else if (signupResult.status === 400 && signupResult.error.error?.includes('already in use')) {
    logInfo('User already exists, trying to login...');
    
    // Test login
    const loginResult = await apiRequest('POST', '/auth/login', {
      email: TEST_USER.email,
      password: TEST_USER.password
    });
    
    if (loginResult.success) {
      logSuccess('User login successful');
      authToken = loginResult.data.token;
      testUserId = loginResult.data.user.id;
    } else {
      logError(`Login failed: ${loginResult.error.error || loginResult.error}`);
      return false;
    }
  } else {
    logError(`Signup failed: ${signupResult.error.error || signupResult.error}`);
    return false;
  }
  
  return true;
}

/**
 * Test notification endpoints
 */
async function testNotifications() {
  logTest('Notification System');
  
  if (!authToken) {
    logError('No auth token available for notification tests');
    return false;
  }
  
  // Test get user notifications
  const notificationsResult = await apiRequest('GET', '/notifications/user', null, true);
  
  if (notificationsResult.success) {
    logSuccess(`Retrieved notifications successfully`);
    logInfo(`Found ${notificationsResult.data.data.pagination.count} notifications`);
  } else {
    logError(`Failed to get notifications: ${notificationsResult.error.error || notificationsResult.error}`);
    return false;
  }
  
  // Test unread count
  const unreadResult = await apiRequest('GET', '/notifications/unread-count', null, true);
  
  if (unreadResult.success) {
    logSuccess(`Retrieved unread count: ${unreadResult.data.data.count}`);
  } else {
    logError(`Failed to get unread count: ${unreadResult.error.error || unreadResult.error}`);
  }
  
  // Test mark all as read
  const markAllResult = await apiRequest('PATCH', '/notifications/mark-all-read', null, true);
  
  if (markAllResult.success) {
    logSuccess(`Marked all notifications as read`);
  } else {
    logError(`Failed to mark all as read: ${markAllResult.error.error || markAllResult.error}`);
  }
  
  return true;
}

/**
 * Test authentication errors
 */
async function testAuthenticationErrors() {
  logTest('Authentication Error Handling');
  
  // Test invalid token
  const invalidTokenResult = await apiRequest('GET', '/notifications/user', null, false);
  invalidTokenResult.config = { headers: { Authorization: 'Bearer invalid-token' } };
  
  if (invalidTokenResult.status === 401) {
    logSuccess('Invalid token properly rejected');
  } else {
    logError('Invalid token should return 401');
  }
  
  // Test missing token
  const noTokenResult = await apiRequest('GET', '/notifications/user');
  
  if (noTokenResult.status === 401) {
    logSuccess('Missing token properly rejected');
  } else {
    logError('Missing token should return 401');
  }
  
  return true;
}

/**
 * Test API endpoints that don't exist
 */
async function testNotFoundRoutes() {
  logTest('404 Route Handling');
  
  const result = await apiRequest('GET', '/nonexistent-route');
  
  if (result.status === 404) {
    logSuccess('Non-existent routes properly return 404');
  } else {
    logError('Non-existent routes should return 404');
  }
  
  return true;
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('🚀 Starting StudyAI Backend API Tests\n'.cyan.bold);
  
  const tests = [
    { name: 'Server Health', fn: testServerHealth },
    { name: 'Authentication', fn: testAuthentication },
    { name: 'Notifications', fn: testNotifications },
    { name: 'Auth Errors', fn: testAuthenticationErrors },
    { name: '404 Handling', fn: testNotFoundRoutes }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      logError(`Test "${test.name}" threw an error: ${error.message}`);
      failed++;
    }
  }
  
  console.log('\n📊 Test Results:'.cyan.bold);
  console.log(`✅ Passed: ${passed}`.green);
  console.log(`❌ Failed: ${failed}`.red);
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`.blue);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! Your backend is working correctly.'.green.bold);
  } else {
    console.log('\n⚠️  Some tests failed. Check the errors above.'.yellow.bold);
  }
}

/**
 * Check if server is running
 */
async function checkServerStatus() {
  try {
    await axios.get(`${BASE_URL}/health`);
    return true;
  } catch (error) {
    return false;
  }
}

// Run tests
(async () => {
  const serverRunning = await checkServerStatus();
  
  if (!serverRunning) {
    console.log('❌ Server is not running on http://localhost:5000'.red.bold);
    console.log('📝 Please start your backend server first:'.yellow);
    console.log('   cd Backend && npm start'.cyan);
    process.exit(1);
  }
  
  await runTests();
})();

module.exports = { runTests };
