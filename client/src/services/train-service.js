import {TrainPos} from "@tfg_cercanias_bajo_control/common/models/TrainPos.js";

export const fetchTrains = async () =>{
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/trains`);
    if(!response.ok) throw new Error('Failed to fetch trains');
    const data = await response.json();
    return data.map(trainJson => TrainPos.fromJson(trainJson));
  } catch(error){
    console.error('Error fetching trains:', error);
    throw error;
  }
}