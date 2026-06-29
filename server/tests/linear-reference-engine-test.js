import { test, describe } from 'node:test';
import assert from 'node:assert';
import * as turf from '@turf/turf';
import { LinearReferenceEngine } from '../src/services/linear-reference-engine.js';

describe('LinearReferenceEngine Unit Tests', () => {

  // ==========================================
  // 1. METHOD: projectPointOnLine
  // ==========================================
  describe('Method: projectPointOnLine', () => {
    test('should successfully project a point and return distance along the line', () => {
      const engine = new LinearReferenceEngine({});
      const lineString = turf.lineString([
        [-3.70379, 40.41677],
        [-3.70379, 40.42000]
      ]);
      const vehiclePoint = { longitude: -3.70379, latitude: 40.41800 };

      const result = engine.projectPointOnLine(vehiclePoint, lineString);

      assert.notStrictEqual(result, null);
      assert.strictEqual(Math.round(result.distanceAlongLine*1000), 137);
      assert.strictEqual(result.location.longitude.toFixed(5), '-3.70379');
      assert.strictEqual(result.location.latitude.toFixed(5), '40.41800');
    });
    
    test('should return null when the point cannot be projected or inputs are invalid', () => {
      const engine = new LinearReferenceEngine({});
      
      // Escenario con datos inválidos o vacíos que deberían forzar un retorno nulo
      const result = engine.projectPointOnLine(null, null);

      assert.strictEqual(result, null);
    });
  });

  // ==========================================
  // 2. METHOD: getStopDistanceAlongRoute
  // ==========================================
  describe('Method: getStopDistanceAlongRoute', () => {
    test('should use shapeDistTraveled from stopTimes as first priority', () => {
      const mockLoader = {
        getStopTimesForTrip: (tripId) => [
          { stopId: 'station-10', shapeDistTraveled: 12.5 }
        ]
      };
      const engine = new LinearReferenceEngine(mockLoader);

      const result = engine.getStopDistanceAlongRoute('trip-1', 'station-10', null);

      assert.notStrictEqual(result, null);
      assert.strictEqual(result.source, 'shapeDist');
      assert.strictEqual(result.distanceAlongLine, 12.5);
    });

    test('should fallback to line projection if shapeDistTraveled is missing', () => {
      const mockLoader = {
        getStopTimesForTrip: () => null,
        getStation: (stationId) => ({ id: stationId, longitude: -3.70379, latitude: 40.41800 })
      };
      const engine = new LinearReferenceEngine(mockLoader);
      const lineString = turf.lineString([
        [-3.70379, 40.41677],
        [-3.70379, 40.42000]
      ]);

      const result = engine.getStopDistanceAlongRoute('trip-1', 'station-10', lineString);

      assert.notStrictEqual(result, null);
      assert.strictEqual(result.source, 'projection');
      assert.strictEqual(Math.round(result.distanceAlongLine * 1000), 137);
    });

    test('should return null if fallback loader cannot find the station', () => {
      const mockLoader = {
        getStopTimesForTrip: () => null,
        getStation: () => null
      };
      const engine = new LinearReferenceEngine(mockLoader);

      const result = engine.getStopDistanceAlongRoute('trip-1', 'unknown-station', null);

      assert.strictEqual(result, null);
    });
  });

  // ==========================================
  // 3. METHOD: determineStopStatus
  // ==========================================
  describe('Method: determineStopStatus', () => {
    test('should return STOPPED_AT if the difference is within the tolerance', () => {
      const engine = new LinearReferenceEngine({});
      
      const result = engine.determineStopStatus(5.005, 5.000, 0.01);

      assert.strictEqual(result, 'STOPPED_AT');
    });

    test('should return PASSED if the train is closer to the final destination than the stop', () => {
      const engine = new LinearReferenceEngine({});
      
      const result = engine.determineStopStatus(2.0, 5.0, 0.1);

      assert.strictEqual(result, 'PASSED');
    });

    test('should return IN_TRANSIT_TO if the stop is closer to the final destination than the train', () => {
      const engine = new LinearReferenceEngine({});
      
      const result = engine.determineStopStatus(8.0, 5.0, 0.1);

      assert.strictEqual(result, 'IN_TRANSIT_TO');
    });
  });
});