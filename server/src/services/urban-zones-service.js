import { fetchUrbanZones } from '../data/files/urban-zones-repo.js';

export const getUrbanZones = async () => {
  const data = await fetchUrbanZones();
  return data;
};

export const getUrbanZoneById = async (id) => {
  const zones = await fetchUrbanZones();
  const zone = zones.find(z => z.id === parseInt(id, 10));
  
  if (!zone) {
    throw new Error(`Urban zone with id ${id} not found`);
  }
  
  return zone;
};
