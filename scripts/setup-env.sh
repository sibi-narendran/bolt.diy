#!/bin/bash

# Setup script for Docker environment variables
# This script helps resolve the issue where .env.local is not being loaded in Docker

echo "🔧 Setting up environment files for Docker..."

# Check if .env.local exists
if [ -f ".env.local" ]; then
    echo "✅ Found .env.local file"
    
    # Create symlink or copy to .env for Docker Compose
    if [ ! -f ".env" ] || [ ".env" -ot ".env.local" ]; then
        echo "📋 Copying .env.local to .env for Docker Compose compatibility..."
        cp .env.local .env
        echo "✅ Environment file synced"
    else
        echo "ℹ️  .env file already up to date"
    fi
else
    echo "⚠️  No .env.local file found"
    
    # Check if an env example file exists and offer to copy it
    example_file=""

    if [ -f ".env.example" ]; then
        example_file=".env.example"
    elif [ -f "env.example" ]; then
        example_file="env.example"
    fi

    if [ -n "$example_file" ]; then
        echo "📋 Found $example_file file"
        read -p "Would you like to create .env.local from $example_file? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            cp "$example_file" .env.local
            cp "$example_file" .env
            echo "✅ Created .env.local and .env from $example_file"
            echo "📝 Please edit .env.local with your API keys"
        fi
    fi
fi

echo "✨ Environment setup complete!"
echo ""
echo "📚 Note: Docker Compose reads both .env and .env.local files"
echo "   - .env is used for variable substitution in docker-compose.yaml"
echo "   - .env.local is passed to the container for runtime variables"