import { io } from 'socket.io-client';
import { TrainPos } from '@tfg_cercanias_bajo_control/common/models/TrainPos.js';
import { Update } from '@tfg_cercanias_bajo_control/common/models/Update.js';

const DEFAULT_SOCKET_URL = import.meta.env.VITE_API_URL;

const getSocketUrl = () => {
  let socketUrl = import.meta.env.VITE_SOCKET_URL;
  if (!socketUrl) {
    try {
      const api = import.meta.env.VITE_API_URL;
      socketUrl = api ? new URL(api).origin : DEFAULT_SOCKET_URL;
    } catch (err) {
      socketUrl = DEFAULT_SOCKET_URL;
    }
  }
  return socketUrl;
};

class RealtimeService {
  constructor() {
    this.socket = null;
  }

  connect() {
    if (!this.socket) {
      this.socket = io(getSocketUrl(), { transports: ['websocket', 'polling'] });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  subscribeToTrains(onTrainsUpdate, onError) {
    const socket = this.connect();

    const handleTrains = (data) => {
      try {
        const mapped = (data || []).map((j) => TrainPos.fromJson(j));
        onTrainsUpdate(mapped);
      } catch (err) {
        onError(String(err));
      }
    };

    socket.on('trains_update', handleTrains);
    return () => socket.off('trains_update', handleTrains);
  }

  subscribeToUpdates(onUpdatesUpdate, onError) {
    const socket = this.connect();

    const handleUpdates = (data) => {
      try {
        const mapped = (data || []).map((j) => Update.fromJson(j));
        onUpdatesUpdate(mapped);
      } catch (err) {
        onError(String(err));
      }
    };

    socket.on('updates_update', handleUpdates);
    return () => socket.off('updates_update', handleUpdates);
  }

  subscribeToErrors(onError) {
    const socket = this.connect();
    socket.on('connect_error', onError);
    return () => socket.off('connect_error', onError);
  }
}

export const realtimeService = new RealtimeService();