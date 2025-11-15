#!/bin/bash

################################################################################
# BuildHomeMart Squares - Hostinger Frontend Deployment Script
# Domain: buildhomemartsquares.com/v2
# Date: 2025-11-16
################################################################################

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="buildhomemartsquares.com"
SUBDOMAIN_PATH="v2"
PROJECT_ROOT="$(pwd)"
DIST_DIR="$PROJECT_ROOT/dist"
BACKUP_DIR="backups"
DEPLOYMENT_LOG="deployment.log"

# Functions
log() {
  echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$DEPLOYMENT_LOG"
}

log_success() {
  echo -e "${GREEN}✓ $1${NC}" | tee -a "$DEPLOYMENT_LOG"
}

log_error() {
  echo -e "${RED}✗ $1${NC}" | tee -a "$DEPLOYMENT_LOG"
}

log_warning() {
  echo -e "${YELLOW}⚠ $1${NC}" | tee -a "$DEPLOYMENT_LOG"
}

# Header
log "=============================================="
log "BuildHomeMart Squares - Hostinger Deployment"
log "=============================================="
log "Domain: $DOMAIN/$SUBDOMAIN_PATH"
log "Project Root: $PROJECT_ROOT"
log "=============================================="

# Check prerequisites
log "Checking prerequisites..."

if [ ! -f "$PROJECT_ROOT/package.json" ]; then
  log_error "package.json not found. Please run this script from the project root."
  exit 1
fi

if ! command -v npm &> /dev/null; then
  log_error "npm is not installed. Please install Node.js and npm first."
  exit 1
fi

log_success "Prerequisites checked"

# Load environment
log "Loading environment configuration..."
if [ ! -f "$PROJECT_ROOT/.env.hostinger" ]; then
  log_warning ".env.hostinger not found. Using .env.production as fallback."
  if [ -f "$PROJECT_ROOT/.env.production" ]; then
    export $(cat "$PROJECT_ROOT/.env.production" | xargs)
  fi
else
  export $(cat "$PROJECT_ROOT/.env.hostinger" | xargs)
fi
log_success "Environment loaded"

# Install dependencies
log "Installing dependencies..."
npm install --production=false
log_success "Dependencies installed"

# Build frontend
log "Building frontend for production..."
npm run build

if [ ! -d "$DIST_DIR" ]; then
  log_error "Build failed. dist directory not found."
  exit 1
fi

log_success "Frontend built successfully"

# Create backup
log "Creating backup of current deployment..."
mkdir -p "$BACKUP_DIR"
BACKUP_NAME="backup-$(date +'%Y%m%d-%H%M%S').tar.gz"
if [ -d "$DIST_DIR" ]; then
  tar -czf "$BACKUP_DIR/$BACKUP_NAME" "$DIST_DIR" 2>/dev/null || true
  log_success "Backup created: $BACKUP_NAME"
else
  log_warning "No previous deployment found. Skipping backup."
fi

# Create deployment package
log "Creating deployment package..."
DEPLOY_PACKAGE="squares-v2-deployment-$(date +'%Y%m%d-%H%M%S').tar.gz"
tar -czf "$DEPLOY_PACKAGE" \
  dist/ \
  .htaccess \
  web.config \
  --exclude=node_modules \
  --exclude=.git \
  --exclude=.github \
  --exclude=src \
  --exclude=public \
  2>/dev/null

log_success "Deployment package created: $DEPLOY_PACKAGE"

# Display deployment instructions
log ""
log "=============================================="
log "DEPLOYMENT PACKAGE READY"
log "=============================================="
log ""
log "Package: $DEPLOY_PACKAGE"
log "Size: $(du -h "$DEPLOY_PACKAGE" | cut -f1)"
log ""
log_success "Build completed successfully!"
log ""
log "Next Steps for Hostinger Deployment:"
log "1. Connect to Hostinger File Manager or via SFTP"
log "2. Navigate to public_html/$SUBDOMAIN_PATH"
log "3. Upload contents of '$DEPLOY_PACKAGE'"
log "4. Extract the archive in the subdirectory"
log "5. Verify .htaccess and web.config are in place"
log ""
log "SFTP Command:"
log "sftp username@$DOMAIN"
log "  cd public_html/$SUBDOMAIN_PATH"
log "  put $DEPLOY_PACKAGE"
log ""
log "File Manager Steps:"
log "1. Upload $DEPLOY_PACKAGE to public_html/$SUBDOMAIN_PATH"
log "2. Right-click on archive → Extract"
log "3. Verify deployment at: https://$DOMAIN/$SUBDOMAIN_PATH"
log ""
log "Post-Deployment Checks:"
log "1. Test homepage: https://$DOMAIN/$SUBDOMAIN_PATH"
log "2. Test SPA routing: https://$DOMAIN/$SUBDOMAIN_PATH/dashboard"
log "3. Check console for API errors"
log "4. Verify static assets load with correct paths"
log "5. Test HTTPS redirect"
log ""
log "Troubleshooting:"
log "- If 404 errors on routes: Verify .htaccess is in public_html/$SUBDOMAIN_PATH"
log "- If assets not loading: Check RewriteBase in .htaccess"
log "- If CSS not applied: Clear browser cache and check headers"
log "- API 404: Verify backend is running and VITE_API_URL is correct"
log ""
log "=============================================="

# Create deployment info file
cat > deployment-info.json <<EOF
{
  "deployment": {
    "timestamp": "$(date -u +'%Y-%m-%dT%H:%M:%SZ')",
    "domain": "$DOMAIN",
    "path": "/$SUBDOMAIN_PATH",
    "package": "$DEPLOY_PACKAGE",
    "files": {
      "dist": "React build output",
      "htaccess": "Apache URL rewriting and security",
      "web_config": "IIS configuration (if applicable)"
    },
    "environment": "production",
    "api_url": "${VITE_API_URL:-https://$DOMAIN/api}",
    "version": "$(npm list --depth=0 | head -n 1)"
  }
}
EOF

log_success "Deployment info saved to deployment-info.json"
log ""
log "Log file saved to: $DEPLOYMENT_LOG"
