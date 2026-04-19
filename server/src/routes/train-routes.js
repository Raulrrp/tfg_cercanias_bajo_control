import express from 'express';
import { getTrains } from '../controllers/train-controller.js';

const router = express.Router();

router.get('/', getTrains);

export default router;