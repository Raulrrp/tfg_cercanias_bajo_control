import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
  LabelList
} from 'recharts';

// Extraemos el Tick personalizado del Eje Y (para los iconos con fondo de color)
const BadgeYAxisTick = ({ x, y, payload, data }) => {
  // Buscamos el color correspondiente al punto de datos actual
  const dataPoint = data.find(d => d.name === payload.value);
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={-45} y={4} fill="#333" textAnchor="end" fontSize={12}>{payload.value}</text>
      {dataPoint && (
        <rect x={-32} y={-9} width={18} height={18} fill={dataPoint.color} rx={2} />
      )}
      <text x={-23} y={4} fill="#fff" textAnchor="middle" fontSize={11} fontWeight="bold">C</text>
    </g>
  );
};

const HorizontalChartCard = ({ 
  title, 
  data, 
  dataKey, 
  labelKey, 
  xDomain, 
  xTicks, 
  xFormatter, 
  showBadges = false 
}) => {
  return (
    <div className="bg-white p-3 rounded-lg shadow-[0_2px_8px_-4px_rgba(0,0,0,0.1)] border border-gray-100 flex flex-col h-64">
      <h3 className="text-[13px] font-medium text-gray-800 mb-3">{title}</h3>
      <div className="flex-grow w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 35, left: showBadges ? 20 : 0, bottom: 15 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} stroke="#e5e7eb" />
            
            <XAxis 
              type="number" 
              domain={xDomain} 
              ticks={xTicks} 
              tickFormatter={xFormatter} 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fill: '#6b7280' }} 
            />
            
            <YAxis 
              type="category" 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={showBadges ? <BadgeYAxisTick data={data} /> : { fontSize: 12, fill: '#374151' }} 
              width={40} 
            />
            
            <Bar dataKey={dataKey} barSize={16}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || '#3b82f6'} />
              ))}
              <LabelList dataKey={labelKey} position="right" style={{ fontSize: '11px', fill: '#111827', fontWeight: 500 }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default HorizontalChartCard;