import { TrainPos } from '@tfg_cercanias_bajo_control/common/models/TrainPos.js';

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
     * @param {TrainPos} trainPos - Original TrainPos domain object with potentially incorrect station ID and status
      * @returns {TrainPos|null} Corrected TrainPos with accurate nextStationId and status
     */
    correctTrainPos(trainPos) {
          const { tripId, nextStationId: stopId, latitude, longitude } = trainPos;

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

        // Step 3: Get final stop and next stop from stop_times
        const stopTimesForTrip = this.loader.getStopTimesForTrip(tripId);
        if (!stopTimesForTrip || stopTimesForTrip.length === 0) {
            return null;
        }

        // Final stop is the one with maximum stop_sequence
        const finalStopTimeEntry = stopTimesForTrip.reduce((max, st) =>
            st.stopSequence > max.stopSequence ? st : max
        );

        const currentStopTimeEntry = stopTimesForTrip.find((entry) => entry.stopId === stopId);
        if (!currentStopTimeEntry) {
            return null;
        }

        // Next stop: smallest stop_sequence that is greater than the current one
        const nextStopTimeEntry = stopTimesForTrip
            .filter((entry) => entry.stopSequence > currentStopTimeEntry.stopSequence)
            .reduce(
                (min, entry) =>
                    min === null || entry.stopSequence < min.stopSequence ? entry : min,
                null
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

        let correctedNextStationId = stopId;
        let correctedStatus = stopStatus;

        if (stopStatus === 'PASSED' && nextStopTimeEntry) {
            correctedNextStationId = nextStopTimeEntry.stopId;
            correctedStatus = 'IN_TRANSIT_TO';
        } else if (stopStatus === 'PASSED') {
            // there is no next stop, but I've passed the stop
            // I'll say I am arriving
            correctedStatus = 'IN_TRANSIT_TO';
        }
        // if stopStatus === 'STOPPED_AT' no changes required
        // if stopStatus === 'IN_TRANSIT_TO' no changes required

        // Create corrected TrainPos with accurate nextStationId and status
        const correctedTrainPos = new TrainPos({
            ...trainPos,
            status: correctedStatus,
            nextStationId: correctedNextStationId,
        });

        return correctedTrainPos;
    }
}
