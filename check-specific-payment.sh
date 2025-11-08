#!/bin/bash

# Quick script to check and update the specific payment mentioned
# Payment ID: 68fa17dcf3f2fa10bad9baf5

echo "🔍 Checking payment status for: 68fa17dcf3f2fa10bad9baf5"
echo "================================================"
echo ""

cd "$(dirname "$0")/server"

node check-payment-status.js 68fa17dcf3f2fa10bad9baf5

echo ""
echo "================================================"
echo "✅ Payment check completed"
echo ""
echo "To check all expired payments, run:"
echo "  node server/check-payment-status.js --all"
