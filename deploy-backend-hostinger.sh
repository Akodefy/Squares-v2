#!/bin/bash

echo "🚀 Backend Deployment Preparation Script for Hostinger"
echo "=================================================="

# Create deployment directory
echo "📁 Creating deployment directory..."
mkdir -p backend-deployment
rm -rf backend-deployment/*

# Copy server files
echo "📋 Copying server files..."
cp -r server/* backend-deployment/

# Navigate to deployment directory
cd backend-deployment

# Update package.json for production
echo "📦 Updating package.json for production..."
npm pkg set scripts.start="node index.js"
npm pkg set engines.node=">=18.0.0"

# Create production environment template
echo "⚙️  Creating environment template..."
cat > .env.template << EOF
# Production Environment Variables for Hostinger
NODE_ENV=production
PORT=3000

# Database (MongoDB Atlas)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/squares

# JWT Security
JWT_SECRET=your_super_secure_jwt_secret_production_key_here_minimum_32_chars
JWT_EXPIRE=7d

# CORS - Allow Vercel frontend
CLIENT_URL=https://your-app-name.vercel.app
ADDITIONAL_ALLOWED_ORIGINS=https://your-app-name.vercel.app

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
EOF

# Create PM2 ecosystem config for VPS
echo "🔄 Creating PM2 configuration..."
cat > ecosystem.config.js << EOF
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
    max_memory_restart: '500M',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF

# Create logs directory
mkdir -p logs

# Create deployment instructions
cat > DEPLOY_INSTRUCTIONS.md << EOF
# Backend Deployment Instructions for Hostinger

## For Shared Hosting:
1. Compress this entire 'backend-deployment' folder to ZIP
2. Login to Hostinger hPanel
3. Go to Advanced → Node.js
4. Create new Node.js application (Node.js 18.x)
5. Upload ZIP to your Node.js app directory
6. Extract files
7. Copy .env.template to .env and fill in your values
8. Run: npm install --production
9. Start the application

## For VPS Hosting:
1. Upload files to /var/www/squares-backend/
2. Copy .env.template to .env and fill in your values
3. Run: npm install --production
4. Install PM2: npm install -g pm2
5. Start: pm2 start ecosystem.config.js --env production
6. Save: pm2 save && pm2 startup

## Test your deployment:
curl https://your-domain.com/api/health
EOF

# Create ZIP for easy upload
echo "📦 Creating deployment ZIP..."
cd ..
zip -r backend-deployment.zip backend-deployment/ -x "*/node_modules/*"

echo ""
echo "✅ Backend deployment preparation complete!"
echo ""
echo "📁 Files created:"
echo "   - backend-deployment/ (directory with all backend files)"
echo "   - backend-deployment.zip (ready to upload to Hostinger)"
echo ""
echo "📋 Next steps:"
echo "   1. Edit backend-deployment/.env.template with your actual values"
echo "   2. Upload backend-deployment.zip to Hostinger"
echo "   3. Follow instructions in backend-deployment/DEPLOY_INSTRUCTIONS.md"
echo ""
echo "🎯 Remember to update CORS origins with your Vercel URL!"
