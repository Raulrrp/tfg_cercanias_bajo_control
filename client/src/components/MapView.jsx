// renders MapView and MapComntet

import { MapContainer, TileLayer, Polyline, ZoomControl, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useMemo, useRef } from 'react';

// hooks & components
import { useStations } from '../hooks/station-hook.js';
import { useShapes } from '../hooks/shape-hook.js'; // Import the new hook
import StationMarker from './StationMarker.jsx';
import TrainInfoCard from './TrainInfoCard.jsx';

const MapContent = ({ trains, stations, shapes, delayByTripId, onTrainSelect, selectedTrain, onCloseTrainCard, getStationById, zoomTarget, onZoomComplete }) => {
  const map = useMap();
  const markerRefs = useRef(new Map());

  // Follow the selected train
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

  // Zoom to station on search (one-time, no follow).
  useEffect(() => {
    if (!zoomTarget) return;

    map.setView([zoomTarget.lat, zoomTarget.lng], 15);
    onZoomComplete();
  }, [zoomTarget, map, onZoomComplete]);

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
              nextStopName={getStationById(train.nextStop)?.name}
              delay={delayByTripId.get(String(train.tripId))}
              onClose={onCloseTrainCard}
              inPopup={true}
            />
          </Popup>
        </CircleMarker>
      ))}
    </>
  );
};

const MapView = ({ trains, updates, trainError, onTrainSelect, selectedTrain, onCloseTrainCard, getStationById, zoomTarget, onZoomComplete }) => {
  // Initial position centered on Madrid
  const position = [40.4167, -3.7037];

  const { stations, error: stationError } = useStations();
  const { shapes, error: shapeError } = useShapes(); // Load the shapes

  const delayByTripId = useMemo(() => {
    const map = new Map();
    updates.forEach((update) => {
      map.set(String(update.tripId), update.delay);
    });
    return map;
  }, [updates]);

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
          delayByTripId={delayByTripId}
          onTrainSelect={onTrainSelect}
          selectedTrain={selectedTrain}
          onCloseTrainCard={onCloseTrainCard}
          getStationById={getStationById}
          zoomTarget={zoomTarget}
          onZoomComplete={onZoomComplete}
        />
      </MapContainer>
    </>
  );
};

export default MapView;