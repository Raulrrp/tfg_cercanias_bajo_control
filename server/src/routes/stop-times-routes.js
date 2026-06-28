import express from 'express';
import { getDeparturesByStopId } from '../controllers/stop-times-controller.js';

const router = express.Router();

// GET /api/stop-times/:stopId - get active stop times for today at a specific stop
router.get('/:stopId', getDeparturesByStopId);

export default router;