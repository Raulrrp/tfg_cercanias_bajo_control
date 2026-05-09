import { getTrains } from "../services/train-service.js";
import { getUpdates } from "../services/update-service.js";

// Global interval id and guard
let broadcastIntervalId = null;
let running = false;

const broadcastSnapshot = async (io) => {
    try {
        if (running) return;
        running = true;

        const [trains, updates] = await Promise.all([getTrains(), getUpdates()]);
        if (trains) {
            io.emit('trains_update', trains.map((t) => t.toJson()));
        }
        if (updates) {
            io.emit('updates_update', updates.map((u) => u.toJson()));
        }
    } catch (err) {
        console.error('Error broadcasting realtime snapshot:', err);
    } finally {
        running = false;
    }
};

export const handleSocketConnection = async (socket, io) => {
    console.log(`Cliente conectado al tracking: ${socket.id}`);

    // Send immediate snapshot to the connecting socket
    try {
        const [trains, updates] = await Promise.all([getTrains(), getUpdates()]);
        if (trains) socket.emit('trains_update', trains.map((t) => t.toJson()));
        if (updates) socket.emit('updates_update', updates.map((u) => u.toJson()));
    } catch (err) {
        console.error('Error sending initial snapshot to socket:', err);
    }

    // Start a single global broadcaster if not already running
    if (!broadcastIntervalId) {
        // Run first broadcast immediately to ensure all clients receive coordinated data
        await broadcastSnapshot(io);

        broadcastIntervalId = setInterval(() => {
            void broadcastSnapshot(io);
        }, 20000);
    }
};