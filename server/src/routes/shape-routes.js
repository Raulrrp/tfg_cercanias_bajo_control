import express from 'express';
import { getShapes, getRouteShapes } from '../controllers/shape-controller.js';

const router = express.Router();
// every get queery to /api/station will run getShapes
router.get('/', getShapes);
router.get('/route-shapes', getRouteShapes);

export default router;