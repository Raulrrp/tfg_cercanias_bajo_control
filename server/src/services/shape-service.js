import { fetchShapes } from "../data/files/shape-repo.js";
import { fetchTrips } from '../data/files/trip-repo.js';

export const getShapes = async () => {
  const data = await fetchShapes();
  return data;
};

export const getRouteShapes = async () => {
  const [shapes, trips] = await Promise.all([fetchShapes(), fetchTrips()]);

  const shapeById = new Map(
    shapes.map((shape) => [String(shape.id ?? '').trim(), shape])
  );

  const uniquePairs = new Set();
  trips.forEach((trip) => {
    const routeId = String(trip.routeId ?? '').trim();
    const shapeId = String(trip.shapeId ?? '').trim();
    if (!routeId || !shapeId) return;
    uniquePairs.add(`${routeId}::${shapeId}`);
  });

  return Array.from(uniquePairs)
    .map((pair) => {
      const [routeId, shapeId] = pair.split('::');
      const shape = shapeById.get(shapeId);
      if (!shape) return null;

      return {
        routeId,
        ...shape.toJson(),
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      if (a.routeId === b.routeId) return String(a.id).localeCompare(String(b.id));
      return a.routeId.localeCompare(b.routeId);
    });
};