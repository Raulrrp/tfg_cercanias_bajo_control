import { getRealtimeSnapshot, storeSnapshot } from "../services/realtime-service.js";

// Global interval id and guard
let readIntervalId = null;
let running = false;
let connectedClients = 0;

const READ_INTERVAL = 20000;

const readSnapshot = async (io) => {
    try {
        if (running) return;
        running = true;

        const { trains, updates } = await storeSnapshot();

        if (connectedClients > 0) {
            if (trains) {
                io.emit('trains_update', trains.map((t) => t.toJson()));
            }
            if (updates) {
                io.emit('updates_update', updates.map((u) => u.toJson()));
            }
        }
    } catch (err) {
        console.error('Error reading realtime snapshot:', err);
    } finally {
        running = false;
    }
};

export const startRealtimeController = (io) => {
    if (readIntervalId) return;

    void readSnapshot(io);

    readIntervalId = setInterval(() => {
        void readSnapshot(io);

    }, READ_INTERVAL);
};

export const handleSocketConnection = async (socket, io) => {
    console.log(`Cliente conectado al tracking: ${socket.id}`);
    connectedClients += 1;

    // Send immediate snapshot to the connecting socket
    try {
        const { trains, updates } = await getRealtimeSnapshot();
        if (trains) socket.emit('trains_update', trains.map((t) => t.toJson()));
        if (updates) socket.emit('updates_update', updates.map((u) => u.toJson()));
    } catch (err) {
        console.error('Error sending initial snapshot to socket:', err);
    }

    socket.on('disconnect', () => {
        connectedClients = Math.max(connectedClients - 1, 0);
    });
};