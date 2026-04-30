import fs from 'fs';

// Path to your GTFS file
const FILE_PATH = '../data_files/shapes/shapes.txt';

function analyzeShapes() {
    // 1. Read the file
    const data = fs.readFileSync(FILE_PATH, 'utf8');
    const lines = data.split('\n');
    
    const shapesMap = new Map();

    // 2. Parse and store all shapes in the Map
    // Start at i=1 to skip the header row
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue; // Skip empty lines

        const [shape_id, latStr, lonStr, seqStr] = line.split(',');

        if (!shapesMap.has(shape_id)) {
            shapesMap.set(shape_id, []);
        }

        // Store lat, lon, and sequence
        shapesMap.get(shape_id).push({
            lat: parseFloat(latStr),
            lon: parseFloat(lonStr),
            seq: parseInt(seqStr, 10)
        });
    }

    // 3. Sort the points of each shape by their 'shape_pt_sequence' (crucial in GTFS)
    shapesMap.forEach(points => {
        points.sort((a, b) => a.seq - b.seq);
    });

    // 4. Perform the inverse validation
    console.log("--- VALIDATION RESULTS ---");
    
    shapesMap.forEach((invPoints, shape_id) => {
        // Check if the current shape is an inverse one
        if (shape_id.endsWith('_INV')) {
            const baseId = shape_id.replace('_INV', '');

            if (shapesMap.has(baseId)) {
                const basePoints = shapesMap.get(baseId);
                let isExactInverse = true;

                // First, they must have the exact same number of points
                if (basePoints.length !== invPoints.length) {
                    isExactInverse = false;
                } else {
                    // Loop and compare the start of 'base' with the end of 'inv'
                    for (let j = 0; j < basePoints.length; j++) {
                        const pBase = basePoints[j];
                        const pInv = invPoints[invPoints.length - 1 - j];

                        if (pBase.lat !== pInv.lat || pBase.lon !== pInv.lon) {
                            isExactInverse = false;
                            break; // Break the loop on the first mismatch
                        }
                    }
                }

                if (isExactInverse) {
                    console.log(`OK: ${shape_id} is a PERFECT inverse of ${baseId}`);
                } else {
                    console.log(`ERROR: ${shape_id} is NOT an exact inverse of ${baseId}`);
                }
            } else {
                console.log(`WARNING: Found ${shape_id} but its base ${baseId} does not exist`);
            }
        }
    });
}

analyzeShapes();