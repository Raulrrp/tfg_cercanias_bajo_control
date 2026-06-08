import {fetchUpdates} from '../data/renfe/update-repo.js';
import { getTripIdByTrainId } from './train-service.js';

export const getUpdates = async () => {
    return fetchUpdates();
}

export const getUpdateByTrainId = async (trainId) => {
    const tripId = await getTripIdByTrainId(trainId);
    if (!tripId) return null;

    return getUpdateByTripId(tripId);
}

export const getUpdateByTripId = async (tripId) => {
    const data = await fetchUpdates();
    const update = data.find(update => String(update.tripId) === String(tripId));
    return update ?? null;
}