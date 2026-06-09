import { useState, useEffect } from 'react';
import { analysisService } from '../services/analysis-service.js';

// Shared colors for the charts to keep the UI consistent
const CHART_COLORS = ['#2da853', '#db4336', '#277bc0', '#7e57c2', '#f59825'];

// Formatting helpers (they now expect the already processed numeric value)
const formatTrafficLabel = (val) => {
  if (val === 0) return '0';
  if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
  if (val >= 1000) return (val / 1000).toFixed(0) + 'k';
  return val.toString();
};
const formatPercentLabel = (val) => `${val}%`;
const formatMinutesLabel = (val) => `${val} min`;

export const useAnalysis = () => {
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

        // Fetch all data simultaneously for better performance
        const [
          rawBusiestLines,
          rawBusiestStations,
          rawLinesDelayPct,
          rawStationsDelayPct,
          rawLinesAvgDelay,
          rawStationsAvgDelay
        ] = await Promise.all([
          analysisService.getBusiestLines(),
          analysisService.getBusiestStations(),
          analysisService.getTopLinesByDelayPercentage(),
          analysisService.getTopStationsByDelayPercentage(),
          analysisService.getTopLinesByAverageDelay(),
          analysisService.getTopStationsByAverageDelay()
        ]);

        // Helper function to map dynamic database columns to UI format { name, value, label, color }
        const mapData = (dataArray, nameKey, valueKey, formatter) => {
          // Safeguard in case dataArray is null/undefined, and limit to top 5 just in case
          if (!dataArray) return [];
          
          return dataArray.slice(0, 5).map((item, index) => {
            let processedValue = Number(item[valueKey] || 0);

            // If the value is in seconds, convert it to minutes and round it
            if (valueKey === 'average_delay_seconds') {
              processedValue = Math.round(processedValue / 60);
            } 
            // If it's a percentage, we round it to avoid decimals like 18.32% in the chart
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

        // Update the state with the fully formatted data ready for the UI
        setDashboardData({
          // Busiest traffic (Uses total_traffic)
          busiestLines: mapData(rawBusiestLines, 'line_name', 'total_traffic', formatTrafficLabel),
          busiestStations: mapData(rawBusiestStations, 'station_name', 'total_traffic', formatTrafficLabel),
          
          // Delay percentage (Uses delay_percentage)
          linesByDelayPct: mapData(rawLinesDelayPct, 'line_name', 'delay_percentage', formatPercentLabel),
          stationsByDelayPct: mapData(rawStationsDelayPct, 'station_name', 'delay_percentage', formatPercentLabel),
          
          // Average delay (Uses average_delay_seconds)
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
  }, []); 

  return { dashboardData, loading, error };
};