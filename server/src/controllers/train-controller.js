import * as TrainService from '../services/train-service.js';

//currently unused
export const getTrains = async (req, res) => {
  try {
    const trains = await TrainService.getTrains();
    // Convert to plain JSON for the HTTP response
    res.json(trains.map(t => t.toJson()));
  } catch (error) {
    console.error("Error in train controller:", error);
    res.status(500).json({ error: "Could not fetch real-time trains" });
  }
};