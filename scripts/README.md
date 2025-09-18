# Scripts Directory

This directory contains all build, deployment, and versioning scripts for the Sudoku Game project.

## 📁 Scripts Overview

### `build.js`
**Purpose**: Builds optimized production files
**Usage**: `npm run build` or `node scripts/build.js`
**Output**: 
- `frontend/script.min.js` - Minified JavaScript
- `frontend/style.min.css` - Minified CSS  
- `frontend/index.optimized.html` - Optimized HTML

### `version.sh`
**Purpose**: Manages version bumping and git operations
**Usage**: `./scripts/version.sh [command]`
**Commands**:
- `patch` - Bump patch version (1.0.0 → 1.0.1)
- `minor` - Bump minor version (1.0.0 → 1.1.0)  
- `major` - Bump major version (1.0.0 → 2.0.0)
- `show` - Show current version
- `prepare` - Bump patch and prepare for deployment
- `help` - Show help message

### `cloud_deploy.sh`
**Purpose**: Deploys to cloud (Docker + AWS Elastic Beanstalk)
**Usage**: `./scripts/cloud_deploy.sh`
**Process**:
1. Builds optimized Docker image
2. Tags with version, latest, and build timestamp
3. Pushes to Docker registry
4. Deploys to AWS Elastic Beanstalk
5. Cleans up local images

## 🚀 Quick Start

### Development
```bash
# Start development server
npm start

# Build optimized files
npm run build
```

### Version Management
```bash
# Show current version
./scripts/version.sh show

# Bump patch version
./scripts/version.sh patch

# Prepare for deployment
./scripts/version.sh prepare
```

### Deployment
```bash
# Deploy to cloud
./scripts/cloud_deploy.sh

# Or use npm script
npm run cloud-deploy
```

## 📋 NPM Scripts

All scripts are accessible via npm for convenience:

```bash
# Build
npm run build              # Build optimized files

# Version management  
npm run version:patch      # Bump patch version
npm run version:minor      # Bump minor version
npm run version:major      # Bump major version

# Deployment
npm run cloud-deploy       # Deploy to cloud

# Docker
npm run docker:build       # Build Docker image with version
npm run docker:build-latest # Build Docker image with latest tag
npm run docker:run         # Run Docker container with version
npm run docker:run-latest  # Run Docker container with latest tag
```

## 🔧 Script Features

### Auto-Directory Detection
All scripts automatically change to the project root directory, so they can be run from anywhere:

```bash
# These all work the same:
./scripts/version.sh show
cd scripts && ./version.sh show
cd /some/other/dir && /path/to/sudoku/scripts/version.sh show
```

### Error Handling
- All scripts use `set -e` for immediate exit on errors
- Comprehensive error messages with color coding
- Git validation before version operations
- Docker build validation

### Color Output
- 🔵 Blue: Information messages
- 🟡 Yellow: Warnings and details
- 🟢 Green: Success messages
- 🔴 Red: Error messages

## 📁 File Structure

```
scripts/
├── README.md          # This file
├── build.js           # Build script
├── version.sh         # Version management
└── cloud_deploy.sh    # Cloud deployment
```

## 🛠️ Customization

### Docker Registry
Update the registry in `cloud_deploy.sh`:
```bash
REGISTRY="your-dockerhub-username"
```

### Build Configuration
Modify `build.js` to change:
- Minification settings
- Output file names
- CSS/JS processing

### Version Strategy
Modify `version.sh` to change:
- Git commit messages
- Tag naming
- Branch validation

## 📚 Related Documentation

- [VERSIONING_DEPLOYMENT.md](../VERSIONING_DEPLOYMENT.md) - Complete versioning guide
- [DOCKER_DEPLOYMENT.md](../DOCKER_DEPLOYMENT.md) - Docker deployment guide
- [PERFORMANCE_OPTIMIZATION.md](../PERFORMANCE_OPTIMIZATION.md) - Performance optimizations
