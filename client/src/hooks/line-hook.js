import { useEffect, useMemo, useState } from 'react';
import { fetchLines } from '../services/line-service.js';

export const useLines = () => {
  const [lines, setLines] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLines = async () => {
      try {
        const data = await fetchLines();
        setLines(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        setLines([]);
      } finally {
        setLoading(false);
      }
    };

    loadLines();
  }, []);

  const getLineByNameAndZone = (name, zone) => {
    return lines.find((line) => line.name === name && line.urbanZone === zone);
  }

  return {
    getLineByNameAndZone,
    lines,
    error,
    loading };
};