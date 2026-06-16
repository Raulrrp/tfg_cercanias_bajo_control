// services/analysis-service.js
import { createClient } from '@supabase/supabase-js';

// Singleton instance
let supabase = null;

// Initialize Supabase client
const getSupabase = () => {
    if (!supabase) {
        const url = import.meta.env.VITE_SUPABASE_URL;
        const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

        if (!url || !key) {
            throw new Error('Supabase environment variables are missing.');
        }

        supabase = createClient(url, key);
    }

    return supabase;
};

export const analysisService = {
  // Fetch top 5 busiest lines
  getBusiestLines: async (urbanZone) => {
    const client = getSupabase();
    const params = {};
    if (urbanZone) params.target_zona = urbanZone;
    
    const { data, error } = await client.rpc('get_busiest_lines', params);
    if (error) throw error;
    return data;
  },

  // Fetch top 5 busiest stations
  getBusiestStations: async (urbanZone, lineName) => {
    const client = getSupabase();
    const params = {};
    if (urbanZone) params.target_zona = urbanZone;
    if (lineName) params.target_line = lineName;
    
    const { data, error } = await client.rpc('get_busiest_stations', params);
    if (error) throw error;
    return data;
  },

  // Fetch lines with highest delay percentage
  getTopLinesByDelayPercentage: async (urbanZone) => {
    const client = getSupabase();
    const params = {};
    if (urbanZone) params.target_zona = urbanZone;
    
    const { data, error } = await client.rpc('get_top_lines_by_delay_percentage', params);
    if (error) throw error;
    return data;
  },

  // Fetch stations with highest delay percentage
  getTopStationsByDelayPercentage: async (urbanZone, lineName) => {
    const client = getSupabase();
    const params = {};
    if (urbanZone) params.target_zona = urbanZone;
    if (lineName) params.target_line = lineName;
    
    const { data, error } = await client.rpc('get_top_stations_by_delay_percentage', params);
    if (error) throw error;
    return data;
  },

  // Fetch lines with highest average delay
  getTopLinesByAverageDelay: async (urbanZone) => {
    const client = getSupabase();
    const params = {};
    if (urbanZone) params.target_zona = urbanZone;
    
    const { data, error } = await client.rpc('get_top_lines_by_average_delay', params);
    if (error) throw error;
    return data;
  },

  // Fetch stations with highest average delay
  getTopStationsByAverageDelay: async (urbanZone, lineName) => {
    const client = getSupabase();
    const params = {};
    if (urbanZone) params.target_zona = urbanZone;
    if (lineName) params.target_line = lineName;
    
    const { data, error } = await client.rpc('get_top_stations_by_average_delay', params);
    if (error) throw error;
    return data;
  }
};