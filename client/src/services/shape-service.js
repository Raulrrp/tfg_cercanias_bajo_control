import {Shape} from "@tfg_cercanias_bajo_control/common/models/Shape.js";

export const fetchShapes = async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/shapes`);
    if (!response.ok) throw new Error('Failed to fetch shapes');

    const data = await response.json();
    // Mapping from json to domain object
    return data.map(shapeJson => Shape.fromJson(shapeJson));
  } catch (error) {
    console.error('Error fetching shapes:', error);
    throw error;
  }
};