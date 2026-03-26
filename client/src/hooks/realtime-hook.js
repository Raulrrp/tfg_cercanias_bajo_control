// loads periodcally and coordinatedly trains and updates

import { useEffect, useRef, useState } from 'react';
import { fetchTrains } from '../services/train-service.js';
import { fetchUpdates } from '../services/update-service.js';

const REFRESH_INTERVAL_MS = 20000;

export const useRealtimeSnapshot = () => {
  const [trains, setTrains] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    const loadSnapshot = async () => {
      try {
        const [liveTrains, liveUpdates] = await Promise.all([
          fetchTrains(),
          fetchUpdates()
        ]);

        if (!isMountedRef.current) return;

        setTrains(liveTrains);
        setUpdates(liveUpdates);
        setError(null);
        setLastUpdatedAt(new Date());
      } catch (err) {
        if (!isMountedRef.current) return;
        setError(err.message);
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    };

    // First immediate synced load.
    loadSnapshot();

    // Keep both feeds aligned in the same refresh tick.
    const intervalId = setInterval(loadSnapshot, REFRESH_INTERVAL_MS);

    return () => {
      isMountedRef.current = false;
      clearInterval(intervalId);
    };
  }, []);

  return { trains, updates, error, loading, lastUpdatedAt };
};