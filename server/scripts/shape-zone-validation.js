// This scripts counts the number of shapes which id doesn't
// start with the id of a valid urban zone

/*
70 -> Zaragoza
62 -> Cantabria
61 -> San Sebastián
60 -> Bilbao
51 -> Cataluña
41 -> Alicante Murcia
40 -> Valencia (hecho)
32 -> Málaga
31 -> Cádiz
30 -> Sevilla (HECHO)
20 -> Asturias (hecho)
10 -> Madrid (hecho)

After running, conclusion: there are no shapes with invalid prefixes
*/

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SHAPES_FILE = path.resolve(__dirname, '../data_files/shapes/shapes.txt');
const VALID_URBAN_ZONE_PREFIXES = new Set(['70', '62', '61', '60', '51', '41', '40', '32', '31', '30', '20', '10']);

export function countShapesWithInvalidUrbanZonePrefix() {
	const shapesContent = fs.readFileSync(SHAPES_FILE, 'utf-8');
	const shapesData = parse(shapesContent, {
		columns: true,
		skip_empty_lines: true,
		trim: true,
	});

	const uniqueShapeIds = new Set(
		shapesData
			.map((shapeRow) => String(shapeRow.shape_id ?? '').trim())
			.filter((shapeId) => shapeId.length > 0)
	);

	const invalidShapeIds = Array.from(uniqueShapeIds).filter((shapeId) => {
		const prefix = shapeId.slice(0, 2);
		return !VALID_URBAN_ZONE_PREFIXES.has(prefix);
	});

	return {
		totalUniqueShapes: uniqueShapeIds.size,
		invalidUniqueShapes: invalidShapeIds.length,
		invalidShapeIds,
	};
}

function runValidation() {
	try {
		const result = countShapesWithInvalidUrbanZonePrefix();

		console.log('--- SHAPE ZONE PREFIX VALIDATION ---');
		console.log(`Total unique shapes: ${result.totalUniqueShapes}`);
		console.log(`Invalid unique shapes: ${result.invalidUniqueShapes}`);

		if (result.invalidShapeIds.length > 0) {
			console.log('Invalid shape IDs:');
			result.invalidShapeIds.forEach((shapeId) => console.log(`- ${shapeId}`));
		}
	} catch (error) {
		console.error('Critical Error:', error.message);
	}
}

runValidation();

