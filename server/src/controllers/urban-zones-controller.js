import * as UrbanZonesService from '../services/urban-zones-service.js';

/**
 * GET /api/urban-zones
 * Sends all urban zones to the client
 */
export const getUrbanZones = async (req, res) => {
  try {
    const zones = await UrbanZonesService.getUrbanZones();
    res.status(200).json(zones);
  } catch (error) {
    res.status(500).json({ 
      message: error.message 
    });
  }
};