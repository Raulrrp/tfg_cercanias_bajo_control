import * as turf from '@turf/turf';
import fs from 'fs/promises';
import path from 'path';
import url from 'url';
import { parse } from 'csv-parse/sync';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

/**
 * Service that indexes domain objects and builds data structures for linear referencing
 * Accepts domain objects from repos and prepares optimized lookups and geometries
 */
export class LinearReferenceLoader {
    constructor() {
        // Indexed data stores for fast lookups (keyed by domain object IDs)
        this.stationsByIdMap = new Map();      // station.id -> Station domain object
        this.shapesByIdMap = new Map();        // shape.id -> Shape domain object
        this.tripsById = new Map();            // trip.id -> Trip domain object
        this.stopTimesByTripId = new Map();    // trip.id -> [{ stopId, stopSequence, shapeDistTraveled }, ...]
        this.routeGeometries = new Map();      // shape.id -> turf LineString
    }

    /**
     * Initialize with domain objects from repos
     */
    async initialize(stations, shapes, trips) {
        try {
            console.log('Initializing LinearReferenceLoader with domain objects...');
            
            // Index stations by ID
            stations.forEach((station) => {
                this.stationsByIdMap.set(station.id, station);
            });
            console.log(`Indexed ${this.stationsByIdMap.size} stations.`);

            // Index shapes by ID
            shapes.forEach((shape) => {
                this.shapesByIdMap.set(shape.id, shape);
            });
            console.log(`Indexed ${this.shapesByIdMap.size} shapes.`);

            // Index trips by ID
            trips.forEach((trip) => {
                this.tripsById.set(trip.id, trip);
            });
            console.log(`Indexed ${this.tripsById.size} trips.`);

            // Load stop_times separately (raw CSV data, as no domain model exists yet)
            await this.loadStopTimes();

            // Build route geometries from Shape domain objects
            this.buildRouteGeometries();
            
            console.log('LinearReferenceLoader initialized successfully.\n');
        } catch (err) {
            console.error('Error initializing LinearReferenceLoader:', err.message);
            throw err;
        }
    }

    /**
     * Load stop_times.txt and index by trip_id
     * Returns: trip_id -> [{ stopId, stopSequence, shapeDistTraveled }, ...]
     */
    async loadStopTimes() {
        try {
            console.log('Loading stop_times.txt...');
            const stopTimesPath = path.resolve(__dirname, '../../data_files/stop_times.txt');
            const content = await fs.readFile(stopTimesPath, 'utf-8');
            
            const records = parse(content, {
                columns: true,
                skip_empty_lines: true,
                trim: true,
            });

            records.forEach((record) => {
                const tripId = record.trip_id;
                if (!this.stopTimesByTripId.has(tripId)) {
                    this.stopTimesByTripId.set(tripId, []);
                }

                this.stopTimesByTripId.get(tripId).push({
                    stopId: record.stop_id,
                    stopSequence: parseInt(record.stop_sequence, 10),
                    shapeDistTraveled: record.shape_dist_traveled ? parseFloat(record.shape_dist_traveled) : null,
                });
            });

            // Sort each trip's stops by sequence
            this.stopTimesByTripId.forEach((stops) => {
                stops.sort((a, b) => a.stopSequence - b.stopSequence);
            });

            console.log(`Loaded stop_times for ${this.stopTimesByTripId.size} trips.`);
        } catch (err) {
            console.error('Error loading stop_times.txt:', err.message);
            throw err;
        }
    }

    /**
     * Build and cache LineString geometries from Shape domain objects
     * Pre-computes all route geometries for fast lookups
     */
    buildRouteGeometries() {
        console.log('Building route LineStrings from domain objects...');

        this.shapesByIdMap.forEach((shape) => {
            // Create GeoJSON coordinate array: [lon, lat] order (GeoJSON standard)
            const coordinates = shape.shapePoints.map((p) => [p.longitude, p.latitude]);

            try {
                const lineString = turf.lineString(coordinates);
                this.routeGeometries.set(shape.id, lineString);
            } catch (err) {
                console.error(`Error building LineString for shape ${shape.id}:`, err.message);
            }
        });

        console.log(`Built ${this.routeGeometries.size} route geometries.`);
    }

    /**
     * Getters for indexed data
     */
    getStation(stationId) {
        const directStation = this.stationsByIdMap.get(stationId) || this.stationsByIdMap.get(String(stationId));
        if (directStation) {
            return directStation;
        }

        // GTFS-RT may send zero-padded stop IDs (e.g., "05451") while StationMapper stores numeric IDs.
        const numericId = Number.parseInt(String(stationId), 10);
        if (Number.isNaN(numericId)) {
            return null;
        }

        return this.stationsByIdMap.get(numericId) || this.stationsByIdMap.get(String(numericId)) || null;
    }

    getShape(shapeId) {
        return this.shapesByIdMap.get(shapeId);
    }

    getTrip(tripId) {
        return this.tripsById.get(tripId);
    }

    getStopTimesForTrip(tripId) {
        return this.stopTimesByTripId.get(tripId);
    }

    getLineString(shapeId) {
        return this.routeGeometries.get(shapeId);
    }
}
