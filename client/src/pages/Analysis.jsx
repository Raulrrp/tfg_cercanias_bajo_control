import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList
} from 'recharts';
import { Menu, TrainFront } from 'lucide-react';

// Shared Data
const chartData = [
  { name: 'C-1', traffic: 1500000, trafficLabel: '1.5M', delays: 18, delaysLabel: '18%', avgDelay: 10, avgDelayLabel: '10 min', color: '#22c55e' }, // Green
  { name: 'C-2', traffic: 1400000, trafficLabel: '1.4M', delays: 15, delaysLabel: '15%', avgDelay: 9, avgDelayLabel: '9 min', color: '#ef4444' }, // Red
  { name: 'C-3', traffic: 1200000, trafficLabel: '1.2M', delays: 12, delaysLabel: '12%', avgDelay: 8, avgDelayLabel: '8 min', color: '#3b82f6' }, // Blue
  { name: 'C-4', traffic: 900000, trafficLabel: '900k', delays: 10, delaysLabel: '10%', avgDelay: 7, avgDelayLabel: '7 min', color: '#8b5cf6' }, // Purple
  { name: 'C-5', traffic: 800000, trafficLabel: '800k', delays: 8, delaysLabel: '8%', avgDelay: 6, avgDelayLabel: '6 min', color: '#f59e0b' }, // Orange
];

// Formatters for X-Axis
const formatTraffic = (val) => {
  if (val === 0) return '0';
  if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
  if (val >= 1000) return (val / 1000) + 'k';
  return val;
};
const formatPercent = (val) => `${val}%`;
const formatMinutes = (val) => `${val} min`;

// Custom Y-Axis Tick with Colored Backgrounds (for bottom right charts)
const CustomYAxisTick = ({ x, y, payload, showBadges }) => {
  const dataPoint = chartData.find(d => d.name === payload.value);
  if (showBadges && dataPoint) {
    return (
      <g transform={`translate(${x},${y})`}>
        <rect x={-35} y={-10} width={22} height={20} fill={dataPoint.color} rx={3} />
        <text x={-24} y={4} fill="#fff" textAnchor="middle" fontSize={12} fontWeight="bold">
          {payload.value.replace('C-', '')}
        </text>
      </g>
    );
  }
  return (
    <text x={x - 10} y={y + 4} fill="#666" textAnchor="end" fontSize={12}>
      {payload.value}
    </text>
  );
};

// Reusable Bar Chart Component
const DashboardChart = ({ title, dataKey, labelKey, xDomain, xTicks, xFormatter, showBadges = false }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col h-72">
    <h3 className="text-sm font-semibold text-gray-800 mb-4">{title}</h3>
    <div className="flex-grow w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 40, left: showBadges ? 10 : 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} />
          <XAxis 
            type="number" 
            domain={xDomain} 
            ticks={xTicks} 
            tickFormatter={xFormatter} 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#666' }}
          />
          <YAxis 
            type="category" 
            dataKey="name" 
            axisLine={false} 
            tickLine={false}
            tick={<CustomYAxisTick showBadges={showBadges} />}
            width={45}
          />
          <Tooltip cursor={{ fill: '#f3f4f6' }} />
          <Bar dataKey={dataKey} barSize={20} radius={[0, 4, 4, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
            <LabelList dataKey={labelKey} position="right" style={{ fontSize: '12px', fill: '#333' }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

// Main Dashboard Component
const CercaniasDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      {/* Header */}
      <header className="flex items-center mb-6 text-gray-600">
        <Menu className="w-6 h-6 mr-4 cursor-pointer" />
        <h1 className="text-2xl font-light tracking-wide text-gray-800 uppercase">Cercanías Análisis</h1>
      </header>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Card 1: Active Trains */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-medium text-gray-800 mb-2">Trenes actualmente en marcha</h2>
            <div className="text-6xl font-bold text-blue-500">145</div>
          </div>
          <TrainFront className="w-24 h-24 text-gray-400 stroke-[1.5]" />
        </div>

        {/* Card 2: Delays Percentage Gauge */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-medium text-gray-800 mb-2">% de llegadas con retraso &lt; 5 minutos</h2>
            <div className="text-6xl font-bold text-slate-500">88%</div>
          </div>
          {/* Simple SVG Arc to represent the gauge */}
          <div className="w-32 h-16 relative overflow-hidden">
            <svg viewBox="0 0 100 50" className="w-full h-full transform scale-150 origin-bottom">
              <path 
                d="M 10 50 A 40 40 0 0 1 90 50" 
                fill="none" 
                stroke="#cbd5e1" 
                strokeWidth="2" 
              />
              <path 
                d="M 10 50 A 40 40 0 0 1 70 15" 
                fill="none" 
                stroke="#64748b" 
                strokeWidth="2" 
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>

      <h2 className="text-lg text-gray-700 mb-4 uppercase tracking-wide">Desempeño Clave</h2>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Row 1: Lines */}
        <DashboardChart 
          title="Top 5 Líneas con más tráfico (Llegadas Registradas)"
          dataKey="traffic"
          labelKey="trafficLabel"
          xDomain={[0, 1500000]}
          xTicks={[0, 500000, 1000000, 1500000]}
          xFormatter={formatTraffic}
        />
        <DashboardChart 
          title="Top 5 líneas con mayor % de retrasos"
          dataKey="delays"
          labelKey="delaysLabel"
          xDomain={[0, 100]}
          xTicks={[0, 20, 40, 60, 80, 100]}
          xFormatter={formatPercent}
        />
        <DashboardChart 
          title="Top 5 líneas con retraso medio más alto"
          dataKey="avgDelay"
          labelKey="avgDelayLabel"
          xDomain={[0, 15]}
          xTicks={[0, 5, 10, 15]}
          xFormatter={formatMinutes}
        />

        {/* Row 2: Stations */}
        <DashboardChart 
          title="Top 5 Estaciones con más tráfico"
          dataKey="traffic"
          labelKey="trafficLabel"
          xDomain={[0, 1500000]}
          xTicks={[0, 500000, 1000000, 1500000]}
          xFormatter={formatTraffic}
        />
        <DashboardChart 
          title="Top 5 Estaciones con mayor % de retrasos"
          dataKey="delays"
          labelKey="delaysLabel"
          xDomain={[0, 100]}
          xTicks={[0, 20, 40, 60, 80, 100]}
          xFormatter={formatPercent}
          showBadges={true}
        />
        <DashboardChart 
          title="Top 5 Estaciones con retraso medio más alto"
          dataKey="avgDelay"
          labelKey="avgDelayLabel"
          xDomain={[0, 15]}
          xTicks={[0, 5, 10, 15]}
          xFormatter={formatMinutes}
          showBadges={true}
        />

      </div>
    </div>
  );
};

export default CercaniasDashboard;