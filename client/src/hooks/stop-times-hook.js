import { useState, useCallback } from 'react';
import { fetchStopTimesByStationId } from '../services/stop-times-service.js';

export const useStopTimes = () => {
  const [timetableOpen, setTimetableOpen] = useState(false);
  const [timetableStation, setTimetableStation] = useState(null);
  const [timetableData, setTimetableData] = useState(null);
  const [timetableLoading, setTimetableLoading] = useState(false);
  const [timetableError, setTimetableError] = useState(null);

  const fetchTimetable = useCallback(async (station) => {
    setTimetableOpen(true);
    setTimetableStation(station);
    setTimetableLoading(true);
    setTimetableError(null);
    setTimetableData(null);
    try {
      const data = await fetchStopTimesByStationId(station.id);
      setTimetableData(data);
    } catch (err) {
      setTimetableError(err.message || 'Error al cargar los horarios');
    } finally {
      setTimetableLoading(false);
    }
  }, []);

  const closeTimetable = useCallback(() => {
    setTimetableOpen(false);
    setTimetableStation(null);
    setTimetableData(null);
    setTimetableError(null);
  }, []);

  return {
    timetableOpen,
    timetableStation,
    timetableData,
    timetableLoading,
    timetableError,
    fetchTimetable,
    closeTimetable
  };
};