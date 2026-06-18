import { useEffect, useState } from 'react';
import { realtimeService } from '../services/realtime-service.js';

export const useRealtimeSnapshot = () => {
  const [trains, setTrains] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);

  useEffect(() => {
    const handleTrainsUpdate = (mappedTrains) => {
      setTrains(mappedTrains);
      setLastUpdatedAt(new Date());
      setLoading(false);
      setError(null);
    };

    const handleUpdatesUpdate = (mappedUpdates) => {
      setUpdates(mappedUpdates);
      setLastUpdatedAt(new Date());
      setLoading(false);
      setError(null);
    };

    const handleConnectionError = (err) => {
      setError(err?.message || String(err));
      setLoading(false);
    };

    const unsubscribeTrains = realtimeService.subscribeToTrains(handleTrainsUpdate, handleConnectionError);
    const unsubscribeUpdates = realtimeService.subscribeToUpdates(handleUpdatesUpdate, handleConnectionError);
    const unsubscribeErrors = realtimeService.subscribeToErrors(handleConnectionError);

    return () => {
      unsubscribeTrains();
      unsubscribeUpdates();
      unsubscribeErrors();
      realtimeService.disconnect();
    };
  }, []);

  return { trains, updates, error, loading, lastUpdatedAt };
};