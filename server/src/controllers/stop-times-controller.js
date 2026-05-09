import * as StopTimesService from '../services/stop-times-service.js';


export const getStopTimes = async (req, res) => {
  try {
    const stopTimes = await StopTimesService.getStopTimes();
    res.status(200).json(stopTimes.map(t => t.toJson()));
  } catch (error) {
    res.status(500).json({ 
      message: error.message 
    });
  }
};


export const getStopTimesByStopId = async (req, res) => {
  try {
    const { stopId } = req.params;
    const stopTimes = await StopTimesService.getStopTimesByStopId(stopId);
    res.status(200).json(stopTimes.map(t => t.toJson()));
  } catch (error) {
    res.status(500).json({ 
      message: error.message 
    });
  }
};
