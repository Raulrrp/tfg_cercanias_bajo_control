import express from 'express';
import { getAllStations } from '../controllers/station-controller.js';

const router = express.Router();

// every get queery to /api/station will run getAllStations
router.get('/', getAllStations);

export default router;