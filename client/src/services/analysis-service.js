import { createClient } from '@supabase/supabase-js';

// Singleton instance
let supabase = null;

// Internal function to get or initialize the Supabase client
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
  // Fetch the top 5 busiest lines
  getBusiestLines: async () => {
    const client = getSupabase();
    const { data, error } = await client.rpc('get_busiest_lines');
    if (error) throw error;
    return data;
  },

  // Fetch the top 5 busiest stations
  getBusiestStations: async () => {
    const client = getSupabase();
    const { data, error } = await client.rpc('get_busiest_stations');
    if (error) throw error;
    return data;
  },

  // Fetch lines with the highest percentage of delays (0-100)
  getTopLinesByDelayPercentage: async () => {
    const client = getSupabase();
    const { data, error } = await client.rpc('get_top_lines_by_delay_percentage');
    if (error) throw error;
    return data;
  },

  // Fetch stations with the highest percentage of delays (0-100)
  getTopStationsByDelayPercentage: async () => {
    const client = getSupabase();
    const { data, error } = await client.rpc('get_top_stations_by_delay_percentage');
    if (error) throw error;
    return data;
  },

  // Fetch lines with the highest average delay
  getTopLinesByAverageDelay: async () => {
    const client = getSupabase();
    const { data, error } = await client.rpc('get_top_lines_by_average_delay');
    if (error) throw error;
    return data;
  },

  // Fetch stations with the highest average delay
  getTopStationsByAverageDelay: async () => {
    const client = getSupabase();
    const { data, error } = await client.rpc('get_top_stations_by_average_delay');
    if (error) throw error;
    return data;
  }
};