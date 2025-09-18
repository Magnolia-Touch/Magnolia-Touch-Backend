# Magnolia Touch Backend - EC2 Deployment Guide

This guide will walk you through deploying the Magnolia Touch Backend to an AWS EC2 instance using Docker.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [EC2 Instance Setup](#ec2-instance-setup)
3. [Local Setup](#local-setup)
4. [Deployment Process](#deployment-process)
5. [Post-Deployment Configuration](#post-deployment-configuration)
6. [Monitoring and Maintenance](#monitoring-and-maintenance)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

### Local Requirements

- Docker and Docker Compose installed
- AWS CLI configured (optional)
- SSH client
- Git

### AWS Requirements

- AWS EC2 instance (Ubuntu 20.04 LTS or later recommended)
- Security group configured for HTTP/HTTPS traffic
- Key pair for SSH access
- Elastic IP (recommended for production)

### Minimum EC2 Instance Specifications

- **Development/Testing**: t3.small (2 vCPU, 2 GB RAM)
- **Production**: t3.medium or larger (2+ vCPU, 4+ GB RAM)
- **Storage**: 20+ GB EBS volume

## EC2 Instance Setup

### 1. Launch EC2 Instance

1. **AMI**: Ubuntu Server 20.04 LTS (HVM)
2. **Instance Type**: t3.medium (recommended for production)
3. **Key Pair**: Create or select existing key pair
4. **Security Group**: Configure ports:
   - SSH (22): Your IP address
   - HTTP (80): 0.0.0.0/0
   - HTTPS (443): 0.0.0.0/0 (if using SSL)
   - Custom TCP (3000): 0.0.0.0/0 (for direct API access, optional)

### 2. Security Group Configuration

```yaml
# Example Security Group Rules
Inbound Rules:
- SSH (22): Your IP / 0.0.0.0/0
- HTTP (80): 0.0.0.0/0
- HTTPS (443): 0.0.0.0/0
- MySQL (3306): Security Group (for database access within VPC)

Outbound Rules:
- All traffic: 0.0.0.0/0
```

### 3. Elastic IP (Recommended)

1. Allocate an Elastic IP address
2. Associate it with your EC2 instance
3. Update your DNS records to point to this IP

## Local Setup

### 1. Clone and Configure Project

```bash
# Clone the repository (if not already done)
git clone <your-repo-url>
cd Magnolia-Touch-Backend

# Create production environment file
cp .env.production .env

# Edit .env with your production values
nano .env
```

### 2. Configure Environment Variables

Update `.env` with your production settings:

```bash
# Database
DATABASE_URL="mysql://magnolia:your_secure_password@mysql:3306/magnolia_db"
MYSQL_ROOT_PASSWORD=your_root_password
MYSQL_DATABASE=magnolia_db
MYSQL_USER=magnolia
MYSQL_PASSWORD=your_secure_password

# JWT
JWT_SECRET="your_very_secure_jwt_secret_key_at_least_32_characters_long"

# AWS
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-magnolia-s3-bucket

# Stripe
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### 3. Test Docker Build Locally

```bash
# Build the Docker image
docker build -t magnolia-backend:latest .

# Test the image locally
docker run -p 3000:3000 --env-file .env magnolia-backend:latest
```

## Deployment Process

### 1. Prepare Deployment Script

Make the deployment script executable:

```bash
chmod +x deploy/aws/deploy-to-ec2.sh
```

### 2. Set Environment Variables

```bash
export EC2_HOST="your-ec2-instance-public-ip-or-domain"
export EC2_USER="ubuntu"
export EC2_KEY_PATH="~/.ssh/your-ec2-key.pem"
export DOCKER_TAG="v1.0.0"  # or "latest"
```

### 3. Deploy Application

#### Full Deployment (First Time)

```bash
./deploy/aws/deploy-to-ec2.sh deploy
```

This will:
1. Build the Docker image
2. Transfer the image to EC2
3. Transfer configuration files
4. Set up the EC2 instance (install Docker, etc.)
5. Deploy and start the application
6. Run database migrations
7. Verify the deployment

#### Partial Deployments

```bash
# Build image only
./deploy/aws/deploy-to-ec2.sh build

# Setup EC2 instance only
./deploy/aws/deploy-to-ec2.sh setup

# View application logs
./deploy/aws/deploy-to-ec2.sh logs

# Check application status
./deploy/aws/deploy-to-ec2.sh status
```

## Post-Deployment Configuration

### 1. SSL/TLS Setup (Recommended)

#### Using Let's Encrypt (Free SSL)

```bash
# SSH into your EC2 instance
ssh -i ~/.ssh/your-key.pem ubuntu@your-ec2-host

# Install Certbot
sudo apt update
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal (already configured)
sudo systemctl status certbot.timer
```

#### Update Nginx Configuration

The Nginx configuration in `docker/nginx/nginx.conf` includes commented SSL settings. Uncomment and configure them after obtaining SSL certificates.

### 2. Domain Configuration

1. Point your domain to the EC2 instance's Elastic IP
2. Update environment variables with your actual domain
3. Restart the application

### 3. Database Seeding (Optional)

```bash
# SSH into EC2 instance
ssh -i ~/.ssh/your-key.pem ubuntu@your-ec2-host

# Navigate to project directory
cd /home/ubuntu/magnolia-backend

# Run database seeder
docker-compose exec magnolia-backend npm run seed
```

## Monitoring and Maintenance

### 1. Application Health

Check application health:
```bash
curl http://your-domain.com/health
```

### 2. View Logs

```bash
# From local machine
./deploy/aws/deploy-to-ec2.sh logs

# From EC2 instance
docker-compose logs -f magnolia-backend
docker-compose logs -f mysql
docker-compose logs -f nginx
```

### 3. Database Backup

```bash
# Create backup
docker-compose exec mysql mysqldump -u root -p${MYSQL_ROOT_PASSWORD} magnolia_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
docker-compose exec -T mysql mysql -u root -p${MYSQL_ROOT_PASSWORD} magnolia_db < backup_file.sql
```

### 4. Update Application

```bash
# Build new version
export DOCKER_TAG="v1.1.0"
./deploy/aws/deploy-to-ec2.sh build

# Deploy update
./deploy/aws/deploy-to-ec2.sh deploy
```

### 5. System Updates

```bash
# SSH into EC2 instance
ssh -i ~/.ssh/your-key.pem ubuntu@your-ec2-host

# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Docker images
docker-compose pull
docker-compose up -d
```

## Monitoring Setup

### 1. CloudWatch Logs (Optional)

Install CloudWatch agent for log monitoring:

```bash
# Install CloudWatch agent
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i -E amazon-cloudwatch-agent.deb

# Configure CloudWatch agent (requires IAM role)
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-config-wizard
```

### 2. Application Monitoring

Consider implementing:
- Application Performance Monitoring (APM)
- Error tracking (e.g., Sentry)
- Uptime monitoring (e.g., UptimeRobot)

## Security Best Practices

### 1. EC2 Security

- Keep the system updated
- Use non-root user
- Configure proper security groups
- Enable VPC flow logs
- Use Systems Manager for secure access

### 2. Application Security

- Use environment variables for secrets
- Enable HTTPS only
- Implement rate limiting (already configured in Nginx)
- Regular security audits

### 3. Database Security

- Use strong passwords
- Enable connection encryption
- Regular backups
- Access logging

## Troubleshooting

### Common Issues

#### 1. Application Won't Start

```bash
# Check container status
docker-compose ps

# Check logs
docker-compose logs magnolia-backend

# Common fixes
docker-compose down
docker-compose up -d
```

#### 2. Database Connection Issues

```bash
# Check MySQL container
docker-compose logs mysql

# Test connection
docker-compose exec magnolia-backend npx prisma db push
```

#### 3. File Upload Issues

```bash
# Check S3 credentials
aws s3 ls s3://your-bucket-name

# Check file permissions
ls -la uploads/
```

#### 4. SSL Certificate Issues

```bash
# Check certificate status
sudo certbot certificates

# Renew certificate
sudo certbot renew --dry-run
```

### Performance Issues

#### 1. High CPU Usage

- Increase instance size
- Optimize database queries
- Check for memory leaks

#### 2. High Memory Usage

- Monitor Docker container memory
- Optimize image sizes
- Add swap space if needed

#### 3. Slow Response Times

- Check network latency
- Optimize database indexes
- Enable caching (Redis)

## Backup and Disaster Recovery

### 1. Automated Backups

Create a backup script:

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/ubuntu/backups"

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
docker-compose exec -T mysql mysqldump -u root -p${MYSQL_ROOT_PASSWORD} magnolia_db > $BACKUP_DIR/db_backup_$DATE.sql

# Upload to S3 (optional)
aws s3 cp $BACKUP_DIR/db_backup_$DATE.sql s3://your-backup-bucket/

# Clean old backups (keep last 7 days)
find $BACKUP_DIR -name "db_backup_*.sql" -mtime +7 -delete
```

Add to crontab:
```bash
# Run daily at 2 AM
0 2 * * * /home/ubuntu/backup.sh
```

### 2. Disaster Recovery

1. **AMI Snapshots**: Create regular AMI snapshots of your EC2 instance
2. **Data Backup**: Regular database backups to S3
3. **Infrastructure as Code**: Keep deployment scripts in version control
4. **Recovery Testing**: Regularly test your recovery procedures

## Cost Optimization

1. **Right-sizing**: Monitor instance usage and resize as needed
2. **Reserved Instances**: Use Reserved Instances for predictable workloads
3. **Spot Instances**: Consider Spot Instances for development environments
4. **Resource Cleanup**: Regularly clean up unused resources

## Support and Maintenance

### Regular Tasks

- [ ] Weekly security updates
- [ ] Monthly performance reviews
- [ ] Quarterly disaster recovery testing
- [ ] Backup verification
- [ ] SSL certificate renewal monitoring
- [ ] Log rotation and cleanup

### Contact Information

- **Emergency Contact**: [Your emergency contact]
- **AWS Support**: [Your AWS support plan details]
- **Application Support**: [Your support team contact]

---

## Quick Commands Reference

```bash
# Deploy application
./deploy/aws/deploy-to-ec2.sh deploy

# Check status
./deploy/aws/deploy-to-ec2.sh status

# View logs
./deploy/aws/deploy-to-ec2.sh logs

# SSH to instance
ssh -i ~/.ssh/your-key.pem ubuntu@your-ec2-host

# Restart application
docker-compose restart magnolia-backend

# Database migration
docker-compose exec magnolia-backend npx prisma db push

# Backup database
docker-compose exec mysql mysqldump -u root -p${MYSQL_ROOT_PASSWORD} magnolia_db > backup.sql
```
