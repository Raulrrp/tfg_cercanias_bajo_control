import { StopTime } from "@tfg_cercanias_bajo_control/common/models/StopTime.js";

export const fetchStopTimesByStationId = async (stationId) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/stop-times/${stationId}`);
    if (!response.ok) throw new Error(`Failed to fetch upcoming stop times for station ${stationId}`);

    const data = await response.json();
    // convert data array to domain objects clean of duplicates and past schedules
    return data.map(stopTimeJson => StopTime.fromJson(stopTimeJson));
  } catch (error) {
    console.error('Error fetching stop times from server:', error);
    throw error;
  }
};