import { useEffect, useMemo, useState } from 'react';
import { fetchRouteShapes } from '../services/route-shapes-service.js';

export const useRouteShapes = () => {
  const [routeShapes, setRouteShapes] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRouteShapes = async () => {
      try {
        const data = await fetchRouteShapes();
        setRouteShapes(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        setRouteShapes([]);
      } finally {
        setLoading(false);
      }
    };

    loadRouteShapes();
  }, []);

  const shapes = useMemo(
    () => routeShapes.flatMap((routeShape) =>
      (routeShape.shapes || []).map((shape) => ({
        routeId: routeShape.routeId,
        routeColor: routeShape.routeColor,
        shape,
      }))
    ),
    [routeShapes]
  );

  const getRouteShapeById = (routeId) => {
    return routeShapes.find(
      (routeShape) => routeShape.routeId === routeId
    );
  }

  return {
    getRouteShapeById,
    routeShapes,
    shapes,
    error,
    loading };
};