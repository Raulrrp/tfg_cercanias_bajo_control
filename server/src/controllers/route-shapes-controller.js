import * as RouteService from '../services/route-service.js';
import * as ShapeService from '../services/shape-service.js';

export const getRouteShapes = async (req, res) => {
  try {
    const routeShapes = await ShapeService.getRouteShapes();
    res.json(routeShapes);
  } catch (error) {
    console.error('Error fetching route-shapes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getDebuggingRoutes = async (req, res) => {
  try {
    const routes = await RouteService.getRoutes();
    res.json(routes);
  } catch (error) {
    console.error('Error fetching routes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getDebuggingShapes = async (req, res) => {
  try {
    const shapes = await ShapeService.getShapes();
    res.json(shapes);
  } catch (error) {
    console.error("Error fetching shapes:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
