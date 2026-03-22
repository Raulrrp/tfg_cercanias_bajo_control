import express from 'express';
import {
	getUpdates,
	getUpdateByTripId,
	getUpdateByTrainId
} from '../controllers/update-controller.js';

const router = express.Router();

router.get('/', getUpdates);
router.get('/trip/:tripId', getUpdateByTripId);
router.get('/train/:trainId', getUpdateByTrainId);

export default router;
