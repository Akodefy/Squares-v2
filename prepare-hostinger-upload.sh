#!/bin/bash

################################################################################
# Quick Deployment Helper for Hostinger
# Compresses and prepares files for SFTP upload
################################################################################

set -e

SUBDOMAIN_PATH="v2"
TIMESTAMP=$(date +'%Y%m%d-%H%M%S')
ARCHIVE_NAME="squares-v2-hostinger-$TIMESTAMP.zip"

echo "Building deployment package for: buildhomemartsquares.com/$SUBDOMAIN_PATH"
echo ""

# Check if dist exists
if [ ! -d "dist" ]; then
  echo "❌ dist/ directory not found. Running build first..."
  npm run build
fi

echo "✓ Creating compressed archive..."
zip -r "$ARCHIVE_NAME" \
  dist/ \
  .htaccess \
  web.config \
  -x "*.git*" "*/node_modules/*" "*/src/*" \
  > /dev/null

ARCHIVE_SIZE=$(du -h "$ARCHIVE_NAME" | cut -f1)

echo "✓ Archive created: $ARCHIVE_NAME ($ARCHIVE_SIZE)"
echo ""
echo "📤 SFTP Upload Instructions:"
echo "────────────────────────────────────────────"
echo "1. Open SFTP client (WinSCP, FileZilla, or terminal)"
echo "2. Connect to: sftp.hostinger.com"
echo "3. Username: your_username"
echo "4. Navigate to: public_html/$SUBDOMAIN_PATH"
echo "5. Upload: $ARCHIVE_NAME"
echo "6. Extract in File Manager"
echo ""
echo "🔗 Verify at: https://buildhomemartsquares.com/$SUBDOMAIN_PATH"
echo ""
