// has to convert json into model object

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const fetchStations = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/stations`);
    if (!response.ok) throw new Error('Error al conectar con el servidor');
    
    const data = await response.json();
    console.log(data);
    return data; 
  } catch (error) {
    console.error("Error en stationService:", error);
    // void array if error
    return []; 
  }
};