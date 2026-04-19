import {UrbanZone} from "@tfg_cercanias_bajo_control/common/models/UrbanZone";

export const fetchUrbanZones = async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/urban-zones`);
    if (!response.ok) 
        throw new Error(`Failed to fetch urban zones: ${response.status}`);
    
    const data = await response.json();
    return data.map((urbanZoneJson) => UrbanZone.fromJson(urbanZoneJson));
  } catch (error) {
    console.error('Error fetching urban zones:', error);
    throw error;
  }
};