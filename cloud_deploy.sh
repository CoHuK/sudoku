#!/bin/bash

# Cloud Deploy Script for Sudoku Game
# Builds Docker image, pushes to registry, and deploys to AWS Elastic Beanstalk

set -e  # Exit on any error

# Configuration
IMAGE_NAME="sudoku-game"
TAG="latest"
REGISTRY="cohuk"  # Change this to your Docker Hub username or ECR registry

echo "🚀 Starting cloud deployment..."

# Step 1: Build Docker image
echo "📦 Building Docker image..."
docker build -t $IMAGE_NAME:$TAG .

# Step 2: Tag for registry
echo "🏷️  Tagging image for registry..."
docker tag $IMAGE_NAME:$TAG $REGISTRY/$IMAGE_NAME:$TAG

# Step 3: Push to registry
echo "⬆️  Pushing image to registry..."
docker push $REGISTRY/$IMAGE_NAME:$TAG

# Step 4: Deploy to Elastic Beanstalk
echo "☁️  Deploying to AWS Elastic Beanstalk..."
eb deploy

echo "✅ Cloud deployment completed successfully!"
echo "🌐 Your app should be available at the EB URL"
