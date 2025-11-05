import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const TEST_EMAIL = 'sdheenadhayalan91@gmail.com';

async function testSMTPConnection() {
  console.log('========================================');
  console.log('SMTP CONNECTION TEST (RENDER)');
  console.log('========================================\n');

  const config = {
    host: process.env.EMAIL_HOST || 'smtp.hostinger.com',
    port: parseInt(process.env.EMAIL_PORT || '465'),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  };

  console.log('📧 SMTP Configuration:');
  console.log(`Host: ${config.host}`);
  console.log(`Port: ${config.port}`);
  console.log(`Secure: ${config.secure}`);
  console.log(`User: ${config.auth.user ? config.auth.user.substring(0, 3) + '***' : 'NOT SET'}`);
  console.log(`Pass: ${config.auth.pass ? '***SET***' : 'NOT SET'}\n`);

  if (!config.auth.user || !config.auth.pass) {
    console.log('❌ ERROR: Email credentials not set!');
    console.log('\nRequired environment variables:');
    console.log('- EMAIL_HOST');
    console.log('- EMAIL_PORT');
    console.log('- EMAIL_USER');
    console.log('- EMAIL_PASS');
    console.log('- EMAIL_SECURE\n');
    return;
  }

  try {
    console.log('🔌 Creating transporter...');
    const transporter = nodemailer.createTransport(config);

    console.log('🔍 Verifying SMTP connection...');
    const startTime = Date.now();
    
    await transporter.verify();
    
    const verifyTime = Date.now() - startTime;
    console.log(`✅ SMTP connection verified! (${verifyTime}ms)\n`);

    console.log('📨 Sending test OTP email...');
    const sendStartTime = Date.now();

    const otp = '123456';
    const mailOptions = {
      from: {
        name: 'BuildHomeMart Squares',
        address: process.env.EMAIL_USER,
      },
      to: TEST_EMAIL,
      subject: '🔐 Test OTP - Email Verification',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #2563eb; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Test OTP Verification</h1>
          </div>
          <div style="padding: 30px; background: #f9fafb;">
            <p style="font-size: 16px;">This is a test email from Render deployment.</p>
            <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">Your verification code is:</p>
              <h2 style="margin: 10px 0; font-size: 36px; letter-spacing: 8px; color: #2563eb;">${otp}</h2>
              <p style="margin: 0; color: #6b7280; font-size: 12px;">Valid for 10 minutes</p>
            </div>
            <p style="color: #6b7280; font-size: 14px;">
              Test sent at: ${new Date().toISOString()}<br>
              Environment: ${process.env.NODE_ENV || 'development'}
            </p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    const sendTime = Date.now() - sendStartTime;

    console.log(`✅ Test email sent successfully! (${sendTime}ms)`);
    console.log(`📬 Message ID: ${info.messageId}`);
    console.log(`📧 Sent to: ${TEST_EMAIL}`);
    console.log(`🔐 Test OTP: ${otp}\n`);

    console.log('✅ ALL TESTS PASSED!');
    console.log('SMTP is working correctly on Render.\n');

  } catch (error) {
    console.log('\n❌ SMTP TEST FAILED!\n');
    console.log('Error Details:');
    console.log(`Type: ${error.name || 'Unknown'}`);
    console.log(`Message: ${error.message}`);
    console.log(`Code: ${error.code || 'N/A'}`);

    console.log('\n🔍 Common Issues:');
    
    if (error.code === 'EAUTH') {
      console.log('- Invalid email credentials');
      console.log('- Check EMAIL_USER and EMAIL_PASS in Render env vars');
      console.log('- Verify credentials work in Hostinger webmail');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('- SMTP connection timeout');
      console.log('- Render might be blocking outbound SMTP connections');
      console.log('- Try port 587 instead of 465');
      console.log('- Contact Render support about SMTP restrictions');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('- Connection refused by SMTP server');
      console.log('- Check EMAIL_HOST is correct');
      console.log('- Verify firewall/network settings');
    } else if (error.errno === -3008) {
      console.log('- DNS resolution failed');
      console.log('- SMTP host might be unreachable from Render');
    }

    console.log('\n💡 Recommended Solutions:');
    console.log('1. Switch to port 587 with STARTTLS');
    console.log('2. Use SendGrid (Render-friendly)');
    console.log('3. Use AWS SES');
    console.log('4. Use Render\'s environment-specific email service');
    console.log('5. Contact Render support about SMTP restrictions\n');

    console.log('Full error:', error);
  }

  console.log('\n========================================');
}

testSMTPConnection().catch(console.error);
