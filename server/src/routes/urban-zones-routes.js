import express from 'express';
import { getUrbanZones, getUrbanZoneById } from '../controllers/urban-zones-controller.js';

const router = express.Router();

// GET all urban zones
router.get('/', getUrbanZones);

// GET a specific urban zone by id
router.get('/:id', getUrbanZoneById);

export default router;
