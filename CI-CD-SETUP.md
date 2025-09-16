# CI/CD Setup Guide

This guide explains how to set up the complete CI/CD pipeline for the Magnolia Touch Backend API.

## 🏗️ Architecture Overview

The CI/CD pipeline includes:
- **Continuous Integration**: Automated testing, building, and security scanning
- **Continuous Deployment**: Automated deployment to staging and production
- **Multi-platform Support**: Docker containers for Linux AMD64 and ARM64
- **Security**: Vulnerability scanning with Trivy
- **Monitoring**: Health checks and deployment verification

## 📋 Prerequisites

### 1. GitHub Repository Setup
- Enable GitHub Actions in your repository
- Set up GitHub Packages for container registry
- Configure branch protection rules for `main` and `develop`

### 2. Environment Setup
Configure the following environments in GitHub:
- `staging` (auto-deploys from `develop` branch)
- `production` (auto-deploys from `main` branch with manual approval)

## 🔐 Required Secrets

Configure these secrets in your GitHub repository:

### GitHub Secrets (Repository level)
```bash
# Container Registry
GITHUB_TOKEN (automatically provided)

# Database
DATABASE_URL=mysql://user:pass@host:port/database

# Authentication
JWT_SECRET=your-super-secret-jwt-key

# Stripe
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# AWS (if using AWS deployment)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key

# Kubernetes (if using K8s deployment)
KUBE_CONFIG=base64_encoded_kubeconfig

# Notifications
SLACK_WEBHOOK_URL=https://hooks.slack.com/your/webhook/url
```

### Environment-specific Secrets
Configure these for each environment (`staging`, `production`):

#### Staging Environment
- `DATABASE_URL` - Staging database connection
- `JWT_SECRET` - Staging JWT secret
- `STRIPE_SECRET_KEY` - Stripe test key
- `STRIPE_WEBHOOK_SECRET` - Staging webhook secret

#### Production Environment  
- `DATABASE_URL` - Production database connection
- `JWT_SECRET` - Production JWT secret
- `STRIPE_SECRET_KEY` - Stripe live key
- `STRIPE_WEBHOOK_SECRET` - Production webhook secret

## 🚀 Deployment Options

### Option 1: Docker with Container Registry

The default setup uses GitHub Container Registry (ghcr.io):

1. **Automatic**: Triggered on push to `main` or `develop`
2. **Manual**: Use repository dispatch or workflow_dispatch

```yaml
# Workflow automatically runs on:
on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]
```

### Option 2: AWS ECS Deployment

To enable AWS ECS deployment:

1. Create ECS cluster, service, and task definition
2. Configure the workflow to use the AWS deployment:

```yaml
# In your main workflow, replace the deploy jobs with:
deploy-staging:
  uses: ./.github/workflows/deploy-aws.yml
  with:
    environment: staging
    image_tag: ghcr.io/${{ github.repository }}:${{ github.sha }}
  secrets:
    AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
    AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
    JWT_SECRET: ${{ secrets.JWT_SECRET }}
    STRIPE_SECRET_KEY: ${{ secrets.STRIPE_SECRET_KEY }}
    STRIPE_WEBHOOK_SECRET: ${{ secrets.STRIPE_WEBHOOK_SECRET }}
```

### Option 3: Kubernetes Deployment

To enable Kubernetes deployment:

1. Apply the Kubernetes manifests: `kubectl apply -f k8s/`
2. Update the workflow to use the Kubernetes deployment:

```yaml
deploy-staging:
  uses: ./.github/workflows/deploy-k8s.yml
  with:
    environment: staging
    image_tag: ghcr.io/${{ github.repository }}:${{ github.sha }}
    namespace: staging
  secrets:
    KUBE_CONFIG: ${{ secrets.KUBE_CONFIG }}
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
    JWT_SECRET: ${{ secrets.JWT_SECRET }}
    STRIPE_SECRET_KEY: ${{ secrets.STRIPE_SECRET_KEY }}
    STRIPE_WEBHOOK_SECRET: ${{ secrets.STRIPE_WEBHOOK_SECRET }}
```

## 🔄 Workflow Process

### Pull Request Flow
1. Developer creates PR to `develop` or `main`
2. **Testing**: Runs unit tests, integration tests, and build
3. **Security**: Scans for vulnerabilities
4. **Review**: Manual code review required
5. **Merge**: After approval and tests pass

### Deployment Flow

#### Develop Branch (Staging)
1. Push to `develop` branch
2. **CI Pipeline**: Tests → Build → Security Scan
3. **Deploy**: Automatic deployment to staging environment
4. **Verification**: Health checks and smoke tests

#### Main Branch (Production)
1. Push to `main` branch (usually via PR from `develop`)
2. **CI Pipeline**: Tests → Build → Security Scan
3. **Deploy**: Manual approval required for production
4. **Verification**: Comprehensive smoke tests
5. **Notifications**: Slack notifications on success/failure

## 🔍 Monitoring & Health Checks

### Health Endpoints
- `GET /health` - Overall application health
- `GET /health/ready` - Readiness probe
- `GET /health/live` - Liveness probe

### Monitoring Features
- Database connectivity checks
- Memory usage monitoring
- Response time tracking
- Uptime reporting

## 🛠️ Local Development with Docker

### Build and Run Locally
```bash
# Build the Docker image
docker build -t magnolia-backend .

# Run with Docker Compose
docker-compose up -d

# Run tests
docker-compose exec app npm test

# View logs
docker-compose logs -f app
```

### Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit with your local values
nano .env

# Run database migrations
docker-compose exec app npx prisma db push
```

## 📊 Performance & Scaling

### Container Resources
```yaml
resources:
  requests:
    memory: "256Mi"
    cpu: "250m"
  limits:
    memory: "512Mi"
    cpu: "500m"
```

### Auto-scaling (Kubernetes)
- **Min replicas**: 2
- **Max replicas**: 10
- **CPU threshold**: 70%
- **Memory threshold**: 80%

## 🔒 Security Features

### Container Security
- Multi-stage Docker builds
- Non-root user execution
- Minimal base images (Alpine Linux)
- Regular security scanning with Trivy

### Application Security
- Environment variable injection
- Secret management
- JWT token validation
- Input validation and sanitization

## 🐛 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Check Docker build logs
docker build --no-cache -t magnolia-backend .

# Verify dependencies
npm ci --legacy-peer-deps
```

#### Database Connection Issues
```bash
# Test database connectivity
docker-compose exec app npx prisma db push --preview-feature

# Check connection string
echo $DATABASE_URL
```

#### Deployment Failures
```bash
# Check GitHub Actions logs
# Verify environment variables are set
# Confirm secrets are configured correctly
```

## 📈 Metrics & Observability

### Application Metrics
- Request/response times
- Error rates
- Database query performance
- Memory and CPU usage

### Deployment Metrics
- Build times
- Test coverage
- Security scan results
- Deployment frequency

## 🔄 Rollback Strategy

### Automated Rollback Triggers
- Health check failures
- High error rates
- Memory/CPU threshold exceeded

### Manual Rollback
```bash
# Kubernetes
kubectl rollout undo deployment/magnolia-app

# Docker
docker-compose down
docker-compose up -d --scale app=0
docker-compose up -d
```

## 📞 Support

For issues with CI/CD pipeline:
1. Check GitHub Actions logs
2. Verify environment variables and secrets
3. Test locally with Docker
4. Review deployment logs in your target environment

---

**Note**: Remember to customize the deployment scripts based on your specific infrastructure and requirements.
