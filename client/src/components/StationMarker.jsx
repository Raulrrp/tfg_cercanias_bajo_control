import { Marker } from 'react-leaflet';
import L from 'leaflet';

// Fix para el icono por defecto en Leaflet con Webpack/Vite
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const defaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

const StationMarker = ({ station, onClick }) => {
  return (
    <Marker
      position={[station.latitude, station.longitude]}
      icon={defaultIcon}
      eventHandlers={{
        click: () => onClick && onClick(station)
      }}
    />
  );
};

export default StationMarker;