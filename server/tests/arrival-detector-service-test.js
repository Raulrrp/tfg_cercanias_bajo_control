import { test, describe } from 'node:test';
import assert from 'node:assert';
import { ArrivalDetector } from '../src/services/arrival-detector-service.js';

// Minimal mock class for TrainPos since it is imported as a constructor
class MockTrainPos {
  constructor(data) {
    Object.assign(this, data);
  }
}

describe('ArrivalDetector Unit Tests', () => {

  describe('Method: correctTrainPos', () => {

    test('should return null if the trip data is missing or incomplete', () => {
      const mockLoader = {
        getTrip: () => null
      };
      const detector = new ArrivalDetector(mockLoader, {});
      const inputTrain = new MockTrainPos({ tripId: 'invalid-trip', latitude: 40.4, longitude: -3.7 });

      const result = detector.correctTrainPos(inputTrain);

      assert.strictEqual(result, null);
    });

    test('should return corrected status STOPPED_AT when vehicle is very close to a station', () => {
      const mockLoader = {
        getTrip: () => ({ shapeId: 'shape-1' }),
        getLineString: () => ({ type: 'LineString', coordinates: [] }),
        getStopTimesForTrip: () => [
          { stopId: 'station-A', stopSequence: 1 },
          { stopId: 'station-B', stopSequence: 2 }
        ]
      };

      const mockEngine = {
        projectPointOnLine: () => ({ distanceAlongLine: 5.0 }),
        getStopDistanceAlongRoute: (tripId, stopId) => {
          if (stopId === 'station-A') return { distanceAlongLine: 0.0 };
          if (stopId === 'station-B') return { distanceAlongLine: 5.01 }; // 0.01 km = 10 meters away (within tolerance)
          return null;
        }
      };

      const detector = new ArrivalDetector(mockLoader, mockEngine);
      const inputTrain = new MockTrainPos({ tripId: 'trip-1', latitude: 40.4, longitude: -3.7 });

      const result = detector.correctTrainPos(inputTrain);

      assert.notStrictEqual(result, null);
      assert.strictEqual(result.nextStationId, 'station-B');
      assert.strictEqual(result.status, 'STOPPED_AT');
    });

    test('should return IN_TRANSIT_TO when vehicle is moving between stations', () => {
      const mockLoader = {
        getTrip: () => ({ shapeId: 'shape-1' }),
        getLineString: () => ({ type: 'LineString', coordinates: [] }),
        getStopTimesForTrip: () => [
          { stopId: 'station-A', stopSequence: 1 },
          { stopId: 'station-B', stopSequence: 2 }
        ]
      };

      const mockEngine = {
        projectPointOnLine: () => ({ distanceAlongLine: 2.5 }), // Halfway between A and B
        getStopDistanceAlongRoute: (tripId, stopId) => {
          if (stopId === 'station-A') return { distanceAlongLine: 0.0 };
          if (stopId === 'station-B') return { distanceAlongLine: 5.0 };
          return null;
        },
        determineStopStatus: () => 'IN_TRANSIT_TO'
      };

      const detector = new ArrivalDetector(mockLoader, mockEngine);
      const inputTrain = new MockTrainPos({ tripId: 'trip-1', latitude: 40.4, longitude: -3.7 });

      const result = detector.correctTrainPos(inputTrain);

      assert.notStrictEqual(result, null);
      assert.strictEqual(result.nextStationId, 'station-B');
      assert.strictEqual(result.status, 'IN_TRANSIT_TO');
    });

  });
});