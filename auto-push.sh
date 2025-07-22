#!/bin/bash

echo "Clockwork Elite Auto-Push Script"
echo "================================"

# Check if we're in the right directory
if [ ! -f "index.html" ]; then
    echo "Error: index.html not found. Make sure you're running this from the clockwork-elite directory."
    exit 1
fi

# Get current timestamp for commit message
timestamp=$(date "+%Y-%m-%d %H:%M")

# Check git status
echo ""
echo "Checking git status..."
git status

# Ask for confirmation
echo ""
read -p "Do you want to push changes to GitHub Pages? (y/n): " confirm
if [[ $confirm != [yY] ]]; then
    echo "Push cancelled."
    exit 0
fi

# Ask for commit message
echo ""
read -p "Enter commit message (or press Enter for auto message): " message

# Use auto message if none provided
if [ -z "$message" ]; then
    message="Auto-update Clockwork Elite - $timestamp"
fi

# Add, commit, and push
echo ""
echo "Adding files..."
git add index.html

echo "Committing changes..."
git commit -m "$message

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

echo "Pushing to GitHub..."
git push

echo ""
echo "✅ Changes pushed successfully!"
echo "Your site will be updated at: https://rpeart73.github.io/clockwork-elite/"
echo "It may take 1-5 minutes for changes to appear."

read -p "Press Enter to continue..."