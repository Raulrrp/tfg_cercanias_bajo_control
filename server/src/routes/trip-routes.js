// debugging purposes
import express from 'express';
import { getTrips } from '../controllers/trip-controller.js';

const router = express.Router();

router.get('/', getTrips);

export default router;