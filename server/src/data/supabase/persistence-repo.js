import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

let supabase = null;

export const initSupabase = ({ url, key, options } = {}) => {
    if (supabase) return supabase;

    supabase = createClient(url, key, {
        realtime: {
            transport: ws,
        },
        ...options,
    });

    return supabase;
};

export const getSupabase = () => {
    if (!supabase) {
        throw new Error('Supabase not initialized.');
    }

    return supabase;
};

const normalizeScheduledArrival = (scheduledArrival) => {
    if (scheduledArrival == null) return null;

    const numericArrival = typeof scheduledArrival === 'string'
        ? Number(scheduledArrival)
        : scheduledArrival;

    if (Number.isFinite(numericArrival)) {
        const milliseconds = numericArrival < 1e12 ? numericArrival * 1000 : numericArrival;
        return new Date(milliseconds).toISOString();
    }

    return scheduledArrival;
};

export const insertArrival = async (arrival) => {
    try{
        const client = getSupabase();
        if (arrival.train_id == null) {
            throw new Error('Arrival.train_id is required.');
        }

        const {error} = await client.from('arrivals').insert({
            train_id: arrival.train_id,
            trip_id: arrival.trip_id,
            line_name: arrival.line_name,
            urban_zone_name: arrival.urban_zone_name,
            station_name: arrival.station_name,
            scheduled_arrival: normalizeScheduledArrival(arrival.scheduled_arrival),
            delay_seconds: arrival.delay_seconds,
            timestamp: normalizeScheduledArrival(arrival.timestamp),
        })
        if(error) throw error;
    }catch (error){
        console.error('Error inserting arrivals:', error);
        throw error;
    }
    
}

