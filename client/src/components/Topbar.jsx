import React from 'react';
import { Menu, Search } from 'lucide-react';

const Topbar = ({ 
  filterMode, 
  filterValue, 
  onFilterModeChange, 
  onFilterValueChange, 
  onSearch, 
  searchError, 
  selectedTrainText, 
  filterOptions = [], 
  urbanZones = [] 
}) => {

  const handleModeChange = (e) => onFilterModeChange(e.target.value);
  const handleValueChange = (e) => onFilterValueChange(e.target.value);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && filterValue.trim() !== '') {
      onSearch(filterMode, filterValue);
    }
  };

  const handleSearchClick = () => {
    if (filterValue.trim() !== '') {
      onSearch(filterMode, filterValue);
    }
  };

  return (
    <header className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 md:px-8 bg-[#f3f4f6] border-b border-gray-200 text-gray-500 shrink-0">
      
      {/* Título unificado con la estética de Análisis */}
      <div className="flex items-center text-gray-500">
        <Menu className="w-6 h-6 mr-3 cursor-pointer stroke-2" />
        <h1 className="text-lg md:text-xl font-light text-gray-700 uppercase tracking-wide">
          Cercanías Bajo Control | Mapa
        </h1>
      </div>

      {/* Contenedor de Filtros Avanzados */}
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

        {/* Input Dinámico / Select del Filtro */}
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
              className="px-3 py-1.5 border border-gray-300 rounded-l-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-[220px] shadow-sm"
            />
          )}
          
          <datalist id="filter-value-options">
            {filterOptions.map((option) => (
              <option key={option.id} value={option.name} />
            ))}
          </datalist>

          <button
            onClick={handleSearchClick}
            className="p-2 border border-gray-300 border-l-0 rounded-r-lg bg-white text-gray-500 hover:bg-gray-50 hover:text-blue-500 transition-colors shadow-sm flex items-center justify-center h-[34px]"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>

        {/* Mensajes de Estado Estilizados */}
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