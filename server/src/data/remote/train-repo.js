// axios helps us to handle http requests easier
import axios from 'axios';

import { TrainPos } from '@tfg_cercanias_bajo_control/common/models/TrainPos.js';
import { Train } from '@tfg_cercanias_bajo_control/common/models/Train.js';

const RENFE_URL = 'https://gtfsrt.renfe.com/vehicle_positions.json';

// Keep the last version in cache
let cachedTrains = [];

export const fetchRenfePositions = async () => {
  try {
    const response = await axios.get(RENFE_URL);
    const data = response.data;

    if (!data.entity) return [];

    const mappedTrains = data.entity.map(entity => {
      const v = entity.vehicle;
      
      // Cast the train from Json to our Train model
      const trainInfo = Train.fromJson({
        id: v.vehicle.id,
        label: v.vehicle.label
      });

      // We map the raw data to our TrainPos model
      return TrainPos.fromJson({
        id: entity.id,
        train: trainInfo,
        trip: v.trip.tripId,
        latitude: v.position.latitude,
        longitude: v.position.longitude,
        status: v.currentStatus,
        timestamp: v.timestamp,
        nextStop: v.stopId
      });
    });

    cachedTrains = mappedTrains;
    return cachedTrains;
  } catch (error) {
    console.error("Error fetching Renfe positions:", error);
    // If it fails, we return the last known positions to avoid leaving the map empty
    return cachedTrains;
  }
};

export const getLastKnownPositions = () => cachedTrains;