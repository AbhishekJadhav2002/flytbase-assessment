# Setup Instructions

This document provides detailed setup instructions for the Drone Survey Management System.

## 📋 Prerequisites

### System Requirements

- **Node.js**: >= Version 22.0
- **Docker**: >= Version 20.10
- **Docker Compose**: >= Version 2.0

### Checking Prerequisites

```bash
node --version
docker --version

docker compose version
```

## 🚀 Installation Methods

### Method 1: Docker Deployment

This is the fastest and most reliable way to get the system running.

1. **Clone the Repository**

   ```bash
   git clone git@github.com:AbhishekJadhav2002/flytbase-assessment.git
   cd flytbase-assessment
   ```
2. **Environment Configuration**
   Create environment files from example files:

   **backend/.env**

   ```bash
   cp backend/.env.example backend/.env
   ```

   **frontend/.env.local**

   ```bash
   cp frontend/.env.example frontend/.env.local
   ```
3. **Build and Start Services**

   ```bash
   docker-compose up --build -d
   ```
4. **Verify Installation**

   - Frontend: http://localhost:3000
   - Backend Health: http://localhost:5000/api/health

### Method 2: Manual Development Setup

1. **Clone and Setup Backend**

   ```bash
   git clone git@github.com:AbhishekJadhav2002/flytbase-assessment.git
   cd flytbase-assessment/backend

   npm install

   echo "NODE_ENV=development
   PORT=5000
   CORS_ORIGIN=http://localhost:3000" > .env

   npm run dev
   ```
2. **Setup Frontend**

   ```bash
   cd flytbase-assessment/frontend

   npm install

   echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api
   NEXT_PUBLIC_SOCKET_URL=http://localhost:5000" > .env.local

   npm run dev
   ```

## 🐳 Docker Configuration

### Docker Commands

```bash
# Start services
docker-compose up

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild and start
docker-compose up --build

# View running containers
docker-compose ps
```
