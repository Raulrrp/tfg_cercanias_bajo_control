import * as StationService from '../services/station-service.js';

/**
 * GET /api/stations
 * Sends filtered station data to the client
 */
export const getAllStations = async (req, res) => {
  try {
    const stations = await StationService.getCercaniasStations();
    
    // Return a structured response
    res.status(200).json({
      success: true,
      count: stations.length,
      data: stations
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};