const RENDER_API_URL = 'https://squares-v2.onrender.com/api';
const TEST_EMAIL = 'sdheenadhayalan91@gmail.com';
const TEST_NAME = 'Dheena';
const SMTP_USER = 'amutha0985@gmail.com';
const SMTP_PASS = 'csmkyylvkknuwmfa';

console.log('========================================');
console.log('🔧 RENDER OTP EMAIL DIAGNOSTIC TOOL');
console.log('========================================\n');
console.log(`📧 Target Email: ${TEST_EMAIL}`);
console.log(`🌐 API Endpoint: ${RENDER_API_URL}`);
console.log(`⏰ Test Time: ${new Date().toLocaleString()}\n`);

async function testOTPSending() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📨 TEST 1: OTP Email Sending');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    console.log('⏳ Sending POST request to /auth/send-otp...');
    const startTime = Date.now();

    const response = await fetch(`${RENDER_API_URL}/auth/send-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email: TEST_EMAIL,
        firstName: TEST_NAME
      }),
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`\n⏱️  Response Time: ${duration}ms`);
    console.log(`📊 HTTP Status: ${response.status} ${response.statusText}`);
    console.log(`📋 Content-Type: ${response.headers.get('content-type')}`);

    const data = await response.json();

    if (response.ok) {
      console.log('\n✅ SUCCESS! OTP Request Accepted');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Response Data:', JSON.stringify(data, null, 2));
      console.log(`\n📧 OTP Email Should Be Sent To: ${TEST_EMAIL}`);
      if (data.expiryMinutes) {
        console.log(`⏰ OTP Valid For: ${data.expiryMinutes} minutes`);
      }
      console.log('\n💡 Check your email inbox (and spam folder)');
    } else {
      console.log('\n❌ FAILED! Server Returned Error');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Error Response:', JSON.stringify(data, null, 2));
      
      console.log('\n🔍 DIAGNOSTIC ANALYSIS:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      if (data.message && data.message.includes('Failed to send OTP email')) {
        console.log('🔴 ROOT CAUSE: Email Service Failure');
        console.log('\nPossible Issues:');
        console.log('  1. SMTP credentials not configured in Render');
        console.log('  2. Render blocking outbound SMTP ports (465/587)');
        console.log('  3. Hostinger SMTP authentication failing');
        console.log('  4. Email service rate limiting');
        
        console.log('\n🛠️  IMMEDIATE FIXES TO TRY:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('1. Verify Render Environment Variables:');
        console.log('   - SMTP_HOST=smtp.hostinger.com');
        console.log('   - SMTP_PORT=587 (or 465)');
        console.log('   - SMTP_USER=amutha0985@gmail.com');
        console.log('   - SMTP_PASS=<your-password>');
        
        console.log('\n2. Alternative Email Providers:');
        console.log('   - SendGrid (free tier available)');
        console.log('   - AWS SES (if using AWS)');
        console.log('   - Resend.com (developer-friendly)');
        
        console.log('\n3. Check Render Logs:');
        console.log('   - Go to Render Dashboard > Your Service > Logs');
        console.log('   - Look for "SMTP" or "nodemailer" errors');
      }
    }

  } catch (error) {
    console.log('\n💥 NETWORK/CONNECTION ERROR');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Error Type:', error.name);
    console.log('Error Message:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n🔴 Server Unreachable - Connection Refused');
      console.log('   - Render service may be down');
      console.log('   - Check Render dashboard for service status');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('\n🔴 Request Timeout');
      console.log('   - Server is slow or unresponsive');
      console.log('   - Render cold start may take 30-60 seconds');
    } else if (error.name === 'TypeError') {
      console.log('\n🔴 Invalid Response Format');
      console.log('   - Server may have crashed');
      console.log('   - Check Render logs for errors');
    }
  }
}

async function testServerHealth() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🏥 TEST 2: Server Health Check');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  try {
    console.log('⏳ Checking server status...');
    const response = await fetch(`${RENDER_API_URL.replace('/api', '')}/health`).catch(() => null);
    
    if (!response) {
      console.log('⚠️  Health endpoint not available, trying root...');
      const rootResponse = await fetch(RENDER_API_URL.replace('/api', '/'));
      console.log(`📊 Root Status: ${rootResponse.status}`);
      console.log('✅ Server is responding');
      return;
    }
    
    const data = await response.json().catch(() => null);
    
    if (response.ok) {
      console.log('✅ Server is Healthy');
      if (data) {
        console.log('Health Data:', JSON.stringify(data, null, 2));
      }
    } else {
      console.log('⚠️  Server responded but with errors');
      console.log(`   Status: ${response.status}`);
    }
  } catch (error) {
    console.log('❌ Health Check Failed:', error.message);
    console.log('   This may indicate server is down or unreachable');
  }
}

async function testEmailEndpoint() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📧 TEST 3: Email Service Endpoint');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  try {
    console.log('⏳ Testing email service availability...');
    const response = await fetch(`${RENDER_API_URL}/auth/send-otp`, {
      method: 'OPTIONS',
    }).catch(() => null);
    
    if (response) {
      console.log('✅ Email endpoint is accessible');
      console.log(`   CORS Headers: ${response.headers.get('access-control-allow-origin')}`);
    } else {
      console.log('⚠️  Could not test email endpoint');
    }
  } catch (error) {
    console.log('ℹ️  OPTIONS request not supported (normal)');
  }
}

async function provideRenderFix() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔧 RENDER CONFIGURATION FIX');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('📝 Step-by-Step Fix Instructions:\n');
  
  console.log('1️⃣  CHECK RENDER ENVIRONMENT VARIABLES:');
  console.log('   • Go to: Render Dashboard > Your Service > Environment');
  console.log('   • Verify these are set correctly:');
  console.log('');
  console.log('   SMTP_HOST=smtp.hostinger.com');
  console.log('   SMTP_PORT=587');
  console.log('   SMTP_USER=amutha0985@gmail.com');
  console.log('   SMTP_PASS=csmkyylvkknuwmfa');
  console.log('   SMTP_SECURE=false');
  console.log('');
  
  console.log('2️⃣  ALTERNATIVE: Use EMAIL_ prefix (more standard):');
  console.log('   EMAIL_HOST=smtp.hostinger.com');
  console.log('   EMAIL_PORT=587');
  console.log('   EMAIL_USER=amutha0985@gmail.com');
  console.log('   EMAIL_PASS=csmkyylvkknuwmfa');
  console.log('   EMAIL_SECURE=false');
  console.log('');
  
  console.log('3️⃣  CHECK RENDER LOGS:');
  console.log('   • Go to: Render Dashboard > Logs');
  console.log('   • Search for: "SMTP", "nodemailer", "email"');
  console.log('   • Look for authentication or connection errors');
  console.log('');
  
  console.log('4️⃣  TEST SMTP FROM RENDER SHELL:');
  console.log('   • Go to: Render Dashboard > Shell');
  console.log('   • Run: node server/scripts/test-smtp-connection.js');
  console.log('');
  
  console.log('5️⃣  ALTERNATIVE EMAIL PROVIDERS (if Render blocks SMTP):');
  console.log('   ┌─────────────┬─────────────────────┬──────────────┐');
  console.log('   │ Provider    │ Free Tier           │ Difficulty   │');
  console.log('   ├─────────────┼─────────────────────┼──────────────┤');
  console.log('   │ Resend      │ 100 emails/day      │ ⭐⭐         │');
  console.log('   │ SendGrid    │ 100 emails/day      │ ⭐⭐⭐       │');
  console.log('   │ AWS SES     │ 62,000/month (AWS)  │ ⭐⭐⭐⭐     │');
  console.log('   │ Mailgun     │ 5,000/month         │ ⭐⭐⭐       │');
  console.log('   └─────────────┴─────────────────────┴──────────────┘');
  console.log('');
  
  console.log('6️⃣  RECOMMENDED QUICK FIX - Use Resend.com:');
  console.log('   • Sign up: https://resend.com');
  console.log('   • Get API Key from dashboard');
  console.log('   • Add to Render: RESEND_API_KEY=re_...');
  console.log('   • Update server code to use Resend SDK');
  console.log('');
}

async function runAllTests() {
  console.log('\n🚀 Starting Comprehensive Diagnostic Tests\n');
  
  // Test 1: OTP Sending
  await testOTPSending();
  
  // Test 2: Server Health
  await testServerHealth();
  
  // Test 3: Email Endpoint
  await testEmailEndpoint();
  
  // Show Fix Instructions
  await provideRenderFix();
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 SUMMARY & NEXT STEPS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('✅ Tests Completed at:', new Date().toLocaleString());
  console.log('\n📋 Troubleshooting Checklist:');
  console.log('   □ Verify Render environment variables');
  console.log('   □ Check Render service logs for errors');
  console.log('   □ Test SMTP connection from Render shell');
  console.log('   □ Verify Hostinger SMTP credentials');
  console.log('   □ Check if Render blocks SMTP ports');
  console.log('   □ Consider switching to API-based email service');
  console.log('\n💡 Recommended Action:');
  console.log('   If SMTP continues failing, switch to Resend.com');
  console.log('   (API-based, no SMTP port issues, free tier available)');
  console.log('\n📞 Support Resources:');
  console.log('   • Render Docs: https://render.com/docs');
  console.log('   • Resend Docs: https://resend.com/docs');
  console.log('   • Project Email: support@buildhomemartsquares.com\n');
  
  console.log('========================================\n');
}

runAllTests().catch(console.error);
