import { useCallback, useState } from 'react';
import Topbar from '../components/Topbar';
import MapView from '../components/MapView';
import { useStations } from '../hooks/station-hook.js';
import { useRealtimeSnapshot } from '../hooks/realtime-hook.js';

const Home = () => {
  // filterMode is the current state value
  // setFilterMode is the function to update the state value
  // when a setter is called, the variable changes and 
  // the component re-renders
  const [filterMode, setFilterMode] = useState('zona-urbana');
  const [filterValue, setFilterValue] = useState('');
  const [searchError, setSearchError] = useState('');
  const [isEditingFilterValue, setIsEditingFilterValue] = useState(false);
  const [selectedTrain, setSelectedTrain] = useState(null);
  const [zoomTarget, setZoomTarget] = useState(null);
  const { getStationNameById, stations } = useStations();
  const { trains, updates, error: trainError } = useRealtimeSnapshot();

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
    if (filterMode !== 'nombre-estacion' || !filterValue.trim()) {
      return [];
    }
    const normalizedInput = filterValue.toLowerCase();
    const matching = stations.filter((st) => 
      st.name.toLowerCase().includes(normalizedInput)
    );
    return matching.length <= 5 ? matching : [];
  };

  const handleSearch = useCallback((mode, value) => {
    const normalizedValue = value.trim();

    setFilterValue('');
    setSearchError('');
    setIsEditingFilterValue(false);
    
    if (mode === 'id-tren') {
      const train = trains.find(
        (currentTrain) => currentTrain.id === normalizedValue || currentTrain.train?.id === normalizedValue
      );

      if (train) {
        setSelectedTrain(train);
        return;
      }

      setSelectedTrain(null);
      setSearchError(`Tren con ID "${normalizedValue}" no encontrado`);
    } else if (mode === 'nombre-estacion') {
      const station = stations.find(
        (st) => st.name.toLowerCase().includes(normalizedValue.toLowerCase())
      );

      if (station) {
        setZoomTarget({ lat: station.latitude, lng: station.longitude });
        return;
      }

      setSearchError(`Estación "${normalizedValue}" no encontrada`);
    }
  }, [trains, stations]);

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
          getStationNameById={getStationNameById}
          zoomTarget={zoomTarget}
          onZoomComplete={() => setZoomTarget(null)}
        />
      </div>
    </div>
  );
};

export default Home;