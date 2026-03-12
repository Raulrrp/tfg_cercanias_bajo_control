import {Station} from "@tfg_cercanias_bajo_control/common/models/Station.js";

export const fetchStations = async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/stations`);
    if (!response.ok) throw new Error('Failed to fetch stations');

    const data = await response.json();
    // convert to domain objects
    return data.map(stationJson => Station.fromJson(stationJson));
  } catch (error) {
    console.error('Error fetching stations:', error);
    throw error;
  }
};