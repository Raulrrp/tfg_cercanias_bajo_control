import fs from 'fs';
import url from 'url';
import path from 'path';
import { fetchStations } from '../src/data/files/station-repo-txt.js';
import { fetchShapes } from '../src/data/files/shape-repo.js';
import { fetchTrips } from '../src/data/files/trip-repo.js';
import { TrainPos } from '@tfg_cercanias_bajo_control/common/models/TrainPos.js';
import { LinearReferenceLoader } from '../src/services/linear-reference-loader.js';
import { LinearReferenceEngine } from '../src/services/linear-reference-engine.js';
import { ArrivalDetector } from '../src/services/arrival-detector-service.js';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data_files');

const FILES = {
    REALTIME_SAMPLE: path.resolve(DATA_DIR, 'gtfs_train_samples/train-sample3.json'),
};

async function main() {
    console.log('\n' + '='.repeat(120));
    console.log('GTFS Realtime Linear Referencing Validation - Raw vs Corrected');
    console.log('='.repeat(120) + '\n');

    try {
        const [stations, shapes, trips] = await Promise.all([
            fetchStations(),
            fetchShapes(),
            fetchTrips(),
        ]);

        const loader = new LinearReferenceLoader();
        await loader.initialize(stations, shapes, trips);
        const engine = new LinearReferenceEngine(loader);
        const detector = new ArrivalDetector(loader, engine);

        // load feed
        const feedFilePath = FILES.REALTIME_SAMPLE;
        const feedContent = fs.readFileSync(feedFilePath, 'utf-8');
        const gtfsRtFeed = JSON.parse(feedContent);

        const vehicles = (gtfsRtFeed.entity || [])
            .filter((e) => e.vehicle)
            .map((e) => ({ id: e.id, vehicle: e.vehicle }));

        console.log('RawStop'.padEnd(16) + ' | RawStatus'.padEnd(12) + ' | Stop->Final(km)'.padStart(15) + ' | Train->Final(km)'.padStart(16) + ' | CorrectedStop'.padEnd(16) + ' | CorrectedStatus');
        console.log('-'.repeat(120));

        for (const item of vehicles) {
            const v = item.vehicle;
            const rawStop = v.stopId;
            const rawStatus = v.currentStatus || 'UNKNOWN';
            const tripId = v.trip?.tripId;
            const lat = v.position?.latitude;
            const lon = v.position?.longitude;
            if (!tripId || lat === undefined || lon === undefined || !rawStop) continue;

            const trip = loader.getTrip(tripId);
            if (!trip || !trip.shapeId) continue;
            const lineString = loader.getLineString(trip.shapeId);
            if (!lineString) continue;

            const stopTimesForTrip = loader.getStopTimesForTrip(tripId);
            if (!stopTimesForTrip || stopTimesForTrip.length === 0) continue;

            const finalStopTimeEntry = stopTimesForTrip.reduce((max, st) => st.stopSequence > max.stopSequence ? st : max);

            // compute distances
            const vehicleProjection = engine.projectPointOnLine({ latitude: lat, longitude: lon }, lineString);
            if (!vehicleProjection) continue;

            const rawStopProjection = engine.getStopDistanceAlongRoute(tripId, rawStop, lineString);
            if (!rawStopProjection) continue;

            const finalStopProjection = engine.getStopDistanceAlongRoute(tripId, finalStopTimeEntry.stopId, lineString);
            if (!finalStopProjection) continue;

            const trainDistToFinal = finalStopProjection.distanceAlongLine - vehicleProjection.distanceAlongLine;
            const rawStopDistToFinal = finalStopProjection.distanceAlongLine - rawStopProjection.distanceAlongLine;

            // determine corrected stop (smallest sequence greater than rawStop's sequence)
            const rawStopTimeEntry = stopTimesForTrip.find((st) => st.stopId === rawStop);
            let nextStopEntry = stopTimesForTrip.filter((st) => st.stopSequence > rawStopTimeEntry.stopSequence)
                .reduce((min, entry) => min === null || entry.stopSequence < min.stopSequence ? entry : min, null);

            let correctedStop = rawStop;
            let correctedStatus = engine.determineStopStatus(trainDistToFinal, rawStopDistToFinal);
            if (correctedStatus === 'PASSED' && nextStopEntry) {
                correctedStop = nextStopEntry.stopId;
                // recalc distances using corrected stop
                const correctedStopProjection = engine.getStopDistanceAlongRoute(tripId, correctedStop, lineString);
                if (correctedStopProjection && finalStopProjection) {
                    const newRawStopDistToFinal = finalStopProjection.distanceAlongLine - correctedStopProjection.distanceAlongLine;
                    correctedStatus = engine.determineStopStatus(trainDistToFinal, newRawStopDistToFinal);
                }
            }

            const trainDistStr = (trainDistToFinal).toFixed(3);
            const rawStopDistStr = (rawStopDistToFinal).toFixed(3);

            console.log(`${String(rawStop).padEnd(16)} | ${String(rawStatus).padEnd(12)} | ${rawStopDistStr.padStart(15)} | ${trainDistStr.padStart(16)} | ${String(correctedStop).padEnd(16)} | ${correctedStatus}`);
        }

        console.log('\nValidation completed.');

    } catch (err) {
        console.error('Fatal error:', err.message);
        process.exitCode = 1;
    }
}

main();

export { LinearReferenceLoader, LinearReferenceEngine, ArrivalDetector };
