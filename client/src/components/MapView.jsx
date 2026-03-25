import { MapContainer, TileLayer, Polyline, ZoomControl, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef } from 'react';

// hooks & components
import { useStations } from '../hooks/station-hook.js';
import { useShapes } from '../hooks/shape-hook.js'; // Import the new hook
import StationMarker from './StationMarker.jsx';
import TrainInfoCard from './TrainInfoCard.jsx';

const MapContent = ({ trains, stations, shapes, onTrainSelect, selectedTrain, onCloseTrainCard, getStationNameById }) => {
  const map = useMap();
  const markerRefs = useRef(new Map());

  // Follow the selected train using its latest coordinates from the live train list.
  useEffect(() => {
    if (!selectedTrain) return;

    const liveSelectedTrain = trains.find(
      (train) => train.id === selectedTrain.id || train.train?.id === selectedTrain.id
    );

    if (!liveSelectedTrain) return;

    const marker = markerRefs.current.get(liveSelectedTrain.id);
    if (marker) {
      marker.openPopup();
    }

    map.setView([liveSelectedTrain.latitude, liveSelectedTrain.longitude], 15);
  }, [selectedTrain, trains]);

  return (
    <>
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; OpenStreetMap contributors'
      />
      <ZoomControl position="topright" />

      {/* 1. Render Train Lines (Shapes) */}
      {shapes.map(shape => {
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

      {/* 3. Render Train Positions */}
      {trains.map(train => (
        <CircleMarker
          key={train.id}
          ref={(marker) => {
            if (marker) {
              markerRefs.current.set(train.id, marker);
            } else {
              markerRefs.current.delete(train.id);
            }
          }}
          center={[train.latitude, train.longitude]}
          radius={6}
          pathOptions={{ color: '#005f73', fillColor: '#0a9396', fillOpacity: 0.95, weight: 1 }}
          eventHandlers={{
            click: () => onTrainSelect(train)
          }}
        >
          <Popup
            eventHandlers={{
              remove: () => {
                if (selectedTrain?.id === train.id) {
                  onCloseTrainCard();
                }
              }
            }}
          >
            <TrainInfoCard
              train={train}
              nextStopName={getStationNameById(train.nextStop)}
              delay={null}
              onClose={onCloseTrainCard}
              inPopup={true}
            />
          </Popup>
        </CircleMarker>
      ))}
    </>
  );
};

const MapView = ({ trains, trainError, onTrainSelect, selectedTrain, onCloseTrainCard, getStationNameById }) => {
  const position = [40.4167, -3.7037];

  const { stations, error: stationError } = useStations();
  const { shapes, error: shapeError } = useShapes(); // Load the shapes

  return (
    <>
      {(stationError || shapeError || trainError) && (
        <div className="map-error">{stationError || shapeError || trainError}</div>
      )}
      <MapContainer 
        center={position} 
        zoom={6} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <MapContent 
          trains={trains} 
          stations={stations} 
          shapes={shapes}
          onTrainSelect={onTrainSelect}
          selectedTrain={selectedTrain}
          onCloseTrainCard={onCloseTrainCard}
          getStationNameById={getStationNameById}
        />
      </MapContainer>
    </>
  );
};

export default MapView;