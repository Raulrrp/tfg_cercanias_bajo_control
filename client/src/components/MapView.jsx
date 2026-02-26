import { MapContainer, TileLayer, Polyline, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const MapView = () => {
  // Aproximate coordinates of the center of Spain
  const position = [40.4167, -3.7037];

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
      
      {/* Map here your train lines from a GeoJson or service */}
      {/* <Polyline positions={lineData} color="red" /> */}
    </MapContainer>
  );
};

export default MapView;