import { Line } from '@tfg_cercanias_bajo_control/common/models/Line.js';

export const fetchLines = async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/lines`);
    if (!response.ok) throw new Error('Failed to fetch lines');

    const data = await response.json();
    return data.map((lineJson) => Line.fromJson(lineJson));
  } catch (error) {
    console.error('Error fetching lines:', error);
    throw error;
  }
};