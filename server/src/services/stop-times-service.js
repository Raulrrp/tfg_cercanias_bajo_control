import { fetchStopTimes } from '../data/files/stop-times-repo.js';
import { fetchCalendarEntries } from '../data/files/calendar-repo.js';
import { fetchTrips } from '../data/files/trip-repo.js';
import { fetchStations } from '../data/files/station-repo.js'; // import station repository to resolve stop names
import { StopTime } from '@tfg_cercanias_bajo_control/common/models/StopTime.js';

const parseTimeToSeconds = (timeStr) => {
  if (!timeStr) return Number.POSITIVE_INFINITY;
  const parts = String(timeStr).split(':');
  if (parts.length < 2) return Number.POSITIVE_INFINITY;
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  const s = parseInt(parts[2], 10) || 0;
  return h * 3600 + m * 60 + s;
};

const getActiveServiceIdsForToday = (calendarEntries) => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const currentDateInt = parseInt(`${year}${month}${day}`, 10);

  const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const currentDayName = daysOfWeek[today.getDay()];

  return calendarEntries
    .filter(entry => {
      const withinDates = currentDateInt >= entry.startDate && currentDateInt <= entry.endDate;
      const runsOnDay = entry[currentDayName] === 1;
      return withinDates && runsOnDay;
    })
    .map(entry => entry.serviceId);
};

export const getStopTimesByStopId = async (stopId) => {
  const allStopTimes = await fetchStopTimes();
  const calendarEntries = await fetchCalendarEntries();
  const allTrips = await fetchTrips();
  const allStations = await fetchStations(); // load all stations to get their descriptive names
  
  const activeServices = getActiveServiceIdsForToday(calendarEntries);

  const tripMap = new Map();
  allTrips.forEach(trip => {
    tripMap.set(String(trip.id), trip);
  });

  const stationMap = new Map();
  allStations.forEach(station => {
    stationMap.set(String(station.id), station); // map station data indexed by its unique identifier
  });

  const tripMaxSequenceMap = new Map(); // map to keep track of the highest stop sequence found per trip
  const tripDestinationMap = new Map(); // map to link each trip identifier to its final stop object

  for (const st of allStopTimes) {
    const tId = String(st.tripId);
    const currentSeq = st.stopSequence || 0;
    const maxSeq = tripMaxSequenceMap.get(tId) || -1;

    if (currentSeq > maxSeq) {
      tripMaxSequenceMap.set(tId, currentSeq);
      tripDestinationMap.set(tId, st); // update the destination stop structure for this specific trip
    }
  }

  const now = new Date();
  const currentSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

  const seenTrips = new Set();
  const filtered = [];

  for (const st of allStopTimes) {
    if (String(st.stopId) !== String(stopId)) continue;

    const tripIdStr = String(st.tripId);
    if (seenTrips.has(tripIdStr)) continue;

    const trip = tripMap.get(tripIdStr);
    if (!trip) continue;

    const isServiceActive = activeServices.includes(String(trip.serviceId));
    if (!isServiceActive) continue;

    const departureSeconds = parseTimeToSeconds(st.departureTime || st.arrivalTime);
    if (departureSeconds < currentSeconds) continue;

    seenTrips.add(tripIdStr);

    const finalStopOfTrip = tripDestinationMap.get(tripIdStr);
    let destinationName = 'Unknown Destination';

    if (finalStopOfTrip) {
      if (String(st.stopId) === String(finalStopOfTrip.stopId)) {
        destinationName = 'Termina trayecto'; // context case if the current filtered stop is already the terminal
      } else {
        const targetStation = stationMap.get(String(finalStopOfTrip.stopId));
        if (targetStation) {
          destinationName = targetStation.name || targetStation.stop_name || 'Unknown Destination'; // read explicit name parameter
        }
      }
    }

    const enrichedStopTime = new StopTime({
      tripId: st.tripId,
      arrivalTime: st.arrivalTime,
      departureTime: st.departureTime,
      stopId: st.stopId,
      stopSequence: st.stopSequence,
      headsign: destinationName
    });

    filtered.push(enrichedStopTime);
  }

  return filtered.sort((a, b) => {
    const aTime = parseTimeToSeconds(a.departureTime || a.arrivalTime);
    const bTime = parseTimeToSeconds(b.departureTime || b.arrivalTime);
    return aTime - bTime;
  });
};

export const getStopTimeByTripIdAndStopId = async (tripId, stopId) => {
  const allStopTimes = await fetchStopTimes();
  return allStopTimes.find((st) => String(st.tripId) === String(tripId) && String(st.stopId) === String(stopId)) || null;
};