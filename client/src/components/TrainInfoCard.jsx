import React from 'react';
import { X, Train } from 'lucide-react';

const formatDelay = (delay) => {
  if (delay == null) return { text: 'En hora', color: 'text-green-600' };
  const delaySeconds = Number(delay);
  if (Number.isNaN(delaySeconds) || delaySeconds === 0) return { text: 'En hora', color: 'text-green-600' };
  
  const delayMinutes = Math.round(Math.abs(delaySeconds) / 60);
  if (delaySeconds > 0) {
    return { text: `+${delayMinutes} min retraso`, color: 'text-red-500 font-medium' };
  }
  return { text: `-${delayMinutes} min adelanto`, color: 'text-blue-500' };
};

const TrainInfoCard = ({ train, nextStopName, delay, onClose, inPopup = false }) => {
  if (!train) return null;

  const delayInfo = formatDelay(delay);

  const innerContent = (
    <div className="font-sans text-gray-700">
      <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-2">
        <div className="flex items-center gap-1.5 text-gray-500 font-medium uppercase text-xs tracking-wider">
          <Train className="w-4 h-4 text-[#4f8bc9]" />
          <span>Detalle del Tren</span>
        </div>
        {!inPopup && (
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors p-0.5 rounded-full hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="space-y-1.5 text-sm">
        <p className="text-gray-600">
          <span className="font-semibold text-gray-500 text-xs uppercase tracking-wide mr-1">ID Tren:</span> 
          <span className="font-mono text-gray-800">{train.train?.id ?? train.id ?? 'N/D'}</span>
        </p>
        <p className="text-gray-600">
          <span className="font-semibold text-gray-500 text-xs uppercase tracking-wide mr-1">Siguiente Parada:</span> 
          <span className="text-gray-800 font-medium">{nextStopName ?? train.nextStationId ?? 'No disponible'}</span>
        </p>
        <div className="pt-1 flex items-center gap-1.5">
          <span className="font-semibold text-gray-500 text-xs uppercase tracking-wide">Estado:</span>
          <span className={`${delayInfo.color} text-sm`}>{delayInfo.text}</span>
        </div>
      </div>
    </div>
  );

  if (inPopup) return innerContent;

  return (
    <div className="absolute right-4 top-4 z-[1000] w-72 bg-white/95 backdrop-blur border border-gray-200 rounded-xl p-4 shadow-lg transition-all duration-200">
      {innerContent}
    </div>
  );
};

export default TrainInfoCard;