#!/bin/bash

# Tamil Chat Application Startup Script

echo "🚀 Starting Tamil Chat Application..."
echo "தமிழ் அரட்டை பயன்பாட்டைத் தொடங்குகிறது..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3 first."
    echo "❌ Python 3 நிறுவப்படவில்லை. முதலில் Python 3 ஐ நிறுவவும்."
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "🔧 Creating virtual environment..."
    echo "🔧 மெய்நிகர் சூழலை உருவாக்குகிறது..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "⚡ Activating virtual environment..."
echo "⚡ மெய்நிகர் சூழலை செயல்படுத்துகிறது..."
source venv/bin/activate

# Install dependencies
echo "📦 Installing dependencies..."
echo "📦 சார்புகளை நிறுவுகிறது..."
pip install -r requirements.txt

# Run the application
echo "🌐 Starting Flask server..."
echo "🌐 Flask சர்வரைத் தொடங்குகிறது..."
echo ""
echo "✅ Application will be available at: http://localhost:5000"
echo "✅ பயன்பாடு இங்கே கிடைக்கும்: http://localhost:5000"
echo ""
echo "Sample Users / மாதிரி பயனர்கள்:"
echo "👤 arun@gmail.com / arun123 (Arun)"
echo "👤 kavi@gmail.com / kavi123 (Kavitha)"
echo "👤 mani@gmail.com / mani123 (Mani)"
echo ""
echo "Press Ctrl+C to stop the server / சர்வரை நிறுத்த Ctrl+C ஐ அழுத்தவும்"
echo ""

python app.py
