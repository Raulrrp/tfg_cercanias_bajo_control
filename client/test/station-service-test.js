import { fetchStations } from '../src/services/station-service.js';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Station } from '@tfg_cercanias_bajo_control/common/models/Station.js';

describe('fetchStations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch and convert stations to domain models', async () => {
    // 1. ARRANGE: Simulate the raw JSON object that the server usually sends.
    const mockData = [
      {
        id: 1, code: 100, name: 'Station A', latitude: 40.0,
        longitude: -3.0, address: 'Address A', zipcode: 28001,
        city: 'Madrid', province: 'Madrid'
      }
    ];

    // 2. MOCKING: "Fake" the global fetch function of the browser.
    // It returns a successful response (ok: true) with our mock JSON.
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockData)
      })
    );

    // 3. ACT: Call the actual function we are testing.
    const result = await fetchStations();

    // 4. ASSERT: Multiple checks to ensure total success.
    // Check if it called the correct API endpoint using the Env Variable.
    expect(global.fetch).toHaveBeenCalledWith(
      `${import.meta.env.VITE_API_URL}/stations`
    );
    // Ensure we got the right amount of items back.
    expect(result).toHaveLength(1);
    // Verify that the function converted the object into a 'Station' class instance.
    expect(result[0]).toBeInstanceOf(Station);
    // Check if the data inside the instance is correct.
    expect(result[0].name).toBe('Station A');
  });

  it('should throw error when fetch fails', async () => {
    // 1. MOCKING: Simulate a server error (e.g., 404 or 500) where 'ok' is false.
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false
      })
    );

    // 2. ACT & ASSERT: Verify that the function throws the expected error message.
    await expect(fetchStations()).rejects.toThrow('Failed to fetch stations');
  });
});