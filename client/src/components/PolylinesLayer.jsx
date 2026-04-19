import { Polyline, Popup } from 'react-leaflet';
import 'leaflet-polylineoffset';
import { useMemo } from 'react';

const resolveLineColor = (rawColor) => {
  const normalized = String(rawColor ?? '').trim();
  if (/^[0-9a-fA-F]{6}$/.test(normalized)) return `#${normalized}`;
  if (/^#[0-9a-fA-F]{6}$/.test(normalized)) return normalized;
  return '#ff4d4d';
};

export const PolylinesLayer = ({ lines }) => {
  const Polylines = useMemo(() => {
    return lines.map((line, index) => {
      const lineId = String(line.id ?? '').trim();
      const points = line.shape?.shapePoints || [];

      return {
        ...line,
        key: `${lineId}-${index}`,
        positions: points.map((point) => [point.latitude, point.longitude]),
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
      }}
    >
      <Popup>
        <strong>Línea:</strong> {polyline.name}
      </Popup>
    </Polyline>
  ));
};

export default PolylinesLayer;