export const fetchDeparturesByStationId = async (stationId) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/stop-times/${stationId}`);
    if (!response.ok) throw new Error(`Failed to fetch upcoming stop times for station ${stationId}`);

    // return the plain DTO array directly containing departureTime and destination
    return await response.json();
  } catch (error) {
    console.error('Error fetching stop times from server:', error);
    throw error;
  }
};