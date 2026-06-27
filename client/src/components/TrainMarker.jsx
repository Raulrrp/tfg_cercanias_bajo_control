import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import trainImg from '../assets/train.png';

const trainIcon = L.icon({
  iconUrl: trainImg,
  iconSize: [32, 32], 
  iconAnchor: [29, 16],
  popupAnchor: [-12, -20]
});

const TrainMarker = React.forwardRef(({ train, onClick, popupEventHandlers, children }, ref) => {
  return (
    <Marker
      ref={ref}
      position={[train.latitude, train.longitude]}
      icon={trainIcon}
      eventHandlers={{ 
        click: () => onClick?.(train),
        // Solución: El Marker detecta directamente cuando su popup se cierra
        popupclose: () => {
          if (popupEventHandlers?.remove) {
            popupEventHandlers.remove();
          }
        }
      }}
    >
      {/* El Popup ya no necesita gestionar el evento en segunda capa */}
      <Popup>
        {children}
      </Popup>
    </Marker>
  );
});

TrainMarker.displayName = 'TrainMarker';
export default TrainMarker;