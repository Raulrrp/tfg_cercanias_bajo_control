/**
 * From a GTFS train position snapshot computes the distance
 * between each train and its final stop, and the distance
 * between the train's current stop and the final stop, to
 * determine if the train has already passed the stop or is
 * approaching it using linear referencing
 */

import fs from 'fs';
import url from 'url';
import path from 'path';
import { parse } from 'csv-parse/sync';
import * as turf from '@turf/turf';

const __filename = url.fileURLToPath(import.meta.url); 
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data_files');
const FILES = {
    // Warning: Uses stops.txt
    STOPS: path.resolve(DATA_DIR, 'stations/stops.txt'),
    SHAPES: path.resolve(DATA_DIR, 'shapes/shapes.txt'),
    TRIPS: path.resolve(DATA_DIR, 'trips.txt'),
    STOP_TIMES: path.resolve(DATA_DIR, 'stop_times.txt'),
    REALTIME_SAMPLE: path.resolve(DATA_DIR, 'gtfs_train_samples/sample-realtime-feed3.json') // User's GTFS-RT feed
};

// Tolerance for point-on-line projection in kilometers
const PROJECTION_TOLERANCE_KM = 0.2;

// Data loading

class GTFSDataStore {
    constructor() {
        this.stops = new Map();           // stop_id -> { stop_id, stop_name, stop_lat, stop_lon }
        this.shapes = new Map();          // shape_id -> [ { shape_pt_lat, shape_pt_lon, shape_pt_sequence, shape_dist_traveled } ]
        this.trips = new Map();           // trip_id -> { trip_id, route_id, shape_id }
        this.stopTimes = new Map();       // trip_id -> [ { stop_id, stop_sequence, shape_dist_traveled, ... } ]
        this.routeGeometries = new Map(); // shape_id -> turf LineString
    }

    // Load stops.txt and index by stop_id

    loadStops(filePath) {
        console.log('Loading stops.txt...');
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const records = parse(fileContent, {
            columns: true,
            skip_empty_lines: true,
            trim: true
        });

        records.forEach((record) => {
            this.stops.set(record.stop_id, {
                stop_id: record.stop_id,
                stop_name: record.stop_name || '',
                stop_lat: parseFloat(record.stop_lat),
                stop_lon: parseFloat(record.stop_lon),
            });
        });

        console.log(`Loaded ${this.stops.size} stops.`);
    }

    // Load shapes.txt and group by shape_id
    // Expects: shape_id, shape_pt_lat, shape_pt_lon, shape_pt_sequence, [shape_dist_traveled]
     
    loadShapes(filePath) {
        console.log('Loading shapes.txt...');
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const records = parse(fileContent,
            {   columns: true,
                skip_empty_lines: true,
                trim: true,
                // shapes.txt has a BOM, hidden bit that
                // can cause reading problems
                bom: true,
            });

        records.forEach((record) => {
            const shapeId = record.shape_id;

            if (!this.shapes.has(shapeId)) {
                this.shapes.set(shapeId, []);
            }

            this.shapes.get(shapeId).push({
                shape_pt_lat: parseFloat(record.shape_pt_lat),
                shape_pt_lon: parseFloat(record.shape_pt_lon),
                shape_pt_sequence: parseInt(record.shape_pt_sequence, 10),
                shape_dist_traveled: record.shape_dist_traveled
                    ? parseFloat(record.shape_dist_traveled)
                    : null,
            });
        });

        // Sort each shape by sequence
        this.shapes.forEach((points) => {
            points.sort((a, b) => a.shape_pt_sequence - b.shape_pt_sequence);
        });

        console.log(`Loaded ${this.shapes.size} unique shapes.`);
    }

    // Load trips.txt and index by trip_id
    // Extracts: trip_id -> shape_id mapping
    loadTrips(filePath) {
        console.log('Loading trips.txt...');
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const records = parse(fileContent, { columns: true, skip_empty_lines: true, trim: true });

        records.forEach((record) => {
            this.trips.set(record.trip_id, {
                trip_id: record.trip_id,
                route_id: record.route_id,
                shape_id: record.shape_id || null,
            });
        });

        console.log(`Loaded ${this.trips.size} trips.`);
    }

    // Load stop_times.txt and group by trip_id
    // Preserves: stop_id, stop_sequence, shape_dist_traveled
    loadStopTimes(filePath) {
        console.log('Loading stop_times.txt...');
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const records = parse(fileContent, { columns: true, skip_empty_lines: true, trim: true });

        records.forEach((record) => {
            const tripId = record.trip_id;

            if (!this.stopTimes.has(tripId)) {
                this.stopTimes.set(tripId, []);
            }

            this.stopTimes.get(tripId).push({
                stop_id: record.stop_id,
                stop_sequence: parseInt(record.stop_sequence, 10),
                shape_dist_traveled: record.shape_dist_traveled
                    ? parseFloat(record.shape_dist_traveled)
                    : null,
            });
        });

        // Sort each trip's stops by sequence
        this.stopTimes.forEach((stops) => {
            stops.sort((a, b) => a.stop_sequence - b.stop_sequence);
        });

        console.log(`Loaded stop_times for ${this.stopTimes.size} trips.`);
    }

    // Build and cache LineString geometries from shapes
    // Pre-computes all route geometries for fast lookups
     
    buildRouteGeometries() {
        console.log('Building route LineStrings...');

        // when used in maps forEach(value, key)
        this.shapes.forEach((points, shapeId) => {

            // Create GeoJSON coordinate array: [lon, lat] order (GeoJSON standard)
            const coordinates = points.map((p) => [p.shape_pt_lon, p.shape_pt_lat]);

            try {
                // from an array of coordinates creates a LineString
                const lineString = turf.lineString(coordinates);
                this.routeGeometries.set(shapeId, lineString);
            } catch (err) {
                console.error(`Error building LineString for shape ${shapeId}:`, err.message);
            }
        });

        console.log(`Built ${this.routeGeometries.size} route geometries.`);
    }

    // Load all needed data from GTFS files
    async loadAll() {
        try {
            this.loadStops(FILES.STOPS);
            this.loadShapes(FILES.SHAPES);
            this.loadTrips(FILES.TRIPS);
            this.loadStopTimes(FILES.STOP_TIMES);
            this.buildRouteGeometries();
            console.log('All GTFS data loaded successfully.\n');
        } catch (err) {
            console.error('Error loading GTFS files:', err.message);
            throw err;
        }
    }
}

// Linear referencing engine

class LinearReferenceEngine {
    constructor(dataStore) {
        this.dataStore = dataStore;
    }

    // Gets the shape_id from a given trip_id using trips.txt
    getShapeIdFromTripId(tripId) {
        const trip = this.dataStore.trips.get(tripId);
        return trip ? trip.shape_id : null;
    }

    // Get stop coordinates (lat/lon) from stops.txt by stop_id
    getStopCoordinates(stopId) {
        const stop = this.dataStore.stops.get(stopId);
        return stop
            ? { stop_lat: stop.stop_lat, stop_lon: stop.stop_lon, stop_name: stop.stop_name }
            : null;
    }

    /**
     * Project a point onto a LineString and return distance along the line from start.
     * 
     * This function uses Turf.js's nearestPointOnLine to find the closest point
     * on the route geometry and directly uses the `location` property which provides
     * the cumulative distance along the line from the start to the projected point.
     */
    projectPointOnLine(point, lineString) {
        if (!lineString || !lineString.geometry.coordinates) {
            return null;
        }

        try {
            // Create a Turf point from vehicle coordinates [lon, lat]
            const geoPoint = turf.point([point.longitude, point.latitude]);

            // Find the nearest point on the line.
            // snappedPoint.properties.location already contains the cumulative distance
            // in kilometers from the start of the line to the snapped point.
            const snappedPoint = turf.nearestPointOnLine(lineString, geoPoint);

            // Extract the distance along the line (already calculated by Turf.js)
            const distanceAlongLine = snappedPoint.properties.location;

            return {
                distanceAlongLine,
                projectedPoint: snappedPoint,
                location: {
                    latitude: snappedPoint.geometry.coordinates[1],
                    longitude: snappedPoint.geometry.coordinates[0],
                },
            };
        } catch (err) {
            console.error('[LinearRef] Error projecting point on line:', err.message);
            return null;
        }
    }

    //I am here

    /**
     * Get the distance of a stop along the route geometry (shape).
     * 
     * Priority:
     * 1. Use shape_dist_traveled from stop_times.txt if available (most accurate)
     * 2. Otherwise, project the stop's coordinates onto the route LineString
     */
    getStopDistanceAlongRoute(tripId, stopId, lineString) {
        // First, check if stop_times.txt has shape_dist_traveled
        const stopTimesForTrip = this.dataStore.stopTimes.get(tripId);
        if (stopTimesForTrip) {
            const stopTimeEntry = stopTimesForTrip.find((st) => st.stop_id === stopId);
            if (stopTimeEntry && stopTimeEntry.shape_dist_traveled !== null) {
                return {
                    distanceAlongLine: stopTimeEntry.shape_dist_traveled,
                    source: 'shapeDist',
                };
            }
        }

        // Fallback: project stop coordinates onto the line
        const stopCoords = this.getStopCoordinates(stopId);
        if (!stopCoords) {
            return null;
        }

        const projection = this.projectPointOnLine(
            { latitude: stopCoords.stop_lat, longitude: stopCoords.stop_lon },
            lineString
        );

        return projection
            ? { distanceAlongLine: projection.distanceAlongLine, source: 'projection' }
            : null;
    }

    /**
     * Determine if a stop has been passed or is being approached by a vehicle.
     * 
     * Uses absolute distance-to-final-stop metric (handles negative values):
     * - If |train dist to final - stop dist to final| <= tolerance: AT_STOP
     * - If |train dist to final| < |stop dist to final|: PASSED (train is closer to end)
     * - Else: APPROACHING (stop is closer to end)
     */
    determineStopStatus(trainDistanceToFinalKm, stopDistanceToFinalKm, toleranceKm = 0.2) {
        const trainAbsDist = Math.abs(trainDistanceToFinalKm);
        const stopAbsDist = Math.abs(stopDistanceToFinalKm);
        const absDiff = Math.abs(trainAbsDist - stopAbsDist);

        // If within tolerance: AT_STOP
        if (absDiff <= toleranceKm) {
            return 'AT_STOP';
        } 
        // If train is closer to final stop (in absolute terms): PASSED
        else if (trainAbsDist < stopAbsDist) {
            return 'PASSED';
        } 
        // Otherwise: APPROACHING
        else {
            return 'APPROACHING';
        }
    }

    /**
     * Process a single GTFS-RT vehicle and compare distances to final stop
     * 
     * @param {Object} vehicleData - { tripId, stopId, latitude, longitude, timestamp, vehicleId }
     * @returns {Object|null} Enriched vehicle data with linear reference info
     */
    processVehicle(vehicleData) {
        const { tripId, stopId, latitude, longitude, timestamp, vehicleId } = vehicleData;
        
        // Step 1: Link trip to shape
        const shapeId = this.getShapeIdFromTripId(tripId);
        if (!shapeId) {
            return null;
        }

        // Step 2: Get the route geometry (LineString)
        const lineString = this.dataStore.routeGeometries.get(shapeId);
        if (!lineString) {
            return null;
        }

        // Step 3: Get all stops for this trip and find the final stop
        const stopTimesForTrip = this.dataStore.stopTimes.get(tripId);
        if (!stopTimesForTrip || stopTimesForTrip.length === 0) {
            return null;
        }

        // Final stop is the one with maximum stop_sequence
        const finalStop = stopTimesForTrip.reduce((max, st) => 
            st.stop_sequence > max.stop_sequence ? st : max
        );

        // Step 4: Project vehicle position onto the line
        const vehicleProjection = this.projectPointOnLine({ latitude, longitude }, lineString);
        if (!vehicleProjection) {
            return null;
        }

        // Step 5: Get current stop distance
        const currentStopProjection = this.getStopDistanceAlongRoute(tripId, stopId, lineString);
        if (!currentStopProjection) {
            return null;
        }

        // Step 6: Get final stop distance
        const finalStopProjection = this.getStopDistanceAlongRoute(tripId, finalStop.stop_id, lineString);
        if (!finalStopProjection) {
            return null;
        }

        // Step 7: Calculate distances from train to final stop and from current stop to final stop
        const trainDistanceToFinal = finalStopProjection.distanceAlongLine - vehicleProjection.distanceAlongLine;
        const currentStopDistanceToFinal = finalStopProjection.distanceAlongLine - currentStopProjection.distanceAlongLine;

        // Step 8: Determine stop status (PASSED, AT_STOP, or APPROACHING)
        // Use distance-to-final-stop for correct classification
        const stopStatus = this.determineStopStatus(
            trainDistanceToFinal,
            currentStopDistanceToFinal
        );

        // Get stop info for output
        const stopInfo = this.getStopCoordinates(stopId);
        const finalStopInfo = this.getStopCoordinates(finalStop.stop_id);

        return {
            vehicleId,
            tripId,
            currentStopId: stopId,
            currentStopName: stopInfo ? stopInfo.stop_name : 'Unknown',
            finalStopId: finalStop.stop_id,
            finalStopName: finalStopInfo ? finalStopInfo.stop_name : 'Unknown',
            timestamp,
            stopStatus,
            gpsPosition: {
                latitude,
                longitude,
            },
            linearReferencing: {
                shapeId,
                vehicleDistanceAlongRoute: vehicleProjection.distanceAlongLine,
                currentStopDistanceAlongRoute: currentStopProjection.distanceAlongLine,
                finalStopDistanceAlongRoute: finalStopProjection.distanceAlongLine,
                trainDistanceToFinalStop: trainDistanceToFinal,
                currentStopDistanceToFinalStop: currentStopDistanceToFinal,
                trainAlreadyPassedCurrentStop: stopStatus === 'PASSED',
                projectedVehicleLocation: vehicleProjection.location,
            },
        };
    }
}

// Sample processing output

async function main() {
    console.log('\n' + '='.repeat(80));
    console.log('GTFS Realtime Linear Referencing Engine');
    console.log('='.repeat(80) + '\n');

    // Initialize data store
    const dataStore = new GTFSDataStore();

    try {
        // Load all GTFS static data
        await dataStore.loadAll();

        // Initialize linear reference engine
        const lrEngine = new LinearReferenceEngine(dataStore);

        // Load sample GTFS-RT vehicles from the feed file
        let sampleVehicles = [];
        try {
            const feedFilePath = FILES.REALTIME_SAMPLE;
            const feedContent = fs.readFileSync(feedFilePath, 'utf-8');
            const gtfsRtFeed = JSON.parse(feedContent);

            if (gtfsRtFeed.entity && Array.isArray(gtfsRtFeed.entity)) {
                sampleVehicles = gtfsRtFeed.entity
                    .filter((entity) => entity.vehicle) // Only vehicle entities
                    .map((entity) => {
                        const vehicle = entity.vehicle;
                        return {
                            vehicleId: vehicle.vehicle?.id || entity.id,
                            tripId: vehicle.trip?.tripId,
                            stopId: vehicle.stopId,
                            latitude: vehicle.position?.latitude,
                            longitude: vehicle.position?.longitude,
                            timestamp: vehicle.timestamp || gtfsRtFeed.header?.timestamp,
                        };
                    })
                    .filter(
                        (v) =>
                            v.tripId && v.stopId && v.latitude !== undefined && v.longitude !== undefined
                    );

                console.log(
                    `Loaded ${sampleVehicles.length} vehicles from ${path.basename(feedFilePath)}\n`
                );
            }
        } catch (err) {
            console.warn(`Could not load ${path.basename(FILES.REALTIME_SAMPLE)}:`, err.message);
            console.warn('Using empty vehicle list.\n');
        }

        // Diagnostic: Show which sample trips have valid shapes
        const uniqueTripIds = [...new Set(sampleVehicles.map((v) => v.tripId))];
        const tripsWithShapes = uniqueTripIds.filter(t => dataStore.trips.get(t)?.shape_id).length;
        console.log(`\nDiagnostic: ${tripsWithShapes}/${uniqueTripIds.length} trips have valid shapes`);


        console.log('\n' + '='.repeat(80));
        console.log('Parada Actual'.padEnd(25) + ' → Parada Final'.padEnd(25) + ' | Distancia Tren | Distancia Parada | Estado');
        console.log('='.repeat(80));
        const results = [];
        sampleVehicles.forEach((vehicle) => {
            const result = lrEngine.processVehicle(vehicle);
            if (result) {
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
            }
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

// Export for use as a module
export { GTFSDataStore, LinearReferenceEngine };
