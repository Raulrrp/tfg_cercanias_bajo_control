import { useStations } from '../src/hooks/station-hook.js';
import * as stationService from '../src/services/station-service.js';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

describe('useStations', () => {
  // Before each test, we reset all mocks to ensure a "clean slate" 
  // and prevent data leakage between tests.
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch stations on mount', async () => {
    // 1. ARRANGE: Create "fake" data to simulate what the API would return.
    const mockStations = [
      { id: 1, name: 'Station A', city: 'Madrid' }
    ];

    // 2. MOCKING: Intercept the call to 'fetchStations'. Instead of going 
    // to the real server, it will instantly return our 'mockStations'.
    vi.spyOn(stationService, 'fetchStations').mockResolvedValue(mockStations);

    // 3. ACT: "Render" the hook in a virtual environment.
    const { result } = renderHook(() => useStations());

    // 4. ASSERT: Wait for the async operation to complete and check results.
    await waitFor(() => {
      // Check if the hook's 'stations' state matches our fake data.
      expect(result.current.stations).toEqual(mockStations);
      // Ensure there is no error message.
      expect(result.current.error).toBeNull();
    });
  });

  it('should handle error on fetch failure', async () => {
    // 1. ARRANGE: Define a specific error message.
    const errorMessage = 'Network error';
    
    // 2. MOCKING: Force the service to fail by rejecting the promise.
    vi.spyOn(stationService, 'fetchStations').mockRejectedValue(
      new Error(errorMessage)
    );

    // 3. ACT: Render the hook.
    const { result } = renderHook(() => useStations());

    // 4. ASSERT: Verify how the hook handles the disaster.
    await waitFor(() => {
      // The error state should now contain our error message.
      expect(result.current.error).toBe(errorMessage);
      // The stations list should remain empty.
      expect(result.current.stations).toEqual([]);
    });
  });
});