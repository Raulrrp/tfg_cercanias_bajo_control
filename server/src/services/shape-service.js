import { fetchShapes } from "../data/files/shape-repo.js";
import { fetchTrips } from '../data/files/trip-repo.js';
import { RouteShapes } from '@tfg_cercanias_bajo_control/common/models/RouteShapes.js';

let cachedRouteShapes = null;

const getRouteCentroid = (shapes) => {
  let latSum = 0;
  let lonSum = 0;
  let totalPoints = 0;

  shapes.forEach((shape) => {
    (shape.shapePoints || []).forEach((point) => {
      if (typeof point.latitude !== 'number' || typeof point.longitude !== 'number') {
        return;
      }

      latSum += point.latitude;
      lonSum += point.longitude;
      totalPoints += 1;
    });
  });

  if (totalPoints === 0) {
    return null;
  }

  return {
    centerLatitude: latSum / totalPoints,
    centerLongitude: lonSum / totalPoints,
  };
};

export const getShapes = async () => {
  const data = await fetchShapes();
  return data;
};

export const getRouteShapes = async () => {
  if (cachedRouteShapes) {
    return cachedRouteShapes;
  }

  const [shapes, trips] = await Promise.all([fetchShapes(), fetchTrips()]);

  const shapeById = new Map(
    shapes.map((shape) => [String(shape.id ?? '').trim(), shape])
  );

  const routeToShapeIds = new Map();
  trips.forEach((trip) => {
    const routeId = String(trip.routeId ?? '').trim();
    const shapeId = String(trip.shapeId ?? '').trim();
    if (!routeId || !shapeId) return;

    if (!routeToShapeIds.has(routeId)) {
      routeToShapeIds.set(routeId, new Set());
    }
    routeToShapeIds.get(routeId).add(shapeId);
  });

  const result = Array.from(routeToShapeIds.entries())
    .map(([routeId, shapeIds]) => {
      const routeShapes = Array.from(shapeIds)
        .map((shapeId) => shapeById.get(shapeId))
        .filter(Boolean)
        .sort((a, b) => String(a.id).localeCompare(String(b.id)));

      const center = getRouteCentroid(routeShapes);

      return new RouteShapes({
        routeId,
        shapes: routeShapes,
        centerLatitude: center?.centerLatitude ?? null,
        centerLongitude: center?.centerLongitude ?? null,
      });
    })
    .sort((a, b) => a.routeId.localeCompare(b.routeId))
    .map((routeShapes) => routeShapes.toJson());

  cachedRouteShapes = result;
  return cachedRouteShapes;
};