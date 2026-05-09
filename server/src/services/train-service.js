import * as TrainRepo from '../data/remote/train-repo.js';

let ioInstance = null;

export const getTrains = async () => {
  // We try to get fresh data or fallback to cache
  const trains = await TrainRepo.fetchTrains();
  return trains;
};