import {Update} from '@tfg_cercanias_bajo_control/common/models/Update.js';

export const fetchUpdates = async () => {
    try{
        const response = await fetch(`${import.meta.env.VITE_API_URL}/updates`);
        if (!response.ok) throw new Error('Failed to fetch updates');
        const data = await response.json();
        return data.map(updateJson => Update.fromJson(updateJson));
    } catch (error) {
        console.error('Error fetching updates:', error);
        throw error;
    }
}