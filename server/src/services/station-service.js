import { fetchStations } from '../data/files/station-repo-txt.js';
import { getShapes } from './shape-service.js';
import { point, lineString } from '@turf/helpers';
import nearestPointOnLinePkg from '@turf/nearest-point-on-line';

// Aseguramos la compatibilidad del paquete según el entorno de Node/ESM
const nearestPointOnLine = nearestPointOnLinePkg.default || nearestPointOnLinePkg;

let cachedStations = null;

const filterAndSnapStations = (stations, shapes, maxDistanceMeters = 50) => {
  const maxDistanceKm = maxDistanceMeters / 1000;
  // Margen de seguridad en grados (~0.01 grados equivale a poco más de 1km)
  // Si la estación no está ni a 1km del rectángulo de la vía, ni calculamos su snap.
  const DEGREE_MARGIN = 0.01; 
  const validStations = [];

  console.log(`[StationService] Pre-processing ${shapes.length} shapes into Turf LineStrings...`);

  const turfLines = shapes
    .filter(shape => shape.shapePoints && shape.shapePoints.length >= 2)
    .map(shape => {
      try {
        const coordinates = shape.shapePoints.map(p => [Number(p.longitude), Number(p.latitude)]);
        
        // Calcular la Bounding Box (Caja delimitadora) de la vía de tren
        let minLon = Infinity, maxLon = -Infinity;
        let minLat = Infinity, maxLat = -Infinity;
        
        for (const [lon, lat] of coordinates) {
          if (lon < minLon) minLon = lon;
          if (lon > maxLon) maxLon = lon;
          if (lat < minLat) minLat = lat;
          if (lat > maxLat) maxLat = lat;
        }

        return {
          id: shape.id,
          line: lineString(coordinates),
          // Guardamos los límites geográficos de esta vía
          bbox: { minLon, maxLon, minLat, maxLat }
        };
      } catch (err) {
        console.error(`[StationService] Failed to parse shape points for shape ${shape.id}:`, err.message);
        return null;
      }
    })
    .filter(Boolean);

  console.log(`[StationService] Processing ${stations.length} stations against prepared shapes with BBox optimization...`);

  const snapFunction = nearestPointOnLine.default || nearestPointOnLine;

  for (const station of stations) {
    if (!station.latitude || !station.longitude) continue;

    const sLon = Number(station.longitude);
    const sLat = Number(station.latitude);
    const stationPoint = point([sLon, sLat]);
    
    let closestSnap = null;
    let minDistanceKm = Infinity;

    for (const item of turfLines) {
      const { minLon, maxLon, minLat, maxLat } = item.bbox;

      // OPTIMIZACIÓN RADICAL: Descarte rápido por Bounding Box
      // Si la estación está completamente fuera del rectángulo extendido de la vía, saltamos.
      if (
        sLon < minLon - DEGREE_MARGIN || 
        sLon > maxLon + DEGREE_MARGIN || 
        sLat < minLat - DEGREE_MARGIN || 
        sLat > maxLat + DEGREE_MARGIN
      ) {
        continue; // Ignoramos esta shape para esta estación instantáneamente
      }

      try {
        // Solo llegamos aquí si la estación está realmente cerca del área de la vía
        const snapped = snapFunction(item.line, stationPoint);
        const distanceKm = snapped.properties.dist;

        if (distanceKm < minDistanceKm) {
          minDistanceKm = distanceKm;
          closestSnap = snapped;
        }
      } catch (err) {
        // Ignorar errores matemáticos aislados
      }
    }

    if (closestSnap && minDistanceKm <= maxDistanceKm) {
      validStations.push({
        ...station,
        latitude: closestSnap.geometry.coordinates[1],
        longitude: closestSnap.geometry.coordinates[0],
        distanceToShapeMeters: minDistanceKm * 1000
      });
    }
  }

  console.log(`[StationService] Successfully snapped and loaded ${validStations.length} stations.`);
  return validStations;
};

export const getStations = async () => {
  if (cachedStations) return cachedStations;

  const [rawStations, shapes] = await Promise.all([
    fetchStations(),
    getShapes()
  ]);

  if (!shapes || shapes.length === 0) {
    console.warn('[StationService] No shapes found. Returning empty stations array.');
    cachedStations = [];
    return cachedStations;
  }

  cachedStations = filterAndSnapStations(rawStations, shapes, 50);
  return cachedStations;
};

export const getStationById = async (stationId) => {
  const stations = await getStations();
  return stations.find((station) => String(station.id) === String(stationId)) ?? null;
};