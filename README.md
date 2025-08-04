# Drone Survey Management System

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Git

### Installation & Setup

1. **Clone the Repository**
   ```bash
   git clone git@github.com:AbhishekJadhav2002/flytbase-assessment.git
   cd flytbase-assessment
   ```

2. **Environment Setup**
   Create `.env` files in both frontend and backend directories:

   **Backend (.env)**
   ```env
   NODE_ENV=development
   PORT=5000
   CORS_ORIGIN=http://localhost:3000
   ```

   **Frontend (.env.local)**
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
   ```

3. **Docker Deployment**
   ```bash
   docker-compose up --build
   ```

   Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api

4. **Manual Development Setup**

   **Backend:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

   **Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### API Endpoints

#### Drone Management
- `GET /api/drones` - List all drones
- `GET /api/drones/statistics` - Fleet statistics
- `PUT /api/drones/:id/status` - Update drone status
- `PUT /api/drones/:id/location` - Update drone location

#### Mission Management
- `GET /api/missions` - List all missions
- `POST /api/missions` - Create new mission
- `POST /api/missions/:id/start` - Start mission
- `POST /api/missions/:id/pause` - Pause mission
- `POST /api/missions/:id/resume` - Resume mission
- `POST /api/missions/:id/abort` - Abort mission

#### Survey Reports
- `GET /api/surveys` - List survey records
- `GET /api/surveys/statistics` - Survey analytics

### WebSocket Events
- `drones:list` - Real-time drone updates
- `missions:list` - Mission status updates
- `mission:progress` - Live mission progress
- `drone:location` - Real-time position updates

### Docker Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```
