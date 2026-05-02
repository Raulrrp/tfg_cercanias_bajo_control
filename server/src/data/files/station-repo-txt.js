// currently this repo reads from the files in every client query


import { StationMapper } from '../mappers/station-mapper.js';
import fs from 'fs/promises';
import path from 'path';
import url from 'url';
import { parse } from 'csv-parse/sync';

// Read stations only from the new GTFS-like TXT file.
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const STATIONS_FILE_PATH = path.resolve(__dirname, '../../../data_files/stations/stops.txt');

/**
 * Reads the stations.json file from the local filesystem
 * @returns {Promise<Array>} List of all stations
 */
export const fetchStations = async () => {
  try {
    // 1. Read the new stations source file.
    const content = await fs.readFile(STATIONS_FILE_PATH, 'utf-8');

    // 2. Parse TXT (comma-separated with header row).
    const records = parse(content, {
      delimiter: ',',
      columns: false,
      from_line: 2,
      skip_empty_lines: true,
      trim: true
    });

    // 3. Adapt GTFS columns to existing StationMapper input shape.
    const stations = records.map((record) => {
      const [stopId, stopName, stopLat, stopLon] = record;

      return StationMapper.toDomain([
        stopId,
        stopName,
        stopLat,
        stopLon,
        '',
        '0',
        '',
        ''
      ]);
    });
    
    return stations;

  } catch (error) {
    // Log technical error and throw a readable message
    console.error(`[FileSystem Error]: Failed to read file at ${STATIONS_FILE_PATH}`, error);
    throw error;
  }
};