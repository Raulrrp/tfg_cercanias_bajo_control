export const useTrainHelpers = () => {
  const getTrainById = (trains, id) => {
    const normalizedId = id?.trim();
    if (!normalizedId) {
      return undefined;
    }

    return trains.find(
      (currentTrain) => currentTrain.id === normalizedId || currentTrain.train?.id === normalizedId
    );
  };

  return { getTrainById };
};
