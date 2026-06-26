import { MapContainer, TileLayer, ZoomControl, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useMemo, useRef } from 'react';
import { AlertCircle } from 'lucide-react';

import { useStations } from '../hooks/station-hook.js';
import { useLines } from '../hooks/line-hook.js';
import { useStopTimes } from '../hooks/stop-times-hook.js';
import StationMarker from './StationMarker.jsx';
import PolylinesLayer from './PolylinesLayer.jsx';
import TrainInfoCard from './TrainInfoCard.jsx';
import TimetablePopup from './TimetablePopup.jsx';
import TrainMarker from './TrainMarker.jsx';

const MapContent = ({ trains, stations, lines, delayByTripId, onTrainSelect, selectedTrain, onCloseTrainCard, getStationById, zoomTarget, onZoomComplete }) => {
  const map = useMap();
  const markerRefs = useRef(new Map());

  const {
    timetableOpen,
    timetableStation,
    timetableData,
    timetableLoading,
    timetableError,
    fetchTimetable,
    closeTimetable
  } = useStopTimes();

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
  }, [selectedTrain, trains, map]);

  useEffect(() => {
    if (!zoomTarget) return;

    if (zoomTarget.bounds) {
      map.fitBounds(zoomTarget.bounds, { padding: [50, 50] });
    } else if (Number.isFinite(zoomTarget.lat) && Number.isFinite(zoomTarget.lng)) {
      const targetZoom = Number.isFinite(zoomTarget.zoom) ? zoomTarget.zoom : 15;
      map.setView([zoomTarget.lat, zoomTarget.lng], targetZoom);
    }
    onZoomComplete();
  }, [zoomTarget, map, onZoomComplete]);

  return (
    <>
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; OpenStreetMap contributors'
      />
      <ZoomControl position="topright" />

      <PolylinesLayer lines={lines} />

      {stations.map(st => (
        <StationMarker key={st.id} station={st} onClick={fetchTimetable} />
      ))}

      {trains.map(train => (
        <TrainMarker
          key={train.id}
          ref={(marker) => {
            if (marker) {
              markerRefs.current.set(train.id, marker);
            } else {
              markerRefs.current.delete(train.id);
            }
          }}
          train={train}
          onClick={onTrainSelect}
          popupEventHandlers={{
            remove: () => {
              if (selectedTrain?.id === train.id) {
                onCloseTrainCard();
              }
            }
          }}
        >
          <TrainInfoCard
            train={train}
            nextStopName={getStationById(train.nextStationId)?.name}
            delay={delayByTripId.get(String(train.tripId))}
            onClose={onCloseTrainCard}
            inPopup={true}
          />
        </TrainMarker>
      ))}

      {timetableOpen && (
        <TimetablePopup
          station={timetableStation}
          stopTimes={timetableData}
          loading={timetableLoading}
          error={timetableError}
          onClose={closeTimetable}
        />
      )}
    </>
  );
};

const MapView = ({ trains, updates, trainError, onTrainSelect, selectedTrain, onCloseTrainCard, getStationById, zoomTarget, onZoomComplete }) => {
  const position = [40.4167, -3.7037];

  const { stations, error: stationError } = useStations();
  const { lines, error: lineError } = useLines();

  const delayByTripId = useMemo(() => {
    const map = new Map();
    updates.forEach((update) => {
      map.set(String(update.tripId), update.delay);
    });
    return map;
  }, [updates]);

  const activeError = stationError || lineError || trainError;

  return (
    <div className="w-full h-full relative font-sans">
      {activeError && (
        <div className="absolute top-4 left-4 z-[2000] flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-2.5 rounded-xl shadow-md text-sm font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{activeError}</span>
        </div>
      )}
      
      <MapContainer 
        center={position} 
        zoom={6} 
        className="w-full h-full"
        zoomControl={false}
      >
        <MapContent 
          trains={trains} 
          stations={stations} 
          lines={lines}
          delayByTripId={delayByTripId}
          onTrainSelect={onTrainSelect}
          selectedTrain={selectedTrain}
          onCloseTrainCard={onCloseTrainCard}
          getStationById={getStationById}
          zoomTarget={zoomTarget}
          onZoomComplete={onZoomComplete}
        />
      </MapContainer>
    </div>
  );
};

export default MapView;