import { MapContainer, TileLayer, Polyline, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// hooks & components
import { useStations } from '../hooks/station-hook.js';
import StationMarker from './StationMarker.jsx';

const MapView = () => {
  // Aproximate coordinates of the center of Spain
  const position = [40.4167, -3.7037];

  const { stations, error } = useStations();

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

      {/* Optionally display an error message on the map */}
      {error && <div className="map-error">{error}</div>}

      {/* render a marker for each station */}
      {stations.map(st => (
        <StationMarker key={st.id} station={st} />
      ))}

      {/* Map here your train lines from a GeoJson or service */}
      {/* <Polyline positions={lineData} color="red" /> */}
    </MapContainer>
  );
};

export default MapView;