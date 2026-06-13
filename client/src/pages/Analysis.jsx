import React, { useState } from 'react';
import { TrainFront, Loader2, AlertCircle } from 'lucide-react';
// Importamos los componentes de navegación nativos
import { Link, useLocation } from 'react-router-dom';
import HorizontalChartCard from '../components/HorizontalChartCard.jsx';
import KPICard from '../components/KPICard.jsx';
import { useAnalysis } from '../hooks/analysis-hook.js';
import { useLines } from '../hooks/line-hook.js';
import { useUrbanZones } from '../hooks/urban-zones-hook.js';

const Analysis = () => {
  // Hook para detectar la ruta actual e iluminar la pestaña activa
  const location = useLocation();

  // Extract state variables from our custom hook
  const { dashboardData, loading, error } = useAnalysis();

  const [lineUrbanZoneFilter, setLineUrbanZoneFilter] = useState('');
  const [stationLineFilter, setStationLineFilter] = useState('');
  const [stationUrbanZoneFilter, setStationUrbanZoneFilter] = useState('');
  
  const { getLinesByZone } = useLines();
  const { zones, getUrbanZoneByName } = useUrbanZones();

  // Handler to update the selected zone and reset the line.
  const handleStationUrbanZoneFilter = (urbanZoneName) => {
    setStationUrbanZoneFilter(urbanZoneName);
    setStationLineFilter('');
  }

  // Derived state: calculate filtered lines dynamically based on the current state.
  let filteredLines = [];
  if (stationUrbanZoneFilter !== '') {
      filteredLines = getLinesByZone(stationUrbanZoneFilter);
  }

  // Show a loading spinner while fetching data from Supabase
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f3f4f6] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-500 font-medium text-lg">Loading dashboard...</p>
      </div>
    );
  }

  // Show an error message if the Supabase request fails
  if (error) {
    return (
      <div className="min-h-screen bg-[#f3f4f6] flex flex-col items-center justify-center text-red-500">
        <AlertCircle className="w-12 h-12 mb-4" />
        <p className="text-lg font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f4f6] p-4 md:p-8 font-sans">
      
      {/* Header section: Estructura idéntica a la Topbar con el navegador integrado */}
      <header className="w-full flex flex-col sm:flex-row sm:items-center gap-4 md:gap-8 mb-6 shrink-0">
        <h1 className="text-lg md:text-xl font-light text-gray-700 uppercase tracking-wide whitespace-nowrap">
          Cercanías Bajo Control
        </h1>
        
        {/* Selector de pestañas idéntico al de la barra de navegación del mapa */}
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
      </header>

      {/* Top Row: KPIs */}
      <div className="grid grid-cols-2 gap-4 md:gap-6 mb-6">
        <KPICard title="Trenes actualmente en marcha" value="145" valueColor="text-[#4f8bc9]">
          <TrainFront className="w-28 h-28 text-gray-400 stroke-[1]" />
        </KPICard>

        <KPICard title="% de llegadas con retraso < 5 minutos" value="88%" valueColor="text-[#6b8299]">
          <div className="w-40 h-20 relative flex items-end justify-center">
            <div className="w-32 h-16 border-[3px] border-b-0 border-[#6b8299] rounded-t-full absolute bottom-0 opacity-70"></div>
          </div>
        </KPICard>
      </div>

      {/* Title and Filters for Lines */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-gray-600 uppercase tracking-wider">Datos Históricos por Línea</h2>
        
        <div className="flex items-center gap-2">
          <label htmlFor="line-zone" className="text-xs font-semibold text-gray-500 uppercase">Zona Urbana:</label>
          <select
            id="line-zone"
            value={lineUrbanZoneFilter}
            onChange={(e) => setLineUrbanZoneFilter(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-[200px]"
          >
            <option value="">Todas las zonas</option>
            {zones?.map((zone) => (
              <option key={zone.id} value={zone.name}>{zone.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-4 mb-8">
        {/* Middle Row: Lines Performance */}
        <div className="grid grid-cols-3 gap-4">
          <HorizontalChartCard 
            title="Top 5 Líneas con más tráfico" 
            data={dashboardData.busiestLines} 
            dataKey="value" 
            labelKey="label" 
            xDomain={[0, 'dataMax']} 
          />
          <HorizontalChartCard 
            title="Top 5 líneas con mayor % de retrasos" 
            data={dashboardData.linesByDelayPct} 
            dataKey="value" 
            labelKey="label" 
            xDomain={[0, 100]} 
          />
          <HorizontalChartCard 
            title="Top 5 líneas con retraso medio más alto" 
            data={dashboardData.linesByAvgDelay} 
            dataKey="value" 
            labelKey="label" 
            xDomain={[0, 'dataMax']} 
          />
        </div>
      </div>

      {/* Title and Filters for Stations */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-gray-600 uppercase tracking-wider">Datos Históricos por Estación</h2>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="station-zone" className="text-xs font-semibold text-gray-500 uppercase">Zona Urbana:</label>
            <select
              id="station-zone"
              value={stationUrbanZoneFilter}
              onChange={(e) => {
                handleStationUrbanZoneFilter(e.target.value);
              }}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-[200px]"
            >
              <option value="">Todas las zonas</option>
              {zones?.map((zone) => (
                <option key={zone.id} value={zone.name}>{zone.name}</option>
              ))}
            </select>
          </div>

          {stationUrbanZoneFilter !== '' && (
            <div className="flex items-center gap-2">
              <label htmlFor="station-line" className="text-xs font-semibold text-gray-500 uppercase">Línea:</label>
              <select
                id="station-line"
                value={stationLineFilter}
                onChange={(e) => setStationLineFilter(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-[150px]"
              >
                <option value="">Todas las líneas...</option>
                {filteredLines?.map((line) => (
                  <option key={line.id} value={line.name}>{line.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {/* Bottom Row: Stations Performance */}
        <div className="grid grid-cols-3 gap-4">
          <HorizontalChartCard 
            title="Top 5 Estaciones con más tráfico" 
            data={dashboardData.busiestStations} 
            dataKey="value" 
            labelKey="label" 
            xDomain={[0, 'dataMax']} 
          />
          <HorizontalChartCard 
            title="Top 5 Estaciones con mayor % de retrasos" 
            data={dashboardData.stationsByDelayPct} 
            dataKey="value" 
            labelKey="label" 
            xDomain={[0, 100]} 
            showBadges={true} 
          />
          <HorizontalChartCard 
            title="Top 5 Estaciones con retraso medio más alto" 
            data={dashboardData.stationsByAvgDelay} 
            dataKey="value" 
            labelKey="label" 
            xDomain={[0, 'dataMax']} 
            showBadges={true} 
          />
        </div>
      </div>
    </div>
  );
};

export default Analysis;