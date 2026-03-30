import * as RouteService from '../services/route-service.js';

export const getRoutes = async (req, res) => {
  try {
    const routes = await RouteService.getRoutes();
    res.json(routes);
  } catch (error) {
    console.error('Error fetching routes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
