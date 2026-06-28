import React from 'react';
import { Search } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Topbar = ({ 
  filterMode, 
  filterValue, 
  selectedLineZone = '', 
  onFilterModeChange, 
  onFilterValueChange, 
  onLineZoneChange, 
  onSearch, 
  searchError, 
  selectedTrainText, 
  filterOptions = [], 
  urbanZones = [] 
}) => {
  const location = useLocation();

  const handleModeChange = (e) => {
    onFilterModeChange(e.target.value);
  };
  
  const handleValueChange = (e) => {
    onFilterValueChange(e.target.value);
  };
  
  const handleZoneSelectChange = (e) => {
    onLineZoneChange(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') e.preventDefault();
  };

  const handleSearchClick = () => {
    if (filterValue.trim() === '') return;
    
    if (filterMode === 'line') {
      if (selectedLineZone !== '') {
        onSearch(filterMode, filterValue, selectedLineZone);
      }
    } else {
      onSearch(filterMode, filterValue);
    }
  };

  // Single-line English comment: Get appropriate placeholder text based on the active generic filter mode
  const getPlaceholder = () => {
    if (filterMode === 'train-id') return "ID de tren";
    if (filterMode === 'station-name') return "Nombre de estación";
    return "Seleccionar...";
  };

  const hasValue = filterValue.trim() !== '';
  const hasLineAndZone = filterMode === 'line' && hasValue && selectedLineZone !== '';

  return (
    <header className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 md:px-8 bg-[#f3f4f6] border-b border-gray-200 text-gray-500 shrink-0">
      
      {/* Title and navigation tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 md:gap-8">
        <h1 className="text-lg md:text-xl font-light text-gray-700 uppercase tracking-wide whitespace-nowrap">
          Cercanías Bajo Control
        </h1>
        
        <nav className="flex bg-gray-200 p-1 rounded-lg text-xs font-medium self-start sm:self-auto">
          <Link to="/" className={`px-4 py-1.5 rounded-md transition-colors ${location.pathname === '/' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
            Mapa
          </Link>
          <Link to="/analysis" className={`px-4 py-1.5 rounded-md transition-colors ${location.pathname === '/analysis' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
            Análisis
          </Link>
        </nav>
      </div>

      {/* Filter container */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label htmlFor="filter-mode" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Filtrar por:
          </label>
          <select
            id="filter-mode"
            value={filterMode}
            onChange={handleModeChange}
            className="px-2 py-1 border border-gray-300 rounded-lg text-xs text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-[150px] shadow-sm h-[30px]"
          >
            <option value="urban-zone">Zona urbana</option>
            <option value="line">Línea</option>
            <option value="train-id">ID de tren</option>
            <option value="station-name">Nombre de estación</option>
          </select>
        </div>

        {/* REFACTOR: Clean separation of search inputs based on filter mode */}
        <div className="flex items-center gap-2">
          
          {/* 1. URBAN ZONE MODE */}
          {filterMode === 'urban-zone' && (
            <div className="flex items-center">
              <select
                value={filterValue}
                onChange={handleValueChange}
                className={`px-2 py-1 border border-gray-300 text-xs text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-[180px] shadow-sm h-[30px] ${hasValue ? 'rounded-l-lg' : 'rounded-lg'}`}
              >
                <option value="">Selecciona zona urbana...</option>
                {urbanZones.map((zone) => (
                  <option key={zone.id} value={zone.name}>{zone.name}</option>
                ))}
              </select>
              {hasValue && (
                <button onClick={handleSearchClick} className="p-1.5 border border-gray-300 border-l-0 rounded-r-lg bg-white text-gray-500 hover:bg-gray-50 hover:text-blue-500 h-[30px] w-[30px] flex items-center justify-center">
                  <Search className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* 2. LINE MODE */}
          {filterMode === 'line' && (
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Nombre línea"
                value={filterValue}
                onChange={handleValueChange}
                onKeyDown={handleKeyDown}
                list="filter-value-options"
                className="px-2 py-1 border border-gray-300 rounded-lg text-xs text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm h-[30px] min-w-[90px] max-w-[90px]"
              />
              
              {hasValue && (
                <div className="flex items-center">
                  <select
                    value={selectedLineZone}
                    onChange={handleZoneSelectChange}
                    className={`px-2 py-1 border border-gray-300 text-xs text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-[170px] shadow-sm h-[30px] ${selectedLineZone !== '' ? 'rounded-l-lg' : 'rounded-lg'}`}
                  >
                    <option value="">Selecciona zona de la línea...</option>
                    {urbanZones.map((zone) => (
                      <option key={zone.id} value={zone.name}>{zone.name}</option>
                    ))}
                  </select>
                  {selectedLineZone !== '' && (
                    <button onClick={handleSearchClick} className="p-1.5 border border-gray-300 border-l-0 rounded-r-lg bg-white text-gray-500 hover:bg-gray-50 hover:text-blue-500 h-[30px] w-[30px] flex items-center justify-center">
                      <Search className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 3. GENERIC TEXT MODES (Train ID & Station Name) */}
          {(filterMode === 'train-id' || filterMode === 'station-name') && (
            <div className="flex items-center">
              <input
                type="text"
                placeholder={getPlaceholder()}
                value={filterValue}
                onChange={handleValueChange}
                onKeyDown={handleKeyDown}
                list="filter-value-options"
                className={`px-2 py-1 border border-gray-300 text-xs text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm h-[30px] min-w-[180px] ${hasValue ? 'rounded-l-lg' : 'rounded-lg'}`}
              />
              {hasValue && (
                <button onClick={handleSearchClick} className="p-1.5 border border-gray-300 border-l-0 rounded-r-lg bg-white text-gray-500 hover:bg-gray-50 hover:text-blue-500 h-[30px] w-[30px] flex items-center justify-center">
                  <Search className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
          
          <datalist id="filter-value-options">
            {filterOptions.map((option) => (
              <option key={option.id} value={option.name} />
            ))}
          </datalist>
        </div>

        {/* State messages */}
        {searchError && (
          <div className="text-xs font-medium text-red-500 bg-red-50 px-2 py-0.5 rounded-md border border-red-100 animate-pulse h-[26px] flex items-center">
            {searchError}
          </div>
        )}
        {selectedTrainText && (
          <div className="text-xs font-medium text-[#4f8bc9] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 h-[26px] flex items-center">
            {selectedTrainText}
          </div>
        )}
      </div>
    </header>
  );
};

export default Topbar;