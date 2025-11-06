# Hostinger Deployment Guide - BuildHomeMart Squares

This guide provides step-by-step instructions for deploying the BuildHomeMart Squares application on Hostinger hosting platform.

## 🏗️ Application Architecture

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express + MongoDB
- **Email**: Configured with Hostinger SMTP (`support@buildhomemartsquares.com`)

## 📋 Prerequisites

1. **Hostinger Account** with appropriate hosting plan
2. **Domain Name** (e.g., `buildhomemartsquares.com`)
3. **MongoDB Database** (MongoDB Atlas recommended)
4. **Cloudinary Account** for image uploads
5. **Razorpay Account** for payments

## 🎯 Deployment Options

### Option 1: Shared Hosting (Recommended for Small Scale)
- Deploy frontend as static files
- Use Hostinger's Node.js hosting for backend

### Option 2: VPS Hosting (Recommended for Production)
- Full control over server environment
- Better performance and scalability

---

## 📁 Option 1: Shared Hosting Deployment

### Step 1: Prepare Frontend for Production

1. **Update Environment Variables**
```bash
# Create .env.production in root directory
VITE_API_URL=https://yourdomain.com/api
VITE_API_BASE_URL=https://yourdomain.com
VITE_SUPABASE_URL=https://fiwawbrrfznxiuymgeyn.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
```

2. **Build Frontend**
```bash
# From project root
npm install
npm run build
```

3. **Upload Frontend Files**
   - Compress the `dist` folder
   - Upload to Hostinger's `public_html` directory
   - Extract files directly in `public_html`

### Step 2: Deploy Backend on Hostinger Node.js

1. **Enable Node.js** in Hostinger hPanel
   - Go to Advanced → Node.js
   - Create new Node.js app
   - Select Node.js version 18.x

2. **Upload Backend Files**
   - Compress the `server` folder
   - Upload to your Node.js app directory
   - Extract files

3. **Configure Environment Variables**
```bash
NODE_ENV=production
PORT=3000
CLIENT_URL=https://yourdomain.com

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/squares

# JWT
JWT_SECRET=your_super_secure_jwt_secret_production_key
JWT_EXPIRE=7d

# Hostinger Email (Already configured!)
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=587
SMTP_USER=support@buildhomemartsquares.com
SMTP_PASS=your_hostinger_email_password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Google Maps
GOOGLE_MAPS_API_KEY=your_google_maps_key
```

4. **Install Dependencies & Start**
```bash
npm install --production
npm start
```

---

## 🚀 Option 2: VPS Hosting Deployment

### Step 1: VPS Setup

1. **Create VPS Instance** on Hostinger
2. **Connect via SSH**
```bash
ssh root@your-vps-ip
```

3. **Install Required Software**
```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Install PM2 for process management
npm install -g pm2

# Install Nginx
apt install nginx -y

# Install SSL certificates
apt install certbot python3-certbot-nginx -y
```

### Step 2: Clone and Setup Application

```bash
# Clone your repository
cd /var/www
git clone https://github.com/yourusername/squares-v2.git
cd squares-v2

# Setup Frontend
npm install
npm run build

# Setup Backend
cd server
npm install --production
```

### Step 3: Configure Environment Variables

```bash
# Create production environment file
nano server/.env.production
```

Add all environment variables from the shared hosting section above.

### Step 4: Configure PM2

```bash
# Create PM2 ecosystem file
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'squares-api',
    script: 'server/index.js',
    cwd: '/var/www/squares-v2',
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    instances: 2,
    exec_mode: 'cluster',
    watch: false,
    max_memory_restart: '1G',
    error_file: '/var/log/squares-api-error.log',
    out_file: '/var/log/squares-api-out.log',
    log_file: '/var/log/squares-api.log'
  }]
};
```

### Step 5: Configure Nginx

```bash
# Create Nginx configuration
nano /etc/nginx/sites-available/buildhomemartsquares.com
```

```nginx
server {
    listen 80;
    server_name buildhomemartsquares.com www.buildhomemartsquares.com;

    # Frontend - Serve static files
    location / {
        root /var/www/squares-v2/dist;
        try_files $uri $uri/ /index.html;
        
        # Enable gzip compression
        gzip on;
        gzip_types text/css application/javascript application/json;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # WebSocket support for Socket.IO
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable the site
ln -s /etc/nginx/sites-available/buildhomemartsquares.com /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### Step 6: Setup SSL Certificate

```bash
# Get SSL certificate
certbot --nginx -d buildhomemartsquares.com -d www.buildhomemartsquares.com
```

### Step 7: Start Application

```bash
# Start the application with PM2
cd /var/www/squares-v2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save
pm2 startup

# Enable auto-start on boot
systemctl enable pm2-root
```

---

## 📧 Email Configuration (Already Done!)

Your application is already configured to use Hostinger email:

```bash
# Email settings (already in your codebase)
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=587
SMTP_USER=support@buildhomemartsquares.com
SMTP_PASS=your_hostinger_email_password
```

**Action Required**: Only update the password in your environment variables.

---

## 🗄️ Database Setup

### MongoDB Atlas (Recommended)

1. **Create MongoDB Atlas Account**
2. **Create a Cluster**
3. **Add Database User**
4. **Whitelist IP Addresses** (0.0.0.0/0 for all IPs)
5. **Get Connection String**
```
mongodb+srv://username:password@cluster.mongodb.net/squares
```

### Local MongoDB (VPS Only)

```bash
# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
apt-get update
apt-get install -y mongodb-org

# Start MongoDB
systemctl start mongod
systemctl enable mongod
```

---

## 🔒 Security Checklist

### Firewall Configuration (VPS Only)

```bash
# Configure UFW firewall
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS
ufw --force enable
```

### Application Security

- ✅ JWT tokens with strong secrets
- ✅ Password hashing with bcrypt
- ✅ Rate limiting enabled
- ✅ CORS properly configured
- ✅ Helmet.js security headers
- ✅ Input validation

---

## 📊 Monitoring & Maintenance

### PM2 Monitoring (VPS)

```bash
# Check application status
pm2 status
pm2 logs squares-api
pm2 monit

# Restart application
pm2 restart squares-api

# Update application
cd /var/www/squares-v2
git pull
npm run build
cd server
npm install --production
pm2 restart squares-api
```

### Log Management

```bash
# Setup log rotation
nano /etc/logrotate.d/squares-app
```

```
/var/log/squares-*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    postrotate
        pm2 reloadLogs
    endscript
}
```

---

## 🧪 Testing Deployment

### Frontend Testing
- Visit `https://yourdomain.com`
- Test all pages and functionality
- Check console for errors

### Backend Testing
```bash
# Test API endpoints
curl https://yourdomain.com/api/health
curl https://yourdomain.com/api/auth/check
```

### Email Testing
- Test registration flow
- Test password reset
- Check admin notifications

---

## 🚨 Troubleshooting

### Common Issues

**1. Frontend not loading**
```bash
# Check Nginx configuration
nginx -t
systemctl status nginx

# Check file permissions
chmod -R 755 /var/www/squares-v2/dist
```

**2. Backend API errors**
```bash
# Check PM2 logs
pm2 logs squares-api

# Check environment variables
pm2 env squares-api
```

**3. Email not working**
```bash
# Test SMTP connection
node -e "
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransporter({
  host: 'smtp.hostinger.com',
  port: 587,
  auth: { user: 'support@buildhomemartsquares.com', pass: 'your_password' }
});
transporter.verify((error, success) => {
  console.log(error ? 'Error:' + error : 'SMTP Ready');
});
"
```

**4. Database connection issues**
- Check MongoDB Atlas IP whitelist
- Verify connection string format
- Test network connectivity

---

## 📈 Performance Optimization

### Frontend Optimizations
- ✅ Vite build optimization already configured
- ✅ Code splitting implemented
- ✅ Asset compression enabled
- ✅ CDN ready (static files in `/dist`)

### Backend Optimizations
- ✅ PM2 cluster mode for load balancing
- ✅ Compression middleware enabled
- ✅ Database indexing implemented
- ✅ Rate limiting configured

### Nginx Optimizations
- ✅ Gzip compression
- ✅ Static asset caching
- ✅ Proxy caching for API responses

---

## 🔄 Backup Strategy

### Application Backup
```bash
# Create backup script
nano /root/backup-squares.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/root/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup application files
tar -czf $BACKUP_DIR/squares-app-$DATE.tar.gz /var/www/squares-v2

# Backup database (if using local MongoDB)
mongodump --out $BACKUP_DIR/mongo-$DATE

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
find $BACKUP_DIR -name "mongo-*" -mtime +7 -exec rm -rf {} \;
```

```bash
# Make executable and schedule
chmod +x /root/backup-squares.sh
crontab -e

# Add this line for daily backup at 2 AM
0 2 * * * /root/backup-squares.sh
```

---

## ✅ Deployment Checklist

### Pre-Deployment
- [ ] Domain name configured
- [ ] MongoDB Atlas cluster created
- [ ] Cloudinary account setup
- [ ] Razorpay account configured
- [ ] Hostinger email password updated

### During Deployment
- [ ] Frontend built and uploaded
- [ ] Backend deployed and running
- [ ] Environment variables configured
- [ ] Database connected
- [ ] SSL certificate installed

### Post-Deployment
- [ ] All pages loading correctly
- [ ] API endpoints responding
- [ ] Email functionality working
- [ ] Payment gateway tested
- [ ] File uploads working
- [ ] Real-time features (WebSocket) working
- [ ] Admin panel accessible
- [ ] Mobile responsiveness verified

---

## 📞 Support

For deployment issues:
1. Check application logs: `pm2 logs squares-api`
2. Verify Nginx configuration: `nginx -t`
3. Test database connection
4. Contact Hostinger support for hosting-related issues

---

**🎉 Congratulations!** Your BuildHomeMart Squares application is now live on Hostinger!

**Live URL**: `https://buildhomemartsquares.com`
**API URL**: `https://buildhomemartsquares.com/api`
**Admin Panel**: `https://buildhomemartsquares.com/admin`
