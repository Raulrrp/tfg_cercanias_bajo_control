import {createClient} from '@supabase/supabase-js';

let supabase;

export const insertArrival = async (arrival) => {
    try{
        if(!supabase){
            throw new Error('Supabase not initialized.');
        }
        const {error} = await supabase.from('arrivals').insert({
            trip_id: arrival.trip_id,
            line_id: arrival.line_id,
            urban_zone_id: arrival.urban_zone_id,
            last_station_id: arrival.last_station_id,
            current_station_id: arrival.current_station_id,
            scheduled_arrival: arrival.scheduled_arrival,
            delay_in_seconds: arrival.delay_in_seconds
        })
        if(error) throw error;
    }catch (error){
        console.error('Error inserting arrivals:', error);
        throw error;
    }
    
}

export const initSupabase = ({url, key, options}) => {
    // options unused
    supabase = createClient(
        url,
        key
    );
    return supabase;
}

export const getSupabase = () => {
    return supabase;
}

