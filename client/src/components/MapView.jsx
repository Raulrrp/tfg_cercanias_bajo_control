import { MapContainer, TileLayer, Polyline, ZoomControl, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';

// hooks & components
import { useStations } from '../hooks/station-hook.js';
import { useShapes } from '../hooks/shape-hook.js'; // Import the new hook
import { useTrains } from '../hooks/train-hook.js';
import StationMarker from './StationMarker.jsx';
import TrainInfoCard from './TrainInfoCard.jsx';

const MapContent = ({ searchQuery, onSearchError, trains, stations, shapes, onTrainSelect, selectedTrain, onCloseTrainCard, getStationNameById }) => {
  const map = useMap();

  useEffect(() => {
    if (!searchQuery || searchQuery.mode !== 'id-tren') return;

    const trainId = searchQuery.value.trim();
    const train = trains.find(t => t.id === trainId || t.train?.id === trainId);

    if (train) {
      // Zoom to the train
      map.setView([train.latitude, train.longitude], 12);
      onSearchError('');
    } else {
      onSearchError(`Tren con ID "${trainId}" no encontrado`);
    }
  }, [searchQuery, trains, map, onSearchError]);

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
          center={[train.latitude, train.longitude]}
          radius={6}
          pathOptions={{ color: '#005f73', fillColor: '#0a9396', fillOpacity: 0.95, weight: 1 }}
          eventHandlers={{
            click: () => onTrainSelect(train)
          }}
        >
          <Popup autoOpen={selectedTrain?.id === train.id}>
            {selectedTrain?.id === train.id ? (
              <TrainInfoCard
                train={selectedTrain}
                nextStopName={getStationNameById(selectedTrain.nextStop)}
                delay={null}
                onClose={onCloseTrainCard}
                inPopup={true}
              />
            ) : (
              <span>{train.train?.label || train.train?.id || 'Train'}</span>
            )}
          </Popup>
        </CircleMarker>
      ))}
    </>
  );
};

const MapView = ({ searchQuery, onSearchError, onTrainSelect, selectedTrain, onCloseTrainCard, getStationNameById }) => {
  const position = [40.4167, -3.7037];

  const { stations, error: stationError } = useStations();
  const { shapes, error: shapeError } = useShapes(); // Load the shapes
  const { trains, error: trainError } = useTrains();

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
          searchQuery={searchQuery} 
          onSearchError={onSearchError}
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