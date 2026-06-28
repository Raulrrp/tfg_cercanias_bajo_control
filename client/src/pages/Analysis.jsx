import React, { useState } from 'react';
import { TrainFront, Loader2, AlertCircle } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import HorizontalChartCard from '../components/HorizontalChartCard.jsx';
import KPICard from '../components/KPICard.jsx';
import { useAnalysis } from '../hooks/analysis-hook.js';
import { useGlobalData } from '../context/DataContext.jsx';

const Analysis = () => {
  const location = useLocation();

  const [lineUrbanZoneFilter, setLineUrbanZoneFilter] = useState('');
  const [stationLineFilter, setStationLineFilter] = useState('');
  const [stationUrbanZoneFilter, setStationUrbanZoneFilter] = useState('');

  const { 
    lineHelpers: { getLinesByZone }, 
    zoneHelpers: { zones },
    trainCount,
  } = useGlobalData();

  const { dashboardData, loading, error } = useAnalysis(
    lineUrbanZoneFilter, 
    stationUrbanZoneFilter, 
    stationLineFilter
  );
  
  const handleBothUrbanZoneFilters = (urbanZoneName) => {
    setStationUrbanZoneFilter(urbanZoneName);
    setLineUrbanZoneFilter(urbanZoneName);
    setStationLineFilter('');
  };

  // to print the half-moon chart properly
  const percentage = dashboardData.globalOnTimePercentage || 100;
  const strokeOffset = 157 - (157 * percentage) / 100;

  let filteredLines = [];
  if (stationUrbanZoneFilter !== '') {
      filteredLines = getLinesByZone(stationUrbanZoneFilter);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f3f4f6] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-500 font-medium text-lg">Loading dashboard...</p>
      </div>
    );
  }

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
      <header className="w-full flex flex-col sm:flex-row sm:items-center gap-4 md:gap-8 mb-6 shrink-0">
        <h1 className="text-lg md:text-xl font-light text-gray-700 uppercase tracking-wide whitespace-nowrap">
          Cercanías Bajo Control
        </h1>
        
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

      <div className="grid grid-cols-2 gap-4 md:gap-6 mb-6">
        <KPICard title="Trenes actualmente en marcha" value={trainCount} valueColor="text-[#4f8bc9]">
          <TrainFront className="w-28 h-28 text-gray-400 stroke-[1]" />
        </KPICard>

        <KPICard title="% de llegadas con retraso < 5 minutos" value={`${percentage}%`} valueColor="text-[#6b8299]">
          <div className="w-40 h-20 relative flex items-end justify-center">
            <svg className="w-32 h-20" viewBox="0 0 112 56">
              {/*Background semicircle*/}
              <path
                d="M 5,50 A 50,50 0 0,1 105,50"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="6"
                strokeLinecap="round"
              />
              {/*Main semicircle*/}
              <path
                d="M 5,50 A 50,50 0 0,1 105,50"
                fill="none"
                stroke="#6b8299"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray="157"
                strokeDashoffset={strokeOffset}
                style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
              />
            </svg>
          </div>
        </KPICard>
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-gray-600 uppercase tracking-wider">Datos Históricos por Línea</h2>
        
        <div className="flex items-center gap-2">
          <label htmlFor="line-zone" className="text-xs font-semibold text-gray-500 uppercase">Zona Urbana:</label>
          <select
            id="line-zone"
            value={lineUrbanZoneFilter}
            onChange={(e) => {
              handleBothUrbanZoneFilters(e.target.value)
            }}
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
        <div className="grid grid-cols-3 gap-4">
          <HorizontalChartCard 
            title="Top 5 Líneas con más tráfico" 
            data={dashboardData.busiestLines} 
            dataKey="value" 
            labelKey="label" 
            xDomain={[0, 'dataMax']} 
          />
          <HorizontalChartCard 
            title="Top 5 líneas con mayor % de retrasos de más de 5 minutos" 
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

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-gray-600 uppercase tracking-wider">Datos Históricos por Estación</h2>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="station-zone" className="text-xs font-semibold text-gray-500 uppercase">Zona Urbana:</label>
            <select
              id="station-zone"
              value={stationUrbanZoneFilter}
              onChange={(e) => {
                handleBothUrbanZoneFilters(e.target.value);
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