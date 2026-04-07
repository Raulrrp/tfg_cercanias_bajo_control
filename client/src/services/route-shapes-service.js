import { RouteShapes } from '@tfg_cercanias_bajo_control/common/models/RouteShapes.js';

export const fetchRouteShapes = async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/shapes/route-shapes`);
    if (!response.ok) throw new Error('Failed to fetch route shapes');

    const data = await response.json();
    return data.map((routeShapesJson) => RouteShapes.fromJson(routeShapesJson));
  } catch (error) {
    console.error('Error fetching route shapes:', error);
    throw error;
  }
};