import fs from 'fs/promises';
import path from 'path';
import url from 'url';
import { parse } from 'csv-parse/sync';
import { StopTime } from '@tfg_cercanias_bajo_control/common/models/StopTime.js';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const STOP_TIMES_FILE_PATH = path.resolve(__dirname, '../../../data_files/stop_times.txt');

let cachedStopTimes = null;

// Helper: parse GTFS time (HH:MM:SS) into seconds since midnight
export const parseTimeToSeconds = (timeStr) => {
  if (!timeStr) return Number.POSITIVE_INFINITY;
  const parts = String(timeStr).split(':');
  if (parts.length < 2) return Number.POSITIVE_INFINITY;
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  const s = parseInt(parts[2], 10) || 0;
  return h * 3600 + m * 60 + s;
};

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
      const [tripId, arrivalTime, departureTime, stopId, stopSequence, , , , shapeDistTraveled] = record;

      return new StopTime({
        tripId: String(tripId).trim(), // Normalize ID formatting directly on load
        arrivalTime,
        departureTime,
        stopId: String(stopId).trim(), // Normalize ID formatting directly on load
        stopSequence: parseInt(stopSequence, 10),
        shapeDistTraveled: shapeDistTraveled ? parseFloat(shapeDistTraveled) : null,
      });
    });

    cachedStopTimes = stopTimes;
    return cachedStopTimes;
  } catch (error) {
    console.error('Error processing stop_times file:', error);
    throw error;
  }
};

export const fetchStopTimesByStopId = async (stopId) => {
  try {
    const allStopTimes = await fetchStopTimes();
    const normalizedStopId = String(stopId).trim();
    const filtered = allStopTimes.filter(st => st.stopId === normalizedStopId);

    filtered.sort((a, b) => {
      const aTime = parseTimeToSeconds(a.arrivalTime || a.departureTime);
      const bTime = parseTimeToSeconds(b.arrivalTime || b.departureTime);
      return aTime - bTime;
    });

    return filtered;
  } catch (error) {
    console.error(`Error fetching stop times for stop_id ${stopId}:`, error);
    throw error;
  }
};