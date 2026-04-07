import express from 'express';
import { getRouteShapes } from '../controllers/shape-controller.js';

const router = express.Router();

router.get('/', getRouteShapes);

export default router;