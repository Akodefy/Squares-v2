# Split Deployment Guide - Vercel + Hostinger

This guide shows how to deploy the BuildHomeMart Squares application with **Frontend on Vercel** and **Backend on Hostinger**.

## 🏗️ Deployment Architecture

- **Frontend**: React app deployed on Vercel
- **Backend**: Node.js API deployed on Hostinger
- **Database**: MongoDB Atlas (cloud)
- **Email**: Hostinger SMTP

---

## 🚀 Part 1: Deploy Backend on Hostinger

### Step 1: Prepare Backend Files

1. **Create backend deployment package**
```bash
# Navigate to your project
cd /home/dheena/Downloads/Squares/ninety-nine-acres-web-main

# Copy server files to a new directory
mkdir backend-deployment
cp -r server/* backend-deployment/
cd backend-deployment
```

2. **Update package.json for production**
```bash
# In backend-deployment directory, update package.json scripts
npm pkg set scripts.start="node index.js"
npm pkg set engines.node=">=18.0.0"
```

### Step 2: Configure Environment Variables

Create `.env` file in backend-deployment directory:
```bash
# Production Environment Variables
NODE_ENV=production
PORT=3000

# Database (Use MongoDB Atlas)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/squares

# JWT Security
JWT_SECRET=your_super_secure_jwt_secret_production_key_here_minimum_32_chars
JWT_EXPIRE=7d

# CORS - Allow Vercel frontend
CLIENT_URL=https://your-app-name.vercel.app
ADDITIONAL_ALLOWED_ORIGINS=https://your-app-name.vercel.app,https://your-custom-domain.com

# Hostinger Email Configuration
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=587
SMTP_USER=support@buildhomemartsquares.com
SMTP_PASS=your_hostinger_email_password
FROM_EMAIL=support@buildhomemartsquares.com

# Cloudinary (for file uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Razorpay (for payments)
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Step 3: Deploy to Hostinger

#### Option A: Shared Hosting (Easier)

1. **Enable Node.js in Hostinger**
   - Login to hPanel
   - Go to Advanced → Node.js
   - Create new Node.js application
   - Select Node.js version 18.x

2. **Upload backend files**
   - Compress `backend-deployment` folder to ZIP
   - Upload ZIP to your Node.js app directory
   - Extract files in Hostinger File Manager

3. **Install dependencies**
```bash
# In Hostinger terminal or File Manager
npm install --production
```

4. **Configure environment variables**
   - In hPanel Node.js section
   - Add all environment variables from above

5. **Start the application**
```bash
npm start
```

#### Option B: VPS Hosting (Better Performance)

```bash
# Connect to VPS via SSH
ssh root@your-hostinger-vps-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Install PM2
npm install -g pm2

# Create application directory
mkdir -p /var/www/squares-backend
cd /var/www/squares-backend

# Upload your backend files here (use scp, git, or file manager)
# Then install dependencies
npm install --production

# Create PM2 config
nano ecosystem.config.js
```

PM2 Configuration:
```javascript
module.exports = {
  apps: [{
    name: 'squares-api',
    script: 'index.js',
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    instances: 1,
    exec_mode: 'cluster',
    max_memory_restart: '500M'
  }]
};
```

```bash
# Start with PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### Step 4: Test Backend Deployment

```bash
# Test health endpoint
curl https://your-hostinger-domain.com/api/health

# Or if using subdomain/port
curl https://api.yourdomain.com/health
```

---

## 🌐 Part 2: Deploy Frontend on Vercel

### Step 1: Prepare Frontend for Vercel

1. **Update environment variables**

Create `.env.production` in project root:
```bash
# Vercel Frontend Environment Variables
VITE_API_URL=https://your-hostinger-domain.com/api
VITE_API_BASE_URL=https://your-hostinger-domain.com
VITE_SUPABASE_URL=https://fiwawbrrfznxiuymgeyn.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
```

2. **Update API base URL in code**

Check `src/lib/api.ts` or similar API configuration files:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://your-hostinger-domain.com/api';
```

### Step 2: Deploy to Vercel

#### Method 1: Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from project root
cd /home/dheena/Downloads/Squares/ninety-nine-acres-web-main
vercel

# Follow the prompts:
# - Set up and deploy? Y
# - Which scope? (your account)
# - Link to existing project? N
# - Project name: squares-app (or your preferred name)
# - Directory: ./ (current directory)
# - Override settings? N

# For production deployment
vercel --prod
```

#### Method 2: GitHub + Vercel Dashboard

1. **Push to GitHub**
```bash
# If not already a git repo
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/DHEENA0007/squares-v2.git
git push -u origin main
```

2. **Connect to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure build settings:
     - **Framework**: Vite
     - **Root Directory**: ./
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`

3. **Add Environment Variables in Vercel**
   - Go to Project Settings → Environment Variables
   - Add all VITE_ variables from `.env.production`

### Step 3: Configure Custom Domain (Optional)

1. **Add domain in Vercel**
   - Project Settings → Domains
   - Add your custom domain

2. **Update DNS records**
   - Add CNAME record pointing to `cname.vercel-dns.com`

---

## 🔧 Part 3: Configuration Updates

### Update Backend CORS for Vercel

Update `server/index.js` CORS configuration:
```javascript
// Add your Vercel deployment URLs
const allowedOrigins = [
  process.env.CLIENT_URL,
  "https://your-app-name.vercel.app",
  "https://your-custom-domain.com",
  "http://localhost:5173", // Keep for development
].filter(Boolean);
```

### Update Frontend API Configuration

In your React app, update API calls to use Hostinger backend:
```typescript
// src/lib/api.ts or similar
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://your-hostinger-domain.com/api';

// Ensure all API calls use this base URL
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});
```

---

## 🗄️ Part 4: Database Setup

### MongoDB Atlas Configuration

1. **Create MongoDB Atlas cluster**
   - Visit [mongodb.com/atlas](https://www.mongodb.com/atlas)
   - Create free cluster

2. **Configure network access**
   - Add `0.0.0.0/0` to IP whitelist (for Hostinger access)

3. **Create database user**
   - Create user with read/write permissions

4. **Get connection string**
```
mongodb+srv://username:password@cluster.mongodb.net/squares?retryWrites=true&w=majority
```

5. **Update backend environment**
```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/squares
```

---

## 🧪 Testing the Complete Setup

### 1. Test Backend API

```bash
# Health check
curl https://your-hostinger-domain.com/api/health

# Test CORS
curl -H "Origin: https://your-app-name.vercel.app" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     https://your-hostinger-domain.com/api/health
```

### 2. Test Frontend

- Visit `https://your-app-name.vercel.app`
- Check browser console for API errors
- Test user registration/login
- Verify all features work

### 3. Test Email Functionality

```bash
# Test from backend
node -e "
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransporter({
  host: 'smtp.hostinger.com',
  port: 587,
  auth: { 
    user: 'support@buildhomemartsquares.com', 
    pass: 'your_password' 
  }
});
transporter.verify(console.log);
"
```

---

## 🔒 Security Considerations

### Environment Variables Security

**Never commit sensitive data!**

1. **Backend (.env)** - Keep secure on Hostinger
2. **Frontend** - Only use VITE_ prefixed variables
3. **Database** - Use MongoDB Atlas with proper authentication

### CORS Configuration

```javascript
// Backend: Only allow your Vercel domain
const allowedOrigins = [
  'https://your-app-name.vercel.app',
  'https://your-custom-domain.com'
];
```

---

## 📊 Monitoring & Maintenance

### Backend Monitoring (Hostinger)

```bash
# Check PM2 status (if using VPS)
pm2 status
pm2 logs squares-api

# Check application logs
tail -f /var/log/squares-api.log
```

### Frontend Monitoring (Vercel)

- Vercel Dashboard provides:
  - Deployment status
  - Build logs
  - Analytics
  - Error tracking

---

## 🚨 Troubleshooting

### Common Issues

**1. CORS Errors**
- Check backend CORS configuration
- Verify Vercel domain in allowed origins
- Test with browser dev tools

**2. API Not Found (404)**
- Verify backend is running on Hostinger
- Check API URL in frontend environment variables
- Test backend endpoints directly

**3. Database Connection Issues**
- Check MongoDB Atlas connection string
- Verify IP whitelist includes `0.0.0.0/0`
- Test connection from backend server

**4. Email Not Working**
- Verify Hostinger email credentials
- Check SMTP configuration
- Test with email testing tools

---

## 💰 Cost Estimation

### Vercel (Frontend)
- **Hobby Plan**: Free for personal projects
- **Pro Plan**: $20/month for production apps

### Hostinger (Backend)
- **Shared Hosting**: $2-10/month
- **VPS**: $4-15/month
- **Email**: Included with hosting

### MongoDB Atlas
- **Free Tier**: 512MB storage
- **Paid Plans**: Start at $9/month

### Total Monthly Cost: ~$15-50/month

---

## ✅ Final Deployment Checklist

### Backend (Hostinger)
- [ ] Node.js application running
- [ ] Environment variables configured
- [ ] Database connected
- [ ] API endpoints responding
- [ ] CORS properly configured for Vercel domain
- [ ] Email functionality tested

### Frontend (Vercel)
- [ ] Vercel deployment successful
- [ ] Environment variables set
- [ ] Custom domain configured (if applicable)
- [ ] API calls working
- [ ] All pages loading correctly

### Integration
- [ ] Frontend can communicate with backend
- [ ] Authentication flow working
- [ ] File uploads functional
- [ ] Email notifications working
- [ ] Payment processing working (if applicable)

---

## 🎉 You're Done!

**Frontend URL**: `https://your-app-name.vercel.app`
**Backend API**: `https://your-hostinger-domain.com/api`

Your application is now split across two reliable hosting platforms:
- **Vercel**: Provides excellent performance, automatic deployments, and global CDN for your React frontend
- **Hostinger**: Offers affordable, reliable hosting for your Node.js backend with email services

This setup gives you the best of both worlds: Vercel's superior frontend hosting capabilities and Hostinger's cost-effective backend hosting!
