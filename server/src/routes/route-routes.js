// debugging purposes
import express from 'express';
import { getRoutes } from '../controllers/route-controller.js';

const router = express.Router();
// every get queery to /api/routes will run getRoutes
router.get('/', getRoutes);

export default router;
