/**
 * GTFS Realtime Linear Referencing Script
 * 
 * Simple test harness that validates arrival detection using linear referencing.
 * Loads sample GTFS-RT data and determines if trains have passed stops or are approaching.
 * 
 * This script orchestrates:
 * - Existing domain repos (loads static GTFS files)
 * - LinearReferenceLoader (indexes domain objects and builds geometries)
 * - LinearReferenceEngine (computes geometric distances)
 * - ArrivalDetector (classifies train status)
 */

import fs from 'fs';
import url from 'url';
import path from 'path';
import { fetchStations } from '../src/data/files/station-repo-txt.js';
import { fetchShapes } from '../src/data/files/shape-repo.js';
import { fetchTrips } from '../src/data/files/trip-repo.js';
import { TrainPos } from '../../common/models/TrainPos.js';
import { LinearReferenceLoader } from '../src/services/linear-reference-loader.js';
import { LinearReferenceEngine } from '../src/services/linear-reference-engine.js';
import { ArrivalDetector } from '../src/services/arrival-detector-service.js';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data_files');

const FILES = {
    REALTIME_SAMPLE: path.resolve(DATA_DIR, 'gtfs_train_samples/train-sample3.json'),
};

/**
 * Main entry point
 */
async function main() {
    console.log('\n' + '='.repeat(80));
    console.log('GTFS Realtime Linear Referencing Engine - Sample Data Validator');
    console.log('='.repeat(80) + '\n');

    try {
        // Load domain objects using existing repos
        console.log('Loading GTFS domain objects from existing repos...\n');
        const [stations, shapes, trips] = await Promise.all([
            fetchStations(),
            fetchShapes(),
            fetchTrips(),
        ]);

        // Initialize loader with domain objects
        const loader = new LinearReferenceLoader();
        await loader.initialize(stations, shapes, trips);

        // Initialize engine and detector
        const engine = new LinearReferenceEngine(loader);
        const detector = new ArrivalDetector(loader, engine);

        // Load sample GTFS-RT vehicles from the feed file
        let sampleVehicles = [];
        try {
            const feedFilePath = FILES.REALTIME_SAMPLE;
            const feedContent = fs.readFileSync(feedFilePath, 'utf-8');
            const gtfsRtFeed = JSON.parse(feedContent);

            // If the gtfs file has the expected structure
            if (gtfsRtFeed.entity && Array.isArray(gtfsRtFeed.entity)) {
                sampleVehicles = gtfsRtFeed.entity
                    .filter((entity) => entity.vehicle) // Only vehicle entities
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
                    // deletes every entry that doesn't have the required fields
                    .filter(
                        (v) =>
                            v.tripId &&
                            v.nextStationId &&
                            v.latitude !== undefined &&
                            v.longitude !== undefined
                    );

                console.log(
                    `Loaded ${sampleVehicles.length} vehicles from ${path.basename(feedFilePath)}\n`
                );
            }
        } catch (err) {
            console.warn(`Could not load ${path.basename(FILES.REALTIME_SAMPLE)}:`, err.message);
            console.warn('Using empty vehicle list.\n');
        }

        // Process vehicles and display results
        console.log('\n' + '='.repeat(80));
        console.log('Parada Actual'.padEnd(25) + ' → Parada Final'.padEnd(25) + ' | Distancia Tren | Distancia Parada | Estado');
        console.log('='.repeat(80));

        const results = [];
        sampleVehicles.forEach((vehicle) => {
            const result = detector.processVehicle(vehicle);
            if (!result) return;
            results.push(result);
            const trainDist = result.linearReferencing.trainDistanceToFinalStop.toFixed(3);
            const stopDist = result.linearReferencing.currentStopDistanceToFinalStop.toFixed(3);
            const statusDisplay = result.stopStatus === 'PASSED'
                ? '✓ PASÓ'
                : result.stopStatus === 'AT_STOP'
                    ? '● EN PARADA'
                    : '→ ACERCÁNDOSE';

            console.log(
                `${result.currentStopName.padEnd(25)} → ${result.finalStopName.padEnd(25)} | Tren: ${trainDist.padStart(7)} km | Parada: ${stopDist.padStart(7)} km | ${statusDisplay}`
            );
        });

        // Output summary
        console.log('='.repeat(80));
        console.log(`Total processed: ${results.length} | Passed: ${results.filter((r) => r.stopStatus === 'PASSED').length} | At Stop: ${results.filter((r) => r.stopStatus === 'AT_STOP').length} | Approaching: ${results.filter((r) => r.stopStatus === 'APPROACHING').length}`);
        console.log('='.repeat(80));

    } catch (err) {
        console.error('Fatal error:', err.message);
        process.exitCode = 1;
    }
}

// Run the main function
main();

// Export services for use as modules
export { LinearReferenceLoader, LinearReferenceEngine, ArrivalDetector };
