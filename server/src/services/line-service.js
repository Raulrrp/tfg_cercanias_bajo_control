import { fetchLines } from '../data/files/line-repo.js';

export const getLines = async () => {
  const data = await fetchLines();
  return data;
};
