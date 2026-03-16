import { useState, useEffect } from 'react';
import { fetchShapes } from '../services/shape-service.js';

export const useShapes = () => {
  const [shapes, setShapes] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadShapes = async () => {
      try {
        const data = await fetchShapes();
        setShapes(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        setShapes([]);
      } finally {
        setLoading(false);
      }
    };

    loadShapes();
  }, []);

  return { shapes, error, loading };
};