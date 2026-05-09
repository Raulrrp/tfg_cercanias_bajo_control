// loads periodcally and coordinatedly trains and updates

import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { TrainPos } from '@tfg_cercanias_bajo_control/common/models/TrainPos.js';
import { Update } from '@tfg_cercanias_bajo_control/common/models/Update.js';

const DEFAULT_SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const useRealtimeSnapshot = () => {
  const [trains, setTrains] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);
  const isMountedRef = useRef(true);
  const socketRef = useRef(null);

  useEffect(() => {
    isMountedRef.current = true;

    // Determine socket URL: explicit VITE_SOCKET_URL > derive origin from VITE_API_URL > window.location.origin
    let socketUrl = import.meta.env.VITE_SOCKET_URL;
    if (!socketUrl) {
      try {
        const api = import.meta.env.VITE_API_URL;
        socketUrl = api ? new URL(api).origin : DEFAULT_SOCKET_URL;
      } catch (err) {
        socketUrl = DEFAULT_SOCKET_URL;
      }
    }

    const socket = io(socketUrl, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    const handleTrains = (data) => {
      if (!isMountedRef.current) return;
      try {
        const mapped = (data || []).map((j) => TrainPos.fromJson(j));
        setTrains(mapped);
        setLastUpdatedAt(new Date());
        setLoading(false);
        setError(null);
      } catch (err) {
        setError(String(err));
      }
    };

    const handleUpdates = (data) => {
      if (!isMountedRef.current) return;
      try {
        const mapped = (data || []).map((j) => Update.fromJson(j));
        setUpdates(mapped);
        setLastUpdatedAt(new Date());
        setLoading(false);
        setError(null);
      } catch (err) {
        setError(String(err));
      }
    };

    const handleError = (err) => {
      if (!isMountedRef.current) return;
      setError(err?.message || String(err));
      setLoading(false);
    };

    socket.on('connect_error', handleError);
    socket.on('connect', () => {
      // nothing special
    });
    socket.on('trains_update', handleTrains);
    socket.on('updates_update', handleUpdates);

    // cleanup
    return () => {
      isMountedRef.current = false;
      if (socketRef.current) {
        socketRef.current.off('trains_update', handleTrains);
        socketRef.current.off('updates_update', handleUpdates);
        socketRef.current.off('connect_error', handleError);
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  return { trains, updates, error, loading, lastUpdatedAt };
};