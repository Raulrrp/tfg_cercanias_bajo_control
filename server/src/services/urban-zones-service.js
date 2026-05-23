import { fetchUrbanZones } from '../data/files/urban-zones-repo.js';

let cachedUrbanZones = null;
let cachedUrbanZonesMap = null;

export const getUrbanZones = async () => {
  if (cachedUrbanZones) return cachedUrbanZones;

  cachedUrbanZones = await fetchUrbanZones();
  return cachedUrbanZones;
};

export const getUrbanZonesMap = async () => {
  if (cachedUrbanZonesMap) return cachedUrbanZonesMap;

  const zones = await getUrbanZones();
  cachedUrbanZonesMap = new Map(zones.map((zone) => [zone.id, zone]));
  return cachedUrbanZonesMap;
};

export const getUrbanZoneById = async (id) => {
  const zones = await getUrbanZones();
  const zone = zones.find(z => z.id === parseInt(id, 10));
  
  if (!zone) {
    throw new Error(`Urban zone with id ${id} not found`);
  }
  
  return zone;
};
