# Cloudflare Setup Guide for sudoku.strongin.qa

## Step-by-Step Visual Guide

### 1. Deploy to AWS First
```bash
# Choose one:
eb create sudoku-production --single-instance  # Elastic Beanstalk
# OR follow EC2 deployment steps
```

### 2. Get AWS Endpoint
```bash
eb status
# Look for: CNAME: sudoku-production.us-east-1.elasticbeanstalk.com
```

### 3. Cloudflare DNS Configuration

**In Cloudflare Dashboard:**

1. Go to **strongin.qa** domain
2. Click **DNS** tab
3. Click **Add record**
4. Fill in:
   ```
   Type: CNAME
   Name: sudoku
   Target: sudoku-production.us-east-1.elasticbeanstalk.com
   Proxy status: ☁️ Proxied (Orange cloud - ENABLED)
   TTL: Auto
   ```
5. Click **Save**

### 4. SSL Configuration

**In Cloudflare Dashboard:**

1. Go to **SSL/TLS** tab
2. Click **Overview**
3. Set encryption mode to **"Flexible"**
4. Enable **"Always Use HTTPS"**

### 5. Test Your Setup

Wait 5-10 minutes, then test:

```bash
# Test HTTP (should redirect to HTTPS)
curl -I http://sudoku.strongin.qa

# Test HTTPS (should work)
curl -I https://sudoku.strongin.qa

# Check Cloudflare headers
curl -I https://sudoku.strongin.qa | grep -i cf-ray
```

## What You Get

✅ **URL**: https://sudoku.strongin.qa  
✅ **Free SSL**: Automatic HTTPS  
✅ **Global CDN**: Fast loading worldwide  
✅ **DDoS Protection**: Enterprise security  
✅ **Analytics**: Traffic insights in Cloudflare  

## Expected Results

**Success indicators:**
- `dig sudoku.strongin.qa` returns Cloudflare IPs
- `curl -I https://sudoku.strongin.qa` returns 200 OK
- Browser shows secure lock icon
- Game loads and works normally

**Troubleshooting:**
- If DNS doesn't resolve: Wait up to 24 hours
- If SSL errors: Use "Flexible" mode in Cloudflare
- If 502 errors: Check AWS instance is running

## Total Cost: $0 🎉

Both AWS (free tier) and Cloudflare (free plan) cost nothing for the first year!