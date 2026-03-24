import { useState } from 'react';
import Topbar from '../components/Topbar';
import MapView from '../components/MapView';
import { useStations } from '../hooks/station-hook.js';

const Home = () => {
  // filterMode is the current state value
  // setFilterMode is the function to update the state value
  const [filterMode, setFilterMode] = useState('zona-urbana');
  const [searchQuery, setSearchQuery] = useState(null);
  const [searchError, setSearchError] = useState('');
  const [selectedTrain, setSelectedTrain] = useState(null);
  const { getStationNameById } = useStations();

  const handleFilterModeChange = (newMode) => {
    setFilterMode(newMode);
    setSearchError('');
    setSelectedTrain(null);
  };

  const handleSearch = (mode, value) => {
    setSearchError('');
    setSearchQuery({ mode, value });
  };

  const handleTrainSelect = (train) => {
    setSelectedTrain(train);
  };



  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>
      <Topbar
        filterMode={filterMode}
        onFilterModeChange={handleFilterModeChange}
        onSearch={handleSearch}
        searchError={searchError}
        selectedTrainText={selectedTrain ? 'Tren seleccionado' : ''}
      />
      <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
        <MapView
          searchQuery={searchQuery}
          onSearchError={(msg) => setSearchError(msg)}
          onTrainSelect={handleTrainSelect}
          selectedTrain={selectedTrain}
          onCloseTrainCard={() => setSelectedTrain(null)}
          getStationNameById={getStationNameById}
        />
      </div>
    </div>
  );
};

export default Home;