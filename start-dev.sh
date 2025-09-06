#!/bin/bash

# MeetingMind Development Startup Script

echo "🚀 Starting MeetingMind Development Environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check if FFmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "⚠️  FFmpeg is not installed. Audio processing may not work properly."
    echo "   Install FFmpeg: https://ffmpeg.org/download.html"
fi

# Check if backend .env exists
if [ ! -f "backend/.env" ]; then
    echo "⚠️  Backend .env file not found. Creating from template..."
    if [ -f "backend/env.example" ]; then
        cp backend/env.example backend/.env
        echo "📝 Please edit backend/.env and add your Gemini API key"
        echo "   Get your API key from: https://makersuite.google.com/app/apikey"
    else
        echo "❌ backend/env.example not found. Please create backend/.env manually."
        exit 1
    fi
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend && npm install && cd ..
fi

# Start the development environment
echo "🎯 Starting development servers..."

# Function to cleanup background processes
cleanup() {
    echo "🛑 Stopping development servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start backend server
echo "🔧 Starting backend server on http://localhost:3001..."
cd backend && npm run dev &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend server
echo "🎨 Starting frontend server on http://localhost:1420..."
npm run dev &
FRONTEND_PID=$!

# Wait for both servers to be ready
echo "⏳ Waiting for servers to start..."
sleep 5

echo "✅ Development environment is ready!"
echo ""
echo "📱 Frontend: http://localhost:1420"
echo "🔧 Backend API: http://localhost:3001"
echo "🖥️  Desktop App: Will open automatically"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for user interrupt
wait

