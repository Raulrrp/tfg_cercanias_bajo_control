import { fetchStations } from '../data/files/station-repo.js';

export const getStations = async () => {
  const data = await fetchStations();
  return data;
};