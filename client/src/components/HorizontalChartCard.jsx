import React from 'react';
import { Loader2 } from 'lucide-react';
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

const MultiLineTick = ({ x, y, payload, maxTextWidth }) => {
  const text = payload.value || '';
  const maxLineChars = Math.floor(maxTextWidth / 7);
  
  // Single-line English comment: Force split by character if the string contains no spaces and exceeds line limit
  let line1 = '';
  let line2 = '';

  if (!text.includes(' ') && text.length > maxLineChars) {
    line1 = text.substring(0, maxLineChars);
    line2 = text.substring(maxLineChars);
  } else {
    const words = text.split(' ');
    for (let i = 0; i < words.length; i++) {
      if ((line1 + words[i]).length <= maxLineChars && line2 === '') {
        line1 += (line1 ? ' ' : '') + words[i];
      } else {
        line2 += (line2 ? ' ' : '') + words[i];
      }
    }
  }

  // Single-line English comment: Truncate lines with ellipsis if they still exceed the safety character limit
  if (line1.length > maxLineChars + 3) {
    line1 = line1.substring(0, maxLineChars) + '...';
  }
  if (line2.length > maxLineChars + 3) {
    line2 = line2.substring(0, maxLineChars) + '...';
  }

  // Single-line English comment: Render SVG text with single or double tspan elements aligned to the right
  return (
    <g transform={`translate(${x},${y})`}>
      {line2 ? (
        <>
          <text x={-10} y={-4} fill="#374151" fontSize={10} textAnchor="end">
            {line1}
          </text>
          <text x={-10} y={8} fill="#374151" fontSize={10} textAnchor="end">
            {line2}
          </text>
        </>
      ) : (
        <text x={-10} y={4} fill="#374151" fontSize={11} textAnchor="end">
          {line1}
        </text>
      )}
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
  loading 
}) => {
  // Single-line English comment: Calculate dynamic width for YAxis based on the maximum text length in data
  const maxTextLength = data && data.length > 0 
    ? Math.max(...data.map(d => (d.name || '').length)) 
    : 0;
  
  // Single-line English comment: Increased maximum width allocation to give long text more physical rendering space
  const calculatedWidth = Math.min(Math.max(maxTextLength * 7.5, 50), 180);

  // Single-line English comment: Render layout passing calculated dimensions and custom multi-line tick component
  return (
    <div className="bg-white p-3 rounded-lg shadow-[0_2px_8px_-4px_rgba(0,0,0,0.1)] border border-gray-100 flex flex-col h-64">
      <h3 className="text-[13px] font-medium text-gray-800 mb-3">{title}</h3>
      <div className="flex-grow w-full flex items-center justify-center">
        {loading ? (
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data || []} layout="vertical" margin={{ top: 0, right: 35, left: 0, bottom: 15 }}>
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
                tick={<MultiLineTick maxTextWidth={calculatedWidth} />} 
                width={calculatedWidth} 
              />
              
              <Bar dataKey={dataKey} barSize={16}>
                {(data || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || '#3b82f6'} />
                ))}
                <LabelList dataKey={labelKey} position="right" style={{ fontSize: '11px', fill: '#111827', fontWeight: 500 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default HorizontalChartCard;