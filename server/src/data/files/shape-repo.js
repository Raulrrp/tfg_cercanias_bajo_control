import fs from 'fs/promises';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { Shape } from '@tfg_cercanias_bajo_control/common/models/Shape.js';
import { ShapePoint } from '@tfg_cercanias_bajo_control/common/models/ShapePoint.js';

const SHAPES_FILE_PATH = path.join(process.cwd(), 'data_files', 'shapes', 'shapes.txt');

let cachedShapes = null;

export const fetchShapes = async () => {
  try {
    if (cachedShapes) return cachedShapes;

    const content = await fs.readFile(SHAPES_FILE_PATH, 'utf-8');

    const records = parse(content, {
      delimiter: ',',
      columns: false,
      from_line: 2,
      skip_empty_lines: true,
      trim: true,
    });

    const shapesMap = new Map();

    records.forEach((record) => {
      const [shapeId, latitude, longitude, sequence] = record;
      const shapeKey = String(shapeId ?? '').trim();
      if (!shapeKey) return;

      const shapePoint = new ShapePoint({
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        sequence: parseInt(sequence, 10),
      });

      if (!shapesMap.has(shapeKey)) {
        shapesMap.set(
          shapeKey,
          new Shape({
            id: shapeKey,
            shapePoints: [shapePoint],
          })
        );
        return;
      }

      shapesMap.get(shapeKey).addShapePoint(shapePoint);
    });

    const shapes = Array.from(shapesMap.values());
    shapes.forEach((shape) => {
      shape.shapePoints.sort((a, b) => a.sequence - b.sequence);
    });

    cachedShapes = shapes;
    return cachedShapes;
  } catch (error) {
    console.error('Error processing shapes file:', error);
    throw error;
  }
};