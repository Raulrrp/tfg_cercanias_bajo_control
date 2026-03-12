import * as StationService from '../services/station-service.js';

/**
 * GET /api/stations
 * Sends filtered station data to the client
 */
export const getAllStations = async (req, res) => {
  try {
    const stations = await StationService.getCercaniasStations();
    
    // Return the domain objects as JSON array
    res.status(200).json(stations);
  } catch (error) {
    res.status(500).json({ 
      message: error.message 
    });
  }
};