import { useCallback, useState } from 'react';
import Topbar from '../components/Topbar';
import MapView from '../components/MapView';
import { useStations } from '../hooks/station-hook.js';
import { useTrainHelpers } from '../hooks/train-hook.js';
import { useRealtimeSnapshot } from '../hooks/realtime-hook.js';
import { useRouteShapes } from '../hooks/route-shapes-hook.js';

const Home = () => {
  // filterMode is the current state value
  // setFilterMode is the function to update the state value
  // when a setter is called, the variable changes and 
  // the component re-renders
  const [filterMode, setFilterMode] = useState('urban-zone');
  const [filterValue, setFilterValue] = useState('');
  const [searchError, setSearchError] = useState('');
  const [isEditingFilterValue, setIsEditingFilterValue] = useState(false);
  const [selectedTrain, setSelectedTrain] = useState(null);
  const [zoomTarget, setZoomTarget] = useState(null);
  const { getStationByName, getStationById, getStationOptionsByName } = useStations();
  const { getTrainById } = useTrainHelpers();
  const { trains, updates, error: trainError } = useRealtimeSnapshot();
  const { getRouteShapeById } = useRouteShapes();

  const handleFilterModeChange = (newMode) => {
    setFilterMode(newMode);
    setFilterValue('');
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

  // handles search based on filter mode
  const handleSearch = useCallback((mode, value) => {
    const normalizedValue = value.trim();

    setFilterValue('');
    setSearchError('');
    setIsEditingFilterValue(false);
    
    if (mode === 'train-id') {
      const train = getTrainById(trains, normalizedValue);

      if (train) {
        setSelectedTrain(train);
        return;
      }

      setSelectedTrain(null);
      setSearchError(`Tren con ID "${normalizedValue}" no encontrado`);
    } else if (mode === 'station-name') {
      const station = getStationByName(normalizedValue);

      if (station) {
        setZoomTarget({ lat: station.latitude, lng: station.longitude });
        return;
      }

      setSearchError(`Estación "${normalizedValue}" no encontrada`);
    } else if (mode === 'urban-zone') {

    } else if (mode === 'route') {
      setSelectedTrain(null);
      const routeShape = getRouteShapeById(normalizedValue);
      
      if (routeShape && routeShape.minLatitude
        && routeShape.maxLatitude && routeShape.minLongitude
        && routeShape.maxLongitude
      ){
        setZoomTarget({
          bounds: [
            [routeShape.minLatitude, routeShape.minLongitude],
            [routeShape.maxLatitude, routeShape.maxLongitude]
          ]
        });
        return;
      }

      setSearchError(`Línea "${normalizedValue}" no encontrada`);
    }


  }, [trains, getStationByName, getTrainById, getRouteShapeById]);

  const handleTrainSelect = useCallback((train) => {
    if (!train) return;
    setSearchError('');
    setSelectedTrain(train);
  }, []);

  const handleTrainDeselect = useCallback(() => {
    setSelectedTrain(null);
    setFilterValue('');
    setSearchError('');
    setIsEditingFilterValue(false);
  }, []);



  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>
      <Topbar
        filterMode={filterMode}
        filterValue={filterValue}
        onFilterModeChange={handleFilterModeChange}
        onFilterValueChange={handleFilterValueChange}
        onSearch={handleSearch}
        searchError={isEditingFilterValue ? '' : searchError}
        selectedTrainText={selectedTrain ? 'Tren seleccionado' : ''}
        filterOptions={getFilterOptions()}
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

export default Home;