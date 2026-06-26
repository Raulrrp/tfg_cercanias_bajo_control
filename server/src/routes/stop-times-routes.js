import express from 'express';
import { getStopTimesByStopId, getStopTimeByTripIdAndStopId } from '../controllers/stop-times-controller.js';

const router = express.Router();

// GET /api/stop-times/:stopId - get active stop times for today at a specific stop
router.get('/:stopId', getStopTimesByStopId);

// GET /api/stop-times/:stopId/trip/:tripId - get specific stop time for a trip at this stop
router.get('/:stopId/trip/:tripId', getStopTimeByTripIdAndStopId);

export default router;