import express from 'express';
import { getStopTimes, getStopTimesByStopId } from '../controllers/stop-times-controller.js';

const router = express.Router();

// GET /api/stop-times - get all stop times
router.get('/', getStopTimes);

// GET /api/stop-times/stop/:stopId - get stop times for a specific stop
router.get('/stop/:stopId', getStopTimesByStopId);

export default router;
