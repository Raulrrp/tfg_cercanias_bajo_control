import { fetchShapes } from "../data/files/shape-repo";

export const getShapes = async () => {
  const data = await fetchShapes();
  return data;
};