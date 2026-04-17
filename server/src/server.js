// express eases the use of the server and its communication
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http'; // Required for WebSocket support
import { Server } from 'socket.io';   // WebSocket library

// stationRoutes import
import stationRoutes from './routes/station-routes.js';
// routeShapesRoutes import
import routeShapesRoutes from './routes/route-shapes-routes.js';
// trainRoutes import
import trainRoutes from './routes/train-routes.js';
// updateRoutes import
import updateRoutes from './routes/update-routes.js';
// tripRoutes import
import tripRoutes from './routes/trip-routes.js';

// Logic and Controller imports for real-time tracking
import * as TrainService from './services/train-service.js';
import { handleSocketConnection } from './controllers/train-controller.js';

// reads the .env file to read variables
dotenv.config();
const app = express();

// Create the HTTP server to allow Express and WebSockets to share the same port
// WHATCHOUT: origin: "*" is not recommended for prod
const httpServer = createServer(app); 
const io = new Server(httpServer, {
  cors: { origin: "http://localhost:5173" }
});

// Middlewares

// enables React to communicate with the servere with no blocking threat
// enables React (port 5173) to connect to the server (port 3000)
app.use(cors()); 
// the server will understand JSON
app.use(express.json());

// every query with /api/stations will be handled by stationRoutes.
app.use('/api/stations', stationRoutes);
// every query with /api/route-shapes will be handled by routeShapesRoutes.
app.use('/api/route-shapes', routeShapesRoutes);
// every query with /api/trains will be handled by trainRoutes.
app.use('/api/trains', trainRoutes);
// every query with /api/updates will be handled by updateRoutes.
app.use('/api/updates', updateRoutes);
// every query with /api/trips will be handled by tripRoutes.
app.use('/api/trips', tripRoutes);

// test path
app.get('/', (req, res) => {
  res.send('API de Estaciones de Tren funcionando');
});

// WebSocket connection handling
io.on('connection', (socket) => {
  handleSocketConnection(socket);
});

// Start the real-time background service
TrainService.initTrainTracking(io);

// the server listens to the port 3000, it there is no .env info, it uses 3000
// added 0.0.0.0 to allow connections from outside the container
const PORT = process.env.PORT || 3000;

// IMPORTANT: We now use httpServer.listen instead of app.listen to support WebSockets
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});