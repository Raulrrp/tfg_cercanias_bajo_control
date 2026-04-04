import { fetchTrips } from '../data/files/trip-repo.js';

export const getTrips = async () => {
  const data = await fetchTrips();
  return data;
};