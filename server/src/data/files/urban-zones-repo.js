import fs from 'fs/promises';
import path from 'path';
import { parse } from 'csv-parse/sync';

// Construct the absolute path starting from the project root (server/)
const URBAN_ZONES_FILE_PATH = path.join(process.cwd(), 'data_files', 'urban_zones.txt');

/**
 * Reads the urban_zones.txt file from the local filesystem
 * @returns {Promise<Array>} List of all urban zones with their metadata
 */
export const fetchUrbanZones = async () => {
  try {
    const content = await fs.readFile(URBAN_ZONES_FILE_PATH, 'utf-8');

    // Parse CSV to Array of Objects
    const records = parse(content, {
      delimiter: ',',
      columns: true,           // Returns objects with column names as keys
      skip_empty_lines: true,
      trim: true
    });

    // Transform to proper format with numeric id
    const urbanZones = records.map(record => ({
      id: parseInt(record.urban_zone_id, 10),
      name: record.name,
      center_lat: parseFloat(record.center_lat),
      center_lon: parseFloat(record.center_lon)
    }));

    return urbanZones;
  } catch (error) {
    console.error('Error reading urban_zones.txt:', error.message);
    throw new Error(`Failed to fetch urban zones: ${error.message}`);
  }
};
