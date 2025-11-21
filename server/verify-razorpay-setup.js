#!/usr/bin/env node
require('dotenv').config();
const Razorpay = require('razorpay');

console.log('\n🔍 Razorpay Setup Verification\n' + '='.repeat(60));

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

console.log('\n1️⃣  Environment Variables:');
console.log('   RAZORPAY_KEY_ID:', keyId || '❌ NOT SET');
console.log('   RAZORPAY_KEY_SECRET:', keySecret ? '✅ SET' : '❌ NOT SET');
console.log('   Mode:', keyId?.startsWith('rzp_test_') ? '🧪 TEST' : keyId?.startsWith('rzp_live_') ? '🔴 LIVE' : '⚠️  UNKNOWN');

if (!keyId || !keySecret) {
  console.error('\n❌ Razorpay credentials missing! Check your .env file.\n');
  process.exit(1);
}

const razorpay = new Razorpay({
  key_id: keyId,
  key_secret: keySecret
});

async function testRazorpay() {
  try {
    console.log('\n2️⃣  Testing Order Creation API:');
    const order = await razorpay.orders.create({
      amount: 10000, // ₹100
      currency: 'INR',
      receipt: `test_${Date.now()}`,
      notes: { test: 'verification' }
    });
    
    console.log('   ✅ Order created successfully!');
    console.log('   📝 Order ID:', order.id);
    console.log('   💰 Amount:', order.amount / 100, 'INR');
    console.log('   📊 Status:', order.status);
    
    console.log('\n3️⃣  Testing Order Fetch API:');
    const fetchedOrder = await razorpay.orders.fetch(order.id);
    console.log('   ✅ Order fetched successfully!');
    console.log('   📝 Status:', fetchedOrder.status);
    
    console.log('\n✅ All API tests passed!');
    console.log('\n💡 Next Steps:');
    console.log('   1. If checkout UI shows 400 error, check Razorpay Dashboard');
    console.log('   2. Verify account is activated: https://dashboard.razorpay.com');
    console.log('   3. Check if "Standard Checkout" is enabled in settings');
    console.log('   4. Try regenerating API keys if issue persists\n');
    
  } catch (error) {
    console.error('\n❌ API Test Failed!');
    console.error('   Error:', error.message);
    if (error.statusCode) console.error('   Status Code:', error.statusCode);
    if (error.error) {
      console.error('   Details:', JSON.stringify(error.error, null, 2));
    }
    
    console.log('\n💡 Common Issues:');
    console.log('   • Invalid API credentials');
    console.log('   • Account not activated');
    console.log('   • API keys expired or revoked');
    console.log('   • Network/firewall blocking Razorpay API\n');
    
    process.exit(1);
  }
}

testRazorpay();
