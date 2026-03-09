// this needs decoupling
// additionally "cercanias" == SI is not a good criterium
import { fetchAllStationsFromFile } from '../data/files/stationRepo.js';
import { Station } from '@tfg_cercanias_bajo_control/common/models/Station.js';

export const getCercaniasStations = async () => {
  const data = await fetchAllStationsFromFile();
  
  if (!data || !data.records) return [];

  return data.records
    // 1. Filter directly on the raw array (index 10 is 'CERCANIAS')
    .filter(record => record[10] === 'SI')
    // 2. Map only the matches to our clean Station objects
    .map(record => new Station(record));
};