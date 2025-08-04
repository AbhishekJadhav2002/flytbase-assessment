const express = require('express');
const Joi = require('joi');
const router = express.Router();

// Validation schemas
const locationUpdateSchema = Joi.object({
  lat: Joi.number().min(-90).max(90).required(),
  lng: Joi.number().min(-180).max(180).required(),
  alt: Joi.number().min(0).max(1000).optional()
});

const statusUpdateSchema = Joi.object({
  status: Joi.string().valid('available', 'in-mission', 'charging', 'maintenance', 'returning').required()
});

// GET /api/drones - Get all drones
router.get('/', (req, res) => {
  try {
    const { status, site } = req.query;
    let drones = req.droneService.getAllDrones();

    if (status) {
      drones = req.droneService.getDronesByStatus(status);
    }

    if (site) {
      drones = req.droneService.getDronesBySite(site);
    }

    res.json({
      success: true,
      data: drones,
      count: drones.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/drones/statistics - Get fleet statistics
router.get('/statistics', (req, res) => {
  try {
    const stats = req.droneService.getFleetStatistics();
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

// GET /api/drones/available - Get available drones
router.get('/available', (req, res) => {
  try {
    const drones = req.droneService.getAvailableDrones();
    res.json({
      success: true,
      data: drones,
      count: drones.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/drones/:id - Get drone by ID
router.get('/:id', (req, res) => {
  try {
    const drone = req.droneService.getDroneById(req.params.id);
    if (!drone) {
      return res.status(404).json({
        success: false,
        error: 'Drone not found'
      });
    }

    res.json({
      success: true,
      data: drone
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// PUT /api/drones/:id/status - Update drone status
router.put('/:id/status', (req, res) => {
  try {
    const { error } = statusUpdateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    const drone = req.droneService.updateDroneStatus(req.params.id, req.body.status);
    res.json({
      success: true,
      data: drone,
      message: 'Drone status updated successfully'
    });
  } catch (error) {
    const status = error.message === 'Drone not found' ? 404 : 500;
    res.status(status).json({
      success: false,
      error: error.message
    });
  }
});

// PUT /api/drones/:id/location - Update drone location
router.put('/:id/location', (req, res) => {
  try {
    const { error } = locationUpdateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    const drone = req.droneService.updateDroneLocation(req.params.id, req.body);
    res.json({
      success: true,
      data: drone,
      message: 'Drone location updated successfully'
    });
  } catch (error) {
    const status = error.message === 'Drone not found' ? 404 : 500;
    res.status(status).json({
      success: false,
      error: error.message
    });
  }
});

// PUT /api/drones/:id/battery - Update drone battery level
router.put('/:id/battery', (req, res) => {
  try {
    const batterySchema = Joi.object({
      battery: Joi.number().min(0).max(100).required()
    });

    const { error } = batterySchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    const drone = req.droneService.updateDroneBattery(req.params.id, req.body.battery);
    res.json({
      success: true,
      data: drone,
      message: 'Drone battery updated successfully'
    });
  } catch (error) {
    const status = error.message === 'Drone not found' ? 404 : 500;
    res.status(status).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;