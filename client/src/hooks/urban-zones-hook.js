import { useState, useEffect } from 'react';
import { fetchUrbanZones } from '../services/urban-zones-service.js';

export const useUrbanZones = () => {
  const [zones, setZones] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadZones = async () => {
      try {
        const data = await fetchUrbanZones();
        setZones(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        setZones([]);
      }
    };

    loadZones();
  }, []);

  const getUrbanZoneByName = (name) => {
    return zones.find(z => z.name.toLowerCase() === name.toLowerCase());
  };

  return {
    zones,
    error,
    getUrbanZoneByName
  };
};
