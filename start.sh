#!/bin/bash

set -e

echo "Drone Survey Management System"
echo "=============================================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

check_docker() {
    print_status "Checking Docker installation..."

    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    if ! docker info &> /dev/null; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi

    print_success "Docker is installed and running"
}

check_docker_compose() {
    print_status "Checking Docker Compose..."

    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not available. Please install Docker Compose."
        exit 1
    fi

    print_success "Docker Compose is available"
}

setup_environment() {
    print_status "Setting up environment files..."

    # Backend environment
    if [ ! -f "backend/.env" ]; then
        print_status "Creating backend/.env from template..."
        mkdir -p backend
        cat > backend/.env << EOL
NODE_ENV=development
PORT=5000
CORS_ORIGIN=http://localhost:3000
EOL
        print_success "Created backend/.env"
    else
        print_warning "backend/.env already exists, skipping..."
    fi

    # Frontend environment
    if [ ! -f "frontend/.env.local" ]; then
        print_status "Creating frontend/.env.local from template..."
        mkdir -p frontend
        cat > frontend/.env.local << EOL
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
EOL
        print_success "Created frontend/.env.local"
    else
        print_warning "frontend/.env.local already exists, skipping..."
    fi
}

check_ports() {
    print_status "Checking if required ports are available..."

    if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
        print_warning "Port 3000 is already in use. Please stop the service using it."
        print_status "You can find what's using it with: lsof -i :3000"
    fi

    if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null ; then
        print_warning "Port 5000 is already in use. Please stop the service using it."
        print_status "You can find what's using it with: lsof -i :5000"
    fi
}

start_services() {
    print_status "Starting Drone Survey Management System..."

    print_status "Stopping any existing containers..."
    docker-compose down --remove-orphans 2>/dev/null || true

    print_status "Building and starting services..."
    if command -v docker-compose &> /dev/null; then
        docker-compose up --build -d
    else
        docker compose up --build -d
    fi

    print_status "Waiting for services to be ready..."
    sleep 10

    if command -v docker-compose &> /dev/null; then
        RUNNING_SERVICES=$(docker-compose ps --services --filter "status=running")
    else
        RUNNING_SERVICES=$(docker compose ps --services --filter "status=running")
    fi

    if [[ $RUNNING_SERVICES == *"backend"* ]] && [[ $RUNNING_SERVICES == *"frontend"* ]]; then
        print_success "All services are running!"
    else
        print_error "Some services failed to start. Check the logs with: docker-compose logs"
        exit 1
    fi
}

verify_installation() {
    print_status "Verifying installation..."

    print_status "Checking backend health..."
    if curl -f -s http://localhost:5000/api/health > /dev/null; then
        print_success "Backend is healthy"
    else
        print_error "Backend health check failed"
        return 1
    fi

    print_status "Checking frontend..."
    if curl -f -s http://localhost:3000 > /dev/null; then
        print_success "Frontend is accessible"
    else
        print_error "Frontend is not accessible"
        return 1
    fi

    return 0
}

show_success_message() {
    echo ""
    echo "🎉 Success!"
    echo ""
    echo "📝 Access the application:"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend API: http://localhost:5000/api"
    echo "   Health Check: http://localhost:5000/api/health"
    echo ""
    echo "🔧 Useful commands:"
    echo "   View logs: docker-compose logs -f"
    echo "   Stop system: docker-compose down"
    echo "   Restart: docker-compose restart"
    echo ""
    echo "📖 For more information, see README.md and SETUP.md"
    echo ""
}

show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --help, -h     Show this help message"
    echo "  --dev          Start in development mode (default)"
    echo "  --prod         Start in production mode"
    echo "  --stop         Stop all services"
    echo "  --restart      Restart all services"
    echo "  --logs         Show logs"
    echo "  --status       Show service status"
    echo ""
}

case "$1" in
    --help|-h)
        show_help
        exit 0
        ;;
    --stop)
        print_status "Stopping services..."
        docker-compose down
        print_success "Services stopped"
        exit 0
        ;;
    --restart)
        print_status "Restarting services..."
        docker-compose restart
        print_success "Services restarted"
        exit 0
        ;;
    --logs)
        docker-compose logs -f
        exit 0
        ;;
    --status)
        docker-compose ps
        exit 0
        ;;
    --prod)
        export NODE_ENV=production
        print_status "Starting in production mode..."
        ;;
    --dev|"")
        export NODE_ENV=development
        print_status "Starting in development mode..."
        ;;
    *)
        print_error "Unknown option: $1"
        show_help
        exit 1
        ;;
esac

main() {
    print_status "Starting setup process..."

    check_docker
    check_docker_compose
    setup_environment
    check_ports
    start_services

    sleep 5

    if verify_installation; then
        show_success_message
    else
        print_error "Installation verification failed. Check logs with: docker-compose logs"
        exit 1
    fi
}

main