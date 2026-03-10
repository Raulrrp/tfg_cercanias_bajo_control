import { StationMapper } from '../mappers/StationMapper.js';
import fs from 'fs/promises';
import path from 'path';

// Construct the absolute path starting from the project root (server/)
const STATIONS_FILE_PATH = path.join(process.cwd(), 'data_files', 'stations.json');

/**
 * Reads the stations.json file from the local filesystem
 * @returns {Promise<Array>} List of all stations
 */
export const fetchStations = async () => {
  try {
    // utf-8 indicates that the content is text-formatted, returns text also.
    const data = await fs.readFile(STATIONS_FILE_PATH, 'utf-8');

    const objetoCompleto = JSON.parse(data);
    const records = objetoCompleto.records;
    // reads a text json formatted and returns a JS Object
    return records
    .filter(record => record[10] === 'SI')
    .map(StationMapper.toDomain);
  } catch (error) {
    // Log technical error and throw a readable message
    console.error(`[FileSystem Error]: Failed to read file at ${STATIONS_FILE_PATH}`, error);
    throw new Error('Database file could not be read');
  }
};