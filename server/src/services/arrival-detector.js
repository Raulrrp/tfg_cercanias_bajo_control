/**
 * Service that detects train arrival status at a given stop
 * Orchestrates linear reference loader (domain objects) and engine (geometry) 
 * to classify vehicle arrival status
 */
export class ArrivalDetector {
    constructor(loader, engine) {
        this.loader = loader;
        this.engine = engine;
    }

    /**
     * Process a single GTFS-RT vehicle and determine its status relative to a stop
     * 
     * @param {Object} vehicleData - { tripId, stopId, latitude, longitude, timestamp, vehicleId }
     * @returns {Object|null} Enriched vehicle data with arrival classification
     */
    processVehicle(vehicleData) {
        const { tripId, stopId, latitude, longitude, timestamp, vehicleId } = vehicleData;

        // Step 1: Get trip domain object and extract shape
        const trip = this.loader.getTrip(tripId);
        if (!trip || !trip.shapeId) {
            return null;
        }

        // Step 2: Get the route geometry (LineString) from shape ID
        const lineString = this.loader.getLineString(trip.shapeId);
        if (!lineString) {
            return null;
        }

        // Step 3: Get all stops for this trip and find the final stop
        const stopTimesForTrip = this.loader.getStopTimesForTrip(tripId);
        if (!stopTimesForTrip || stopTimesForTrip.length === 0) {
            return null;
        }

        // Final stop is the one with maximum stop_sequence
        const finalStopTimeEntry = stopTimesForTrip.reduce((max, st) =>
            st.stopSequence > max.stopSequence ? st : max
        );

        // Step 4: Project vehicle position onto the line
        const vehicleProjection = this.engine.projectPointOnLine({ latitude, longitude }, lineString);
        if (!vehicleProjection) {
            return null;
        }

        // Step 5: Get current stop distance
        const currentStopProjection = this.engine.getStopDistanceAlongRoute(tripId, stopId, lineString);
        if (!currentStopProjection) {
            return null;
        }

        // Step 6: Get final stop distance
        const finalStopProjection = this.engine.getStopDistanceAlongRoute(tripId, finalStopTimeEntry.stopId, lineString);
        if (!finalStopProjection) {
            return null;
        }

        // Step 7: Calculate distances from train to final stop and from current stop to final stop
        const trainDistanceToFinal = finalStopProjection.distanceAlongLine - vehicleProjection.distanceAlongLine;
        const currentStopDistanceToFinal = finalStopProjection.distanceAlongLine - currentStopProjection.distanceAlongLine;

        // Step 8: Determine stop status (PASSED, AT_STOP, or APPROACHING)
        const stopStatus = this.engine.determineStopStatus(
            trainDistanceToFinal,
            currentStopDistanceToFinal
        );

        // Get station domain objects for output
        const currentStation = this.loader.getStation(stopId);
        const finalStation = this.loader.getStation(finalStopTimeEntry.stopId);

        return {
            vehicleId,
            tripId,
            currentStopId: stopId,
            currentStopName: currentStation ? currentStation.name : 'Unknown',
            finalStopId: finalStopTimeEntry.stopId,
            finalStopName: finalStation ? finalStation.name : 'Unknown',
            timestamp,
            stopStatus,
            gpsPosition: {
                latitude,
                longitude,
            },
            linearReferencing: {
                shapeId: trip.shapeId,
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
