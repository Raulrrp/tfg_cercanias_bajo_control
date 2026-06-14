import { test, describe } from 'node:test';
import assert from 'node:assert';

// Import the function to be tested
import { filterAndSnapStations } from '../src/services/station-service.js';

describe('Station Service Unit Tests', () => {

  describe('Function: filterAndSnapStations', () => {

    test('should successfully snap a station that is close to a shape', () => {
      const shapes = [
        {
          id: 'shape-1',
          shapePoints: [
            { longitude: -3.70379, latitude: 40.41677 },
            { longitude: -3.70379, latitude: 40.42000 }
          ]
        }
      ];

      const stations = [
        { id: 'station-1', name: 'Close Station', longitude: -3.70379, latitude: 40.41800 }
      ];

      const result = filterAndSnapStations(stations, shapes, 50);

      assert.strictEqual(result.length, 1);
      assert.strictEqual(result[0].id, 'station-1');
      assert.notStrictEqual(result[0].distanceToShapeMeters, undefined);
    });

    test('should filter out a station that is too far from any shape', () => {
      const shapes = [
        {
          id: 'shape-1',
          shapePoints: [
            { longitude: -3.70379, latitude: 40.41677 },
            { longitude: -3.70379, latitude: 40.42000 }
          ]
        }
      ];

      const stations = [
        { id: 'station-2', name: 'Far Station', longitude: -4.50000, latitude: 41.50000 }
      ];

      const result = filterAndSnapStations(stations, shapes, 50);

      assert.strictEqual(result.length, 0);
    });

    test('should ignore stations that are missing latitude or longitude', () => {
      const shapes = [
        {
          id: 'shape-1',
          shapePoints: [
            { longitude: -3.70379, latitude: 40.41677 },
            { longitude: -3.70379, latitude: 40.42000 }
          ]
        }
      ];

      const stations = [
        { id: 'station-3', name: 'Invalid Station', longitude: null, latitude: 40.41800 }
      ];

      const result = filterAndSnapStations(stations, shapes, 50);

      assert.strictEqual(result.length, 0);
    });

  });
});