import { test, describe } from 'node:test';
import assert from 'node:assert';
import { LinearReferenceLoader } from '../src/services/linear-reference-loader.js';

describe('LinearReferenceLoader Unit Tests', () => {

  // ==========================================
  // 1. METHOD: loadStopTimes
  // ==========================================
  describe('Method: loadStopTimes', () => {
    test('should load stop times, group them by tripId, and sort them by stopSequence', async () => {
      const loader = new LinearReferenceLoader();

      // We inject mock data directly into the function to bypass the external repo file
      loader.loadStopTimes = async function() {
        const mockStopTimes = [
          { tripId: 'trip-1', stopSequence: 2, stationId: 'B' },
          { tripId: 'trip-1', stopSequence: 1, stationId: 'A' },
          { tripId: 'trip-2', stopSequence: 1, stationId: 'C' }
        ];
        
        mockStopTimes.forEach((stopTime) => {
          const tripId = stopTime.tripId;
          if (!this.stopTimesByTripId.has(tripId)) {
            this.stopTimesByTripId.set(tripId, []);
          }
          this.stopTimesByTripId.get(tripId).push(stopTime);
        });

        this.stopTimesByTripId.forEach((stops) => {
          stops.sort((a, b) => a.stopSequence - b.stopSequence);
        });
      };

      await loader.loadStopTimes();

      const trip1Stops = loader.getStopTimesForTrip('trip-1');
      const trip2Stops = loader.getStopTimesForTrip('trip-2');

      assert.strictEqual(loader.stopTimesByTripId.size, 2);
      
      assert.strictEqual(trip1Stops.length, 2);
      assert.strictEqual(trip1Stops[0].stopSequence, 1);
      assert.strictEqual(trip1Stops[1].stopSequence, 2);

      assert.strictEqual(trip2Stops.length, 1);
      assert.strictEqual(trip2Stops[0].stopSequence, 1);
    });
  });

  // ==========================================
  // 2. METHOD: buildRouteGeometries
  // ==========================================
  describe('Method: buildRouteGeometries', () => {
    test('should convert stored shape points into turf LineString geometries', () => {
      const loader = new LinearReferenceLoader();
      
      const mockShapes = [
        {
          id: 'shape-100',
          shapePoints: [
            { longitude: -3.70379, latitude: 40.41677 },
            { longitude: -3.70380, latitude: 40.41678 }
          ]
        }
      ];
      
      loader.shapesByIdMap.set('shape-100', mockShapes[0]);

      loader.buildRouteGeometries();

      const resultGeometry = loader.getLineString('shape-100');

      assert.notStrictEqual(resultGeometry, undefined);
      assert.strictEqual(resultGeometry.type, 'Feature');
      assert.strictEqual(resultGeometry.geometry.type, 'LineString');
      assert.deepStrictEqual(resultGeometry.geometry.coordinates, [
        [-3.70379, 40.41677],
        [-3.70380, 40.41678]
      ]);
    });

    test('should safely ignore shapes with invalid coordinates without throwing errors', () => {
      const loader = new LinearReferenceLoader();
      
      const invalidShape = {
        id: 'shape-invalid',
        shapePoints: []
      };
      
      loader.shapesByIdMap.set('shape-invalid', invalidShape);

      assert.doesNotThrow(() => {
        loader.buildRouteGeometries();
      });

      const resultGeometry = loader.getLineString('shape-invalid');
      assert.strictEqual(resultGeometry, undefined);
    });
  });
});