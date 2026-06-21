import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import { LinearReferenceLoader } from '../src/services/linear-reference-loader.js';

describe('LinearReferenceLoader Unit Tests', () => {
  let loader;

  beforeEach(() => {
    loader = new LinearReferenceLoader();
  });

  // ==========================================
  // 1. METHOD: initialize
  // ==========================================
  describe('Method: initialize', () => {
    test('should successfully index stations, shapes, trips and build geometries', async () => {
      const mockStations = [{ id: 101, name: 'Station 101' }];
      const mockShapes = [{ id: 'shape-1', shapePoints: [{ longitude: -3.7, latitude: 40.4 }, { longitude: -3.8, latitude: 40.5 }] }];
      const mockTrips = [{ id: 'trip-1', routeId: 'R1' }];

      // Overriding the method directly on this instance to isolate initialize from the external repo file
      loader.loadStopTimes = async function() {
        // This avoids calling fetchStopTimes during initialize tests
        return Promise.resolve();
      };

      await loader.initialize(mockStations, mockShapes, mockTrips);

      assert.strictEqual(loader.getStation(101).name, 'Station 101');
      assert.strictEqual(loader.getShape('shape-1'), mockShapes[0]);
      assert.strictEqual(loader.getTrip('trip-1'), mockTrips[0]);
      assert.notStrictEqual(loader.getLineString('shape-1'), undefined);
    });

    test('should throw and log error when initialization fails', async () => {
      loader.loadStopTimes = async function() {
        throw new Error('Forced initialization error');
      };

      await assert.rejects(
        async () => {
          await loader.initialize([], [], []);
        },
        /Forced initialization error/
      );
    });
  });

  // ==========================================
  // 2. METHOD: buildRouteGeometries
  // ==========================================
  describe('Method: buildRouteGeometries', () => {
    test('should bypass elements that trigger turf errors gracefully', () => {
      const invalidShape = { id: 'shape-invalid', shapePoints: [] };
      loader.shapesByIdMap.set('shape-invalid', invalidShape);

      assert.doesNotThrow(() => {
        loader.buildRouteGeometries();
      });
      assert.strictEqual(loader.getLineString('shape-invalid'), undefined);
    });
  });

  // ==========================================
  // 3. GETTERS: Getters Edge Cases & Conversions
  // ==========================================
  describe('Data Getters Edge Cases', () => {
    test('getStation should resolve string IDs, numeric conversions, and padded strings', () => {
      const stationObj = { id: 5451, name: 'Atocha' };
      loader.stationsByIdMap.set(5451, stationObj);

      assert.strictEqual(loader.getStation(5451), stationObj);
      assert.strictEqual(loader.getStation('5451'), stationObj);
      assert.strictEqual(loader.getStation('05451'), stationObj);
      assert.strictEqual(loader.getStation('INVALID_ID'), null);
    });

    test('getTrip should resolve both direct types and fallback string conversions', () => {
      const tripObj = { id: '999', name: 'Express' };
      loader.tripsById.set('999', tripObj);

      assert.strictEqual(loader.getTrip('999'), tripObj);
      assert.strictEqual(loader.getTrip(999), tripObj);
      assert.strictEqual(loader.getTrip('non-existent'), null);
    });

    test('getStopTimesForTrip should resolve fallback string conversions or return null', () => {
      loader.stopTimesByTripId.set('42', [{ stopSequence: 1 }]);

      assert.strictEqual(loader.getStopTimesForTrip('42').length, 1);
      assert.strictEqual(loader.getStopTimesForTrip(42).length, 1);
      assert.strictEqual(loader.getStopTimesForTrip('unknown'), null);
    });
  });
});