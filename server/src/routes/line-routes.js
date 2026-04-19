import express from 'express';
import { getLines } from '../controllers/line-controller.js';

const router = express.Router();

// every GET query to /api/lines will run getLines
router.get('/', getLines);

export default router;
