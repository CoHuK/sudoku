# Sudoku Game Deployment Guide

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```

3. Open browser and navigate to `http://localhost:3000`

## Docker Deployment

### Build and run with Docker:
```bash
docker build -t sudoku-game .
docker run -d -p 3000:3000 --name sudoku-container sudoku-game
```

### Using Docker Compose:
```bash
docker-compose up -d
```

## AWS Deployment Options

### Option 1: AWS Elastic Beanstalk (Recommended - Free Tier Eligible)

**Prerequisites:**
```bash
# Install AWS CLI
brew install awscli

# Install EB CLI
pip install awsebcli

# Configure AWS credentials
aws configure
```

**Deployment Steps:**
```bash
# 1. Initialize Elastic Beanstalk application
eb init

# Follow prompts:
# - Select region (e.g., us-east-1)
# - Create new application: sudoku-game
# - Platform: Docker
# - Use CodeCommit: No
# - Setup SSH: Yes (optional)

# 2. Create environment (single instance to avoid load balancer costs)
eb create sudoku-production --single-instance

# 3. Deploy updates
eb deploy

# 4. Open application
eb open

# 5. Check status
eb status

# 6. View logs
eb logs
```

**Environment Configuration:**
```bash
# Set environment variables if needed
eb setenv NODE_ENV=production PORT=3000

# Scale (if needed later)
eb scale 1
```

**Cost Estimate:** 
- Single t2.micro instance: **FREE** (first 12 months)
- No load balancer charges with `--single-instance`
- Minimal data transfer costs

### Option 2: Direct EC2 Deployment (Full Control)

**Prerequisites:**
```bash
# Install AWS CLI and configure
aws configure
```

**Step 1: Launch EC2 Instance**
```bash
# Create security group
aws ec2 create-security-group \
    --group-name sudoku-sg \
    --description "Security group for Sudoku app"

# Get security group ID
SG_ID=$(aws ec2 describe-security-groups \
    --group-names sudoku-sg \
    --query 'SecurityGroups[0].GroupId' \
    --output text)

# Allow HTTP traffic
aws ec2 authorize-security-group-ingress \
    --group-id $SG_ID \
    --protocol tcp \
    --port 80 \
    --cidr 0.0.0.0/0

# Allow SSH traffic
aws ec2 authorize-security-group-ingress \
    --group-id $SG_ID \
    --protocol tcp \
    --port 22 \
    --cidr 0.0.0.0/0

# Launch instance (replace key-name with your key pair)
aws ec2 run-instances \
    --image-id ami-0c55b159cbfafe1d0 \
    --count 1 \
    --instance-type t2.micro \
    --key-name your-key-pair-name \
    --security-group-ids $SG_ID \
    --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=sudoku-server}]'
```

**Step 2: Setup Server**
```bash
# Get instance public IP
INSTANCE_IP=$(aws ec2 describe-instances \
    --filters "Name=tag:Name,Values=sudoku-server" "Name=instance-state-name,Values=running" \
    --query 'Reservations[0].Instances[0].PublicIpAddress' \
    --output text)

# SSH into instance
ssh -i your-key-pair.pem ec2-user@$INSTANCE_IP

# On the EC2 instance:
# Update system
sudo yum update -y

# Install Docker
sudo yum install -y docker
sudo service docker start
sudo usermod -a -G docker ec2-user

# Install Node.js (alternative to Docker)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install node
nvm use node

# Install Git
sudo yum install -y git
```

**Step 3: Deploy Application**

**Option A: Using Docker**
```bash
# Clone your repository
git clone https://github.com/yourusername/sudoku-game.git
cd sudoku-game

# Build and run Docker container
docker build -t sudoku-game .
docker run -d -p 80:3000 --name sudoku-app --restart unless-stopped sudoku-game
```

**Option B: Direct Node.js**
```bash
# Clone repository
git clone https://github.com/yourusername/sudoku-game.git
cd sudoku-game

# Install dependencies
npm install --production

# Install PM2 for process management
npm install -g pm2

# Start application
PORT=80 pm2 start backend/server.js --name sudoku-app

# Save PM2 configuration
pm2 startup
pm2 save
```

**Step 4: Configure Domain (Optional)**
```bash
# Get Elastic IP for static IP address
aws ec2 allocate-address --domain vpc

# Associate with instance
aws ec2 associate-address \
    --instance-id i-1234567890abcdef0 \
    --allocation-id eipalloc-12345678
```

**Maintenance Commands:**
```bash
# View application logs
docker logs sudoku-app
# or
pm2 logs sudoku-app

# Update application
git pull
docker build -t sudoku-game .
docker stop sudoku-app
docker rm sudoku-app
docker run -d -p 80:3000 --name sudoku-app --restart unless-stopped sudoku-game

# Monitor resources
top
df -h
docker stats
```

### Cost Comparison

| Option | Monthly Cost (after free tier) | Setup Complexity | Maintenance |
|--------|--------------------------------|------------------|-------------|
| **Elastic Beanstalk** | ~$10-15 | Low | Low |
| **Direct EC2** | ~$10-15 | Medium | Medium |

### Monitoring and Troubleshooting

**For Elastic Beanstalk:**
```bash
# Check health
eb health

# View logs
eb logs --all

# SSH to instance
eb ssh

# Configuration
eb config
```

**For Direct EC2:**
```bash
# Check application status
curl http://your-instance-ip

# Monitor system resources
htop
df -h

# Check Docker containers
docker ps
docker logs sudoku-app

# PM2 monitoring
pm2 monit
pm2 status
```

## Environment Variables
- `PORT`: Server port (default: 3000, use 80 for production)
- `NODE_ENV`: Environment (development/production)

## Custom Domain Setup with Cloudflare

### 🏆 Option 1: Subdomain (Recommended) - `sudoku.strongin.qa`

**Why this is better:**
- Easier setup (one DNS record)
- No code changes needed
- Independent from your main site
- Better performance
- Automatic SSL with Cloudflare

**Setup Steps:**

1. **Deploy to AWS first** (complete EB or EC2 deployment)

2. **Get your AWS endpoint:**
   ```bash
   # For Elastic Beanstalk
   eb status | grep "CNAME"
   # Example output: your-app-name.region.elasticbeanstalk.com
   
   # For EC2
   aws ec2 describe-instances --filters "Name=tag:Name,Values=sudoku-server" \
       --query 'Reservations[0].Instances[0].PublicDnsName' --output text
   ```

3. **Configure Cloudflare DNS:**
   - Go to Cloudflare dashboard → strongin.qa domain
   - Click "DNS" tab
   - Add new record:
     - **Type**: CNAME
     - **Name**: sudoku
     - **Target**: your-eb-app.region.elasticbeanstalk.com (without http://)
     - **Proxy status**: ☁️ Proxied (recommended for SSL + CDN)
     - **TTL**: Auto

4. **Set environment variable:**
   ```bash
   # For Elastic Beanstalk (remove base path)
   eb setenv BASE_PATH=""
   
   # For EC2
   export BASE_PATH=""
   ```

5. **Test your deployment:**
   ```bash
   # Wait 5-10 minutes for DNS propagation, then test:
   curl -I https://sudoku.strongin.qa
   ```

**Result:** Your game will be available at `https://sudoku.strongin.qa` with free SSL! 🎉

---

### Option 2: Path-based - `strongin.qa/sudoku`

**Setup Steps:**

1. **Keep current code** (BASE_PATH=/sudoku is already configured)

2. **Deploy to AWS** (complete EB or EC2 deployment)

3. **Configure Cloudflare Page Rules:**
   - Go to Cloudflare dashboard → strongin.qa domain
   - Click "Rules" → "Page Rules"
   - Create new rule:
     - **URL pattern**: `strongin.qa/sudoku*`
     - **Setting**: Forwarding URL (301 redirect)
     - **Destination**: `https://your-eb-app.region.elasticbeanstalk.com$1`

4. **Alternative: Cloudflare Workers (More advanced):**
   ```javascript
   // Cloudflare Worker script
   addEventListener('fetch', event => {
     event.respondWith(handleRequest(event.request))
   })

   async function handleRequest(request) {
     const url = new URL(request.url)
     
     if (url.pathname.startsWith('/sudoku')) {
       // Proxy to AWS
       const awsUrl = 'https://your-eb-app.region.elasticbeanstalk.com' + url.pathname
       return fetch(awsUrl, request)
     }
     
     // Handle other routes normally
     return fetch(request)
   }
   ```

**This option is more complex and less recommended.**

---

## Cloudflare Benefits (Free Plan)

✅ **Free SSL Certificate** - Automatic HTTPS
✅ **Global CDN** - Faster loading worldwide  
✅ **DDoS Protection** - Enterprise-level security
✅ **Analytics** - Traffic and performance insights
✅ **Caching** - Reduced server load
✅ **Always Online** - Backup if your server goes down

## DNS Configuration Details

### For `sudoku.strongin.qa` (Recommended):
```
Type: CNAME
Name: sudoku
Target: your-eb-app.us-east-1.elasticbeanstalk.com
Proxy: ☁️ Proxied (Orange Cloud)
```

### Cloudflare SSL Settings:
- Go to SSL/TLS → Overview
- Set to "Flexible" or "Full" 
- "Full (strict)" if you add SSL to your AWS instance

## Testing & Verification

```bash
# Check DNS propagation
dig sudoku.strongin.qa

# Test SSL
curl -I https://sudoku.strongin.qa

# Check Cloudflare is working (should see CF-RAY header)
curl -I https://sudoku.strongin.qa | grep -i cf-ray
```

## Cost Comparison with Cloudflare

| Setup | AWS Cost | Cloudflare Cost | Total |
|-------|----------|-----------------|-------|
| **subdomain** | Free (t2.micro) | Free | **$0** |
| **path-based** | Free (t2.micro) | Free | **$0** |

Both options are completely free for the first year! 🎉

## Troubleshooting

**If subdomain doesn't work:**
1. Check DNS propagation: `dig sudoku.strongin.qa`
2. Verify CNAME points to correct AWS endpoint
3. Ensure Cloudflare proxy is enabled (orange cloud)
4. Wait up to 24 hours for full propagation

**If you see SSL errors:**
1. In Cloudflare, go to SSL/TLS → Overview
2. Set to "Flexible" mode initially
3. Once working, upgrade to "Full" for better security

## Security Notes
- Both options include security groups restricting access to necessary ports only
- Consider adding SSL/TLS certificate for production use
- Regular security updates recommended
- Use IAM roles instead of access keys when possible