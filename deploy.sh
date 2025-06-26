#!/bin/bash

set -x

# Exit immediately if a command exits with a non-zero status.
set -e

# Check if a commit message was provided
if [ -z "$1" ]; then
  echo "🛑 Error: No commit message supplied."
  echo "Usage: ./deploy.sh \"Your commit message\""
  exit 1
fi

echo "✅ 1/5: Adding changes..."
git add .

echo "✅ 2/5: Committing changes..."
git commit -m "$1"

echo "✅ 3/5: Pushing to main branch..."
git push origin main

echo "✅ 4/5: Deploying to GitHub Pages..."
git checkout gh-pages
git merge main --no-edit
git push origin gh-pages

echo "✅ 5/5: Returning to main branch..."
git checkout main

echo "🚀 Website successfully deployed!" 