import { Polyline, Popup } from 'react-leaflet';
import 'leaflet-polylineoffset';
import { useMemo } from 'react';

const OFFSET_STEP = 0.3;

const resolveLineColor = (rawColor) => {
  const normalized = String(rawColor ?? '').trim();
  if (/^[0-9a-fA-F]{6}$/.test(normalized)) return `#${normalized}`;
  if (/^#[0-9a-fA-F]{6}$/.test(normalized)) return normalized;
  return '#ff4d4d';
};

const getOffsetForIndex = (index) => {
  if (index === 0) return 0;

  const magnitude = Math.ceil(index / 2) * OFFSET_STEP;
  return index % 2 === 1 ? magnitude : -magnitude;
};

export const PolylinesLayer = ({ lines }) => {
  const Polylines = useMemo(() => {
    const lineIndexByZone = new Map();

    return lines.map((line, index) => {
      const lineId = String(line.id ?? '').trim();
      const points = line.shape?.shapePoints || [];
      const zoneKey = String(line.urbanZone ?? '').trim();
      const zoneIndex = lineIndexByZone.get(zoneKey) ?? 0;
      lineIndexByZone.set(zoneKey, zoneIndex + 1);

      return {
        ...line,
        key: `${lineId}-${index}`,
        positions: points.map((point) => [point.latitude, point.longitude]),
        offset: getOffsetForIndex(zoneIndex),
      };
    });
  }, [lines]);

  return Polylines.map((polyline) => (
    <Polyline
      key={polyline.key}
      positions={polyline.positions}
      pathOptions={{
        color: resolveLineColor(polyline.color),
        weight: 3,
        opacity: 0.8,
        offset: polyline.offset,
      }}
    >
      <Popup>
        <strong>Línea:</strong> {polyline.name}
      </Popup>
    </Polyline>
  ));
};

export default PolylinesLayer;