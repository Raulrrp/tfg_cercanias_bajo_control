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

/**
 * GET /api/urban-zones/:id
 * Sends a specific urban zone by id
 */
export const getUrbanZoneById = async (req, res) => {
  try {
    const { id } = req.params;
    const zone = await UrbanZonesService.getUrbanZoneById(id);
    res.status(200).json(zone);
  } catch (error) {
    res.status(404).json({ 
      message: error.message 
    });
  }
};
