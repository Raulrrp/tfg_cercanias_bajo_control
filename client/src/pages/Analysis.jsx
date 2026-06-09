import React from 'react';
import { Menu, TrainFront } from 'lucide-react';

// Import reusable components (adjust the paths according to your structure)

import HorizontalChartCard from '../components/HorizontalChartCard.jsx';
import KPICard from '../components/KPICard.jsx';

// Shared Data for Cercanías
const cercaniasData = [
  { name: 'C-1', traffic: 1500000, trafficLabel: '1.5M', delays: 18, delaysLabel: '18%', avgDelay: 10, avgDelayLabel: '10 min', color: '#2da853' }, 
  { name: 'C-2', traffic: 1400000, trafficLabel: '1.4M', delays: 15, delaysLabel: '15%', avgDelay: 9, avgDelayLabel: '9 min', color: '#db4336' }, 
  { name: 'C-3', traffic: 1200000, trafficLabel: '1.2M', delays: 12, delaysLabel: '12%', avgDelay: 8, avgDelayLabel: '8 min', color: '#277bc0' }, 
  { name: 'C-4', traffic: 900000, trafficLabel: '900k', delays: 10, delaysLabel: '10%', avgDelay: 7, avgDelayLabel: '7 min', color: '#7e57c2' }, 
  { name: 'C-5', traffic: 800000, trafficLabel: '800k', delays: 8, delaysLabel: '8%', avgDelay: 6, avgDelayLabel: '6 min', color: '#f59825' }, 
];

// X-Axis formatting functions
const formatTraffic = (val) => val === 0 ? '0' : val >= 1000000 ? (val / 1000000).toFixed(1) + 'M' : (val / 1000) + 'k';
const formatPercent = (val) => `${val}%`;
const formatMinutes = (val) => `${val} min`;

const CercaniasDashboard = () => {
  return (
    <div className="min-h-screen bg-[#f3f4f6] p-4 md:p-8 font-sans">
      
      {/* Header section */}
      <header className="flex items-center mb-6 text-gray-500">
        <Menu className="w-6 h-6 mr-3 cursor-pointer stroke-2" />
        <h1 className="text-xl md:text-2xl font-light text-gray-700 uppercase tracking-wide">Cercanías Análisis</h1>
      </header>

      {/* Top Row: KPIs (Key Performance Indicators) */}
      <div className="grid grid-cols-2 gap-4 md:gap-6 mb-6">
        
        {/* KPI 1: Active Trains */}
        <KPICard title="Trenes actualmente en marcha" value="145" valueColor="text-[#4f8bc9]">
          <TrainFront className="w-28 h-28 text-gray-400 stroke-[1]" />
        </KPICard>

        {/* KPI 2: On-time arrivals */}
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
          <HorizontalChartCard data={cercaniasData} title="Top 5 Líneas con más tráfico (Llegadas Registradas)" dataKey="traffic" labelKey="trafficLabel" xDomain={[0, 1500000]} xTicks={[0, 500000, 1000000, 1500000]} xFormatter={formatTraffic} />
          <HorizontalChartCard data={cercaniasData} title="Top 5 líneas con mayor % de retrasos" dataKey="delays" labelKey="delaysLabel" xDomain={[0, 100]} xTicks={[0, 20, 40, 60, 80, 100]} xFormatter={formatPercent} />
          <HorizontalChartCard data={cercaniasData} title="Top 5 líneas con retraso medio más alto" dataKey="avgDelay" labelKey="avgDelayLabel" xDomain={[0, 15]} xTicks={[0, 5, 10, 15]} xFormatter={formatMinutes} />
        </div>

        {/* Bottom Row: Stations Performance */}
        <div className="grid grid-cols-3 gap-4">
          <HorizontalChartCard data={cercaniasData} title="Top 5 Estaciones con más tráfico" dataKey="traffic" labelKey="trafficLabel" xDomain={[0, 1500000]} xTicks={[0, 500000, 1000000, 1500000]} xFormatter={formatTraffic} />
          <HorizontalChartCard data={cercaniasData} title="Top 5 Estaciones con mayor % de retrasos" dataKey="delays" labelKey="delaysLabel" xDomain={[0, 100]} xTicks={[0, 20, 40, 60, 80, 100]} xFormatter={formatPercent} showBadges={true} />
          <HorizontalChartCard data={cercaniasData} title="Top 5 Estaciones con retraso medio más alto" dataKey="avgDelay" labelKey="avgDelayLabel" xDomain={[0, 15]} xTicks={[0, 5, 10, 15]} xFormatter={formatMinutes} showBadges={true} />
        </div>

      </div>
    </div>
  );
};

export default CercaniasDashboard;