import * as ShapeService from '../services/shape-service.js';

export const getShapes = async (req, res) => {
  try {
    const shapes = await ShapeService.getShapes();
    res.json(shapes);
  } catch (error) {
    console.error("Error fetching shapes:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};