import { useState } from 'react';
import Topbar from '../components/Topbar';
import MapView from '../components/MapView';
import { useStations } from '../hooks/station-hook.js';

const Home = () => {
  // filterMode is the current state value
  // setFilterMode is the function to update the state value
  const [filterMode, setFilterMode] = useState('zona-urbana');
  const [filterValue, setFilterValue] = useState('');
  const [searchQuery, setSearchQuery] = useState(null);
  const [searchError, setSearchError] = useState('');
  const [isEditingFilterValue, setIsEditingFilterValue] = useState(false);
  const [selectedTrain, setSelectedTrain] = useState(null);
  const { getStationNameById } = useStations();

  const handleFilterModeChange = (newMode) => {
    setFilterMode(newMode);
    setFilterValue('');
    setIsEditingFilterValue(false);
    setSearchError('');
    setSelectedTrain(null);
  };

  const handleFilterValueChange = (newValue) => {
    setFilterValue(newValue);
    setIsEditingFilterValue(true);
    setSearchError('');
    setSelectedTrain(null);
  };

  const handleSearch = (mode, value) => {
    setSearchError('');
    setIsEditingFilterValue(false);
    setSearchQuery({ mode, value });
  };

  const handleTrainSelect = (train) => {
    setSelectedTrain(train);
  };



  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>
      <Topbar
        filterMode={filterMode}
        filterValue={filterValue}
        onFilterModeChange={handleFilterModeChange}
        onFilterValueChange={handleFilterValueChange}
        onSearch={handleSearch}
        searchError={isEditingFilterValue ? '' : searchError}
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