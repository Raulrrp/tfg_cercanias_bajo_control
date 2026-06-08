import { fetchRoutes } from '../data/files/route-repo.js';

export const getRoutes = async () => {
  const data = await fetchRoutes();
  return data;
};

export const getRouteById = async (routeId) => {
  const routes = await getRoutes();
  return routes.find((route) => String(route.id ?? '').trim() === String(routeId ?? '').trim()) ?? null;
};
