# Magnolia Touch Backend EC2 Deployment Script (PowerShell)
# This script deploys the application to AWS EC2 instance

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("deploy", "build", "setup", "logs", "status", "help")]
    [string]$Action = "deploy",
    
    [Parameter(Mandatory=$false)]
    [string]$EC2Host = $env:EC2_HOST,
    
    [Parameter(Mandatory=$false)]
    [string]$EC2User = $env:EC2_USER,
    
    [Parameter(Mandatory=$false)]
    [string]$EC2KeyPath = $env:EC2_KEY_PATH,
    
    [Parameter(Mandatory=$false)]
    [string]$DockerTag = $env:DOCKER_TAG
)

# Default values
if (-not $EC2Host) { $EC2Host = "your-ec2-instance.amazonaws.com" }
if (-not $EC2User) { $EC2User = "ubuntu" }
if (-not $EC2KeyPath) { $EC2KeyPath = "~/.ssh/your-key.pem" }
if (-not $DockerTag) { $DockerTag = "latest" }

$DockerImageName = "magnolia-backend"
$RemotePath = "/home/ubuntu/magnolia-backend"

# Color functions
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Check prerequisites
function Test-Prerequisites {
    Write-Info "Checking prerequisites..."
    
    # Check if Docker is installed
    try {
        $null = docker --version
        Write-Success "Docker is installed"
    } catch {
        Write-Error "Docker is not installed. Please install Docker Desktop first."
        exit 1
    }
    
    # Check if .env file exists
    if (-not (Test-Path ".env")) {
        Write-Error ".env file not found. Please create one based on .env.production"
        exit 1
    }
    
    # Check if SSH key exists
    if (-not (Test-Path $EC2KeyPath)) {
        Write-Error "SSH key not found at $EC2KeyPath"
        Write-Error "Please update EC2_KEY_PATH or provide the correct path"
        exit 1
    }
    
    Write-Success "Prerequisites check completed"
}

# Build Docker image
function Build-DockerImage {
    Write-Info "Building Docker image: ${DockerImageName}:${DockerTag}"
    
    try {
        docker build -t "${DockerImageName}:${DockerTag}" .
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Docker image built successfully"
        } else {
            throw "Docker build failed"
        }
    } catch {
        Write-Error "Failed to build Docker image: $_"
        exit 1
    }
}

# Transfer Docker image
function Transfer-DockerImage {
    Write-Info "Saving Docker image to tar file..."
    
    $tarFile = "${DockerImageName}-${DockerTag}.tar"
    
    try {
        docker save -o $tarFile "${DockerImageName}:${DockerTag}"
        
        Write-Info "Transferring Docker image to EC2 instance..."
        
        # Use SCP to transfer (requires OpenSSH or similar)
        scp -i $EC2KeyPath -o StrictHostKeyChecking=no $tarFile "${EC2User}@${EC2Host}:${RemotePath}/"
        
        # Clean up local tar file
        Remove-Item $tarFile -Force
        
        Write-Success "Docker image transferred successfully"
    } catch {
        Write-Error "Failed to transfer Docker image: $_"
        if (Test-Path $tarFile) {
            Remove-Item $tarFile -Force
        }
        exit 1
    }
}

# Transfer deployment files
function Transfer-DeploymentFiles {
    Write-Info "Transferring deployment files..."
    
    try {
        # Create remote directories
        ssh -i $EC2KeyPath -o StrictHostKeyChecking=no "${EC2User}@${EC2Host}" "mkdir -p ${RemotePath}/docker/nginx ${RemotePath}/docker/mysql ${RemotePath}/prisma"
        
        # Transfer main files
        scp -i $EC2KeyPath -o StrictHostKeyChecking=no docker-compose.yml "${EC2User}@${EC2Host}:${RemotePath}/"
        scp -i $EC2KeyPath -o StrictHostKeyChecking=no .env "${EC2User}@${EC2Host}:${RemotePath}/"
        
        # Transfer Docker configuration files
        scp -i $EC2KeyPath -o StrictHostKeyChecking=no docker/nginx/nginx.conf "${EC2User}@${EC2Host}:${RemotePath}/docker/nginx/"
        scp -i $EC2KeyPath -o StrictHostKeyChecking=no docker/mysql/init.sql "${EC2User}@${EC2Host}:${RemotePath}/docker/mysql/"
        scp -i $EC2KeyPath -o StrictHostKeyChecking=no docker/mysql/my.cnf "${EC2User}@${EC2Host}:${RemotePath}/docker/mysql/"
        
        # Transfer Prisma schema
        scp -i $EC2KeyPath -o StrictHostKeyChecking=no prisma/schema.prisma "${EC2User}@${EC2Host}:${RemotePath}/prisma/"
        
        Write-Success "Deployment files transferred successfully"
    } catch {
        Write-Error "Failed to transfer deployment files: $_"
        exit 1
    }
}

# Setup EC2 instance
function Setup-EC2Instance {
    Write-Info "Setting up EC2 instance..."
    
    $setupScript = @"
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Docker if not already installed
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    sudo apt install -y apt-transport-https ca-certificates curl software-properties-common
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
    sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu `$(lsb_release -cs) stable"
    sudo apt update
    sudo apt install -y docker-ce
    sudo usermod -aG docker `${USER}
fi

# Install Docker Compose if not already installed
if ! command -v docker-compose &> /dev/null; then
    echo "Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-`$(uname -s)-`$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Install wget for health checks
sudo apt install -y wget

# Create necessary directories
sudo mkdir -p /var/log/nginx
sudo chown -R `$USER:`$USER /var/log/nginx
"@
    
    try {
        $setupScript | ssh -i $EC2KeyPath -o StrictHostKeyChecking=no "${EC2User}@${EC2Host}"
        Write-Success "EC2 instance setup completed"
    } catch {
        Write-Error "Failed to setup EC2 instance: $_"
        exit 1
    }
}

# Deploy application
function Deploy-Application {
    Write-Info "Deploying application on EC2 instance..."
    
    $deployScript = @"
cd ${RemotePath}

# Load the Docker image
echo "Loading Docker image..."
docker load -i ${DockerImageName}-${DockerTag}.tar

# Stop existing containers
echo "Stopping existing containers..."
docker-compose down || true

# Remove old images (optional)
docker image prune -f

# Start the application
echo "Starting application..."
docker-compose up -d

# Wait for services to be healthy
echo "Waiting for services to start..."
sleep 30

# Check if containers are running
docker-compose ps

# Run database migrations
echo "Running database migrations..."
docker-compose exec -T magnolia-backend npx prisma db push || true

# Clean up the image tar file
rm -f ${DockerImageName}-${DockerTag}.tar
"@
    
    try {
        $deployScript | ssh -i $EC2KeyPath -o StrictHostKeyChecking=no "${EC2User}@${EC2Host}"
        Write-Success "Application deployed successfully"
    } catch {
        Write-Error "Failed to deploy application: $_"
        exit 1
    }
}

# Verify deployment
function Test-Deployment {
    Write-Info "Verifying deployment..."
    
    Start-Sleep -Seconds 10
    
    try {
        $response = Invoke-WebRequest -Uri "http://${EC2Host}/health" -Method Get -TimeoutSec 30
        if ($response.StatusCode -eq 200) {
            Write-Success "Application is responding to health checks"
        } else {
            Write-Warning "Application health check returned status: $($response.StatusCode)"
        }
    } catch {
        Write-Warning "Application health check failed. Please check the logs manually."
    }
    
    Write-Info "Deployment verification completed"
}

# Show logs
function Show-Logs {
    Write-Info "Showing application logs..."
    
    try {
        ssh -i $EC2KeyPath -o StrictHostKeyChecking=no "${EC2User}@${EC2Host}" "cd ${RemotePath} && docker-compose logs --tail=50"
    } catch {
        Write-Error "Failed to retrieve logs: $_"
        exit 1
    }
}

# Show status
function Show-Status {
    Write-Info "Checking application status..."
    
    try {
        ssh -i $EC2KeyPath -o StrictHostKeyChecking=no "${EC2User}@${EC2Host}" "cd ${RemotePath} && docker-compose ps"
    } catch {
        Write-Error "Failed to check status: $_"
        exit 1
    }
}

# Show help
function Show-Help {
    Write-Host @"
Magnolia Touch Backend EC2 Deployment Script (PowerShell)

Usage: .\deploy-to-ec2.ps1 -Action <action> [options]

Actions:
  deploy      Full deployment (build, transfer, deploy)
  build       Build Docker image only
  setup       Setup EC2 instance only
  logs        Show application logs
  status      Check application status
  help        Show this help message

Parameters:
  -EC2Host       EC2 instance hostname or IP
  -EC2User       SSH user (default: ubuntu)
  -EC2KeyPath    Path to SSH private key
  -DockerTag     Docker image tag (default: latest)

Environment Variables:
  EC2_HOST       EC2 instance hostname or IP
  EC2_USER       SSH user (default: ubuntu)
  EC2_KEY_PATH   Path to SSH private key
  DOCKER_TAG     Docker image tag (default: latest)

Examples:
  .\deploy-to-ec2.ps1 -Action deploy -EC2Host "your-server.com" -EC2KeyPath "C:\path\to\key.pem"
  
  # Using environment variables
  `$env:EC2_HOST="your-server.com"
  `$env:EC2_KEY_PATH="C:\path\to\key.pem"
  .\deploy-to-ec2.ps1 -Action deploy
"@
}

# Main execution
switch ($Action) {
    "deploy" {
        Write-Info "Starting full deployment process..."
        Test-Prerequisites
        Build-DockerImage
        Transfer-DockerImage
        Transfer-DeploymentFiles
        Setup-EC2Instance
        Deploy-Application
        Test-Deployment
        Write-Success "Deployment completed successfully!"
        Write-Info "Your application should be available at: http://${EC2Host}"
    }
    "build" {
        Test-Prerequisites
        Build-DockerImage
    }
    "setup" {
        Test-Prerequisites
        Setup-EC2Instance
    }
    "logs" {
        Show-Logs
    }
    "status" {
        Show-Status
    }
    "help" {
        Show-Help
    }
    default {
        Write-Error "Unknown action: $Action"
        Show-Help
        exit 1
    }
}
