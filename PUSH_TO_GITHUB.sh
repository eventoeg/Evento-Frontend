#!/bin/bash
# Run this script to push all code to GitHub
# Usage: bash PUSH_TO_GITHUB.sh

echo "Setting up GitHub remote..."
git remote set-url origin https://github.com/omarmorad/Evento-Frontend.git 2>/dev/null || git remote add origin https://github.com/omarmorad/Evento-Frontend.git

echo "Enter your GitHub Personal Access Token when prompted:"
read -s TOKEN

git remote set-url origin "https://${TOKEN}@github.com/omarmorad/Evento-Frontend.git"

echo "Pushing to GitHub..."
git push origin main --force

echo "Done! Check https://github.com/omarmorad/Evento-Frontend"
