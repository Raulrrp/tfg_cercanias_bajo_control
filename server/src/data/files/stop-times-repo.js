import fs from 'fs/promises';
import path from 'path';
import url from 'url';
import { parse } from 'csv-parse/sync';
import { StopTime } from '@tfg_cercanias_bajo_control/common/models/StopTime.js';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const STOP_TIMES_FILE_PATH = path.resolve(__dirname, '../../../data_files/stop_times.txt');

let cachedStopTimes = null;

/**
 * Fetch all stop times from stop_times.txt
 * @returns {Promise<Array<StopTime>>} Array of StopTime domain objects
 */
export const fetchStopTimes = async () => {
  try {
    if (cachedStopTimes) return cachedStopTimes;

    const content = await fs.readFile(STOP_TIMES_FILE_PATH, 'utf-8');

    const records = parse(content, {
      delimiter: ',',
      columns: false,
      from_line: 2,
      skip_empty_lines: true,
      trim: true,
    });

    const stopTimes = records.map((record) => {
      const [tripId, arrivalTime, departureTime, stopId, stopSequence] = record;

      return new StopTime({
        tripId,
        arrivalTime,
        departureTime,
        stopId,
        stopSequence: parseInt(stopSequence, 10),
      });
    });

    cachedStopTimes = stopTimes;
    return cachedStopTimes;
  } catch (error) {
    console.error('Error processing stop_times file:', error);
    throw error;
  }
};

/**
 * Get stop times by stop_id
 * @param {string|number} stopId - The stop ID to filter by
 * @returns {Promise<Array<StopTime>>} Array of StopTime objects for the given stop
 */
export const fetchStopTimesByStopId = async (stopId) => {
  try {
    const allStopTimes = await fetchStopTimes();
    return allStopTimes.filter(st => st.stopId == stopId);
  } catch (error) {
    console.error(`Error fetching stop times for stop_id ${stopId}:`, error);
    throw error;
  }
};
