import express from 'express';
import {getShapes} from '../controllers/shape-controller.js';

const router = express.Router();
// every get queery to /api/station will run getShapes
router.get('/', getShapes);

export default router;