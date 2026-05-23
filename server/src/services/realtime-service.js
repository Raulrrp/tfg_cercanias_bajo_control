import { Arrival } from '@tfg_cercanias_bajo_control/common/models/Arrival.js';
import { getTrains } from './train-service.js';
import { getUpdates } from './update-service.js';
import { getTrips } from './trip-service.js';
import { getUrbanZonesMap } from './urban-zones-service.js';
import { storeArrival } from './persistence-service.js';

let lastArrivals = null;
let snapshotInFlight = null;

const buildArrival = ({ train, update, trip, urbanZoneId, previousArrival = null }) => {
    const currentStation = train.nextStationId ?? update?.nextStationId ?? null;

    if (!train?.tripId || !trip?.routeId || currentStation == null || urbanZoneId == null) {
        return null;
    }

    return new Arrival({
        train_id: train.train?.id ?? train.id ?? null,
        trip_id: train.tripId,
        line_id: trip.routeId,
        urban_zone_id: urbanZoneId,
        last_station: previousArrival?.current_station ?? null,
        current_station: currentStation,
        scheduled_arrival: update?.scheduledTime ?? null,
        delay_seconds: update?.delay ?? null,
    });
};

export const getRealtimeSnapshot = async () => {
    const [trains, updates] = await Promise.all([getTrains(), getUpdates()]);
    return { trains, updates };
}

export const storeSnapshot = async () => {
    if (snapshotInFlight) return snapshotInFlight;

    snapshotInFlight = (async () => {
        const [trains, updates, trips] = await Promise.all([
            getTrains(),
            getUpdates(),
            getTrips(),
        ]);

        const updatesByTripId = new Map((updates ?? []).map((update) => [String(update.tripId), update]));
        const tripsById = new Map((trips ?? []).map((trip) => [String(trip.id), trip]));
        const urbanZonesById = await getUrbanZonesMap();

        const currentArrivals = new Map();
        const arrivalsToStore = [];

        for (const train of trains ?? []) {
            if (String(train?.status ?? '').trim() !== 'STOPPED_AT') {
                continue;
            }

            const trip = tripsById.get(String(train.tripId));
            const update = updatesByTripId.get(String(train.tripId)) ?? null;
            const urbanZoneId = (() => {
                const routeId = String(trip?.routeId ?? '').trim();
                const numericZoneId = Number.parseInt(routeId.slice(0, 2), 10);
                return Number.isNaN(numericZoneId) ? null : (urbanZonesById.get(numericZoneId)?.id ?? null);
            })();
            const previousArrival = lastArrivals?.get(String(train.tripId)) ?? null;
            const arrival = buildArrival({
                train,
                update,
                trip,
                urbanZoneId,
                previousArrival,
            });

            if (!arrival) {
                continue;
            }

            currentArrivals.set(String(train.tripId), arrival);

            if (lastArrivals && previousArrival && previousArrival.current_station !== arrival.current_station) {
                arrivalsToStore.push(arrival);
            }
        }

        if (lastArrivals === null) {
            lastArrivals = currentArrivals;
            return { trains, updates };
        }

        for (const [tripId, arrival] of currentArrivals.entries()) {
            lastArrivals.set(tripId, arrival);
        }

        if (arrivalsToStore.length > 0) {
            await Promise.all(arrivalsToStore.map((arrival) => storeArrival(arrival)));
        }

        return { trains, updates };
    })();

    try {
        return await snapshotInFlight;
    } finally {
        snapshotInFlight = null;
    }
};
