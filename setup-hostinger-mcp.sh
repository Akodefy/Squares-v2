#!/bin/bash

echo "🚀 Setting up Hostinger MCP for Claude Desktop..."
echo ""

# Check if Claude Desktop config directory exists
CLAUDE_CONFIG_DIR="$HOME/.config/claude-desktop"
CONFIG_FILE="$CLAUDE_CONFIG_DIR/claude_desktop_config.json"

# Create directory if it doesn't exist
if [ ! -d "$CLAUDE_CONFIG_DIR" ]; then
    echo "📁 Creating Claude Desktop config directory..."
    mkdir -p "$CLAUDE_CONFIG_DIR"
fi

# Backup existing config if it exists
if [ -f "$CONFIG_FILE" ]; then
    echo "💾 Backing up existing Claude config..."
    cp "$CONFIG_FILE" "$CONFIG_FILE.backup.$(date +%Y%m%d_%H%M%S)"
fi

# Copy the MCP configuration
echo "📋 Installing Hostinger MCP configuration..."
cp "./claude-desktop-config.json" "$CONFIG_FILE"

echo ""
echo "✅ Hostinger MCP Configuration Installed!"
echo ""
echo "📋 Configuration Details:"
echo "   - Server: hostinger-mcp"
echo "   - Package: hostinger-api-mcp@latest"
echo "   - API Token: Configured (ePiJ37...)"
echo ""
echo "🔄 Next Steps:"
echo "1. Restart Claude Desktop application"
echo "2. The Hostinger MCP will be available in Claude"
echo "3. You can now use Hostinger API commands through Claude"
echo ""
echo "💡 Available Hostinger MCP Features:"
echo "   - Domain management"
echo "   - Hosting account operations"
echo "   - File management"
echo "   - Database operations"
echo "   - SSL certificate management"
echo ""
echo "🔧 To verify installation:"
echo "   Check if the MCP server appears in Claude Desktop settings"
echo ""
