import { useCallback, useState } from 'react';
import Topbar from '../components/Topbar.jsx';
import MapView from '../components/MapView.jsx';
import { useGlobalData } from '../context/DataContext.jsx';

const Map = () => {
  const [filterMode, setFilterMode] = useState('urban-zone');
  const [filterValue, setFilterValue] = useState('');
  const [selectedLineZone, setSelectedLineZone] = useState(''); // Tracks the urban zone chosen for the line filter
  const [searchError, setSearchError] = useState('');
  const [isEditingFilterValue, setIsEditingFilterValue] = useState(false);
  const [selectedTrain, setSelectedTrain] = useState(null);
  const [zoomTarget, setZoomTarget] = useState(null);

  // Destructure application-wide shared state instances from the global context wrapper
  const { 
    stationHelpers: { getStationByName, getStationById, getStationOptionsByName },
    trainHelpers: { getTrainById },
    realtimeData: { trains, updates, error: trainError },
    lineHelpers: { getLineByNameAndZone },
    zoneHelpers: { zones, getUrbanZoneByName }
  } = useGlobalData();

  const handleFilterModeChange = (newMode) => {
    setFilterMode(newMode);
    setFilterValue('');
    setSelectedLineZone(''); // Clean line zone state on mode switching
    setSearchError('');
    setIsEditingFilterValue(false);
    setSelectedTrain(null);
  };

  const handleFilterValueChange = (newValue) => {
    setFilterValue(newValue);
    setSearchError('');
    setIsEditingFilterValue(true);
    setSelectedTrain(null);
  };

  const getFilterOptions = () => {
    if (filterMode !== 'station-name' || !filterValue.trim()) {
      return [];
    }
    return getStationOptionsByName(filterValue);
  };

  const handleSearch = useCallback((mode, value, extraParam = null) => {
    const normalizedValue = value.trim();
    setSearchError('');
    setIsEditingFilterValue(false);
    
    if (mode === 'train-id') {
      setFilterValue('');
      const train = getTrainById(trains, normalizedValue);
      if (train) {
        setSelectedTrain(train);
        return;
      }
      setSelectedTrain(null);
      setSearchError(`Tren con ID "${normalizedValue}" no encontrado`);
    } else if (mode === 'station-name') {
      setFilterValue('');
      const station = getStationByName(normalizedValue);
      if (station) {
        setZoomTarget({ lat: station.latitude, lng: station.longitude });
        return;
      }
      setSearchError(`Estación "${normalizedValue}" no encontrada`);
    } else if (mode === 'urban-zone') {
      setFilterValue('');
      const zone = getUrbanZoneByName(normalizedValue);
      if (zone) {
        const centerLat = zone.center_lat ?? zone.centerLat;
        const centerLng = zone.center_lon ?? zone.centerLon;
        if (Number.isFinite(centerLat) && Number.isFinite(centerLng)) {
          setZoomTarget({ lat: centerLat, lng: centerLng, zoom: 9 });
          return;
        }
        return;
      }
      setSearchError(`Zona urbana "${normalizedValue}" no encontrada`);
    } else if (mode === 'line') {
      const zoneName = extraParam;
      if (!zoneName) return;

      const line = getLineByNameAndZone(normalizedValue, zoneName);
      if (line) {
        const { minLatitude, maxLatitude, minLongitude, maxLongitude } = line;
        if (minLatitude && maxLatitude && minLongitude && maxLongitude) {
          // Structure the bounding box geometry using the standard multidimensional array format required by Leaflet fitBounds
          setZoomTarget({
            bounds: [
              [minLatitude, minLongitude],
              [maxLatitude, maxLongitude]
            ]
          });
        } else {
          setSearchError(`La línea "${normalizedValue}" no contiene coordenadas válidas de límites`);
        }
      } else {
        setSearchError(`No se encontró la línea "${normalizedValue}" en la zona "${zoneName}"`);
      }
    }
  }, [trains, getStationByName, getTrainById, getUrbanZoneByName, getLineByNameAndZone]);

  const handleLineZoneChange = (zoneName) => {
    setSelectedLineZone(zoneName);
    if (zoneName && filterValue.trim()) {
      handleSearch('line', filterValue, zoneName);
    }
  };

  const handleTrainSelect = useCallback((train) => {
    if (!train) return;
    setSearchError('');
    setSelectedTrain(train);
  }, []);

  const handleTrainDeselect = useCallback(() => {
    setSelectedTrain(null);
    setFilterValue('');
    setSelectedLineZone(''); // Reset the custom line zone picker on data clear operations
    setSearchError('');
    setIsEditingFilterValue(false);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>
      <Topbar
        filterMode={filterMode}
        filterValue={filterValue}
        selectedLineZone={selectedLineZone} // Provide the persistent line zone status configuration property
        onFilterModeChange={handleFilterModeChange}
        onFilterValueChange={handleFilterValueChange}
        onLineZoneChange={handleLineZoneChange} // Expose the proxy function that delegates back into handleSearch
        onSearch={handleSearch}
        searchError={isEditingFilterValue ? '' : searchError}
        selectedTrainText={selectedTrain ? 'Tren seleccionado' : ''}
        filterOptions={getFilterOptions()}
        urbanZones={zones}
      />
      <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
        <MapView
          trains={trains}
          updates={updates}
          trainError={trainError}
          onTrainSelect={handleTrainSelect}
          selectedTrain={selectedTrain}
          onCloseTrainCard={handleTrainDeselect}
          getStationById={getStationById}
          zoomTarget={zoomTarget}
          onZoomComplete={() => setZoomTarget(null)}
        />
      </div>
    </div>
  );
};

export default Map;