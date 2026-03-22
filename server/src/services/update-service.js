import {fetchUpdates} from '@tfg_cercanias_bajo_control/server/src/data/remote/update-repo.js';
import { fetchTrains } from '@tfg_cercanias_bajo_control/server/src/data/remote/train-repo.js';

export const getUpdates = async () => {
    return fetchUpdates();
}

export const getUpdateByTrainId = async (trainId) => {
    // Train updates are keyed by tripId, so we resolve train id -> tripId first.
    const trains = await fetchTrains();
    const train = trains.find(t => String(t.train?.id) === String(trainId));
    if (!train?.tripId) return null;

    return getUpdateByTripId(train.tripId);
}

export const getUpdateByTripId = async (tripId) => {
    const data = await fetchUpdates();
    const update = data.find(update => String(update.tripId) === String(tripId));
    return update ?? null;
}