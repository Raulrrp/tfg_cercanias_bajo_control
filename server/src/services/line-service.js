import { fetchLines } from '../data/files/line-repo.js';
import { getRouteById } from './route-service.js';
import { getUrbanZoneNameFromIdentifier } from './urban-zones-service.js';

export const getLines = async () => {
  const data = await fetchLines();
  return data;
};

export const getLineByShapeId = async (shapeId) => {
  const lines = await getLines();
  return lines.find((line) => String(line.shape?.id ?? '').trim() === String(shapeId ?? '').trim()) ?? null;
};

export const getLineByKey = async ({ name, urbanZone } = {}) => {
  const lines = await getLines();
  const normalizedName = String(name ?? '').trim();
  const normalizedUrbanZone = String(urbanZone ?? '').trim();

  return lines.find((line) => (
    String(line.name ?? '').trim() === normalizedName
    && String(line.urbanZone ?? '').trim() === normalizedUrbanZone
  )) ?? null;
};

export const getLineByRouteId = async (routeId) => {
  const route = await getRouteById(routeId);
  if (!route?.shortName) return null;

  const urbanZone = await getUrbanZoneNameFromIdentifier(route.id);
  if (!urbanZone) return null;

  return getLineByKey({ name: route.shortName, urbanZone });
};
