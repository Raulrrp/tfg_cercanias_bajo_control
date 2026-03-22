// currently this repo reads from the files in every client query


import { StationMapper } from '../mappers/station-mapper.js';
import fs from 'fs/promises';
import path from 'path';
import { parse } from 'csv-parse/sync';

// Construct the absolute path starting from the project root (server/)
const STATIONS_DIR_PATH = path.join(process.cwd(), 'data_files', 'stations');

/**
 * Reads the stations.json file from the local filesystem
 * @returns {Promise<Array>} List of all stations
 */
export const fetchStations = async () => {
  try {
    // 1. List all files in the directory
    const files = (await fs.readdir(STATIONS_DIR_PATH)).filter(file => file.toLowerCase().endsWith('.csv'));

    // 2. Process all files in parallel
    const allStationsNested = await Promise.all(
      files.map(async (file) => {
        // Construct the full path for each file
        const filePath = path.join(STATIONS_DIR_PATH, file);
        const content = await fs.readFile(filePath, 'utf-8');

        // 3. Parse CSV to Array of Arrays
        const records = parse(content, {
          delimiter: ';',          // CRITICAL: Your CSV uses semicolons
          columns: false,          // Returns an Array per row to satisfy your Mapper
          from_line: 2,            // Skips the header row (CÓDIGO;DESCRIPCION...)
          skip_empty_lines: true,
          trim: true               // Removes whitespace around values
        });
        
        return records;
      })
    );

    // 4. Flatten the nested arrays and map them to the Station model
    const flattened = allStationsNested.flat();
    const stations = flattened.map(record => StationMapper.toDomain(record));
    
    return stations;

  } catch (error) {
    // Log technical error and throw a readable message
    console.error(`[FileSystem Error]: Failed to read files in ${STATIONS_DIR_PATH}`, error);
    throw error;
  }
};