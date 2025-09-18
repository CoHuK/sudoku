#!/bin/bash

# Cloud Deploy Script for Sudoku Game
# Builds optimized Docker image, pushes to registry, and deploys to AWS Elastic Beanstalk

set -e

# Change to project root directory
cd "$(dirname "$0")/.."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
IMAGE_NAME="sudoku-game"
REGISTRY="cohuk"  # Change this to your Docker Hub username or ECR registry
DOCKERFILE="Dockerfile.production"

# Get version from package.json
VERSION=$(node -p "require('./package.json').version")
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BUILD_TAG="${VERSION}-${TIMESTAMP}"

echo -e "${BLUE}🚀 Starting cloud deployment for Sudoku Game${NC}"
echo -e "${YELLOW}📋 Version: ${VERSION}${NC}"
echo -e "${YELLOW}📋 Build Tag: ${BUILD_TAG}${NC}"
echo -e "${YELLOW}📋 Dockerfile: ${DOCKERFILE}${NC}"

# Check if git is clean
if ! git diff-index --quiet HEAD --; then
    echo -e "${RED}❌ Git working directory is not clean. Please commit or stash changes first.${NC}"
    exit 1
fi

# Check if we're on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ] && [ "$CURRENT_BRANCH" != "master" ]; then
    echo -e "${YELLOW}⚠️  Warning: You're not on main/master branch (currently on: ${CURRENT_BRANCH})${NC}"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}❌ Deployment cancelled${NC}"
        exit 1
    fi
fi

# Step 1: Build optimized Docker image
echo -e "${BLUE}📦 Building optimized Docker image...${NC}"
echo -e "${YELLOW}   Using Dockerfile: ${DOCKERFILE}${NC}"
echo -e "${YELLOW}   Image: ${IMAGE_NAME}:${VERSION}${NC}"

if ! docker build -f $DOCKERFILE -t $IMAGE_NAME:$VERSION -t $IMAGE_NAME:latest .; then
    echo -e "${RED}❌ Docker build failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker image built successfully${NC}"

# Step 2: Tag for registry
echo -e "${BLUE}🏷️  Tagging images for registry...${NC}"
docker tag $IMAGE_NAME:$VERSION $REGISTRY/$IMAGE_NAME:$VERSION
docker tag $IMAGE_NAME:$VERSION $REGISTRY/$IMAGE_NAME:latest
docker tag $IMAGE_NAME:$VERSION $REGISTRY/$IMAGE_NAME:$BUILD_TAG

echo -e "${GREEN}✅ Images tagged successfully${NC}"

# Step 3: Push to registry
echo -e "${BLUE}⬆️  Pushing images to registry...${NC}"
echo -e "${YELLOW}   Pushing: ${REGISTRY}/${IMAGE_NAME}:${VERSION}${NC}"
echo -e "${YELLOW}   Pushing: ${REGISTRY}/${IMAGE_NAME}:latest${NC}"
echo -e "${YELLOW}   Pushing: ${REGISTRY}/${IMAGE_NAME}:${BUILD_TAG}${NC}"

if ! docker push $REGISTRY/$IMAGE_NAME:$VERSION; then
    echo -e "${RED}❌ Failed to push versioned image${NC}"
    exit 1
fi

if ! docker push $REGISTRY/$IMAGE_NAME:latest; then
    echo -e "${RED}❌ Failed to push latest image${NC}"
    exit 1
fi

if ! docker push $REGISTRY/$IMAGE_NAME:$BUILD_TAG; then
    echo -e "${RED}❌ Failed to push build-tagged image${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Images pushed successfully${NC}"

# Step 4: Deploy to Elastic Beanstalk
echo -e "${BLUE}☁️  Deploying to AWS Elastic Beanstalk...${NC}"
echo -e "${YELLOW}   Version: ${VERSION}${NC}"
echo -e "${YELLOW}   Build Tag: ${BUILD_TAG}${NC}"

if ! eb deploy; then
    echo -e "${RED}❌ EB deployment failed${NC}"
    exit 1
fi


echo -e "${GREEN}✅ Cloud deployment completed successfully!${NC}"
echo -e "${GREEN}🌐 Your app should be available at the EB URL${NC}"
echo -e "${YELLOW}📋 Deployment Details:${NC}"
echo -e "${YELLOW}   Version: ${VERSION}${NC}"
echo -e "${YELLOW}   Build Tag: ${BUILD_TAG}${NC}"
echo -e "${YELLOW}   Deployed Image: ${REGISTRY}/${IMAGE_NAME}:latest${NC}"
echo -e "${YELLOW}   Versioned Image: ${REGISTRY}/${IMAGE_NAME}:${VERSION}${NC}"
echo -e "${YELLOW}   Dockerfile: ${DOCKERFILE}${NC}"
