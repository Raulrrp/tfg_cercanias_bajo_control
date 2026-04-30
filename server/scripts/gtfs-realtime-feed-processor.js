/**
 * GTFS-RT Feed Processor
 * 
 * Wrapper utility to process complete GTFS-RT feeds and output enriched vehicle data
 * with linear referencing status for each vehicle and its next stop.
 */

import fs from 'fs';
import { LinearReferenceEngine, GTFSDataStore } from './gtfs-realtime-linear-reference.js';

/**
 * Parse a GTFS-RT JSON feed and extract vehicle entities
 * @param {Object} gtfsRtFeed - Parsed JSON from GTFS-RT endpoint
 * @returns {Array} Array of vehicle objects in normalized format
 */
function extractVehiclesFromGtfsRtFeed(gtfsRtFeed) {
    const vehicles = [];

    if (!gtfsRtFeed.entity || !Array.isArray(gtfsRtFeed.entity)) {
        console.warn('[FeedProcessor] No entities found in GTFS-RT feed.');
        return vehicles;
    }

    gtfsRtFeed.entity.forEach((entity) => {
        if (!entity.vehicle) return; // Skip non-vehicle entities

        const vehicle = entity.vehicle;
        const trip = vehicle.trip || {};
        const position = vehicle.position || {};

        // Extract data, with fallbacks
        const vehicleData = {
            entityId: entity.id,
            vehicleId: vehicle.vehicle?.id || entity.id,
            tripId: trip.tripId,
            stopId: vehicle.stopId,
            latitude: position.latitude,
            longitude: position.longitude,
            timestamp: vehicle.timestamp || gtfsRtFeed.header?.timestamp,
            currentStatus: vehicle.currentStatus || 'UNKNOWN',
        };

        // Only include if we have minimum required fields
        if (vehicleData.tripId && vehicleData.stopId && vehicleData.latitude && vehicleData.longitude) {
            vehicles.push(vehicleData);
        }
    });

    return vehicles;
}

/**
 * Process a GTFS-RT feed file and output enriched vehicle data
 * @param {string} gtfsRtFilePath - Path to GTFS-RT JSON file
 * @param {GTFSDataStore} dataStore - Pre-loaded GTFS data
 * @returns {Array} Processed vehicle results
 */
async function processGtfsRtFeed(gtfsRtFilePath, dataStore) {
    console.log(`[FeedProcessor] Reading GTFS-RT feed from: ${gtfsRtFilePath}`);

    try {
        const fileContent = fs.readFileSync(gtfsRtFilePath, 'utf-8');
        const gtfsRtFeed = JSON.parse(fileContent);

        console.log(
            `[FeedProcessor] Feed timestamp: ${gtfsRtFeed.header?.timestamp || 'unknown'}`
        );
        console.log(`[FeedProcessor] GTFS-RT version: ${gtfsRtFeed.header?.gtfsRealtimeVersion || 'unknown'}\n`);

        // Extract vehicles from feed
        const vehicles = extractVehiclesFromGtfsRtFeed(gtfsRtFeed);
        console.log(`[FeedProcessor] Extracted ${vehicles.length} vehicles from feed.\n`);

        // Process each vehicle with linear referencing
        const lrEngine = new LinearReferenceEngine(dataStore);
        const results = [];

        vehicles.forEach((vehicle) => {
            try {
                const result = lrEngine.processVehicle(vehicle);
                if (result) {
                    results.push(result);
                }
            } catch (err) {
                console.error(
                    `[FeedProcessor] Error processing vehicle ${vehicle.vehicleId}:`,
                    err.message
                );
            }
        });

        console.log(`[FeedProcessor] Successfully processed ${results.length} vehicles.\n`);
        return results;
    } catch (err) {
        console.error('[FeedProcessor] Error reading/parsing GTFS-RT feed:', err.message);
        throw err;
    }
}

/**
 * Output results to file in different formats
 * @param {Array} results - Array of processed vehicle results
 * @param {string} outputPath - Path to write output file
 * @param {string} format - Output format: 'json' | 'csv' | 'geojson'
 */
function outputResults(results, outputPath, format = 'json') {
    let output;

    if (format === 'json') {
        output = JSON.stringify(results, null, 2);
    } else if (format === 'csv') {
        const headers = [
            'vehicleId',
            'tripId',
            'stopId',
            'stopName',
            'stopStatus',
            'vehicleDistanceKm',
            'stopDistanceKm',
            'distanceDifferenceKm',
            'latitude',
            'longitude',
            'timestamp',
        ];

        let csv = headers.join(',') + '\n';
        results.forEach((r) => {
            const row = [
                r.vehicleId,
                r.tripId,
                r.stopId,
                `"${r.stopName}"`,
                r.linearReferencing.stopStatus,
                r.linearReferencing.vehicleDistanceAlongRoute.toFixed(3),
                r.linearReferencing.stopDistanceAlongRoute.toFixed(3),
                r.linearReferencing.distanceDifference.toFixed(3),
                r.gpsPosition.latitude,
                r.gpsPosition.longitude,
                r.timestamp,
            ];
            csv += row.join(',') + '\n';
        });
        output = csv;
    } else if (format === 'geojson') {
        const features = results.map((r) => ({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [r.gpsPosition.longitude, r.gpsPosition.latitude],
            },
            properties: {
                vehicleId: r.vehicleId,
                tripId: r.tripId,
                stopId: r.stopId,
                stopName: r.stopName,
                stopStatus: r.linearReferencing.stopStatus,
                vehicleDistance: r.linearReferencing.vehicleDistanceAlongRoute,
                stopDistance: r.linearReferencing.stopDistanceAlongRoute,
            },
        }));

        output = JSON.stringify({ type: 'FeatureCollection', features }, null, 2);
    }

    fs.writeFileSync(outputPath, output);
    console.log(`[Output] Results written to: ${outputPath}`);
}

// Export functions for use as module
export { processGtfsRtFeed, outputResults, extractVehiclesFromGtfsRtFeed };
