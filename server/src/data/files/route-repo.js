import fs from 'fs/promises';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { Route } from '@tfg_cercanias_bajo_control/common/models/Route.js';

const ROUTES_FILE_PATH = path.join(process.cwd(), 'data_files', 'routes.txt');

let cachedRoutes = null;

export const fetchRoutes = async () => {
  try {
    if (cachedRoutes) return cachedRoutes;

    const content = await fs.readFile(ROUTES_FILE_PATH, 'utf-8');

    const records = parse(content, {
      delimiter: ',',
      columns: false,
      from_line: 2,
      skip_empty_lines: true,
      trim: true,
    });

    const routes = records.map((record) => {
      const [routeId, routeShortName, routeLongName, routeType, routeColor, routeTextColor] = record;

      return new Route({
        id: routeId,
        shortName: routeShortName,
        longName: routeLongName,
        type: parseInt(routeType, 10),
        color: routeColor,
        textColor: routeTextColor,
      });
    });

    cachedRoutes = routes;
    return cachedRoutes;
  } catch (error) {
    console.error('Error processing routes file:', error);
    throw error;
  }
};
