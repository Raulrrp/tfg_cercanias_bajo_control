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
        const { tripId, latitude, longitude } = trainPos;

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

        // Step 3: Get stop times for the trip
        const stopTimesForTrip = this.loader.getStopTimesForTrip(tripId);
        if (!stopTimesForTrip || stopTimesForTrip.length === 0) {
            return null;
        }

        // Final stop is the one with maximum stop_sequence
        const finalStopTimeEntry = stopTimesForTrip.reduce((max, st) =>
            st.stopSequence > max.stopSequence ? st : max
        );

        // Compute vehicle projection distance (used to find the computed next stop)
        const vehicleProjection = this.engine.projectPointOnLine({ latitude, longitude }, lineString);
        if (!vehicleProjection) {
            return null;
        }

        // Step 5: Get final stop distance
        const finalStopProjection = this.engine.getStopDistanceAlongRoute(
            tripId,
            finalStopTimeEntry.stopId,
            lineString
        );
        if (!finalStopProjection) {
            return null;
        }

        // Step 6: Calculate distance from train to final stop
        const trainDistanceToFinal = finalStopProjection.distanceAlongLine - vehicleProjection.distanceAlongLine;

        // Step 7: Compute stop distances along the route
        const vehicleDist = vehicleProjection.distanceAlongLine;
        const stopsWithDist = stopTimesForTrip
            .map((st) => {
                const p = this.engine.getStopDistanceAlongRoute(tripId, st.stopId, lineString);
                return p ? { entry: st, distance: p.distanceAlongLine } : null;
            })
            .filter(Boolean);

        const nearestStopObj = stopsWithDist.reduce((nearest, stop) => {
            if (nearest === null) {
                return stop;
            }

            const currentDelta = Math.abs(stop.distance - vehicleDist);
            const nearestDelta = Math.abs(nearest.distance - vehicleDist);
            return currentDelta < nearestDelta ? stop : nearest;
        }, null);

        const nearestDeltaKm = nearestStopObj ? Math.abs(nearestStopObj.distance - vehicleDist) : Infinity;
        const nextStopAheadObj = stopsWithDist
            .filter((stop) => stop.distance > vehicleDist)
            .reduce((closestAhead, stop) => {
                if (closestAhead === null) {
                    return stop;
                }

                return stop.distance < closestAhead.distance ? stop : closestAhead;
            }, null);

        const computedNextStopId = nearestDeltaKm <= 0.2
            ? nearestStopObj.entry.stopId
            : (nextStopAheadObj ? nextStopAheadObj.entry.stopId : finalStopTimeEntry.stopId);

        const computedStopProjection = this.engine.getStopDistanceAlongRoute(tripId, computedNextStopId, lineString);
        if (!computedStopProjection) {
            return null;
        }

        const computedStopDistToFinal = finalStopProjection.distanceAlongLine - computedStopProjection.distanceAlongLine;

        // Determine corrected status with a 200m stop tolerance
        let correctedStatus = nearestDeltaKm <= 0.2
            ? 'STOPPED_AT'
            : this.engine.determineStopStatus(trainDistanceToFinal, computedStopDistToFinal);
        if (correctedStatus === 'PASSED') correctedStatus = 'IN_TRANSIT_TO';

        const correctedNextStationId = computedNextStopId;

        // Create corrected TrainPos with accurate nextStationId and status
        const correctedTrainPos = new TrainPos({
            ...trainPos,
            status: correctedStatus,
            nextStationId: correctedNextStationId,
        });

        return correctedTrainPos;
    }
}
