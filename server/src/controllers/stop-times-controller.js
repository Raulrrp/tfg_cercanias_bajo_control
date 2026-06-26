import * as StopTimesService from '../services/stop-times-service.js';

export const getStopTimesByStopId = async (req, res) => {
  try {
    const { stopId } = req.params;
    const stopTimes = await StopTimesService.getStopTimesByStopId(stopId);
    res.status(200).json(stopTimes.map(t => t.toJson()));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getStopTimeByTripIdAndStopId = async (req, res) => {
  try {
    const { tripId, stopId } = req.params;
    const stopTime = await StopTimesService.getStopTimeByTripIdAndStopId(tripId, stopId);
    if (!stopTime) {
      return res.status(404).json({ message: 'Stop time not found for specified trip and stop' });
    }
    res.status(200).json(stopTime.toJson());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};