import { MapContainer, TileLayer, Polyline, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// hooks & components
import { useStations } from '../hooks/station-hook.js';
import { useShapes } from '../hooks/shape-hook.js'; // Import the new hook
import StationMarker from './StationMarker.jsx';

const MapView = () => {
  const position = [40.4167, -3.7037];

  const { stations, error: stationError } = useStations();
  const { shapes, error: shapeError } = useShapes(); // Load the shapes

  return (
    <MapContainer 
      center={position} 
      zoom={6} 
      style={{ height: '100%', width: '100%' }}
      zoomControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; OpenStreetMap contributors'
      />
      <ZoomControl position="topright" />

      {(stationError || shapeError) && (
        <div className="map-error">{stationError || shapeError}</div>
      )}

      {/* 1. Render Train Lines (Shapes) */}
      {shapes.map(shape => {
        // Transform shapePoints objects into Leaflet [lat, lon] arrays
        const polylinePositions = shape.shapePoints.map(p => [
          p.latitude, 
          p.longitude
        ]);

        return (
          <Polyline 
            key={shape.id} 
            positions={polylinePositions} 
            pathOptions={{ color: '#ff4d4d', weight: 3, opacity: 0.7 }} 
          />
        );
      })}

      {/* 2. Render Station Markers */}
      {stations.map(st => (
        <StationMarker key={st.id} station={st} />
      ))}
    </MapContainer>
  );
};

export default MapView;