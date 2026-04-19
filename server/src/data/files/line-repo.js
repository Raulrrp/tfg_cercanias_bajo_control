import fs from 'fs/promises';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { Line } from '@tfg_cercanias_bajo_control/common/models/Line.js';
import { Shape } from '@tfg_cercanias_bajo_control/common/models/Shape.js';
import { ShapePoint } from '@tfg_cercanias_bajo_control/common/models/ShapePoint.js';

const TRIPS_FILE_PATH = path.join(process.cwd(), 'data_files', 'trips.txt');
const ROUTES_FILE_PATH = path.join(process.cwd(), 'data_files', 'routes.txt');
const SHAPES_FILE_PATH = path.join(process.cwd(), 'data_files', 'shapes', 'shapes.txt');

let cachedLines = null;

const URBAN_ZONE_BY_SHAPE_PREFIX = {
  '70': 'Zaragoza',
  '62': 'Cantabria',
  '61': 'San Sebastian',
  '60': 'Bilbao',
  '51': 'Cataluna',
  '41': 'Alicante Murcia',
  '40': 'Valencia',
  '32': 'Malaga',
  '31': 'Cadiz',
  '30': 'Sevilla',
  '20': 'Asturias',
  '10': 'Madrid',
};

const getUrbanZoneFromShapeId = (shapeId) => {
  const normalizedShapeId = String(shapeId ?? '').trim();
  if (!normalizedShapeId) return null;

  const prefix = normalizedShapeId.slice(0, 2);
  return URBAN_ZONE_BY_SHAPE_PREFIX[prefix] ?? null;
};

const getLineBounds = (shape) => {
  if (!shape || !Array.isArray(shape.shapePoints) || shape.shapePoints.length === 0) {
    return null;
  }

  let minLatitude = Infinity;
  let maxLatitude = -Infinity;
  let minLongitude = Infinity;
  let maxLongitude = -Infinity;
  let hasValidPoints = false;

  shape.shapePoints.forEach((point) => {
    if (typeof point.latitude !== 'number' || typeof point.longitude !== 'number') {
      return;
    }

    hasValidPoints = true;
    minLatitude = Math.min(minLatitude, point.latitude);
    maxLatitude = Math.max(maxLatitude, point.latitude);
    minLongitude = Math.min(minLongitude, point.longitude);
    maxLongitude = Math.max(maxLongitude, point.longitude);
  });

  if (!hasValidPoints) {
    return null;
  }

  return {
    minLatitude,
    maxLatitude,
    minLongitude,
    maxLongitude,
  };
};

export const fetchLines = async () => {
  try {
    if (cachedLines) return cachedLines;

    const [tripsContent, routesContent, shapesContent] = await Promise.all([
      fs.readFile(TRIPS_FILE_PATH, 'utf-8'),
      fs.readFile(ROUTES_FILE_PATH, 'utf-8'),
      fs.readFile(SHAPES_FILE_PATH, 'utf-8'),
    ]);

    const tripsRecords = parse(tripsContent, {
      delimiter: ',',
      columns: false,
      from_line: 2,
      skip_empty_lines: true,
      trim: true,
    });

    const routesRecords = parse(routesContent, {
      delimiter: ',',
      columns: false,
      from_line: 2,
      skip_empty_lines: true,
      trim: true,
    });

    const shapesRecords = parse(shapesContent, {
      delimiter: ',',
      columns: false,
      from_line: 2,
      skip_empty_lines: true,
      trim: true,
    });

    const routeShortNameByRouteId = new Map();
    const lineColorByRouteShortName = new Map();

    routesRecords.forEach((record) => {
      const [routeId, routeShortName, , , routeColor] = record;
      const rawRouteId = String(routeId ?? '').trim();
      const shortName = String(routeShortName ?? '').trim() || rawRouteId;
      const color = String(routeColor ?? '').trim();

      if (!rawRouteId) return;

      routeShortNameByRouteId.set(rawRouteId, shortName);
      if (shortName && color && !lineColorByRouteShortName.has(shortName)) {
        lineColorByRouteShortName.set(shortName, color);
      }
    });

    const shapeById = new Map();
    shapesRecords.forEach((record) => {
      const [shapeId, latitude, longitude, sequence] = record;
      const shapeKey = String(shapeId ?? '').trim();
      if (!shapeKey) return;

      const currentPoint = new ShapePoint({
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        sequence: parseInt(sequence, 10),
      });

      if (!shapeById.has(shapeKey)) {
        shapeById.set(shapeKey, new Shape({ id: shapeKey, shapePoints: [currentPoint] }));
        return;
      }

      shapeById.get(shapeKey).addShapePoint(currentPoint);
    });

    shapeById.forEach((shape) => {
      shape.shapePoints.sort((a, b) => a.sequence - b.sequence);
    });

    const lineKeys = new Set();
    tripsRecords.forEach((record) => {
      const [routeId, , , , , , shapeId] = record;
      const shortName = routeShortNameByRouteId.get(String(routeId ?? '').trim());
      const shapeKey = String(shapeId ?? '').trim();
      if (!shortName || !shapeKey) return;

      lineKeys.add(`${shortName}::${shapeKey}`);
    });

    const lines = Array.from(lineKeys)
      .map((lineKey) => {
        const [name, shapeId] = lineKey.split('::');
        const shape = shapeById.get(shapeId) ?? null;
        const urbanZone = getUrbanZoneFromShapeId(shapeId) ?? shapeId;
        const bounds = getLineBounds(shape);

        return new Line({
          name,
          urbanZone,
          color: lineColorByRouteShortName.get(name) ?? null,
          shape,
          minLatitude: bounds?.minLatitude ?? null,
          maxLatitude: bounds?.maxLatitude ?? null,
          minLongitude: bounds?.minLongitude ?? null,
          maxLongitude: bounds?.maxLongitude ?? null,
        });
      })
      .sort((a, b) => {
        const nameCompare = String(a.name).localeCompare(String(b.name));
        if (nameCompare !== 0) return nameCompare;
        return String(a.urbanZone ?? '').localeCompare(String(b.urbanZone ?? ''));
      });

    cachedLines = lines;
    return cachedLines;
  } catch (error) {
    console.error('Error processing lines file:', error);
    throw error;
  }
};