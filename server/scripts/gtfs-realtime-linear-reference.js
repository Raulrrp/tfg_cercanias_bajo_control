/**
 * GTFS Realtime Linear Referencing Engine
 * 
 * This script projects real-time vehicle positions onto GTFS static route geometries
 * using linear referencing to determine precise stop status (passed/approaching).
 * 
 * Dependencies: turf.js for geometric operations
 * 
 * Input: GTFS-RT JSON feed with vehicle position + trip_id + stop_id
 * Output: Enriched data with linear position along route + stop status
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';
import * as turf from '@turf/turf';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// Configuration
// ============================================================================

const DATA_DIR = path.resolve(__dirname, '../data_files');
const FILES = {
    STOPS: path.resolve(DATA_DIR, 'stations/stops.txt'),
    SHAPES: path.resolve(DATA_DIR, 'shapes/shapes.txt'),
    TRIPS: path.resolve(DATA_DIR, 'trips.txt'),
    STOP_TIMES: path.resolve(DATA_DIR, 'stop_times.txt'),
    REALTIME_SAMPLE: path.resolve(__dirname, '../../sample-realtime-data.json') // User's GTFS-RT feed
};

// Tolerance for point-on-line projection in kilometers
const PROJECTION_TOLERANCE_KM = 0.5;

// ============================================================================
// Data Loading and Caching
// ============================================================================

class GTFSDataStore {
    constructor() {
        this.stops = new Map();           // stop_id -> { stop_id, stop_name, stop_lat, stop_lon }
        this.shapes = new Map();          // shape_id -> [ { shape_pt_lat, shape_pt_lon, shape_pt_sequence, shape_dist_traveled } ]
        this.trips = new Map();           // trip_id -> { trip_id, route_id, shape_id }
        this.stopTimes = new Map();       // trip_id -> [ { stop_id, stop_sequence, shape_dist_traveled, ... } ]
        this.routeGeometries = new Map(); // shape_id -> turf LineString
    }

    /**
     * Load stops.txt and index by stop_id
     */
    loadStops(filePath) {
        console.log('[Data] Loading stops.txt...');
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const records = parse(fileContent, { columns: true, skip_empty_lines: true, trim: true });

        records.forEach((record) => {
            this.stops.set(record.stop_id, {
                stop_id: record.stop_id,
                stop_name: record.stop_name || '',
                stop_lat: parseFloat(record.stop_lat),
                stop_lon: parseFloat(record.stop_lon),
            });
        });

        console.log(`[Data] Loaded ${this.stops.size} stops.`);
    }

    /**
     * Load shapes.txt and group by shape_id
     * Expects: shape_id, shape_pt_lat, shape_pt_lon, shape_pt_sequence, [shape_dist_traveled]
     */
    loadShapes(filePath) {
        console.log('[Data] Loading shapes.txt...');
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const records = parse(fileContent, { columns: true, skip_empty_lines: true, trim: true });

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

        console.log(`[Data] Loaded ${this.shapes.size} unique shapes.`);
    }

    /**
     * Load trips.txt and index by trip_id
     * Extracts: trip_id -> shape_id mapping
     */
    loadTrips(filePath) {
        console.log('[Data] Loading trips.txt...');
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const records = parse(fileContent, { columns: true, skip_empty_lines: true, trim: true });

        records.forEach((record) => {
            this.trips.set(record.trip_id, {
                trip_id: record.trip_id,
                route_id: record.route_id,
                shape_id: record.shape_id || null,
            });
        });

        console.log(`[Data] Loaded ${this.trips.size} trips.`);
    }

    /**
     * Load stop_times.txt and group by trip_id
     * Preserves: stop_id, stop_sequence, shape_dist_traveled (if available)
     */
    loadStopTimes(filePath) {
        console.log('[Data] Loading stop_times.txt...');
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

        console.log(`[Data] Loaded stop_times for ${this.stopTimes.size} trips.`);
    }

    /**
     * Build and cache LineString geometries from shapes
     * Pre-computes all route geometries for fast lookups
     */
    buildRouteGeometries() {
        console.log('[Geometry] Building route LineStrings...');

        this.shapes.forEach((points, shapeId) => {
            if (points.length < 2) {
                console.warn(`[Geometry] Shape ${shapeId} has fewer than 2 points; skipping.`);
                return;
            }

            // Create GeoJSON coordinate array: [lon, lat] order (GeoJSON standard)
            const coordinates = points.map((p) => [p.shape_pt_lon, p.shape_pt_lat]);

            try {
                const lineString = turf.lineString(coordinates);
                this.routeGeometries.set(shapeId, lineString);
            } catch (err) {
                console.error(`[Geometry] Error building LineString for shape ${shapeId}:`, err.message);
            }
        });

        console.log(`[Geometry] Built ${this.routeGeometries.size} route geometries.`);
    }

    /**
     * Load all data from GTFS files
     */
    async loadAll() {
        try {
            this.loadStops(FILES.STOPS);
            this.loadShapes(FILES.SHAPES);
            this.loadTrips(FILES.TRIPS);
            this.loadStopTimes(FILES.STOP_TIMES);
            this.buildRouteGeometries();
            console.log('[Data] All GTFS data loaded successfully.\n');
        } catch (err) {
            console.error('[Data] Error loading GTFS files:', err.message);
            throw err;
        }
    }
}

// ============================================================================
// Linear Referencing Engine
// ============================================================================

class LinearReferenceEngine {
    constructor(dataStore) {
        this.dataStore = dataStore;
    }

    /**
     * Get the shape_id for a given trip_id from trips.txt
     * @param {string} tripId - Trip identifier
     * @returns {string|null} Shape ID or null if not found
     */
    getShapeIdFromTripId(tripId) {
        const trip = this.dataStore.trips.get(tripId);
        return trip ? trip.shape_id : null;
    }

    /**
     * Get stop coordinates (lat/lon) from stops.txt by stop_id
     * @param {string} stopId - Stop identifier
     * @returns {Object|null} { stop_lat, stop_lon } or null
     */
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
     * 
     * @param {Object} point - { latitude, longitude }
     * @param {Object} lineString - Turf LineString geometry
     * @returns {Object|null} { distanceAlongLine (km), projectedPoint (turf Point) }
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

    /**
     * Get the distance of a stop along the route geometry (shape).
     * 
     * Priority:
     * 1. Use shape_dist_traveled from stop_times.txt if available (most accurate)
     * 2. Otherwise, project the stop's coordinates onto the route LineString
     * 
     * @param {string} tripId - Trip identifier
     * @param {string} stopId - Stop identifier
     * @param {Object} lineString - Turf LineString geometry of the route
     * @returns {Object|null} { distanceAlongLine (km), source (string: 'shapeDist' or 'projection') }
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
     * Logic:
     * - If train distance >= stop distance: stop has been PASSED
     * - If train distance < stop distance: stop is APPROACHING
     * 
     * Optional: Add tolerance threshold (e.g., within 100m of the stop)
     * 
     * @param {number} trainDistanceKm - Vehicle's distance along line (km)
     * @param {number} stopDistanceKm - Stop's distance along line (km)
     * @param {number} toleranceKm - Distance tolerance (default 0.1 km = 100m)
     * @returns {string} Status: 'PASSED' | 'AT_STOP' | 'APPROACHING'
     */
    determineStopStatus(trainDistanceKm, stopDistanceKm, toleranceKm = 0.1) {
        const diff = trainDistanceKm - stopDistanceKm;

        if (diff >= 0 && diff <= toleranceKm) {
            return 'AT_STOP';
        } else if (diff > toleranceKm) {
            return 'PASSED';
        } else {
            return 'APPROACHING';
        }
    }

    /**
     * Process a single GTFS-RT vehicle and project it on its route
     * 
     * @param {Object} vehicleData - { tripId, stopId, latitude, longitude, timestamp, vehicleId }
     * @returns {Object|null} Enriched vehicle data with linear reference info
     */
    processVehicle(vehicleData) {
        const { tripId, stopId, latitude, longitude, timestamp, vehicleId } = vehicleData;

        // Step 1: Link trip to shape
        const shapeId = this.getShapeIdFromTripId(tripId);
        if (!shapeId) {
            console.warn(`[Process] Trip ${tripId} has no associated shape_id.`);
            return null;
        }

        // Step 2: Get the route geometry (LineString)
        const lineString = this.dataStore.routeGeometries.get(shapeId);
        if (!lineString) {
            console.warn(`[Process] Shape ${shapeId} not found in route geometries.`);
            return null;
        }

        // Step 3 & 4: Project vehicle and stop positions onto the line
        const vehicleProjection = this.projectPointOnLine({ latitude, longitude }, lineString);
        if (!vehicleProjection) {
            console.warn(`[Process] Could not project vehicle ${vehicleId} on line.`);
            return null;
        }

        const stopProjection = this.getStopDistanceAlongRoute(tripId, stopId, lineString);
        if (!stopProjection) {
            console.warn(`[Process] Could not determine stop distance for stop ${stopId}.`);
            return null;
        }

        // Step 5: Compare distances and determine status
        const stopStatus = this.determineStopStatus(
            vehicleProjection.distanceAlongLine,
            stopProjection.distanceAlongLine
        );

        // Get stop info for output
        const stopInfo = this.getStopCoordinates(stopId);

        return {
            vehicleId,
            tripId,
            stopId,
            stopName: stopInfo ? stopInfo.stop_name : 'Unknown',
            timestamp,
            gpsPosition: {
                latitude,
                longitude,
            },
            linearReferencing: {
                shapeId,
                vehicleDistanceAlongRoute: vehicleProjection.distanceAlongLine,
                stopDistanceAlongRoute: stopProjection.distanceAlongLine,
                distanceDifference: vehicleProjection.distanceAlongLine - stopProjection.distanceAlongLine,
                stopStatus,
                distanceSource: stopProjection.source,
                projectedVehicleLocation: vehicleProjection.location,
            },
        };
    }
}

// ============================================================================
// Sample Processing and Output
// ============================================================================

async function main() {
    console.log('='.repeat(80));
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
            const feedFilePath = path.resolve(__dirname, '../../sample-realtime-feed.json');
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
                    `[Data] Loaded ${sampleVehicles.length} vehicles from sample-realtime-feed.json\n`
                );
            }
        } catch (err) {
            console.warn('[Data] Could not load sample-realtime-feed.json:', err.message);
            console.warn('[Data] Using empty vehicle list.\n');
        }

        // Diagnostic: Show which sample trips have valid shapes
        console.log('\n' + '='.repeat(80));
        console.log('Diagnostic: Trip-Shape Mapping');
        console.log('='.repeat(80));
        const uniqueTripIds = [...new Set(sampleVehicles.map((v) => v.tripId))];
        uniqueTripIds.forEach((tripId) => {
            const tripData = dataStore.trips.get(tripId);
            if (tripData) {
                console.log(
                    `Trip ${tripId}: shape_id=${tripData.shape_id || 'NULL (no shape assigned)'}`
                );
            } else {
                console.log(`Trip ${tripId}: NOT FOUND in trips.txt`);
            }
        });

        console.log(
            `\\nTotal trips with valid shape_id in dataset: ${Array.from(dataStore.trips.values()).filter((t) => t.shape_id).length}`
        );
        console.log('='.repeat(80) + '\n');

        console.log('\n' + '='.repeat(80));
        console.log('Processing Real-Time Vehicles');
        console.log('='.repeat(80) + '\n');

        const results = [];
        sampleVehicles.forEach((vehicle) => {
            const result = lrEngine.processVehicle(vehicle);
            if (result) {
                results.push(result);
                console.log(`✓ Vehicle ${result.vehicleId}:`);
                console.log(
                    `  Trip: ${result.tripId} | Stop: ${result.stopId} (${result.stopName})`
                );
                console.log(
                    `  Vehicle distance: ${result.linearReferencing.vehicleDistanceAlongRoute.toFixed(2)} km`
                );
                console.log(
                    `  Stop distance: ${result.linearReferencing.stopDistanceAlongRoute.toFixed(2)} km`
                );
                console.log(
                    `  Difference: ${result.linearReferencing.distanceDifference.toFixed(2)} km`
                );
                console.log(`  Status: ${result.linearReferencing.stopStatus}\n`);
            }
        });

        // Output summary
        console.log('='.repeat(80));
        console.log('Summary');
        console.log('='.repeat(80));
        console.log(`Total vehicles processed: ${results.length}`);
        console.log(
            `PASSED: ${results.filter((r) => r.linearReferencing.stopStatus === 'PASSED').length}`
        );
        console.log(
            `AT_STOP: ${results.filter((r) => r.linearReferencing.stopStatus === 'AT_STOP').length}`
        );
        console.log(
            `APPROACHING: ${results.filter((r) => r.linearReferencing.stopStatus === 'APPROACHING').length}`
        );

        // Output detailed results as JSON
        console.log('\n' + '='.repeat(80));
        console.log('Detailed Results (JSON)');
        console.log('='.repeat(80));
        console.log(JSON.stringify(results, null, 2));

    } catch (err) {
        console.error('Fatal error:', err.message);
        process.exitCode = 1;
    }
}

// Run the main function
main();

// Export for use as a module
export { GTFSDataStore, LinearReferenceEngine };
