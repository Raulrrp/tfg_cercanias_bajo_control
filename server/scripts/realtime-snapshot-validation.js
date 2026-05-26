import fs from 'fs';
import path from 'path';
import url from 'url';

import { fetchStations } from '../src/data/files/station-repo-txt.js';
import { fetchShapes } from '../src/data/files/shape-repo.js';
import { fetchTrips } from '../src/data/files/trip-repo.js';
import { TrainPos } from '@tfg_cercanias_bajo_control/common/models/TrainPos.js';
import { LinearReferenceLoader } from '../src/services/linear-reference-loader.js';
import { LinearReferenceEngine } from '../src/services/linear-reference-engine.js';
import { ArrivalDetector } from '../src/services/arrival-detector-service.js';
import { collectStoppedArrivals } from '../src/services/realtime-service.js';
import { getUrbanZonesMap } from '../src/services/urban-zones-service.js';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data_files');

const resolveSnapshotPath = (relativePaths) => {
    for (const relativePath of relativePaths) {
        const candidatePath = path.resolve(DATA_DIR, relativePath);
        if (fs.existsSync(candidatePath)) {
            return candidatePath;
        }
    }

    throw new Error(`Snapshot file not found. Tried: ${relativePaths.join(', ')}`);
};

const SNAPSHOT_1_PATH = resolveSnapshotPath([
    'gtfs_train_samples/train-snapshot1.json',
]);

const SNAPSHOT_2_PATH = resolveSnapshotPath([
    'gtfs_train_samples/train-snapshot2.json',
]);

const parseSnapshot = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf-8'));

const loadCorrectedTrains = (snapshot, detector) => {
    return (snapshot.entity ?? [])
        .filter((entity) => entity.vehicle?.position)
        .map((entity) => {
            const vehicle = entity.vehicle;

            return TrainPos.fromJson({
                id: entity.id,
                train: vehicle.vehicle,
                tripId: vehicle.trip?.tripId,
                latitude: vehicle.position?.latitude,
                longitude: vehicle.position?.longitude,
                status: vehicle.currentStatus,
                timestamp: vehicle.timestamp || snapshot.header?.timestamp,
                nextStationId: vehicle.stopId,
            });
        })
        .map((train) => detector.correctTrainPos(train) ?? train);
};

const getTrainKey = (train) => String(train?.id);

const getStoppedTrainMap = (trains) => {
    return new Map(
        trains
            .filter((train) => String(train?.status ?? '').trim() === 'STOPPED_AT')
            .map((train) => [getTrainKey(train), train]),
    );
};

async function main() {
    const snapshot1 = parseSnapshot(SNAPSHOT_1_PATH);
    const snapshot2 = parseSnapshot(SNAPSHOT_2_PATH);

    const [stations, shapes, trips] = await Promise.all([
        fetchStations(),
        fetchShapes(),
        fetchTrips(),
    ]);

    const loader = new LinearReferenceLoader();
    await loader.initialize(stations, shapes, trips);

    const engine = new LinearReferenceEngine(loader);
    const detector = new ArrivalDetector(loader, engine);

    const trains1 = loadCorrectedTrains(snapshot1, detector);
    const trains2 = loadCorrectedTrains(snapshot2, detector);

    const stoppedTrains1 = getStoppedTrainMap(trains1);
    const urbanZonesById = await getUrbanZonesMap();
    const { arrivalsToStore } = await collectStoppedArrivals({
        trains: trains2,
        updates: [],
        trips,
        urbanZonesById,
        previousStoppedTrains: stoppedTrains1,
    });

    console.log(JSON.stringify(arrivalsToStore.map((arrival) => arrival.toJson()), null, 2));
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});