// hooks/analysis-hook.js
import { useState, useEffect } from 'react';
import { analysisService } from '../services/analysis-service.js';

const CHART_COLORS = ['#2da853', '#db4336', '#277bc0', '#7e57c2', '#f59825'];

const formatTrafficLabel = (val) => {
  if (val === 0) return '0';
  if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
  if (val >= 1000) return (val / 1000).toFixed(0) + 'k';
  return val.toString();
};
const formatPercentLabel = (val) => `${val}%`;
const formatMinutesLabel = (val) => `${val} min`;

export const useAnalysis = (lineZone = '', stationZone = '', stationLine = '') => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [dashboardData, setDashboardData] = useState({
    busiestLines: [],
    busiestStations: [],
    linesByDelayPct: [],
    stationsByDelayPct: [],
    linesByAvgDelay: [],
    stationsByAvgDelay: [],
    globalOnTimePercentage: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [
          rawBusiestLines,
          rawBusiestStations,
          rawLinesDelayPct,
          rawStationsDelayPct,
          rawLinesAvgDelay,
          rawStationsAvgDelay,
          rawGlobalOnTimePercentage
        ] = await Promise.all([
          analysisService.getBusiestLines(lineZone),
          analysisService.getBusiestStations(stationZone, stationLine),
          analysisService.getTopLinesByDelayPercentage(lineZone),
          analysisService.getTopStationsByDelayPercentage(stationZone, stationLine),
          analysisService.getTopLinesByAverageDelay(lineZone),
          analysisService.getTopStationsByAverageDelay(stationZone, stationLine),
          analysisService.getGlobalOnTimePercentage()
        ]);

        // Single-line English comment: Helper to map domain rows into presentation-ready chart structures
        const mapData = (dataArray, nameKey, valueKey, formatter, isLineData = false) => {
          if (!dataArray) return [];
          
          return dataArray.slice(0, 5).map((item, index) => {
            let processedValue = Number(item[valueKey] || 0);

            if (valueKey === 'averageDelaySeconds') {
              processedValue = Math.round(processedValue / 60);
            } else if (valueKey === 'delayPercentage') {
              processedValue = Math.round(processedValue);
            }

            // Single-line English comment: Construct the final display name adding the urban zone prefix if no filter is active
            let displayName = item[nameKey];
            if (isLineData && lineZone === '' && item.urbanZone) {
              displayName = `${item.urbanZone} - ${item[nameKey]}`;
            }

            return {
              name: displayName,
              value: processedValue,
              label: formatter(processedValue),
              color: CHART_COLORS[index % CHART_COLORS.length]
            };
          });
        };

        setDashboardData({
          busiestLines: mapData(rawBusiestLines, 'lineName', 'totalTraffic', formatTrafficLabel, true),
          busiestStations: mapData(rawBusiestStations, 'stationName', 'totalTraffic', formatTrafficLabel, false),
          linesByDelayPct: mapData(rawLinesDelayPct, 'lineName', 'delayPercentage', formatPercentLabel, true),
          stationsByDelayPct: mapData(rawStationsDelayPct, 'stationName', 'delayPercentage', formatPercentLabel, false),
          linesByAvgDelay: mapData(rawLinesAvgDelay, 'lineName', 'averageDelaySeconds', formatMinutesLabel, true),
          stationsByAvgDelay: mapData(rawStationsAvgDelay, 'stationName', 'averageDelaySeconds', formatMinutesLabel, false),
          globalOnTimePercentage: rawGlobalOnTimePercentage ? Number(rawGlobalOnTimePercentage) : 0
        });

      } catch (err) {
        console.error("Error fetching analysis data:", err);
        setError("No se pudieron cargar los datos del dashboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [lineZone, stationZone, stationLine]); 

  return { dashboardData, loading, error };
};