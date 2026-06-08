import * as TrainRepo from '../data/renfe/train-repo.js';

let arrivalDetector = null;

export const configureTrainService = ({ detector }) => {
  arrivalDetector = detector ?? null;
};

export const getRawTrains = async () => {
  return await TrainRepo.fetchTrains();
}

export const getTrainById = async (trainId) => {
  const rawTrains = await getRawTrains();
  return rawTrains.find((trainPos) => String(trainPos.train?.id) === String(trainId)) ?? null;
};

export const getTripIdByTrainId = async (trainId) => {
  const train = await getTrainById(trainId);
  return train?.tripId ?? null;
};

export const getTrains = async () => {
  const rawTrains = await getRawTrains();

  if (!arrivalDetector) {
    return rawTrains;
  }

  return rawTrains.map((trainPos) => arrivalDetector.correctTrainPos(trainPos) ?? trainPos);
};