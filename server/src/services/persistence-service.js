import { insertArrival } from '@tfg_cercanias_bajo_control/server/src/data/supabase/persistence-repo.js';

export const storeArrival = async (arrival) => {
    await insertArrival(arrival);
};