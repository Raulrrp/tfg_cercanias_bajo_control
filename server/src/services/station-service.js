import { fetchStations } from '../data/files/station-repo.js';

let cachedStations = null;

export const getStations = async () => {
  if (cachedStations) return cachedStations;

  cachedStations = await fetchStations();
  return cachedStations;
};

export const getStationById = async (stationId) => {
  const stations = await getStations();
  return stations.find((station) => String(station.id) === String(stationId)) ?? null;
};