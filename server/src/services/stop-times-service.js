import { fetchStopTimes, fetchStopTimesByStopId } from '../data/files/stop-times-repo.js';

// Get all stop times
export const getStopTimes = async () => {
  const data = await fetchStopTimes();
  return data;
};

// Get stop times for a specific stop

export const getStopTimesByStopId = async (stopId) => {
  const data = await fetchStopTimesByStopId(stopId);
  return data;
};
