const { v4: uuidv4 } = require('uuid');

class DroneService {
    constructor(io) {
        this.io = io;
        this.drones = new Map();
        this.initializeMockDrones();
    }

    initializeMockDrones() {
        const mockDrones = [
            {
                id: uuidv4(),
                name: 'SkyEye-001',
                model: 'DJI Matrice 350 RTK',
                status: 'available',
                battery: 95,
                location: { lat: 28.6500, lng: 77.2200, alt: 0 },
                lastSeen: new Date(),
                capabilities: ['high-res-camera', 'thermal-imaging', 'lidar'],
                maxFlightTime: 55,
                maxRange: 15000,
                site: 'New Delhi CP area'
            },
            {
                id: uuidv4(),
                name: 'Guardian-002',
                model: 'Autel EVO Max 4T',
                status: 'available',
                battery: 87,
                location: { lat: 18.9450, lng: 72.8250, alt: 0 },
                lastSeen: new Date(),
                capabilities: ['high-res-camera', 'thermal-imaging'],
                maxFlightTime: 42,
                maxRange: 12000,
                site: 'South Mumbai – Marine Drive'
            },
            {
                id: uuidv4(),
                name: 'Scout-003',
                model: 'DJI Mavic 3 Enterprise',
                status: 'charging',
                battery: 23,
                location: { lat: 12.9700, lng: 77.5900, alt: 0 },
                lastSeen: new Date(),
                capabilities: ['high-res-camera', 'multispectral'],
                maxFlightTime: 45,
                maxRange: 15000,
                site: 'Bengaluru Center'
            },
            {
                id: uuidv4(),
                name: 'Surveyor-004',
                model: 'Parrot ANAFI USA',
                status: 'in-mission',
                battery: 78,
                location: { lat: 13.0825, lng: 80.2750, alt: 120 },
                lastSeen: new Date(),
                capabilities: ['high-res-camera', 'thermal-imaging'],
                maxFlightTime: 32,
                maxRange: 8000,
                site: 'Chennai Coast'
            },
            {
                id: uuidv4(),
                name: 'Inspector-005',
                model: 'DJI M300 RTK',
                status: 'maintenance',
                battery: 0,
                location: { lat: 17.3871, lng: 78.4917, alt: 0 },
                lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000),
                capabilities: ['high-res-camera', 'thermal-imaging', 'lidar'],
                maxFlightTime: 55,
                maxRange: 15000,
                site: 'Hyderabad North'
            }
        ];

        mockDrones.forEach(drone => {
            this.drones.set(drone.id, drone);
        });
    }

    getAllDrones() {
        return Array.from(this.drones.values());
    }

    getDroneById(id) {
        return this.drones.get(id);
    }

    updateDroneStatus(id, status) {
        const drone = this.drones.get(id);
        if (drone) {
            drone.status = status;
            drone.lastSeen = new Date();
            this.io.emit('drone:updated', drone);
            return drone;
        }
        throw new Error('Drone not found');
    }

    updateDroneLocation(id, location) {
        const drone = this.drones.get(id);
        if (drone) {
            drone.location = { ...drone.location, ...location };
            drone.lastSeen = new Date();
            this.io.emit('drone:location', { droneId: id, location: drone.location });
            return drone;
        }
        throw new Error('Drone not found');
    }

    updateDroneBattery(id, battery) {
        const drone = this.drones.get(id);
        if (drone) {
            drone.battery = Math.max(0, Math.min(100, battery));
            drone.lastSeen = new Date();
            this.io.emit('drone:battery', { droneId: id, battery: drone.battery });
            return drone;
        }
        throw new Error('Drone not found');
    }

    getAvailableDrones() {
        return Array.from(this.drones.values()).filter(drone =>
            drone.status === 'available' && drone.battery > 20
        );
    }

    getDronesByStatus(status) {
        return Array.from(this.drones.values()).filter(drone => drone.status === status);
    }

    getDronesBySite(site) {
        return Array.from(this.drones.values()).filter(drone => drone.site === site);
    }

    getFleetStatistics() {
        const drones = Array.from(this.drones.values());
        const statusCounts = drones.reduce((acc, drone) => {
            acc[drone.status] = (acc[drone.status] || 0) + 1;
            return acc;
        }, {});

        const avgBattery = drones.reduce((sum, drone) => sum + drone.battery, 0) / drones.length;
        const activeDrones = drones.filter(drone =>
            ['available', 'in-mission'].includes(drone.status)
        ).length;

        return {
            total: drones.length,
            active: activeDrones,
            statusBreakdown: statusCounts,
            averageBattery: Math.round(avgBattery),
            sites: [...new Set(drones.map(drone => drone.site))].length
        };
    }

    startSimulation() {
        setInterval(() => {
            this.drones.forEach((drone) => {
                if (drone.status === 'in-mission') {
                    drone.battery = Math.max(0, drone.battery - Math.random() * 2);
                    if (drone.battery < 20) {
                        this.updateDroneStatus(drone.id, 'returning');
                    }
                } else if (drone.status === 'charging') {
                    drone.battery = Math.min(100, drone.battery + Math.random() * 5);
                    if (drone.battery > 90) {
                        this.updateDroneStatus(drone.id, 'available');
                    }
                }
            });

            this.io.emit('drones:list', this.getAllDrones());
        }, 3000);

        setInterval(() => {
            const availableDrones = this.getAvailableDrones();
            if (availableDrones.length > 0 && Math.random() > 0.8) {
                const randomDrone = availableDrones[Math.floor(Math.random() * availableDrones.length)];
                if (randomDrone.battery < 30) {
                    this.updateDroneStatus(randomDrone.id, 'charging');
                }
            }
        }, 10000);
    }

    assignDroneToMission(droneId, missionId) {
        const drone = this.getDroneById(droneId);
        if (!drone) {
            throw new Error('Drone not found');
        }

        if (drone.status !== 'available') {
            throw new Error('Drone is not available for assignment');
        }

        if (drone.battery < 20) {
            throw new Error('Drone battery too low for mission');
        }

        drone.currentMission = missionId;
        this.updateDroneStatus(droneId, 'in-mission');
        return drone;
    }

    releaseDroneFromMission(droneId) {
        const drone = this.getDroneById(droneId);
        if (drone) {
            delete drone.currentMission;
            this.updateDroneStatus(droneId, 'available');
            return drone;
        }
        throw new Error('Drone not found');
    }
}

module.exports = DroneService;