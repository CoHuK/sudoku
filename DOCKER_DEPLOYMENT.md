# Docker Deployment Guide

## Overview

The Docker setup now includes optimized production builds that automatically minify and optimize all assets for better performance.

## Docker Files

### 1. `Dockerfile` (Standard)
- Single-stage build
- Good for development and simple deployments
- Includes build process and optimization

### 2. `Dockerfile.production` (Recommended)
- Multi-stage build for smaller final image
- Security hardening with non-root user
- Optimized for production deployment

## Quick Start

### Using Standard Dockerfile
```bash
# Build and run
docker build -t sudoku-game .
docker run -p 80:80 sudoku-game

# Or with docker-compose
docker-compose up --build
```

### Using Production Dockerfile
```bash
# Build production image
docker build -f Dockerfile.production -t sudoku-game:production .

# Run production container
docker run -p 80:80 sudoku-game:production

# Or with docker-compose (uses production Dockerfile by default)
docker-compose up --build
```

## What Happens During Build

### 1. **Dependency Installation**
```dockerfile
# Install all dependencies (including dev dependencies for build)
RUN npm ci --only=production=false
```

### 2. **Build Process**
```dockerfile
# Build optimized production files
RUN npm run build
```
This generates:
- `script.min.js` (minified JavaScript)
- `style.min.css` (minified CSS)
- `index.optimized.html` (optimized HTML)

### 3. **Asset Replacement**
```dockerfile
# Replace source files with optimized versions
RUN cp frontend/index.optimized.html frontend/index.html && \
    cp frontend/script.min.js frontend/script.js && \
    cp frontend/style.min.css frontend/style.css
```

### 4. **Cleanup**
```dockerfile
# Clean up build artifacts
RUN rm -f frontend/index.optimized.html frontend/script.min.js frontend/style.min.css frontend/critical.css
```

## Performance Benefits in Docker

### ✅ **Optimized Assets**
- **JavaScript**: 4.2 KiB → 1.2 KiB (70% reduction)
- **CSS**: 2.3 KiB → 1.1 KiB (52% reduction)
- **HTML**: Optimized with inlined critical CSS

### ✅ **Server Optimizations**
- **Compression**: Gzip compression enabled
- **Caching**: 1-year cache for static files
- **Algorithm**: Optimized puzzle generation

### ✅ **Docker Optimizations**
- **Multi-stage build**: Smaller final image
- **Security**: Non-root user
- **Health checks**: Container health monitoring
- **Layer caching**: Faster rebuilds

## File Structure in Container

```
/app/
├── backend/
│   └── server.js          # Optimized server with compression
├── frontend/
│   ├── index.html         # Optimized HTML (replaced)
│   ├── script.js          # Minified JavaScript (replaced)
│   ├── style.css          # Minified CSS (replaced)
│   └── critical.css       # Removed (not needed)
├── package.json
└── node_modules/          # Production dependencies only
```

## Environment Variables

```bash
# Required
PORT=80                    # Server port
NODE_ENV=production        # Environment mode

# Optional
BASE_PATH=/sudoku          # Base path for subdirectory deployment
```

## Health Checks

The production setup includes health checks:

```yaml
healthcheck:
  test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:80/api/new-game"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

## Deployment Commands

### Local Development
```bash
# Run with readable files
npm start

# Build and test optimized files
npm run build
npm start
```

### Docker Development
```bash
# Build and run
docker-compose up --build

# Run in background
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Production Deployment
```bash
# Build production image
docker build -f Dockerfile.production -t sudoku-game:latest .

# Run production container
docker run -d \
  --name sudoku-game \
  -p 80:80 \
  -e NODE_ENV=production \
  sudoku-game:latest

# Check container health
docker ps
docker logs sudoku-game
```

## Image Sizes

| Dockerfile | Size | Use Case |
|------------|------|----------|
| `Dockerfile` | ~150MB | Development, simple deployments |
| `Dockerfile.production` | ~120MB | Production, optimized deployments |

## Troubleshooting

### White Page Issue
- Ensure the build process completed successfully
- Check that optimized files were generated
- Verify the server is running on the correct port

### Performance Issues
- Use `Dockerfile.production` for better performance
- Ensure compression is enabled (it is by default)
- Check that static file caching is working

### Build Failures
- Ensure all source files are present
- Check that `npm run build` works locally first
- Verify Docker has enough memory allocated

## Monitoring

```bash
# Check container status
docker ps

# View container logs
docker logs sudoku-game

# Check resource usage
docker stats sudoku-game

# Test API endpoint
curl http://localhost:80/api/new-game
```

This Docker setup ensures your Sudoku game runs with optimal performance in any containerized environment!
