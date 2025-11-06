# Hostinger MCP Setup for Claude Desktop

This directory contains the configuration and setup scripts to integrate Hostinger's Model Context Protocol (MCP) server with Claude Desktop for backend deployment management.

## Files

- `claude-desktop-config.json` - MCP server configuration for Claude Desktop
- `setup-hostinger-mcp.sh` - Automated setup script
- `hostingermcp.txt` - Original API token and configuration data

## Quick Setup

Run the setup script to automatically configure Claude Desktop:

```bash
./setup-hostinger-mcp.sh
```

## Manual Setup

1. Copy the configuration to Claude Desktop config directory:
```bash
mkdir -p ~/.config/claude-desktop
cp claude-desktop-config.json ~/.config/claude-desktop/claude_desktop_config.json
```

2. Restart Claude Desktop application

## API Token

The Hostinger API token (`ePiJ37DRHnvhlzFrRITszHkDqENByIgp7CJoDtNt23aaf9b4`) is configured in the MCP server environment variables.

## Available Features

Once configured, Claude Desktop will have access to:
- Domain management
- Hosting account operations  
- File management on Hostinger servers
- Database operations
- SSL certificate management
- Deployment automation

## Backend Deployment

With this MCP configured, you can ask Claude to:
- Deploy your Node.js backend to Hostinger
- Configure domain settings
- Manage environment variables
- Set up SSL certificates
- Monitor deployment status

## Verification

After setup, verify the MCP is working by:
1. Opening Claude Desktop
2. Checking MCP servers in settings
3. Testing Hostinger API commands through Claude
