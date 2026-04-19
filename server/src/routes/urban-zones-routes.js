import express from 'express';
import { getUrbanZones } from '../controllers/urban-zones-controller.js';

const router = express.Router();

// GET all urban zones
router.get('/', getUrbanZones);

export default router;
