import fs from 'fs/promises';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { Trip } from '@tfg_cercanias_bajo_control/common/models/Trip.js';

const TRIPS_FILE_PATH = path.join(process.cwd(), 'data_files', 'trips.txt');

let cachedTrips = null;

export const fetchTrips = async () => {
  try {
    if (cachedTrips) return cachedTrips;

    const content = await fs.readFile(TRIPS_FILE_PATH, 'utf-8');

    const records = parse(content, {
      delimiter: ',',
      columns: false,
      from_line: 2,
      skip_empty_lines: true,
      trim: true,
    });

    const trips = records.map((record) => {
      const [routeId, serviceId, tripId, tripHeadsign, wheelchairAccessible, blockId, shapeId] = record;

      return new Trip({
        routeId,
        serviceId,
        id: tripId,
        headsign: tripHeadsign,
        wheelchairAccessible,
        blockId,
        shapeId,
      });
    });

    cachedTrips = trips;
    return cachedTrips;
  } catch (error) {
    console.error('Error processing trips file:', error);
    throw error;
  }
};
