#!/bin/bash

# Magnolia Touch Backend EC2 Deployment Script
# This script deploys the application to AWS EC2 instance

set -e  # Exit on any error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration - Update these values
EC2_HOST="${EC2_HOST:-your-ec2-instance.amazonaws.com}"
EC2_USER="${EC2_USER:-ubuntu}"
EC2_KEY_PATH="${EC2_KEY_PATH:-~/.ssh/your-key.pem}"
DOCKER_IMAGE_NAME="${DOCKER_IMAGE_NAME:-magnolia-backend}"
DOCKER_TAG="${DOCKER_TAG:-latest}"
REMOTE_PATH="${REMOTE_PATH:-/home/ubuntu/magnolia-backend}"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check if AWS CLI is installed
    if ! command -v aws &> /dev/null; then
        print_warning "AWS CLI is not installed. Some features may not work."
    fi
    
    # Check if SSH key exists
    if [ ! -f "$EC2_KEY_PATH" ]; then
        print_error "SSH key not found at $EC2_KEY_PATH"
        print_error "Please update EC2_KEY_PATH or provide the correct path"
        exit 1
    fi
    
    # Check if .env file exists
    if [ ! -f ".env" ]; then
        print_error ".env file not found. Please create one based on .env.example"
        exit 1
    fi
    
    print_success "Prerequisites check completed"
}

# Function to build Docker image
build_docker_image() {
    print_status "Building Docker image: $DOCKER_IMAGE_NAME:$DOCKER_TAG"
    
    docker build -t $DOCKER_IMAGE_NAME:$DOCKER_TAG .
    
    if [ $? -eq 0 ]; then
        print_success "Docker image built successfully"
    else
        print_error "Failed to build Docker image"
        exit 1
    fi
}

# Function to save and transfer Docker image
transfer_docker_image() {
    print_status "Saving Docker image to tar file..."
    
    docker save -o ${DOCKER_IMAGE_NAME}-${DOCKER_TAG}.tar $DOCKER_IMAGE_NAME:$DOCKER_TAG
    
    print_status "Transferring Docker image to EC2 instance..."
    
    scp -i "$EC2_KEY_PATH" -o StrictHostKeyChecking=no \
        ${DOCKER_IMAGE_NAME}-${DOCKER_TAG}.tar \
        ${EC2_USER}@${EC2_HOST}:${REMOTE_PATH}/
    
    # Clean up local tar file
    rm ${DOCKER_IMAGE_NAME}-${DOCKER_TAG}.tar
    
    print_success "Docker image transferred successfully"
}

# Function to transfer deployment files
transfer_deployment_files() {
    print_status "Transferring deployment files..."
    
    # Create remote directory
    ssh -i "$EC2_KEY_PATH" -o StrictHostKeyChecking=no \
        ${EC2_USER}@${EC2_HOST} \
        "mkdir -p ${REMOTE_PATH}/docker/nginx ${REMOTE_PATH}/docker/mysql ${REMOTE_PATH}/prisma"
    
    # Transfer docker-compose and other necessary files
    scp -i "$EC2_KEY_PATH" -o StrictHostKeyChecking=no \
        docker-compose.yml \
        .env \
        ${EC2_USER}@${EC2_HOST}:${REMOTE_PATH}/
    
        # Transfer docker configuration files
        scp -i "$EC2_KEY_PATH" -o StrictHostKeyChecking=no \
            docker/nginx/nginx.conf \
            ${EC2_USER}@${EC2_HOST}:${REMOTE_PATH}/docker/nginx/
        
        scp -i "$EC2_KEY_PATH" -o StrictHostKeyChecking=no \
            docker/mysql/init.sql \
            docker/mysql/my.cnf \
            ${EC2_USER}@${EC2_HOST}:${REMOTE_PATH}/docker/mysql/
    
    # Transfer Prisma schema for migrations
    scp -i "$EC2_KEY_PATH" -o StrictHostKeyChecking=no \
        prisma/schema.prisma \
        ${EC2_USER}@${EC2_HOST}:${REMOTE_PATH}/prisma/
    
    print_success "Deployment files transferred successfully"
}

# Function to setup EC2 instance
setup_ec2_instance() {
    print_status "Setting up EC2 instance..."
    
    ssh -i "$EC2_KEY_PATH" -o StrictHostKeyChecking=no \
        ${EC2_USER}@${EC2_HOST} << 'ENDSSH'
        
        # Update system packages
        sudo apt update && sudo apt upgrade -y
        
        # Install Docker if not already installed
        if ! command -v docker &> /dev/null; then
            echo "Installing Docker..."
            sudo apt install -y apt-transport-https ca-certificates curl software-properties-common
            curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
            sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
            sudo apt update
            sudo apt install -y docker-ce
            sudo usermod -aG docker ${USER}
        fi
        
        # Install Docker Compose if not already installed
        if ! command -v docker-compose &> /dev/null; then
            echo "Installing Docker Compose..."
            sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
            sudo chmod +x /usr/local/bin/docker-compose
        fi
        
        # Install wget for health checks
        sudo apt install -y wget
        
        # Create necessary directories
        sudo mkdir -p /var/log/nginx
        sudo chown -R $USER:$USER /var/log/nginx
        
ENDSSH
    
    print_success "EC2 instance setup completed"
}

# Function to deploy application
deploy_application() {
    print_status "Deploying application on EC2 instance..."
    
    ssh -i "$EC2_KEY_PATH" -o StrictHostKeyChecking=no \
        ${EC2_USER}@${EC2_HOST} << ENDSSH
        
        cd ${REMOTE_PATH}
        
        # Load the Docker image
        echo "Loading Docker image..."
        docker load -i ${DOCKER_IMAGE_NAME}-${DOCKER_TAG}.tar
        
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
        rm -f ${DOCKER_IMAGE_NAME}-${DOCKER_TAG}.tar
        
ENDSSH
    
    print_success "Application deployed successfully"
}

# Function to verify deployment
verify_deployment() {
    print_status "Verifying deployment..."
    
    # Check if the application is responding
    sleep 10
    
    if curl -f -s "http://${EC2_HOST}/health" > /dev/null; then
        print_success "Application is responding to health checks"
    else
        print_warning "Application health check failed. Please check the logs."
    fi
    
    print_status "Deployment verification completed"
}

# Function to show logs
show_logs() {
    print_status "Showing application logs..."
    
    ssh -i "$EC2_KEY_PATH" -o StrictHostKeyChecking=no \
        ${EC2_USER}@${EC2_HOST} \
        "cd ${REMOTE_PATH} && docker-compose logs --tail=50"
}

# Function to print help
print_help() {
    echo "Magnolia Touch Backend EC2 Deployment Script"
    echo ""
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  deploy      Full deployment (build, transfer, deploy)"
    echo "  build       Build Docker image only"
    echo "  setup       Setup EC2 instance only"
    echo "  logs        Show application logs"
    echo "  status      Check application status"
    echo "  help        Show this help message"
    echo ""
    echo "Environment Variables:"
    echo "  EC2_HOST       EC2 instance hostname or IP"
    echo "  EC2_USER       SSH user (default: ubuntu)"
    echo "  EC2_KEY_PATH   Path to SSH private key"
    echo "  DOCKER_TAG     Docker image tag (default: latest)"
    echo ""
    echo "Example:"
    echo "  EC2_HOST=your-server.com EC2_KEY_PATH=~/.ssh/key.pem $0 deploy"
}

# Main execution
main() {
    case "${1:-deploy}" in
        "deploy")
            print_status "Starting full deployment process..."
            check_prerequisites
            build_docker_image
            transfer_docker_image
            transfer_deployment_files
            setup_ec2_instance
            deploy_application
            verify_deployment
            print_success "Deployment completed successfully!"
            print_status "Your application should be available at: http://${EC2_HOST}"
            ;;
        "build")
            check_prerequisites
            build_docker_image
            ;;
        "setup")
            check_prerequisites
            setup_ec2_instance
            ;;
        "logs")
            show_logs
            ;;
        "status")
            ssh -i "$EC2_KEY_PATH" -o StrictHostKeyChecking=no \
                ${EC2_USER}@${EC2_HOST} \
                "cd ${REMOTE_PATH} && docker-compose ps"
            ;;
        "help"|"-h"|"--help")
            print_help
            ;;
        *)
            print_error "Unknown option: $1"
            print_help
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
