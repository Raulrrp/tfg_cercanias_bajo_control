import { test, describe } from 'node:test';
import assert from 'node:assert';

// Import the functions to be tested
import { 
  buildArrival, 
  shouldStoreStoppedArrival, 
  collectStoppedArrivals 
} from '../src/services/realtime-service.js'; // <- Update this path to match your actual file structure

describe('Realtime Service Unit Tests', () => {

  // ==========================================
  // 1. METHOD: shouldStoreStoppedArrival
  // ==========================================
  describe('Function: shouldStoreStoppedArrival', () => {
    test('should return true if there is NO previous stopped train (first time detected)', () => {
      const currentTrain = { nextStationId: 'Atocha_01' };
      const result = shouldStoreStoppedArrival(null, currentTrain);
      
      assert.strictEqual(result, true);
    });

    test('should return false if the train remains at the exact same station', () => {
      const previousTrain = { nextStationId: 'Atocha_01' };
      const currentTrain = { nextStationId: 'Atocha_01' };
      
      const result = shouldStoreStoppedArrival(previousTrain, currentTrain);
      
      assert.strictEqual(result, false);
    });

    test('should return true if the train has moved to a different station', () => {
      const previousTrain = { nextStationId: 'Atocha_01' };
      const currentTrain = { nextStationId: 'Chamartin_02' };
      
      const result = shouldStoreStoppedArrival(previousTrain, currentTrain);
      
      assert.strictEqual(result, true);
    });
  });

  // ==========================================
  // 2. METHOD: buildArrival
  // ==========================================
  describe('Function: buildArrival', () => {
    test('should return null if mandatory properties are missing from the input data', () => {
      const train = { tripId: null }; // Incomplete data
      const result = buildArrival({ train });
      
      assert.strictEqual(result, null);
    });

    test('should successfully build and map the Arrival object when valid data is provided', () => {
      const train = { id: 'T-100', tripId: 'TRIP-XYZ', nextStationId: 'S-4', timestamp: 1718378400 };
      const line = { name: 'C-1', urbanZone: 'Zone A' };
      const station = { name: 'Recoletos' };

      const result = buildArrival({ train, line, station });

      assert.notStrictEqual(result, null);
      assert.strictEqual(result.train_id, 'T-100');
      assert.strictEqual(result.trip_id, 'TRIP-XYZ');
      assert.strictEqual(result.line_name, 'C-1');
      assert.strictEqual(result.urban_zone_name, 'Zone A');
      assert.strictEqual(result.station_name, 'Recoletos');
      // Verifies that the numerical timestamp is correctly converted into an ISO string format
      assert.strictEqual(result.timestamp, new Date(1718378400 * 1000).toISOString());
    });
  });

  // ==========================================
  // 3. METHOD: collectStoppedArrivals
  // ==========================================
  describe('Function: collectStoppedArrivals', () => {
    test('should completely ignore trains that are NOT in "STOPPED_AT" status', async () => {
      const trains = [{ id: 'T-1', status: 'RUNNING', tripId: 'TRIP-1' }];
      
      const result = await collectStoppedArrivals({ trains, updates: [] });

      assert.strictEqual(result.currentStoppedTrains.size, 0);
      assert.strictEqual(result.arrivalsToStore.length, 0);
    });
  });
});