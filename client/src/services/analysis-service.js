// services/analysis-service.js
import { createClient } from '@supabase/supabase-js';

let supabase = null;

const getSupabase = () => {
    if (!supabase) {
        const url = import.meta.env.VITE_SUPABASE_URL;
        const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
        if (!url || !key) throw new Error('Supabase environment variables are missing.');
        supabase = createClient(url, key);
    }
    return supabase;
};

// Single-line English comment: Helper to map snake_case SQL columns to camelCase domain models
const mapSqlRows = (data) => {
  if (!data) return [];
  return data.map(row => ({
    lineName: row.line_name,
    stationName: row.station_name,
    totalTraffic: row.total_traffic,
    delayPercentage: row.delay_percentage,
    averageDelaySeconds: row.average_delay_seconds,
    urbanZone: row.urban_zone_name // Single-line English comment: Map database column to domain property here
  }));
};

export const analysisService = {
  getBusiestLines: async (urbanZone) => {
    const client = getSupabase();
    const params = urbanZone ? { target_zona: urbanZone } : {};
    const { data, error } = await client.rpc('get_busiest_lines', params);
    if (error) throw error;
    return mapSqlRows(data);
  },

  getBusiestStations: async (urbanZone, lineName) => {
    const client = getSupabase();
    const params = {};
    if (urbanZone) params.target_zona = urbanZone;
    if (lineName) params.target_line = lineName;
    const { data, error } = await client.rpc('get_busiest_stations', params);
    if (error) throw error;
    return mapSqlRows(data);
  },

  getTopLinesByDelayPercentage: async (urbanZone) => {
    const client = getSupabase();
    const params = urbanZone ? { target_zona: urbanZone } : {};
    const { data, error } = await client.rpc('get_top_lines_by_delay_percentage', params);
    if (error) throw error;
    return mapSqlRows(data);
  },

  getTopStationsByDelayPercentage: async (urbanZone, lineName) => {
    const client = getSupabase();
    const params = {};
    if (urbanZone) params.target_zona = urbanZone;
    if (lineName) params.target_line = lineName;
    const { data, error } = await client.rpc('get_top_stations_by_delay_percentage', params);
    if (error) throw error;
    return mapSqlRows(data);
  },

  getTopLinesByAverageDelay: async (urbanZone) => {
    const client = getSupabase();
    const params = urbanZone ? { target_zona: urbanZone } : {};
    const { data, error } = await client.rpc('get_top_lines_by_average_delay', params);
    if (error) throw error;
    return mapSqlRows(data);
  },

  getTopStationsByAverageDelay: async (urbanZone, lineName) => {
    const client = getSupabase();
    const params = {};
    if (urbanZone) params.target_zona = urbanZone;
    if (lineName) params.target_line = lineName;
    const { data, error } = await client.rpc('get_top_stations_by_average_delay', params);
    if (error) throw error;
    return mapSqlRows(data);
  },
  
  getGlobalOnTimePercentage: async () => {
    const client = getSupabase();
    const { data, error } = await client.rpc('get_on_time_arrivals_percentage');
    if (error) throw error;
    return data;
  },
};