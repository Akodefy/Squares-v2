# Render OTP Email Sending Fix

## Issue Confirmed
The test script confirms that Render is blocking SMTP connections to Hostinger.

**Error**: `Failed to send OTP email. Please try again.`  
**Response Time**: ~10.5 seconds (timeout indicator)  
**Status**: 500 Internal Server Error

## Root Cause
Render's infrastructure likely blocks outbound SMTP connections on ports 465/587 as a security measure to prevent spam.

## Solutions

### Solution 1: Use SendGrid (Recommended)

#### Step 1: Create SendGrid Account
1. Go to https://sendgrid.com/
2. Sign up for free account (100 emails/day)
3. Verify your email
4. Create API Key in Settings → API Keys

#### Step 2: Update Render Environment Variables
```env
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=your_sendgrid_api_key_here
EMAIL_FROM=support@buildhomemartsquares.com
EMAIL_FROM_NAME=BuildHomeMart Squares
```

#### Step 3: Update Email Service Code
Update `server/utils/emailService.js`:

```javascript
const sgMail = require('@sendgrid/mail');

class EmailService {
  constructor() {
    if (process.env.EMAIL_SERVICE === 'sendgrid') {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    }
  }

  async sendEmail(to, subject, html) {
    if (process.env.EMAIL_SERVICE === 'sendgrid') {
      return this.sendWithSendGrid(to, subject, html);
    }
    // Fallback to SMTP
    return this.sendWithSMTP(to, subject, html);
  }

  async sendWithSendGrid(to, subject, html) {
    const msg = {
      to,
      from: {
        email: process.env.EMAIL_FROM,
        name: process.env.EMAIL_FROM_NAME
      },
      subject,
      html,
    };

    try {
      await sgMail.send(msg);
      return { success: true };
    } catch (error) {
      console.error('SendGrid error:', error);
      throw error;
    }
  }
}
```

#### Step 4: Install SendGrid Package
```bash
npm install @sendgrid/mail
```

#### Step 5: Deploy to Render
```bash
git add .
git commit -m "Add SendGrid email service for Render"
git push
```

---

### Solution 2: Use AWS SES

#### Step 1: Setup AWS SES
1. Create AWS account
2. Go to SES (Simple Email Service)
3. Verify your domain or email
4. Create SMTP credentials
5. Move out of sandbox mode (request production access)

#### Step 2: Update Environment Variables
```env
EMAIL_SERVICE=aws-ses
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
EMAIL_FROM=support@buildhomemartsquares.com
```

#### Step 3: Install AWS SDK
```bash
npm install @aws-sdk/client-ses
```

---

### Solution 3: Try Alternative SMTP Ports

Sometimes Render allows specific ports. Update `.env`:

```env
# Try port 587 with TLS
EMAIL_PORT=587
EMAIL_SECURE=false

# Or try port 2525 (alternative SMTP port)
EMAIL_PORT=2525
EMAIL_SECURE=false
```

---

### Solution 4: Use Render's Add-ons

Check if Render provides email add-ons:
1. Go to Render Dashboard
2. Check Add-ons section
3. Look for email services

---

## Quick Fix Implementation

I'll create an updated email service that supports multiple providers:

### Install Required Packages
```bash
npm install @sendgrid/mail nodemailer
```

### Environment Variables for Render
```env
# Email Service Provider (smtp, sendgrid, aws-ses)
EMAIL_SERVICE=sendgrid

# SendGrid Configuration
SENDGRID_API_KEY=your_api_key_here

# Default sender
EMAIL_FROM=support@buildhomemartsquares.com
EMAIL_FROM_NAME=BuildHomeMart Squares

# SMTP Fallback (Hostinger)
EMAIL_HOST=smtp.hostinger.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=support@buildhomemartsquares.com
EMAIL_PASS=your_password
```

---

## Testing on Render

After implementing SendGrid, test with:

```bash
node test-otp-render.js
```

Expected success output:
```
✅ SUCCESS!
📧 OTP sent successfully!
⏰ Valid for: 10 minutes
```

---

## Cost Comparison

| Service | Free Tier | Paid Plans |
|---------|-----------|------------|
| SendGrid | 100 emails/day | $14.95/month for 40k emails |
| AWS SES | 62k emails/month (if on EC2) | $0.10 per 1000 emails |
| Hostinger SMTP | Unlimited* | Included with hosting |

*May not work on Render due to port restrictions

---

## Recommended Action

1. **Immediate**: Switch to SendGrid (easiest, free tier sufficient)
2. **Long-term**: Consider AWS SES for scalability
3. **Keep SMTP**: As fallback for local development

---

## Debug Commands

Check Render logs:
```bash
# In Render dashboard → Logs
# Look for errors like:
# - ETIMEDOUT
# - ECONNREFUSED
# - getaddrinfo ENOTFOUND
```

Test locally:
```bash
node server/scripts/test-smtp-connection.js
```

Test on Render (after deploy):
```bash
curl -X POST https://squares-v2.onrender.com/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"sdheenadhayalan91@gmail.com","firstName":"Dheena"}'
```
