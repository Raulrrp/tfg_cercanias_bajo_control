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

/* 💡 OPCIONAL: Si prefieres un diseño de marcador circular minimalista (estilo estación de metro plana) 
  que encaje aún MEJOR con la estética limpia de Análisis en lugar del pin azul clásico, 
  puedes sustituir el componente <Marker> por un <CircleMarker> de Leaflet de esta forma:
  */
  


const StationMarker = ({ station, onClick }) => {
  return (
    <CircleMarker
      center={[station.latitude, station.longitude]}
      radius={4.5}
      pathOptions={{ color: '#6b8299', fillColor: '#ffffff', fillOpacity: 1, weight: 2 }}
      eventHandlers={{ click: () => onClick && onClick(station) }}
    />
  );
};

export default StationMarker;