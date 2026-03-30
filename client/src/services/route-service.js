import {Route} from "@tfg_cercanias_bajo_control/common/models/Route.js";

export const fetchRoutes = async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/routes`);
    if (!response.ok) throw new Error('Failed to fetch routes');

    const data = await response.json();
    // Mapping from json to domain object
    return data.map(routeJson => Route.fromJson(routeJson));
  } catch (error) {
    console.error('Error fetching routes:', error);
    throw error;
  }
};
