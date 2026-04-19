import express from 'express';
import { getStations } from '../controllers/station-controller.js';

const router = express.Router();

// every GET query to /api/stations will run getStations
router.get('/', getStations);

export default router;