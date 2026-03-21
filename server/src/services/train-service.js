import * as TrainRepo from '../data/remote/train-repo.js';

let ioInstance = null;

// Initializes the tracking process
export const initTrainTracking = (io) => {
  ioInstance = io;
  
  // First immediate load
  TrainRepo.fetchTrains().then(trains => {
    ioInstance.emit('trains_update', trains.map(t => t.toJson()));
  });

  // 20 seconds loop
  setInterval(async () => {
    const trains = await TrainRepo.fetchTrains();
    
    // Send to all clients via WebSocket
    if (ioInstance) {
      ioInstance.emit('trains_update', trains.map(t => t.toJson()));
    }
  }, 20000);
};

export const getLiveTrains = async () => {
  // We try to get fresh data or fallback to cache
  const trains = await TrainRepo.fetchTrains();
  return trains;
};