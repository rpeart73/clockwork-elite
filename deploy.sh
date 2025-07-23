#!/usr/bin/env sh

# Build the application
echo "Building Clockwork Elite v5.0.0..."
npm run build

# Navigate into the build output directory
cd dist

# Create a new git repository in dist
git init
git checkout -b main
git add -A
git commit -m 'Deploy Clockwork Elite v5.0.0 Enterprise Edition'

# Force push to the gh-pages branch
git push -f git@github.com:rpeart73/clockwork-elite.git main:gh-pages

cd -

echo "Deployment complete! Visit https://rpeart73.github.io/clockwork-elite/"