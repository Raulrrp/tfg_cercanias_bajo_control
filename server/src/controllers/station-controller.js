import * as StationService from '../services/station-service.js';

/**
 * GET /api/stations
 * Sends station data to the client
 */
export const getStations = async (req, res) => {
  try {
    const stations = await StationService.getStations();
    
    // Return the domain objects as JSON array
    res.status(200).json(stations);
  } catch (error) {
    res.status(500).json({ 
      message: error.message 
    });
  }
};