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

function formatStatus(status) {
	if (status === 'IN_TRANSIT_TO') return 'IN TRANSIT TO';
	if (status === 'STOPPED_AT') return 'STOPPED AT';
	return status || 'Unknown';
}

async function main() {
	console.log('\n' + '='.repeat(80));
	console.log('GTFS Realtime Linear Referencing Validation');
	console.log('='.repeat(80) + '\n');

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

		const feedFilePath = FILES.REALTIME_SAMPLE;
		const feedContent = fs.readFileSync(feedFilePath, 'utf-8');
		const gtfsRtFeed = JSON.parse(feedContent);

		const sampleVehicles = Array.isArray(gtfsRtFeed.entity)
			? gtfsRtFeed.entity
				.filter((entity) => entity.vehicle)
				.map((entity) => {
					const vehicle = entity.vehicle;
					return TrainPos.fromJson({
						id: entity.id,
						train: vehicle.vehicle,
						tripId: vehicle.trip?.tripId,
						latitude: vehicle.position?.latitude,
						longitude: vehicle.position?.longitude,
						status: vehicle.currentStatus,
						timestamp: vehicle.timestamp || gtfsRtFeed.header?.timestamp,
						nextStationId: vehicle.stopId,
					});
				})
				.filter(
					(vehicle) =>
						vehicle.tripId &&
						vehicle.nextStationId &&
						vehicle.latitude !== undefined &&
						vehicle.longitude !== undefined
				)
			: [];

		console.log(`Loaded ${sampleVehicles.length} vehicles from ${path.basename(feedFilePath)}\n`);

		console.log(
			'Train ID'.padEnd(12) +
			' | Raw stop'.padEnd(18) +
			' | Raw status'.padEnd(16) +
			' | Stop->Final(km)'.padStart(15) +
			' | Train->Final(km)'.padStart(16) +
			' | Corrected stop'.padEnd(18) +
			' | Corrected status'
		);
		console.log('='.repeat(132));

		sampleVehicles.forEach((vehicle) => {
			const corrected = detector.correctTrainPos(vehicle);
			const rawTrainId = vehicle.train && vehicle.train.id ? vehicle.train.id : vehicle.id || 'Unknown';
			const correctedStop = corrected ? corrected.nextStationId : 'N/A';
			const correctedStatus = corrected ? formatStatus(corrected.status) : 'N/A';

			const trip = loader.getTrip(vehicle.tripId);
			if (!trip || !trip.shapeId) return;
			const lineString = loader.getLineString(trip.shapeId);
			if (!lineString) return;
			const stopTimesForTrip = loader.getStopTimesForTrip(vehicle.tripId);
			if (!stopTimesForTrip || stopTimesForTrip.length === 0) return;

			const finalStopTimeEntry = stopTimesForTrip.reduce((max, st) =>
				st.stopSequence > max.stopSequence ? st : max
			);

			const vehicleProjection = engine.projectPointOnLine(
				{ latitude: vehicle.latitude, longitude: vehicle.longitude },
				lineString
			);
			const rawStopProjection = engine.getStopDistanceAlongRoute(vehicle.tripId, vehicle.nextStationId, lineString);
			const finalStopProjection = engine.getStopDistanceAlongRoute(vehicle.tripId, finalStopTimeEntry.stopId, lineString);

			if (!vehicleProjection || !rawStopProjection || !finalStopProjection) return;

			const stopToFinalKm = finalStopProjection.distanceAlongLine - rawStopProjection.distanceAlongLine;
			const trainToFinalKm = finalStopProjection.distanceAlongLine - vehicleProjection.distanceAlongLine;

			const stopToFinalStr = stopToFinalKm.toFixed(3);
			const trainToFinalStr = trainToFinalKm.toFixed(3);

			console.log(
				`${String(rawTrainId).padEnd(12)} | ${String(vehicle.nextStationId).padEnd(18)} | ${String(formatStatus(vehicle.status)).padEnd(16)} | ${stopToFinalStr.padStart(15)} | ${trainToFinalStr.padStart(16)} | ${String(correctedStop).padEnd(18)} | ${correctedStatus}`
			);
		});

		console.log('='.repeat(132));
	} catch (err) {
		console.error('Fatal error:', err.message);
		process.exitCode = 1;
	}
}

main();

export { LinearReferenceLoader, LinearReferenceEngine, ArrivalDetector };
