// express eases the use of the server and its communication
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// stationRoutes import
import stationRoutes from './routes/station-routes.js';
// reads the .env file to read variables
dotenv.config();
const app = express();

// Middlewares

// enables React to communicate with the servere with no blocking threat
// enables React  (port  5173) to connect to the server (port 3000)
app.use(cors()); 
// the servere will understand JSON
app.use(express.json());
// every query with /api/stations will be handled by stationRoutes.
app.use('/api/stations', stationRoutes);

//  test path
app.get('/', (req, res) => {
  res.send('API de Estaciones de Tren funcionando');
});

// the server listens to the port 3000, it there is no .env info, it uses 3000
// added 0.0.0.0 to allow connections from outside the container
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});