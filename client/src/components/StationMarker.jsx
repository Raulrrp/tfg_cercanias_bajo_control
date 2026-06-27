import { CircleMarker, Marker, Popup } from 'react-leaflet';
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
    <CircleMarker
      // 0.0002 is a little right biased offset to ease its visualization
      center={[station.latitude, station.longitude+0.0002]}
      radius={6}
      pathOptions={{ color: '#6b8299', fillColor: '#ffffff', fillOpacity: 1, weight: 2 }}
      eventHandlers={{ click: () => onClick && onClick(station) }}
    />
  );
};

export default StationMarker;