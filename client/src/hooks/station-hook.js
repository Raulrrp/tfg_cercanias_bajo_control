import { useState, useEffect } from 'react';
import { fetchStations } from '../services/station-service.js';

// when called, states and useEffect are registered
// after rendering the component, useEffect will be executed as a callback

// as there is a void array in useEffect(function, array), this function
// will only be executed after the first render.

// Using useEffect callbacks is the  standard way to fetch info, so that
// you can control when the fetch is executed
export const useStations = () => {
  const [stations, setStations] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadStations = async () => {
      try {
        const data = await fetchStations();
        setStations(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        setStations([]);
      }
    };

    loadStations();
  }, []);

  const getStationByName = (name) =>{
    return stations.find((st) => st.name.toLowerCase().includes(name.toLowerCase()));
  }

  const getStationById = (id) => {
    return stations.find((st) => st.id == id);
  }

  // this defines what is accesible from outside when we call useStations()
  return { stations, error, getStationByName, getStationById };
};