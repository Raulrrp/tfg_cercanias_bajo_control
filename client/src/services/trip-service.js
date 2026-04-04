import { Trip } from '@tfg_cercanias_bajo_control/common/models/Trip.js';

export const fetchTrips = async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/trips`);
    if (!response.ok) throw new Error('Failed to fetch trips');

    const data = await response.json();
    return data.map((tripJson) => Trip.fromJson(tripJson));
  } catch (error) {
    console.error('Error fetching trips:', error);
    throw error;
  }
};