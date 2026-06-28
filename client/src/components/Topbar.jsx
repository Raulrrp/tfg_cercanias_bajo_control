import React from 'react';
import { Search } from 'lucide-react';
// Importamos los componentes necesarios para la navegación sin recargar la página
import { Link, useLocation } from 'react-router-dom';

const Topbar = ({ 
  filterMode, 
  filterValue, 
  selectedLineZone = '', // Explicit reference property mapped into state scope values
  onFilterModeChange, 
  onFilterValueChange, 
  onLineZoneChange, // External hook parameter receiving changes from custom dropdown select options
  onSearch, 
  searchError, 
  selectedTrainText, 
  filterOptions = [], 
  urbanZones = [] 
}) => {
  //useLocation gives us the current tab to illuminate it
  const location = useLocation();

  const handleModeChange = (e) => onFilterModeChange(e.target.value);
  const handleValueChange = (e) => onFilterValueChange(e.target.value);
  const handleZoneSelectChange = (e) => onLineZoneChange(e.target.value); // Transmit target values back to parent state mechanisms

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && filterValue.trim() !== '') {
      // Avoid searching on intermediate enter key strikes when in line selection modes
      if (filterMode !== 'line') {
        onSearch(filterMode, filterValue);
      }
    }
  };

  const handleSearchClick = () => {
    if (filterValue.trim() !== '' && filterMode !== 'line') {
      onSearch(filterMode, filterValue);
    }
  };

  return (
    <header className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 md:px-8 bg-[#f3f4f6] border-b border-gray-200 text-gray-500 shrink-0">
      
      {/* Title and navigation tabs*/}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 md:gap-8">
        <h1 className="text-lg md:text-xl font-light text-gray-700 uppercase tracking-wide whitespace-nowrap">
          Cercanías Bajo Control
        </h1>
        
        {/* Tab selector */}
        <nav className="flex bg-gray-200 p-1 rounded-lg text-xs font-medium self-start sm:self-auto">
          <Link
            to="/"
            className={`px-4 py-1.5 rounded-md transition-colors ${
              location.pathname === '/' 
                ? 'bg-white text-gray-800 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Mapa
          </Link>
          <Link
            to="/analysis"
            className={`px-4 py-1.5 rounded-md transition-colors ${
              location.pathname === '/analysis' 
                ? 'bg-white text-gray-800 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Análisis
          </Link>
        </nav>
      </div>

      {/* Filter container */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label htmlFor="filter-mode" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Filtrar por:
          </label>
          <select
            id="filter-mode"
            value={filterMode}
            onChange={handleModeChange}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-[180px] shadow-sm"
          >
            <option value="urban-zone">Zona urbana</option>
            <option value="line">Línea</option>
            <option value="train-id">ID de tren</option>
            <option value="station-name">Nombre de estación</option>
          </select>
        </div>

        {/* Filter fields */}
        <div className="flex items-center relative">
          {filterMode === 'urban-zone' ? (
            <select
              id="filter-value"
              value={filterValue}
              onChange={handleValueChange}
              className="px-3 py-1.5 border border-gray-300 rounded-l-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-[220px] shadow-sm"
            >
              <option value="">Selecciona zona urbana...</option>
              {urbanZones.map((zone) => (
                <option key={zone.id} value={zone.name}>{zone.name}</option>
              ))}
            </select>
          ) : (
            <input
              id="filter-value"
              type="text"
              placeholder="Escribe un valor..."
              value={filterValue}
              onChange={handleValueChange}
              onKeyDown={handleKeyDown}
              list="filter-value-options"
              className={`px-3 py-1.5 border border-gray-300 text-sm text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-[220px] shadow-sm ${filterMode === 'line' ? 'rounded-lg' : 'rounded-l-lg'}`}
            />
          )}
          
          <datalist id="filter-value-options">
            {filterOptions.map((option) => (
              <option key={option.id} value={option.name} />
            ))}
          </datalist>

          {/* Conditional layout check ensuring the search execution trigger stays invisible in line operations */}
          {filterMode !== 'line' && (
            <button
              onClick={handleSearchClick}
              className="p-2 border border-gray-300 border-l-0 rounded-r-lg bg-white text-gray-500 hover:bg-gray-50 hover:text-blue-500 transition-colors shadow-sm flex items-center justify-center h-[34px]"
            >
              <Search className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Conditional container rendering for line operations when active criteria content criteria is present */}
        {filterMode === 'line' && filterValue.trim() !== '' && (
          <div className="flex items-center gap-2">
            <select
              id="line-zone-select"
              value={selectedLineZone}
              onChange={handleZoneSelectChange}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-[200px] shadow-sm"
            >
              <option value="">Selecciona zona de la línea...</option>
              {urbanZones.map((zone) => (
                <option key={zone.id} value={zone.name}>{zone.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* State messages */}
        {searchError && (
          <div className="text-xs font-medium text-red-500 bg-red-50 px-2.5 py-1 rounded-md border border-red-100 animate-pulse">
            {searchError}
          </div>
        )}
        {selectedTrainText && (
          <div className="text-xs font-medium text-[#4f8bc9] bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
            {selectedTrainText}
          </div>
        )}
      </div>
    </header>
  );
};

export default Topbar;