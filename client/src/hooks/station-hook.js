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

  const getStationNameById = (stationId) => {
    if (!stationId) return null;
    const station = stations.find((st) => st.id == stationId);
    return station?.name ?? null;
  };

  return { stations, error, getStationNameById };
};