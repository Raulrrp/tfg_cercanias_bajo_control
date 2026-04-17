// debugging purposes
import express from 'express';
import { getRouteShapes, getDebuggingRoutes, getDebuggingShapes } from '../controllers/route-shapes-controller.js';

const router = express.Router();

// delivers RouteShapes for clients
router.get('/', getRouteShapes);

// deliver model routes and shapes for debugging purposes
router.get('/debug/routes', getDebuggingRoutes);
router.get('/debug/shapes', getDebuggingShapes);

export default router;
