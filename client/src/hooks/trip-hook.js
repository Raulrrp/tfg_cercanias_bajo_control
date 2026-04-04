import { useEffect, useState } from 'react';
import { fetchTrips } from '../services/trip-service.js';

export const useTrips = () => {
  const [trips, setTrips] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTrips = async () => {
      try {
        const data = await fetchTrips();
        setTrips(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        setTrips([]);
      } finally {
        setLoading(false);
      }
    };

    loadTrips();
  }, []);

  return { trips, error, loading };
};