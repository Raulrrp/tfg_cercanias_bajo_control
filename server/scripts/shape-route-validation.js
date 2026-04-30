// calculating how many shapes are related to each short-name
// to find out if the combination (short-name, urban-zone) is unique

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';

// ESM workaround to recreate __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// File path configuration
const ROUTES_FILE = path.resolve(__dirname, '../data_files/routes.txt');
const TRIPS_FILE = path.resolve(__dirname, '../data_files/trips.txt');

function validateGTFS() {
    try {
        console.log("Starting validation...");

        // 1. Load and process routes.txt
        const routesContent = fs.readFileSync(ROUTES_FILE, 'utf-8');
        const routesData = parse(routesContent, {
            columns: true,
            skip_empty_lines: true,
            trim: true
        });

        // Create a lookup map: route_id -> route_short_name
        const routesMap = new Map(
            routesData.map(r => [r.route_id, r.route_short_name])
        );

        // 2. Load and process trips.txt
        const tripsContent = fs.readFileSync(TRIPS_FILE, 'utf-8');
        const tripsData = parse(tripsContent, {
            columns: true,
            skip_empty_lines: true,
            trim: true
        });

        // 3. Perform analysis
        const analysis = {};

        tripsData.forEach(trip => {
            const rId = trip.route_id;
            const sId = trip.shape_id;
            
            // Skip trips with inverted shapes
            if (sId && String(sId).includes('_INV')) {
                return;
            }
            
            // If the route_id is missing from routesMap, mark it as an error
            const shortName = routesMap.has(rId) 
                ? routesMap.get(rId) 
                : `ERROR: route_id [${rId}] missing in routes.txt`;

            if (!analysis[shortName]) {
                analysis[shortName] = new Set(); // Use Set for unique values
            }
            
            if (sId) {
                analysis[shortName].add(sId);
            }
        });

        // 4. Format and display results
        const summary = Object.keys(analysis)
            .sort()
            .map(name => ({
                "Route / Short Name": name,
                "Unique Shapes Count": analysis[name].size
            }));

        console.log("--- VALIDATION RESULTS ---");
        console.table(summary);

    } catch (err) {
        console.error("Critical Error:", err.message);
    }
}

validateGTFS();