// additionally "cercanias" == SI is not a good criterium
import { fetchStations } from '../data/files/stationRepo.js';
import { Station } from '@tfg_cercanias_bajo_control/common/models/Station.js';

export const getCercaniasStations = async () => {
  const data = await fetchStations();
  return data;
};