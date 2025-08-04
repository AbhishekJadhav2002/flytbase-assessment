const express = require('express');
const Joi = require('joi');
const router = express.Router();

// Validation schemas
const createMissionSchema = Joi.object({
    name: Joi.string().min(3).max(100).required(),
    type: Joi.string().valid('inspection', 'security', 'mapping', 'monitoring').required(),
    priority: Joi.string().valid('low', 'medium', 'high', 'critical').default('medium'),
    site: Joi.string().required(),
    surveyArea: Joi.object({
        name: Joi.string().required(),
        coordinates: Joi.array().items(
            Joi.object({
                lat: Joi.number().min(-90).max(90).required(),
                lng: Joi.number().min(-180).max(180).required()
            })
        ).min(3).required()
    }).required(),
    flightPlan: Joi.object({
        pattern: Joi.string().valid('perimeter', 'crosshatch', 'custom').required(),
        altitude: Joi.number().min(10).max(400).required(),
        speed: Joi.number().min(1).max(15).required(),
        overlap: Joi.number().min(0).max(100).default(70)
    }).required(),
    dataCollection: Joi.object({
        sensors: Joi.array().items(
            Joi.string().valid('high-res-camera', 'thermal-imaging', 'lidar', 'multispectral')
        ).min(1).required(),
        frequency: Joi.number().min(1).max(10).default(5),
        captureMode: Joi.string().valid('continuous', 'waypoint', 'interval').default('waypoint')
    }).required(),
    schedule: Joi.object({
        startTime: Joi.date().min('now').required(),
        estimatedDuration: Joi.number().min(5).max(300).required()
    }).required()
});

const updateMissionSchema = Joi.object({
    name: Joi.string().min(3).max(100).optional(),
    priority: Joi.string().valid('low', 'medium', 'high', 'critical').optional(),
    surveyArea: Joi.object({
        name: Joi.string().required(),
        coordinates: Joi.array().items(
            Joi.object({
                lat: Joi.number().min(-90).max(90).required(),
                lng: Joi.number().min(-180).max(180).required()
            })
        ).min(3).required()
    }).optional(),
    flightPlan: Joi.object({
        pattern: Joi.string().valid('perimeter', 'crosshatch', 'custom').optional(),
        altitude: Joi.number().min(10).max(400).optional(),
        speed: Joi.number().min(1).max(15).optional(),
        overlap: Joi.number().min(0).max(100).optional()
    }).optional(),
    dataCollection: Joi.object({
        sensors: Joi.array().items(
            Joi.string().valid('high-res-camera', 'thermal-imaging', 'lidar', 'multispectral')
        ).min(1).optional(),
        frequency: Joi.number().min(1).max(10).optional(),
        captureMode: Joi.string().valid('continuous', 'waypoint', 'interval').optional()
    }).optional(),
    schedule: Joi.object({
        startTime: Joi.date().min('now').optional(),
        estimatedDuration: Joi.number().min(5).max(300).optional()
    }).optional()
});

// GET /api/missions - Get all missions
router.get('/', (req, res) => {
    try {
        const { status, site, type } = req.query;
        let missions = req.missionService.getAllMissions();

        if (status) {
            missions = req.missionService.getMissionsByStatus(status);
        }

        if (site) {
            missions = req.missionService.getMissionsBySite(site);
        }

        if (type) {
            missions = missions.filter(m => m.type === type);
        }

        // Sort by priority and creation date
        missions.sort((a, b) => {
            const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
            const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
            if (priorityDiff !== 0) return priorityDiff;
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        res.json({
            success: true,
            data: missions,
            count: missions.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// GET /api/missions/statistics - Get mission statistics
router.get('/statistics', (req, res) => {
    try {
        const stats = req.missionService.getMissionStatistics();
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// POST /api/missions - Create new mission
router.post('/', (req, res) => {
    try {
        const { error } = createMissionSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                error: error.details[0].message
            });
        }

        const mission = req.missionService.createMission(req.body);
        res.status(201).json({
            success: true,
            data: mission,
            message: 'Mission created successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// GET /api/missions/:id - Get mission by ID
router.get('/:id', (req, res) => {
    try {
        const mission = req.missionService.getMissionById(req.params.id);
        if (!mission) {
            return res.status(404).json({
                success: false,
                error: 'Mission not found'
            });
        }

        res.json({
            success: true,
            data: mission
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// PUT /api/missions/:id - Update mission
router.put('/:id', (req, res) => {
    try {
        const { error } = updateMissionSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                error: error.details[0].message
            });
        }

        const mission = req.missionService.updateMission(req.params.id, req.body);
        res.json({
            success: true,
            data: mission,
            message: 'Mission updated successfully'
        });
    } catch (error) {
        const status = error.message === 'Mission not found' ? 404 : 500;
        res.status(status).json({
            success: false,
            error: error.message
        });
    }
});

// DELETE /api/missions/:id - Delete mission
router.delete('/:id', (req, res) => {
    try {
        req.missionService.deleteMission(req.params.id);
        res.json({
            success: true,
            message: 'Mission deleted successfully'
        });
    } catch (error) {
        const status = error.message === 'Mission not found' ? 404 : 500;
        res.status(status).json({
            success: false,
            error: error.message
        });
    }
});

// POST /api/missions/:id/start - Start mission
router.post('/:id/start', (req, res) => {
    try {
        const mission = req.missionService.startMission(req.params.id);
        res.json({
            success: true,
            data: mission,
            message: 'Mission started successfully'
        });
    } catch (error) {
        const status = error.message === 'Mission not found' ? 404 : 400;
        res.status(status).json({
            success: false,
            error: error.message
        });
    }
});

// POST /api/missions/:id/pause - Pause mission
router.post('/:id/pause', (req, res) => {
    try {
        const mission = req.missionService.pauseMission(req.params.id);
        res.json({
            success: true,
            data: mission,
            message: 'Mission paused successfully'
        });
    } catch (error) {
        const status = error.message === 'Mission not found' ? 404 : 400;
        res.status(status).json({
            success: false,
            error: error.message
        });
    }
});

// POST /api/missions/:id/resume - Resume mission
router.post('/:id/resume', (req, res) => {
    try {
        const mission = req.missionService.resumeMission(req.params.id);
        res.json({
            success: true,
            data: mission,
            message: 'Mission resumed successfully'
        });
    } catch (error) {
        const status = error.message === 'Mission not found' ? 404 : 400;
        res.status(status).json({
            success: false,
            error: error.message
        });
    }
});

// POST /api/missions/:id/abort - Abort mission
router.post('/:id/abort', (req, res) => {
    try {
        const mission = req.missionService.abortMission(req.params.id);
        res.json({
            success: true,
            data: mission,
            message: 'Mission aborted successfully'
        });
    } catch (error) {
        const status = error.message === 'Mission not found' ? 404 : 400;
        res.status(status).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;