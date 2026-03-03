import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// stationRoutes import
import stationRoutes from './routes/stationRoutes.js';

dotenv.config();

const app = express();

// Middlewares
app.use(cors()); // Enables React  (port  5173) to connect to the server (port 3000)
app.use(express.json()); // The servere will understand JSON
app.use('/api', stationRoutes);

//  test path
app.get('/', (req, res) => {
  res.send('API de Estaciones de Tren funcionando');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});