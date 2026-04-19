import { fetchShapes } from '../data/files/shape-repo.js';

export const getShapes = async () => {
  const data = await fetchShapes();
  return data;
};