import { fetchTrips } from '../data/files/trip-repo.js';
import { getLineByRouteId } from './line-service.js';

export const getTrips = async () => {
  const data = await fetchTrips();
  return data;
};

export const getTripById = async (tripId) => {
  const trips = await getTrips();
  return trips.find((trip) => String(trip.id) === String(tripId)) ?? null;
};

export const getLineByTripId = async (tripId) => {
  const trip = await getTripById(tripId);
  if (!trip?.routeId) return null;

  return getLineByRouteId(trip.routeId);
};