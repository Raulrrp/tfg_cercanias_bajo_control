import { fetchStations } from '../data/files/station-repo.js';
import { Station } from '@tfg_cercanias_bajo_control/common/models/Station.js';

export const getCercaniasStations = async () => {
  const data = await fetchStations();
  return data;
};