// here we decide which data is being sent

// test
// backend/src/controllers/stationController.js
export const getAllStations = (req, res) => {
  const stations = [
    { id: 1, name: "Madrid Puerta de Atocha", lat: 40.4065, lng: -3.6896 },
    { id: 2, name: "Barcelona Sants", lat: 41.3792, lng: 2.1406 }
  ];
  
  res.json(stations);
};