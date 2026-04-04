import * as TripService from '../services/trip-service.js';

export const getTrips = async (req, res) => {
  try {
    const trips = await TripService.getTrips();
    res.json(trips);
  } catch (error) {
    console.error('Error fetching trips:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};