import React from 'react';
import { Menu, TrainFront, Loader2, AlertCircle } from 'lucide-react';
import HorizontalChartCard from '../components/HorizontalChartCard.jsx';
import KPICard from '../components/KPICard.jsx';
import { useAnalysis } from '../hooks/analysis-hook.js';

const Analysis = () => {
  // Extract state variables from our custom hook
  const { dashboardData, loading, error } = useAnalysis();

  // Show a loading spinner while fetching data from Supabase
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f3f4f6] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-500 font-medium text-lg">Cargando dashboard...</p>
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
      
      {/* Header section */}
      <header className="flex items-center mb-6 text-gray-500">
        <Menu className="w-6 h-6 mr-3 cursor-pointer stroke-2" />
        <h1 className="text-xl md:text-2xl font-light text-gray-700 uppercase tracking-wide">Cercanías Análisis</h1>
      </header>

      {/* Top Row: KPIs (These are static for now, you can hook them up later!) */}
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

      <h2 className="text-sm font-medium text-gray-600 mb-3 uppercase tracking-wider">Desempeño Clave</h2>

      <div className="flex flex-col gap-4">
        
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