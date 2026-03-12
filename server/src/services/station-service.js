import { fetchStations } from '../data/files/station-repo.js';

export const getCercaniasStations = async () => {
  const data = await fetchStations();
  return data;
};