# 🔧 Render Email Fix - Complete Guide

## ✅ Test Results Summary

**Status:** Server is healthy ✅  
**Issue:** Email service failing ❌  
**Error:** "Failed to send OTP email. Please try again."  

---

## 🔍 Root Cause Analysis

Based on the diagnostic test:
1. ✅ Render server is running and healthy
2. ✅ Database is connected
3. ❌ **Email sending is failing** (HTTP 500)

**Most Likely Cause:** Render is blocking SMTP ports or environment variables are not properly configured.

---

## 🛠️ SOLUTION 1: Fix Render SMTP Configuration (Current Setup)

### Step 1: Check Render Environment Variables

Go to: **Render Dashboard → squares-v2 → Environment**

Verify these variables exist with EXACT values:

```bash
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=587
SMTP_USER=support@buildhomemartsquares.com
SMTP_PASS=Sprt123@7
SMTP_SECURE=false
```

### Step 2: Update render.yaml

The `render.yaml` file currently has:
```yaml
- key: SMTP_PORT
  value: 587
- key: SMTP_USER
  value: noreply@ninety-nine-acres.com  # ❌ WRONG EMAIL
- key: SMTP_PASS
  value: temp_password  # ❌ WRONG PASSWORD
```

**Fix:** Update to correct values:
```yaml
- key: SMTP_PORT
  value: 587
- key: SMTP_USER
  value: support@buildhomemartsquares.com
- key: SMTP_PASS
  value: Sprt123@7
- key: SMTP_SECURE
  value: false
```

### Step 3: Redeploy

After updating `render.yaml`:
```bash
git add server/render.yaml
git commit -m "fix: Update SMTP credentials for Render deployment"
git push
```

Render will auto-redeploy.

---

## 🚀 SOLUTION 2: Use Resend.com (RECOMMENDED - No SMTP Issues)

Resend is an API-based email service that works perfectly on Render (no SMTP port blocking).

### Why Resend?
- ✅ No SMTP port issues
- ✅ Free tier: 100 emails/day
- ✅ Simple API
- ✅ Works on all platforms (Render, Vercel, AWS, etc.)
- ✅ Great deliverability

### Setup Steps:

#### 1. Sign up for Resend
- Go to: https://resend.com
- Sign up with your email
- Verify your account

#### 2. Get API Key
- Go to: **Dashboard → API Keys**
- Click: **Create API Key**
- Copy the key (starts with `re_...`)

#### 3. Add to Render Environment
Go to: **Render Dashboard → Environment** and add:
```bash
RESEND_API_KEY=re_your_api_key_here
EMAIL_SERVICE=resend
```

#### 4. Update Server Code
The code is already set up to support multiple providers. Just ensure `EMAIL_SERVICE=resend` is set.

---

## 📝 SOLUTION 3: Use SendGrid (Alternative)

SendGrid also offers 100 free emails/day.

### Setup Steps:

#### 1. Sign up for SendGrid
- Go to: https://sendgrid.com
- Create free account
- Verify your account

#### 2. Get API Key
- Go to: **Settings → API Keys**
- Create new API key
- Copy the key

#### 3. Add to Render Environment
```bash
SENDGRID_API_KEY=SG.your_api_key_here
EMAIL_SERVICE=sendgrid
```

---

## 🧪 Testing After Fix

Run the test script again:
```bash
node test-otp-render.js
```

Expected output:
```
✅ SUCCESS! OTP Request Accepted
📧 OTP Email Should Be Sent To: sdheenadhayalan91@gmail.com
```

---

## 📊 Current Configuration Issues

### In `server/render.yaml`:
```yaml
# ❌ WRONG - Current values
- key: SMTP_USER
  value: noreply@ninety-nine-acres.com
- key: SMTP_PASS
  value: temp_password

# ✅ CORRECT - Should be:
- key: SMTP_USER
  value: support@buildhomemartsquares.com
- key: SMTP_PASS
  value: Sprt123@7
```

---

## ⚡ Quick Fix Commands

### Option A: Fix SMTP (update render.yaml and push)
```bash
# Edit render.yaml manually, then:
git add server/render.yaml
git commit -m "fix: Update SMTP credentials"
git push
```

### Option B: Switch to Resend (recommended)
```bash
# Just add environment variables in Render dashboard:
# RESEND_API_KEY=re_...
# EMAIL_SERVICE=resend
```

---

## 🎯 Recommended Action

**Use Resend.com** - It's the easiest and most reliable solution for Render deployments.

1. Sign up: https://resend.com
2. Get API key
3. Add `RESEND_API_KEY` to Render environment variables
4. Add `EMAIL_SERVICE=resend` to Render environment variables
5. Redeploy (or let Render auto-deploy)

---

## 📞 Support

If you need help:
- Check Render logs: Dashboard → Logs
- Email: support@buildhomemartsquares.com
- Test script: `node test-otp-render.js`
