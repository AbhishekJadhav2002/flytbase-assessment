const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
require('dotenv').config();

const droneRoutes = require('./routes/drones');
const missionRoutes = require('./routes/missions');
const surveyRoutes = require('./routes/surveys');
const DroneService = require('./services/DroneService');
const MissionService = require('./services/MissionService');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: process.env.CORS_ORIGIN || "http://localhost:3000",
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});

app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true
}));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});
app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const droneService = new DroneService(io);
const missionService = new MissionService(io, droneService);

app.use((req, res, next) => {
    req.droneService = droneService;
    req.missionService = missionService;
    req.io = io;
    next();
});

app.use('/api/drones', droneRoutes);
app.use('/api/missions', missionRoutes);
app.use('/api/surveys', surveyRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.emit('drones:list', droneService.getAllDrones());
    socket.emit('missions:list', missionService.getAllMissions());

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });

    socket.on('mission:start', (missionId) => {
        try {
            missionService.startMission(missionId);
        } catch (error) {
            socket.emit('error', { message: error.message });
        }
    });

    socket.on('mission:pause', (missionId) => {
        try {
            missionService.pauseMission(missionId);
        } catch (error) {
            socket.emit('error', { message: error.message });
        }
    });

    socket.on('mission:resume', (missionId) => {
        try {
            missionService.resumeMission(missionId);
        } catch (error) {
            socket.emit('error', { message: error.message });
        }
    });

    socket.on('mission:abort', (missionId) => {
        try {
            missionService.abortMission(missionId);
        } catch (error) {
            socket.emit('error', { message: error.message });
        }
    });
});

app.use((error, req, res, next) => {
    console.error('Error:', error);
    res.status(error.status || 500).json({
        error: {
            message: error.message || 'Internal Server Error',
            status: error.status || 500
        }
    });
});

app.use('/*splat', (req, res) => {
    res.status(404).json({ error: { message: 'Route not found', status: 404 } });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);

    droneService.startSimulation();
    missionService.startProgressSimulation();
});