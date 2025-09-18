#!/bin/bash

# Version Management Script for Sudoku Game
# Handles version bumping, git tagging, and deployment preparation

set -e

# Change to project root directory
cd "$(dirname "$0")/.."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo -e "${BLUE}📋 Current version: ${CURRENT_VERSION}${NC}"

# Function to show help
show_help() {
    echo -e "${BLUE}Version Management Script${NC}"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  patch     Bump patch version (1.0.0 -> 1.0.1)"
    echo "  minor     Bump minor version (1.0.0 -> 1.1.0)"
    echo "  major     Bump major version (1.0.0 -> 2.0.0)"
    echo "  show      Show current version"
    echo "  prepare   Bump patch version and prepare for deployment"
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 patch          # Bump patch version"
    echo "  $0 prepare        # Bump patch and prepare for deployment"
    echo "  $0 show           # Show current version"
    echo ""
    echo "Note: Run from project root: ./scripts/version.sh [command]"
}

# Function to bump version
bump_version() {
    local version_type=$1
    local new_version
    
    echo -e "${BLUE}🔄 Bumping ${version_type} version...${NC}"
    
    # Check if git is clean
    if ! git diff-index --quiet HEAD --; then
        echo -e "${RED}❌ Git working directory is not clean. Please commit or stash changes first.${NC}"
        exit 1
    fi
    
    # Bump version
    case $version_type in
        "patch")
            new_version=$(npm version patch --no-git-tag-version | sed 's/v//')
            ;;
        "minor")
            new_version=$(npm version minor --no-git-tag-version | sed 's/v//')
            ;;
        "major")
            new_version=$(npm version major --no-git-tag-version | sed 's/v//')
            ;;
        *)
            echo -e "${RED}❌ Invalid version type: ${version_type}${NC}"
            exit 1
            ;;
    esac
    
    echo -e "${GREEN}✅ Version bumped to: ${new_version}${NC}"
    
    # Commit version change
    git add package.json package-lock.json
    git commit -m "chore: bump version to ${new_version}"
    
    # Create git tag
    git tag "v${new_version}"
    
    echo -e "${GREEN}✅ Git tag created: v${new_version}${NC}"
    
    # Push changes and tags
    git push origin HEAD
    git push origin "v${new_version}"
    
    echo -e "${GREEN}✅ Changes pushed to remote${NC}"
    
    return 0
}

# Function to prepare for deployment
prepare_deploy() {
    echo -e "${BLUE}🚀 Preparing for deployment...${NC}"
    
    # Bump patch version
    bump_version "patch"
    
    echo -e "${GREEN}✅ Version bumped and ready for deployment!${NC}"
    echo -e "${YELLOW}💡 Run './scripts/cloud_deploy.sh' to deploy to cloud${NC}"
}

# Main script logic
case "${1:-help}" in
    "patch")
        bump_version "patch"
        ;;
    "minor")
        bump_version "minor"
        ;;
    "major")
        bump_version "major"
        ;;
    "show")
        echo -e "${YELLOW}Current version: ${CURRENT_VERSION}${NC}"
        ;;
    "prepare")
        prepare_deploy
        ;;
    "help"|*)
        show_help
        ;;
esac
