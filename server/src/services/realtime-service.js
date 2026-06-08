import { Arrival } from '@tfg_cercanias_bajo_control/common/models/Arrival.js';
import { getTrains } from './train-service.js';
import { getUpdates } from './update-service.js';
import { getLineByTripId } from './trip-service.js';
import { getStationById } from './station-service.js';
import { getStopTimeByTripIdAndStopId } from './stop-times-service.js';
import { storeArrival } from './persistence-service.js';

let lastStoppedTrains = null;
let snapshotInFlight = null;

const parseGtfsTimeToIso = (gtfsTime, referenceTimestamp) => {
    if (!gtfsTime || referenceTimestamp == null) return null;

    const parts = String(gtfsTime).split(':').map((part) => Number.parseInt(part, 10));
    if (parts.length < 2 || parts.some((part) => Number.isNaN(part))) {
        return null;
    }

    const [hours, minutes, seconds = 0] = parts;
    const referenceDate = new Date(Number(referenceTimestamp) * 1000);

    if (Number.isNaN(referenceDate.getTime())) {
        return null;
    }

    const startOfDayUtc = Date.UTC(
        referenceDate.getUTCFullYear(),
        referenceDate.getUTCMonth(),
        referenceDate.getUTCDate(),
    );
    const arrivalMs = startOfDayUtc + (((hours * 3600) + (minutes * 60) + seconds) * 1000);

    return new Date(arrivalMs).toISOString();
};

const resolveScheduledArrival = ({ stopTime, referenceTimestamp }) => {
    if (stopTime?.arrivalTime) {
        return parseGtfsTimeToIso(stopTime.arrivalTime, referenceTimestamp);
    }

    return null;
};

export const buildArrival = ({ train, update, line, station, previousArrival = null, stopTime = null }) => {
    const currentStation = train.nextStationId ?? null;

    if (!train?.tripId || !line?.name || !line?.urbanZone || !station?.name || currentStation == null) {
        return null;
    }

    return new Arrival({
        train_id: train.train?.id ?? train.id ?? null,
        trip_id: train.tripId,
        line_id: line.name,
        urban_zone_id: line.urbanZone,
        current_station: station.name,
        scheduled_arrival: resolveScheduledArrival({
            stopTime,
            referenceTimestamp: train.timestamp,
        }),
        delay_seconds: update?.delay ?? 0,
    });
};

export const shouldStoreStoppedArrival = (previousStoppedTrain, currentTrain) => {
    if (!previousStoppedTrain) {
        return true;
    }

    return String(previousStoppedTrain.nextStationId ?? '') !== String(currentTrain.nextStationId ?? '');
};

export const collectStoppedArrivals = async ({
    trains,
    updates,
    previousStoppedTrains = null,
    stopTimeResolver = getStopTimeByTripIdAndStopId,
}) => {
    const updatesByTripId = new Map((updates ?? []).map((update) => [String(update.tripId), update]));
    const currentStoppedTrains = new Map();
    const arrivalsToStore = [];

    for (const train of trains ?? []) {
        if (String(train?.status ?? '').trim() !== 'STOPPED_AT') {
            continue;
        }

        const update = updatesByTripId.get(String(train.tripId)) ?? null;
        const currentStation = train.nextStationId ?? update?.nextStationId ?? null;
        const line = await getLineByTripId(train.tripId);
        const station = currentStation == null ? null : await getStationById(currentStation);
        const stopTime = currentStation == null
            ? null
            : await stopTimeResolver(train.tripId, currentStation);
        const arrival = buildArrival({
            train,
            update,
            line,
            station,
            stopTime,
        });

        if (!arrival) {
            continue;
        }

        currentStoppedTrains.set(String(train.id), train);

        if (previousStoppedTrains && shouldStoreStoppedArrival(previousStoppedTrains.get(String(train.id)), train)) {
            arrivalsToStore.push(arrival);
        }
    }

    return { currentStoppedTrains, arrivalsToStore };
};

export const getRealtimeSnapshot = async () => {
    const [trains, updates] = await Promise.all([getTrains(), getUpdates()]);
    return { trains, updates };
}

export const storeSnapshot = async () => {
    if (snapshotInFlight) return snapshotInFlight;

    snapshotInFlight = (async () => {
        const [trains, updates] = await Promise.all([
            getTrains(),
            getUpdates(),
        ]);
        const { currentStoppedTrains, arrivalsToStore } = await collectStoppedArrivals({
            trains,
            updates,
            previousStoppedTrains: lastStoppedTrains,
        });

        if (lastStoppedTrains === null) {
            lastStoppedTrains = currentStoppedTrains;
            return { trains, updates };
        }

        lastStoppedTrains = currentStoppedTrains;

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
