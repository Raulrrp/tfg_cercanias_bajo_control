import * as StopTimesService from '../services/stop-times-service.js';

export const getStopTimesByStopId = async (req, res) => {
  try {
    const { stopId } = req.params;
    const stopTimes = await StopTimesService.getStopTimesByStopId(stopId);
    
    // map domain objects to a plain DTO array optimized for network transfer
    const departuresDto = stopTimes.map(st => ({
      departureTime: st.departureTime || '-',
      destination: st.headsign || 'Unknown Destination'
    }));

    res.status(200).json(departuresDto);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};