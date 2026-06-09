import React from 'react';

// Reusable KPI card that accepts children for the right-side visual element
const KPICard = ({ title, value, valueColor, children }) => {
  return (
    <div className="bg-white p-5 rounded-lg shadow-[0_2px_8px_-4px_rgba(0,0,0,0.1)] border border-gray-100 flex items-center justify-between overflow-hidden">
      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-800 mb-2">{title}</span>
        {/* Dynamic color applied via inline style or template literal */}
        <span className={`text-6xl font-bold ${valueColor}`}>{value}</span>
      </div>
      {/* Right-side visual content passed as children */}
      {children}
    </div>
  );
};

export default KPICard;