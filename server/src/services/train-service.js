import * as TrainRepo from '../data/remote/train-repo.js';

let arrivalDetector = null;

export const configureTrainService = ({ detector }) => {
  arrivalDetector = detector ?? null;
};

export const getRawTrains = async () => {
  return await TrainRepo.fetchTrains();
}

export const getTrains = async () => {
  const rawTrains = await getRawTrains();

  if (!arrivalDetector) {
    return rawTrains;
  }

  return rawTrains.map((trainPos) => arrivalDetector.correctTrainPos(trainPos) ?? trainPos);
};