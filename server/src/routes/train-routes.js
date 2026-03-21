import express from 'express';
import { getLiveTrains } from '../controllers/train-controller.js';

const router = express.Router();

router.get('/', getLiveTrains);

export default router;