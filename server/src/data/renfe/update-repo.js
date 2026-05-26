import axios from 'axios';
import { Update } from '@tfg_cercanias_bajo_control/common/models/Update.js';

const RENFE_UPDATES_URL = 'https://gtfsrt.renfe.com/trip_updates.json';

const mapUpdatesFromFeed = (data) => {
    if (!data.entity) return [];

    return data.entity
        .map(update => {
            const tripUpdate = update.tripUpdate;
            if (!tripUpdate) return null;

            const validStop = tripUpdate.stopTimeUpdate?.find(stu => stu.arrival);
            if (!validStop) return null;

            return Update.fromJson({
                id: update.id,
                tripId: tripUpdate.trip.tripId,
                scheduledState: tripUpdate.trip.scheduleRelationship,
                scheduledTime: validStop.arrival.time,
                delay: tripUpdate.delay,
                nextStationId: validStop.stopId
            });
        })
        .filter(u => u !== null);
};

export const fetchUpdates = async () => {
    try {
        const response = await axios.get(RENFE_UPDATES_URL);
        const data = response.data;

        return mapUpdatesFromFeed(data);

    } catch (error) {
        console.error("Error fetching Renfe updates:", error);
        throw error;
    }
};