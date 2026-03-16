import fs from 'fs/promises';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { Shape } from '@tfg_cercanias_bajo_control/common/models/Shape.js';
import { ShapePoint } from '@tfg_cercanias_bajo_control/common/models/ShapePoint.js';

const SHAPES_FILE_PATH = path.join(process.cwd(), 'data_files','shapes', 'shapes.txt');

let cachedShapes = null;

export const fetchShapes = async () => {
  try {
    // 1. Return cached data if available
    if (cachedShapes) return cachedShapes;

    // 2. Read the file as a string
    const content = await fs.readFile(SHAPES_FILE_PATH, 'utf-8');

    // 3. Parse CSV into an array of arrays
    const records = parse(content, {
      delimiter: ',',
      columns: false,
      from_line: 2, // Skip header row
      skip_empty_lines: true,
      trim: true,
    });

    // 4. Use a Map for O(1) lookup performance during grouping
    const shapesMap = new Map();

    for (const record of records) {
      const [shapeId, lat, lon, seq] = record;

      // 5. Create the point object for EVERY row 
      const currentPoint = new ShapePoint({
        latitude: parseFloat(lat),
        longitude: parseFloat(lon),
        sequence: parseInt(seq, 10)
      });

      if (!shapesMap.has(shapeId)) {
        // 6. If it's a new shapeId, create a new Shape instance 
        // We initialize it with an array containing our first point
        const newShape = new Shape({ 
          id: shapeId, 
          shapePoint: currentPoint
        });
        shapesMap.set(shapeId, newShape);
      } else {
        // 7. If the shapeId already exists, retrieve the instance and add the point
        const existingShape = shapesMap.get(shapeId);
        existingShape.addShapePoint(currentPoint);
      }
    }

    // 8. Convert the Map values to a flat Array for the client
    const finalShapesArray = Array.from(shapesMap.values());

    // 9. Sort points within each shape to ensure the path is drawn correctly
    // (don't know if its necessary)
    finalShapesArray.forEach(shape => {
      shape.shapePoints.sort((a, b) => a.sequence - b.sequence);
    });

    // 10. Store in cache and return
    cachedShapes = finalShapesArray;
    return cachedShapes;

  } catch (error) {
    console.error("Error processing shapes file:", error);
    throw error;
  }
};