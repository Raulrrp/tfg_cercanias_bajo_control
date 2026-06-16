// hooks/analysis-hook.js
import { useState, useEffect } from 'react';
import { analysisService } from '../services/analysis-service.js';

// Shared colors for UI consistency
const CHART_COLORS = ['#2da853', '#db4336', '#277bc0', '#7e57c2', '#f59825'];

// Formatting helpers
const formatTrafficLabel = (val) => {
  if (val === 0) return '0';
  if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
  if (val >= 1000) return (val / 1000).toFixed(0) + 'k';
  return val.toString();
};
const formatPercentLabel = (val) => `${val}%`;
const formatMinutesLabel = (val) => `${val} min`;

// Hook accepts filters to pass down
export const useAnalysis = (lineZone = '', stationZone = '', stationLine = '') => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [dashboardData, setDashboardData] = useState({
    busiestLines: [],
    busiestStations: [],
    linesByDelayPct: [],
    stationsByDelayPct: [],
    linesByAvgDelay: [],
    stationsByAvgDelay: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch data passing corresponding filters
        const [
          rawBusiestLines,
          rawBusiestStations,
          rawLinesDelayPct,
          rawStationsDelayPct,
          rawLinesAvgDelay,
          rawStationsAvgDelay
        ] = await Promise.all([
          analysisService.getBusiestLines(lineZone),
          analysisService.getBusiestStations(stationZone, stationLine),
          analysisService.getTopLinesByDelayPercentage(lineZone),
          analysisService.getTopStationsByDelayPercentage(stationZone, stationLine),
          analysisService.getTopLinesByAverageDelay(lineZone),
          analysisService.getTopStationsByAverageDelay(stationZone, stationLine)
        ]);

        // Helper function mapping database columns to UI
        const mapData = (dataArray, nameKey, valueKey, formatter) => {
          // Safeguard limit to top 5
          if (!dataArray) return [];
          
          return dataArray.slice(0, 5).map((item, index) => {
            let processedValue = Number(item[valueKey] || 0);

            // Convert seconds to rounded minutes
            if (valueKey === 'average_delay_seconds') {
              processedValue = Math.round(processedValue / 60);
            } 
            // Round percentage
            else if (valueKey === 'delay_percentage') {
              processedValue = Math.round(processedValue);
            }

            return {
              name: item[nameKey],
              value: processedValue,
              label: formatter(processedValue),
              color: CHART_COLORS[index % CHART_COLORS.length]
            };
          });
        };

        // Update state with formatted data
        setDashboardData({
          busiestLines: mapData(rawBusiestLines, 'line_name', 'total_traffic', formatTrafficLabel),
          busiestStations: mapData(rawBusiestStations, 'station_name', 'total_traffic', formatTrafficLabel),
          linesByDelayPct: mapData(rawLinesDelayPct, 'line_name', 'delay_percentage', formatPercentLabel),
          stationsByDelayPct: mapData(rawStationsDelayPct, 'station_name', 'delay_percentage', formatPercentLabel),
          linesByAvgDelay: mapData(rawLinesAvgDelay, 'line_name', 'average_delay_seconds', formatMinutesLabel),
          stationsByAvgDelay: mapData(rawStationsAvgDelay, 'station_name', 'average_delay_seconds', formatMinutesLabel)
        });

      } catch (err) {
        console.error("Error fetching analysis data:", err);
        setError("No se pudieron cargar los datos del dashboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  // Refetch data when filters change
  }, [lineZone, stationZone, stationLine]); 

  return { dashboardData, loading, error };
};