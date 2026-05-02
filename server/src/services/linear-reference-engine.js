import * as turf from '@turf/turf';

/**
 * Service that implements linear referencing geometry operations
 * Handles point projection and distance calculation using domain objects
 */
export class LinearReferenceEngine {
    constructor(loader) {
        this.loader = loader;
    }

    /**
     * Project a point onto a LineString and return distance along the line from start.
     * 
     * Uses Turf.js's nearestPointOnLine to find the closest point on the route geometry
     * and extracts the `location` property which provides cumulative distance.
     */
    projectPointOnLine(point, lineString) {
        if (!lineString || !lineString.geometry.coordinates) {
            return null;
        }

        try {
            // Create a Turf point from vehicle coordinates [lon, lat]
            const geoPoint = turf.point([point.longitude, point.latitude]);

            // Find the nearest point on the line
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
     * Get the distance of a stop (station) along the route geometry (shape).
     * 
     * Priority:
     * 1. Use shape_dist_traveled from stop_times.txt if available (most accurate)
     * 2. Otherwise, project the station's coordinates onto the route LineString
     */
    getStopDistanceAlongRoute(tripId, stationId, lineString) {
        // First, check if stop_times.txt has shape_dist_traveled for this stop
        const stopTimesForTrip = this.loader.getStopTimesForTrip(tripId);
        if (stopTimesForTrip) {
            const stopTimeEntry = stopTimesForTrip.find((st) => st.stopId === stationId);
            if (stopTimeEntry && stopTimeEntry.shapeDistTraveled !== null) {
                return {
                    distanceAlongLine: stopTimeEntry.shapeDistTraveled,
                    source: 'shapeDist',
                };
            }
        }

        // Fallback: project station coordinates onto the line
        const station = this.loader.getStation(stationId);
        if (!station) {
            return null;
        }

        const projection = this.projectPointOnLine(
            { latitude: station.latitude, longitude: station.longitude },
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
}
