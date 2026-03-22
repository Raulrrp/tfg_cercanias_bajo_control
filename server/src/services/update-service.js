import {fetchUpdates} from '@tfg_cercanias_bajo_control/server/src/data/remote/update-repo.js';

export const getUpdates = async () => {
    const data = await fetchUpdates();
    return data;
}