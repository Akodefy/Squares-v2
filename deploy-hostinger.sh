#!/bin/bash

# Hostinger VPS Deployment Script for BuildHomeMart Squares
# Run this script on your VPS after initial server setup

set -e  # Exit on any error

echo "🚀 Starting Hostinger VPS deployment for BuildHomeMart Squares..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="buildhomemartsquares.com"
APP_DIR="/var/www/squares-v2"
USER="root"

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    print_error "Please run this script as root (sudo ./deploy-hostinger.sh)"
    exit 1
fi

# Update system
print_status "Updating system packages..."
apt update && apt upgrade -y

# Install Node.js 18
print_status "Installing Node.js 18..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    apt-get install -y nodejs
fi

# Verify Node.js installation
NODE_VERSION=$(node --version)
print_status "Node.js version: $NODE_VERSION"

# Install PM2
print_status "Installing PM2..."
npm install -g pm2

# Install Nginx
print_status "Installing Nginx..."
if ! command -v nginx &> /dev/null; then
    apt install nginx -y
    systemctl enable nginx
fi

# Install Certbot for SSL
print_status "Installing Certbot for SSL certificates..."
if ! command -v certbot &> /dev/null; then
    apt install certbot python3-certbot-nginx -y
fi

# Install MongoDB (optional - for local database)
read -p "Do you want to install local MongoDB? (y/N): " install_mongo
if [[ $install_mongo =~ ^[Yy]$ ]]; then
    print_status "Installing MongoDB..."
    wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
    echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
    apt-get update
    apt-get install -y mongodb-org
    systemctl start mongod
    systemctl enable mongod
fi

# Create application directory
print_status "Creating application directory..."
mkdir -p $APP_DIR

# Check if Git repository exists
if [ -d "$APP_DIR/.git" ]; then
    print_status "Updating existing repository..."
    cd $APP_DIR
    git pull origin main
else
    print_status "Cloning repository..."
    echo "Please provide your Git repository URL:"
    read -p "Git URL: " git_url
    if [ -n "$git_url" ]; then
        git clone $git_url $APP_DIR
    else
        print_warning "No Git URL provided. Please manually upload your application files to $APP_DIR"
        print_warning "Make sure your application structure is:"
        print_warning "  $APP_DIR/"
        print_warning "  ├── server/          (Backend files)"
        print_warning "  ├── src/             (Frontend source)"
        print_warning "  ├── package.json     (Frontend dependencies)"
        print_warning "  └── vite.config.ts   (Vite configuration)"
        read -p "Press Enter when files are uploaded..."
    fi
fi

cd $APP_DIR

# Install frontend dependencies and build
print_status "Installing frontend dependencies..."
npm install

print_status "Building frontend..."
npm run build

# Install backend dependencies
print_status "Installing backend dependencies..."
cd server
npm install --production

# Copy configuration files
print_status "Setting up configuration files..."
cd $APP_DIR

# Copy ecosystem config if not exists
if [ ! -f "ecosystem.config.js" ]; then
    cp ecosystem.config.js.example ecosystem.config.js 2>/dev/null || print_warning "ecosystem.config.js not found in repository"
fi

# Setup environment variables
print_status "Setting up environment variables..."
if [ ! -f "server/.env.production" ]; then
    print_warning "Creating production environment file..."
    cat > server/.env.production << EOF
NODE_ENV=production
PORT=3000
CLIENT_URL=https://$DOMAIN

# Database - UPDATE WITH YOUR MONGODB URI
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/squares

# JWT - CHANGE THESE VALUES
JWT_SECRET=your_super_secure_jwt_secret_production_key_change_this_immediately
JWT_EXPIRE=7d

# Hostinger Email - UPDATE PASSWORD
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=587
SMTP_USER=support@buildhomemartsquares.com
SMTP_PASS=your_hostinger_email_password

# Cloudinary - ADD YOUR CREDENTIALS
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Razorpay - ADD YOUR CREDENTIALS
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Google Maps - ADD YOUR API KEY
GOOGLE_MAPS_API_KEY=your_google_maps_key

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=jpg,jpeg,png,pdf,doc,docx
EOF
    print_warning "Environment file created at server/.env.production"
    print_warning "Please update all the placeholder values!"
fi

# Setup Nginx configuration
print_status "Configuring Nginx..."
if [ -f "nginx.conf" ]; then
    cp nginx.conf /etc/nginx/sites-available/$DOMAIN
else
    print_warning "nginx.conf not found in repository. Using default configuration..."
    # Create basic nginx config
    cat > /etc/nginx/sites-available/$DOMAIN << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    location / {
        root $APP_DIR/dist;
        try_files \$uri \$uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF
fi

# Enable Nginx site
ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t
if [ $? -eq 0 ]; then
    print_status "Nginx configuration is valid"
    systemctl reload nginx
else
    print_error "Nginx configuration is invalid. Please check the configuration."
    exit 1
fi

# Setup firewall
print_status "Configuring firewall..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Start application with PM2
print_status "Starting application with PM2..."
cd $APP_DIR
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup

# Setup SSL certificate
print_status "Setting up SSL certificate..."
print_warning "Make sure your domain DNS is pointing to this server IP before continuing!"
read -p "Is your domain DNS configured? (y/N): " dns_ready
if [[ $dns_ready =~ ^[Yy]$ ]]; then
    certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
    if [ $? -eq 0 ]; then
        print_status "SSL certificate installed successfully!"
    else
        print_warning "SSL certificate installation failed. You can run it manually later:"
        print_warning "certbot --nginx -d $DOMAIN -d www.$DOMAIN"
    fi
else
    print_warning "SSL certificate skipped. Run this command after DNS is configured:"
    print_warning "certbot --nginx -d $DOMAIN -d www.$DOMAIN"
fi

# Create backup script
print_status "Creating backup script..."
cat > /root/backup-squares.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/root/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup application files
tar -czf $BACKUP_DIR/squares-app-$DATE.tar.gz /var/www/squares-v2

# Backup database if local MongoDB is running
if systemctl is-active --quiet mongod; then
    mongodump --out $BACKUP_DIR/mongo-$DATE
fi

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
find $BACKUP_DIR -name "mongo-*" -mtime +7 -exec rm -rf {} \; 2>/dev/null

echo "Backup completed: $DATE"
EOF

chmod +x /root/backup-squares.sh

# Setup daily backup cron job
(crontab -l 2>/dev/null; echo "0 2 * * * /root/backup-squares.sh") | crontab -

# Final status check
print_status "Checking application status..."
pm2 status

print_status "Checking Nginx status..."
systemctl status nginx --no-pager -l

echo ""
echo "🎉 Deployment completed!"
echo ""
echo "Next steps:"
echo "1. Update environment variables in server/.env.production"
echo "2. Restart the application: pm2 restart squares-api"
echo "3. Test your application at: https://$DOMAIN"
echo ""
echo "Important files:"
echo "- Application: $APP_DIR"
echo "- Environment: $APP_DIR/server/.env.production"
echo "- Nginx config: /etc/nginx/sites-available/$DOMAIN"
echo "- PM2 logs: pm2 logs squares-api"
echo "- Backup script: /root/backup-squares.sh"
echo ""
echo "Useful commands:"
echo "- Restart app: pm2 restart squares-api"
echo "- View logs: pm2 logs squares-api"
echo "- Update app: cd $APP_DIR && git pull && npm run build && pm2 restart squares-api"
echo "- SSL setup: certbot --nginx -d $DOMAIN -d www.$DOMAIN"
echo ""
print_status "Deployment script completed successfully! 🚀"
