# Versioning & Deployment Guide

## Overview

The Sudoku Game now includes comprehensive versioning and deployment automation with Docker container optimization.

## 🏷️ Version Management

### Current Version
```bash
# Show current version
npm run version:show
# or
./scripts/version.sh show
```

### Version Bumping
```bash
# Patch version (1.0.0 -> 1.0.1) - Bug fixes
./scripts/version.sh patch

# Minor version (1.0.0 -> 1.1.0) - New features
./scripts/version.sh minor

# Major version (1.0.0 -> 2.0.0) - Breaking changes
./scripts/version.sh major
```

### NPM Scripts
```bash
# Version management
npm run version:patch    # Bump patch + git push + tags
npm run version:minor    # Bump minor + git push + tags
npm run version:major    # Bump major + git push + tags

# Docker with versioning
npm run docker:build     # Build with current version tag
npm run docker:build-latest  # Build with 'latest' tag
npm run docker:run       # Run with current version
npm run docker:run-latest    # Run with 'latest' tag
```

## 🐳 Docker Versioning

### Image Tags
- `sudoku-game:1.0.0` - Version-specific tag (for rollback)
- `sudoku-game:latest` - Latest version (used by EB deployment)
- `cohuk/sudoku-game:1.0.0-20241201-143022` - Build-specific tag (for tracking)

**Note**: AWS Elastic Beanstalk always uses the `latest` tag for deployment, while version-specific tags are available for rollback purposes.

### Docker Commands
```bash
# Build production image with version
docker build -f Dockerfile.production -t sudoku-game:$(node -p "require('./package.json').version") .

# Build and run locally
npm run docker:build
npm run docker:run

# Run specific version
docker run -p 80:80 sudoku-game:1.0.0
```

## ☁️ Cloud Deployment

### Quick Deploy
```bash
# 1. Bump version and prepare
./scripts/version.sh prepare

# 2. Deploy to cloud
./scripts/cloud_deploy.sh
```

### Manual Deploy
```bash
# 1. Bump version
./scripts/version.sh patch

# 2. Deploy to cloud
./scripts/cloud_deploy.sh
```

### Deployment Process
1. **Version Check**: Validates git is clean and on main branch
2. **Build**: Creates optimized Docker image using `Dockerfile.production`
3. **Tag**: Tags image with version, latest, and build timestamp
4. **Push**: Pushes to Docker registry (Docker Hub/ECR)
5. **Deploy**: Deploys to AWS Elastic Beanstalk
6. **Cleanup**: Removes local images to save space

## 📋 Version Information

### API Endpoints
```bash
# Get version info
curl http://localhost:3000/api/version

# Response includes:
{
  "version": "1.0.0",
  "buildTime": "2024-12-01T14:30:22.000Z",
  "name": "sudoku-game",
  "description": "A Sudoku game with JavaScript frontend and Node.js backend",
  "nodeVersion": "v20.18.3",
  "environment": "production"
}
```

### New Game Response
```bash
# New game now includes version info
curl http://localhost:3000/api/new-game

# Response includes:
{
  "board": [...],
  "message": "New game started!",
  "version": "1.0.0",
  "buildTime": "2024-12-01T14:30:22.000Z"
}
```

## 🔧 Configuration

### Environment Variables
```bash
# Required
NODE_ENV=production
PORT=80

# Optional
BASE_PATH=/sudoku  # For subdirectory deployment
```

### Docker Registry
Update `cloud_deploy.sh`:
```bash
REGISTRY="your-dockerhub-username"  # Change this
```

### AWS Elastic Beanstalk
Ensure you have:
- `eb` CLI installed and configured
- AWS credentials set up
- EB application and environment created

## 📊 Deployment Workflow

### Development
```bash
# 1. Make changes
git add .
git commit -m "feat: add new feature"

# 2. Test locally
npm start

# 3. Test Docker
npm run docker:build
npm run docker:run
```

### Production
```bash
# 1. Bump version and deploy
./version.sh deploy

# 2. Or manual process
./version.sh patch
./cloud_deploy.sh
```

## 🚀 Performance Benefits

### Docker Optimization
- **Multi-stage build**: Smaller final image (~120MB)
- **Production dependencies only**: Reduced attack surface
- **Security hardening**: Non-root user
- **Health checks**: Container monitoring

### Version Tracking
- **Git tags**: Automatic version tagging
- **Build metadata**: Timestamp and environment info
- **API versioning**: Version info in responses
- **Rollback capability**: Easy version switching

## 🔍 Monitoring

### Health Checks
```bash
# Check container health
docker ps
docker logs sudoku-game

# Check API health
curl http://localhost:3000/api/version
curl http://localhost:3000/api/new-game
```

### Version History
```bash
# View git tags
git tag -l

# View version history
git log --oneline --decorate

# Check deployed version
curl https://your-app.elasticbeanstalk.com/api/version
```

## 🛠️ Troubleshooting

### Common Issues

#### Git Not Clean
```bash
# Stash changes
git stash
./version.sh patch
git stash pop
```

#### Docker Build Fails
```bash
# Check Dockerfile
docker build -f Dockerfile.production -t test .

# Check build logs
docker build -f Dockerfile.production -t test . --no-cache
```

#### EB Deployment Fails
```bash
# Check EB status
eb status

# View logs
eb logs

# Check Dockerrun.aws.json
cat Dockerrun.aws.json
```

### Rollback
```bash
# Rollback to previous version
eb deploy --version previous-version-tag

# Or use specific Docker image
# Update Dockerrun.aws.json with previous image tag
```

## 📈 Best Practices

1. **Always test locally** before deploying
2. **Use semantic versioning** (patch/minor/major)
3. **Keep git clean** before deployment
4. **Monitor deployments** via EB console
5. **Tag releases** for easy rollback
6. **Use production Dockerfile** for deployments
7. **Clean up old images** regularly

This versioning system ensures reliable, traceable deployments with full rollback capability!
