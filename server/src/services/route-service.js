import { fetchRoutes } from '../data/files/route-repo.js';

export const getRoutes = async () => {
  const data = await fetchRoutes();
  return data;
};
