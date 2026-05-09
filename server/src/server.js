// express eases the use of the server and its communication
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http'; // Required for WebSocket support
import { Server } from 'socket.io';   // WebSocket library

// stationRoutes import
import stationRoutes from './routes/station-routes.js';
// trainRoutes import
import trainRoutes from './routes/train-routes.js';
// updateRoutes import
import updateRoutes from './routes/update-routes.js';
// tripRoutes import
import tripRoutes from './routes/trip-routes.js';
// lineRoutes import
import lineRoutes from './routes/line-routes.js';
// urbanZonesRoutes import
import urbanZonesRoutes from './routes/urban-zones-routes.js';
// timetablesRoutes import
import timetablesRoutes from './routes/stop-times-routes.js';
// linearReferenceLoader import
import {LinearReferenceLoader} from './services/linear-reference-loader.js';
// linearReferenceEngine import
import {LinearReferenceEngine} from './services/linear-reference-engine.js';
// arrivalDetector
import {ArrivalDetector} from './services/arrival-detector-service.js';
// getStations import
import { getStations } from './services/station-service.js';
// getShapes import
import { getShapes } from './services/shape-service.js';
// getTrips import
import { getTrips } from './services/trip-service.js';
// train service configuration
import { configureTrainService } from './services/train-service.js';
// Logic and Controller imports for real-time tracking
import { handleSocketConnection } from './controllers/realtime-controller.js';


// reads the .env file to read variables
dotenv.config();
const app = express();

// Create the HTTP server to allow Express and WebSockets to share the same port
// WHATCHOUT: origin: "*" is not recommended for prod
// hardcoding urls is not the best practice
const httpServer = createServer(app); 
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN;

const io = new Server(httpServer, {
  cors: { origin: CLIENT_ORIGIN }
});

// Middlewares

// enables React to communicate with the servere with no blocking threat
// enables React (port 5173) to connect to the server (port 3000)
app.use(cors()); 
// the server will understand JSON
app.use(express.json());

// every query with /api/stations will be handled by stationRoutes.
app.use('/api/stations', stationRoutes);
// every query with /api/trains will be handled by trainRoutes.
app.use('/api/trains', trainRoutes);
// every query with /api/updates will be handled by updateRoutes.
app.use('/api/updates', updateRoutes);
// every query with /api/trips will be handled by tripRoutes.
app.use('/api/trips', tripRoutes);
// every query with /api/lines will be handled by lineRoutes.
app.use('/api/lines', lineRoutes);
// every query with /api/urban-zones will be handled by urbanZonesRoutes.
app.use('/api/urban-zones', urbanZonesRoutes);
// every query with /api/stop-times will be handled by timetablesRoutes.
app.use('/api/stop-times', timetablesRoutes);

// test path
app.get('/', (req, res) => {
  res.send('API de Estaciones de Tren funcionando');
});

// WebSocket connection handling
io.on('connection', (socket) => {
  handleSocketConnection(socket, io);
});

// loader
const [stations, shapes, trips] = await Promise.all(
  [getStations(), getShapes(), getTrips()]
);
const loader = new LinearReferenceLoader();
await loader.initialize(stations, shapes, trips);

// linear reference engine
const engine = new LinearReferenceEngine(loader);

// arrival detector
const arrivalDetector = new ArrivalDetector(loader, engine);

// inject detector into train service
configureTrainService({ detector: arrivalDetector });

// the server listens to the port 3000, it there is no .env info, it uses 3000
// added 0.0.0.0 to allow connections from outside the container
const PORT = process.env.PORT || 3000;

// IMPORTANT: We now use httpServer.listen instead of app.listen to support WebSockets
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});