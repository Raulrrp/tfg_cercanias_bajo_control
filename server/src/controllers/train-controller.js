import * as TrainService from '../services/train-service.js';

export const getTrains = async (req, res) => {
  try {
    const trains = await TrainService.getLiveTrains();
    // Convert to plain JSON for the HTTP response
    res.json(trains.map(t => t.toJson()));
  } catch (error) {
    console.error("Error in train controller:", error);
    res.status(500).json({ error: "Could not fetch real-time trains" });
  }
};

// Controller for initial Socket.io connection
export const handleSocketConnection = (socket) => {
  console.log(`Cliente conectado al tracking: ${socket.id}`);
  
  // Send current data immediately on connection
  const currentTrains = TrainService.getLiveTrains(); 
  // Note: getLiveTrains is async, but you could use a synchronous cache version
  TrainService.getLiveTrains().then(trains => {
    socket.emit('trains_update', trains.map(t => t.toJson()));
  });
};