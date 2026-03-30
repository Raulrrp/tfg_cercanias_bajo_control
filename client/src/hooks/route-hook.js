import { useState, useEffect } from 'react';
import { fetchRoutes } from '../services/route-service.js';

export const useRoutes = () => {
  const [routes, setRoutes] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRoutes = async () => {
      try {
        const data = await fetchRoutes();
        setRoutes(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        setRoutes([]);
      } finally {
        setLoading(false);
      }
    };

    loadRoutes();
  }, []);

  return { routes, error, loading };
};
