const { v4: uuidv4 } = require('uuid');

class MissionService {
    constructor(io, droneService) {
        this.io = io;
        this.droneService = droneService;
        this.missions = new Map();
        this.surveyHistory = new Map();
        this.initializeMockMissions();
    }

    initializeMockMissions() {
        const mockMissions = [
            {
                id: uuidv4(),
                name: 'Urban Patrol – Jaipur Greater Loop',
                type: 'security',
                status: 'completed',
                priority: 'high',
                droneId: null,
                site: 'Jaipur Ops − Pink City Sector',
                surveyArea: {
                    name: 'Jaipur Central & West Sector',
                    coordinates: [
                        { lat: 26.82, lng: 75.65 },
                        { lat: 26.82, lng: 75.80 },
                        { lat: 27.02, lng: 75.80 },
                        { lat: 27.02, lng: 75.65 }
                    ]
                },
                flightPlan: {
                    pattern: 'zigzag',
                    altitude: 60,
                    speed: 12,
                    overlap: 65,
                    waypoints: [
                        { lat: 26.82, lng: 75.65, alt: 60 },
                        { lat: 26.82, lng: 75.80, alt: 60 },
                        { lat: 26.88, lng: 75.80, alt: 60 },
                        { lat: 26.88, lng: 75.65, alt: 60 },
                        { lat: 26.94, lng: 75.65, alt: 60 },
                        { lat: 26.94, lng: 75.80, alt: 60 },
                        { lat: 27.00, lng: 75.80, alt: 60 },
                        { lat: 27.00, lng: 75.65, alt: 60 }
                    ]
                },
                dataCollection: {
                    sensors: ['high-res-camera', 'thermal-imaging'],
                    frequency: 10,
                    captureMode: 'continuous'
                },
                schedule: {
                    startTime: new Date(Date.now() - 4 * 60 * 60 * 1000),
                    estimatedDuration: 45,
                    actualDuration: 42
                },
                progress: 100,
                createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                completedAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
            },
            {
                id: uuidv4(),
                name: 'Security Orbit – New Delhi CP Expanded',
                type: 'security',
                status: 'in-progress',
                priority: 'medium',
                droneId: null,
                site: 'New Delhi CP + Connaught Junction',
                surveyArea: {
                    name: 'Delhi CP & Lutyens Zone',
                    coordinates: [
                        { lat: 28.59, lng: 77.12 },
                        { lat: 28.59, lng: 77.30 },
                        { lat: 28.73, lng: 77.30 },
                        { lat: 28.73, lng: 77.12 }
                    ]
                },
                flightPlan: {
                    pattern: 'star',
                    altitude: 70,
                    speed: 10,
                    overlap: 70,
                    waypoints: [
                        { lat: 28.59, lng: 77.12, alt: 70 },
                        { lat: 28.6448, lng: 77.2167, alt: 70 },
                        { lat: 28.73, lng: 77.30, alt: 70 },
                        { lat: 28.73, lng: 77.12, alt: 70 },
                        { lat: 28.6448, lng: 77.2167, alt: 70 },
                        { lat: 28.59, lng: 77.30, alt: 70 },
                        { lat: 28.6448, lng: 77.2167, alt: 70 },
                        { lat: 28.59, lng: 77.12, alt: 70 }
                    ]
                },
                dataCollection: {
                    sensors: ['high-res-camera', 'thermal-imaging'],
                    frequency: 8,
                    captureMode: 'waypoint'
                },
                schedule: {
                    startTime: new Date(Date.now() - 1 * 60 * 60 * 1000),
                    estimatedDuration: 60
                },
                progress: 60,
                createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
            },
            {
                id: uuidv4(),
                name: 'Marine Drive Full Span Infrastructure Scan',
                type: 'inspection',
                status: 'scheduled',
                priority: 'high',
                droneId: null,
                site: 'South Mumbai Coastal Promenade',
                surveyArea: {
                    name: 'Mumbai Marine Drive Corridor + Chowpatty',
                    coordinates: [
                        { lat: 18.88, lng: 72.78 },
                        { lat: 18.88, lng: 72.84 },
                        { lat: 18.95, lng: 72.84 },
                        { lat: 18.95, lng: 72.78 }
                    ]
                },
                flightPlan: {
                    pattern: 'crosshatch',
                    altitude: 80,
                    speed: 6,
                    overlap: 75,
                    waypoints: [
                        { lat: 18.88, lng: 72.78, alt: 80 },
                        { lat: 18.88, lng: 72.84, alt: 80 },
                        { lat: 18.915, lng: 72.84, alt: 80 },
                        { lat: 18.915, lng: 72.78, alt: 80 },
                        { lat: 18.95, lng: 72.78, alt: 80 },
                        { lat: 18.95, lng: 72.84, alt: 80 },
                        { lat: 18.88, lng: 72.78, alt: 80 },
                        { lat: 18.95, lng: 72.78, alt: 80 },
                        { lat: 18.95, lng: 72.82, alt: 80 },
                        { lat: 18.88, lng: 72.82, alt: 80 },
                        { lat: 18.95, lng: 72.84, alt: 80 }
                    ]
                },
                dataCollection: {
                    sensors: ['high-res-camera', 'thermal-imaging'],
                    frequency: 5,
                    captureMode: 'waypoint'
                },
                schedule: {
                    startTime: new Date(Date.now() + 45 * 60 * 1000),
                    estimatedDuration: 75
                },
                progress: 0,
                createdAt: new Date()
            },
            {
                id: uuidv4(),
                name: 'Crop Health Survey – Pune Greater West Farms',
                type: 'inspection',
                status: 'in-progress',
                priority: 'medium',
                droneId: null,
                site: 'Pune Agri Hub Outskirts',
                surveyArea: {
                    name: 'Pune North-West Mega Farms',
                    coordinates: [
                        { lat: 18.45, lng: 73.75 },
                        { lat: 18.45, lng: 73.87 },
                        { lat: 18.59, lng: 73.87 },
                        { lat: 18.59, lng: 73.75 }
                    ]
                },
                flightPlan: {
                    pattern: 'crosshatch',
                    altitude: 60,
                    speed: 8,
                    overlap: 70,
                    waypoints: []
                },
                dataCollection: {
                    sensors: ['multispectral-camera'],
                    frequency: 6,
                    captureMode: 'waypoint'
                },
                schedule: {
                    startTime: new Date(Date.now() - 45 * 60 * 1000),
                    estimatedDuration: 55
                },
                progress: 48,
                createdAt: new Date(Date.now() - 45 * 60 * 1000)
            },
            {
                id: uuidv4(),
                name: 'Mangrove Surveillance – Sundarbans Macro Grid',
                type: 'environment',
                status: 'scheduled',
                priority: 'high',
                droneId: null,
                site: 'Indian Sundarbans West Sector',
                surveyArea: {
                    name: 'Sundarbans Expanded Zone',
                    coordinates: [
                        { lat: 21.60, lng: 88.50 },
                        { lat: 21.60, lng: 89.10 },
                        { lat: 22.20, lng: 89.10 },
                        { lat: 22.20, lng: 88.50 }
                    ]
                },
                flightPlan: {
                    pattern: 'crosshatch',
                    altitude: 85,
                    speed: 7,
                    overlap: 75,
                    waypoints: []
                },
                dataCollection: {
                    sensors: ['thermal-imaging', 'high-res-camera'],
                    frequency: 12,
                    captureMode: 'waypoint'
                },
                schedule: {
                    startTime: new Date(Date.now() + 10 * 60 * 60 * 1000),
                    estimatedDuration: 120
                },
                progress: 0,
                createdAt: new Date()
            }
        ];

        mockMissions.forEach(mission => {
            this.missions.set(mission.id, mission);
            if (mission.status === 'completed') {
                const id = uuidv4();
                this.surveyHistory.set(id, {
                    id,
                    missionId: mission.id,
                    missionName: mission.name,
                    site: mission.site,
                    type: mission.type,
                    completedAt: mission.completedAt,
                    duration: mission.schedule.actualDuration,
                    distance: Math.round(Math.random() * 5000 + 1000),
                    area: Math.round(Math.random() * 12000 + 2000),
                    dataPoints: Math.round(Math.random() * 800 + 100),
                    status: 'success'
                });
            }
        });
    }

    createMission(missionData) {
        const mission = {
            id: uuidv4(),
            ...missionData,
            status: 'draft',
            progress: 0,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        mission.flightPlan.waypoints = this.generateWaypoints(
            mission.surveyArea,
            mission.flightPlan
        );

        this.missions.set(mission.id, mission);
        this.io.emit('mission:created', mission);
        return mission;
    }

    generateWaypoints(surveyArea, flightPlan) {
        const waypoints = [];
        const coords = surveyArea.coordinates;

        if (flightPlan.pattern === 'perimeter') {
            coords.forEach(coord => {
                waypoints.push({
                    lat: coord.lat,
                    lng: coord.lng,
                    alt: flightPlan.altitude
                });
            });
        } else if (flightPlan.pattern === 'crosshatch') {
            const minLat = Math.min(...coords.map(c => c.lat));
            const maxLat = Math.max(...coords.map(c => c.lat));
            const minLng = Math.min(...coords.map(c => c.lng));
            const maxLng = Math.max(...coords.map(c => c.lng));

            const spacing = 0.001;

            for (let lat = minLat; lat <= maxLat; lat += spacing) {
                for (let lng = minLng; lng <= maxLng; lng += spacing) {
                    waypoints.push({ lat, lng, alt: flightPlan.altitude });
                }
            }
        }

        return waypoints;
    }

    getAllMissions() {
        return Array.from(this.missions.values());
    }

    getMissionById(id) {
        return this.missions.get(id);
    }

    updateMission(id, updates) {
        const mission = this.missions.get(id);
        if (mission) {
            Object.assign(mission, updates, { updatedAt: new Date() });
            this.io.emit('mission:updated', mission);
            return mission;
        }
        throw new Error('Mission not found');
    }

    deleteMission(id) {
        const deleted = this.missions.delete(id);
        if (deleted) {
            this.io.emit('mission:deleted', { id });
            return true;
        }
        throw new Error('Mission not found');
    }

    startMission(id) {
        const mission = this.missions.get(id);
        if (!mission) {
            throw new Error('Mission not found');
        }

        if (mission.status !== 'scheduled' && mission.status !== 'paused') {
            throw new Error('Mission cannot be started in current state');
        }

        const availableDrones = this.droneService.getAvailableDrones();
        if (availableDrones.length === 0) {
            throw new Error('No available drones for mission');
        }

        const assignedDrone = availableDrones[0];
        this.droneService.assignDroneToMission(assignedDrone.id, id);

        mission.droneId = assignedDrone.id;
        mission.status = 'in-progress';
        mission.schedule.actualStartTime = new Date();
        mission.updatedAt = new Date();

        this.io.emit('mission:started', mission);
        return mission;
    }

    pauseMission(id) {
        const mission = this.missions.get(id);
        if (!mission) {
            throw new Error('Mission not found');
        }

        if (mission.status !== 'in-progress') {
            throw new Error('Mission is not in progress');
        }

        mission.status = 'paused';
        mission.updatedAt = new Date();

        this.io.emit('mission:paused', mission);
        return mission;
    }

    resumeMission(id) {
        const mission = this.missions.get(id);
        if (!mission) {
            throw new Error('Mission not found');
        }

        if (mission.status !== 'paused') {
            throw new Error('Mission is not paused');
        }

        mission.status = 'in-progress';
        mission.updatedAt = new Date();

        this.io.emit('mission:resumed', mission);
        return mission;
    }

    abortMission(id) {
        const mission = this.missions.get(id);
        if (!mission) {
            throw new Error('Mission not found');
        }

        if (!['in-progress', 'paused'].includes(mission.status)) {
            throw new Error('Mission cannot be aborted in current state');
        }

        if (mission.droneId) {
            this.droneService.releaseDroneFromMission(mission.droneId);
        }

        mission.status = 'aborted';
        mission.schedule.actualEndTime = new Date();
        mission.updatedAt = new Date();

        this.io.emit('mission:aborted', mission);
        return mission;
    }

    completeMission(id) {
        const mission = this.missions.get(id);
        if (!mission) {
            throw new Error('Mission not found');
        }

        if (mission.droneId) {
            this.droneService.releaseDroneFromMission(mission.droneId);
        }

        mission.status = 'completed';
        mission.progress = 100;
        mission.schedule.actualEndTime = new Date();
        mission.schedule.actualDuration = Math.round(
            (mission.schedule.actualEndTime - mission.schedule.actualStartTime) / (1000 * 60)
        );
        mission.updatedAt = new Date();

        const surveyRecord = {
            id: uuidv4(),
            missionId: mission.id,
            missionName: mission.name,
            site: mission.site,
            type: mission.type,
            completedAt: mission.schedule.actualEndTime,
            duration: mission.schedule.actualDuration,
            distance: Math.round(Math.random() * 5000 + 1000),
            area: Math.round(Math.random() * 10000 + 5000),
            dataPoints: Math.round(Math.random() * 500 + 100),
            status: 'success'
        };

        this.surveyHistory.set(surveyRecord.id, surveyRecord);
        this.io.emit('mission:completed', mission);
        this.io.emit('survey:completed', surveyRecord);
        return mission;
    }

    getMissionsByStatus(status) {
        return Array.from(this.missions.values()).filter(m => m.status === status);
    }

    getMissionsBySite(site) {
        return Array.from(this.missions.values()).filter(m => m.site === site);
    }

    getAllSurveys() {
        return Array.from(this.surveyHistory.values());
    }

    getSurveyById(id) {
        return this.surveyHistory.get(id);
    }

    getMissionStatistics() {
        const missions = Array.from(this.missions.values());
        const surveys = Array.from(this.surveyHistory.values());

        const statusCounts = missions.reduce((acc, mission) => {
            acc[mission.status] = (acc[mission.status] || 0) + 1;
            return acc;
        }, {});

        const typeCounts = missions.reduce((acc, mission) => {
            acc[mission.type] = (acc[mission.type] || 0) + 1;
            return acc;
        }, {});

        const totalDistance = surveys.reduce((sum, survey) => sum + survey.distance, 0);
        const totalArea = surveys.reduce((sum, survey) => sum + survey.area, 0);
        const avgDuration = surveys.length > 0
            ? surveys.reduce((sum, survey) => sum + survey.duration, 0) / surveys.length
            : 0;

        return {
            totalMissions: missions.length,
            completedSurveys: surveys.length,
            statusBreakdown: statusCounts,
            typeBreakdown: typeCounts,
            totalDistance: Math.round(totalDistance),
            totalArea: Math.round(totalArea),
            averageDuration: Math.round(avgDuration),
            successRate: surveys.length > 0
                ? Math.round((surveys.filter(s => s.status === 'success').length / surveys.length) * 100)
                : 0
        };
    }

    startProgressSimulation() {
        setInterval(() => {
            const activeMissions = this.getMissionsByStatus('in-progress');

            activeMissions.forEach(mission => {
                if (mission.progress < 100) {
                    mission.progress = Math.min(100, mission.progress + Math.random() * 5);

                    if (mission.droneId && mission.flightPlan.waypoints.length > 0) {
                        const waypointIndex = Math.floor((mission.progress / 100) * mission.flightPlan.waypoints.length);
                        const waypoint = mission.flightPlan.waypoints[waypointIndex] || mission.flightPlan.waypoints[0];

                        this.droneService.updateDroneLocation(mission.droneId, waypoint);
                    }

                    this.io.emit('mission:progress', {
                        missionId: mission.id,
                        progress: mission.progress
                    });

                    if (mission.progress >= 100) {
                        setTimeout(() => {
                            this.completeMission(mission.id);
                        }, 1000);
                    }
                }
            });
        }, 3000);
    }
}

module.exports = MissionService;