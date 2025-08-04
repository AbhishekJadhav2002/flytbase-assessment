const express = require('express');
const router = express.Router();

// GET /api/surveys - Get all survey records
router.get('/', (req, res) => {
    try {
        const { site, type, status } = req.query;
        let surveys = req.missionService.getAllSurveys();

        if (site) {
            surveys = surveys.filter(s => s.site === site);
        }

        if (type) {
            surveys = surveys.filter(s => s.type === type);
        }

        if (status) {
            surveys = surveys.filter(s => s.status === status);
        }

        // Sort by completion date (newest first)
        surveys.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

        res.json({
            success: true,
            data: surveys,
            count: surveys.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// GET /api/surveys/statistics - Get survey analytics
router.get('/statistics', (req, res) => {
    try {
        const surveys = req.missionService.getAllSurveys();

        if (surveys.length === 0) {
            return res.json({
                success: true,
                data: {
                    totalSurveys: 0,
                    totalDistance: 0,
                    totalArea: 0,
                    averageDuration: 0,
                    successRate: 0,
                    siteBreakdown: {},
                    typeBreakdown: {},
                    monthlyTrends: []
                }
            });
        }

        // Calculate statistics
        const totalDistance = surveys.reduce((sum, s) => sum + s.distance, 0);
        const totalArea = surveys.reduce((sum, s) => sum + s.area, 0);
        const averageDuration = surveys.reduce((sum, s) => sum + s.duration, 0) / surveys.length;
        const successRate = (surveys.filter(s => s.status === 'success').length / surveys.length) * 100;

        // Site breakdown
        const siteBreakdown = surveys.reduce((acc, survey) => {
            acc[survey.site] = (acc[survey.site] || 0) + 1;
            return acc;
        }, {});

        // Type breakdown
        const typeBreakdown = surveys.reduce((acc, survey) => {
            acc[survey.type] = (acc[survey.type] || 0) + 1;
            return acc;
        }, {});

        // Monthly trends (last 6 months)
        const monthlyTrends = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

            const monthSurveys = surveys.filter(s => {
                const completedAt = new Date(s.completedAt);
                return completedAt >= month && completedAt <= monthEnd;
            });

            monthlyTrends.push({
                month: month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                count: monthSurveys.length,
                distance: monthSurveys.reduce((sum, s) => sum + s.distance, 0),
                area: monthSurveys.reduce((sum, s) => sum + s.area, 0)
            });
        }

        res.json({
            success: true,
            data: {
                totalSurveys: surveys.length,
                totalDistance: Math.round(totalDistance),
                totalArea: Math.round(totalArea),
                averageDuration: Math.round(averageDuration),
                successRate: Math.round(successRate),
                siteBreakdown,
                typeBreakdown,
                monthlyTrends
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// GET /api/surveys/:id - Get survey by ID
router.get('/:id', (req, res) => {
    try {
        const survey = req.missionService.getSurveyById(req.params.id);
        if (!survey) {
            return res.status(404).json({
                success: false,
                error: 'Survey not found'
            });
        }

        res.json({
            success: true,
            data: survey
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// GET /api/surveys/mission/:missionId - Get surveys for a specific mission
router.get('/mission/:missionId', (req, res) => {
    try {
        const surveys = req.missionService.getAllSurveys()
            .filter(s => s.missionId === req.params.missionId);

        res.json({
            success: true,
            data: surveys,
            count: surveys.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;