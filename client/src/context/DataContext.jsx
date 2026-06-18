import React, { createContext, useContext } from 'react';
import { useStations } from '../hooks/station-hook.js';
import { useTrains } from '../hooks/train-hook.js';
import { useRealtimeSnapshot } from '../hooks/realtime-hook.js';
import { useLines } from '../hooks/line-hook.js';
import { useUrbanZones } from '../hooks/urban-zones-hook.js';

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  // Initialize core data fetching hooks at the root level to prevent re-fetching on route switches
  const stationHelpers = useStations();
  const trainHelpers = useTrains();
  const realtimeData = useRealtimeSnapshot();
  const lineHelpers = useLines();
  const zoneHelpers = useUrbanZones();

  // Expose all states and operational methods via a single context value object
  const value = {
    stationHelpers,
    trainHelpers,
    realtimeData,
    lineHelpers,
    zoneHelpers
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

// Custom hook to ensure safe context consumption across views
export const useGlobalData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useGlobalData must be used within a DataProvider');
  }
  return context;
};