import { useState, useEffect } from 'react';
import { fetchStations } from '../services/station-service.js';

export const useStations = () => {
  const [stations, setStations] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadStations = async () => {
      try {
        const data = await fetchStations();
        setStations(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        setStations([]);
      }
    };

    loadStations();
  }, []);

  return { stations, error };
};