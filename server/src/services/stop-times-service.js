import { fetchStopTimes, parseTimeToSeconds } from '../data/files/stop-times-repo.js';
import { fetchCalendarEntries } from '../data/files/calendar-repo.js';
import { fetchTrips } from '../data/files/trip-repo.js';
import { fetchStations } from '../data/files/station-repo.js';
import { StopTime } from '@tfg_cercanias_bajo_control/common/models/StopTime.js';

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
    .map(entry => String(entry.serviceId).trim()); // Normalize serviceId to string for safe comparison
};

export const getDeparturesByStopId = async (stationId) => {
  const normalizedStationId = String(stationId).trim();
  
  const allStopTimes = await fetchStopTimes();
  const calendarEntries = await fetchCalendarEntries();
  const allTrips = await fetchTrips();
  const allStations = await fetchStations();
  
  const activeServices = getActiveServiceIdsForToday(calendarEntries);

  const tripMap = new Map();
  allTrips.forEach(trip => {
    tripMap.set(String(trip.id).trim(), trip);
  });

  const stationMap = new Map();
  allStations.forEach(station => {
    stationMap.set(String(station.id).trim(), station);
  });

  const tripMaxSequenceMap = new Map();
  const tripDestinationMap = new Map();

  for (const st of allStopTimes) {
    const tId = st.tripId; // Already string normalized from repository
    const currentSeq = st.stopSequence || 0;
    const maxSeq = tripMaxSequenceMap.get(tId) ?? -1;

    if (currentSeq > maxSeq) {
      tripMaxSequenceMap.set(tId, currentSeq);
      tripDestinationMap.set(tId, st);
    }
  }

  const now = new Date();
  const format = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Madrid',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hourCycle: 'h23' // warrants that 24:00 is formated as 00:00
  });
  const parts = format.formatToParts(now);
  const hours = parseInt(parts.find( part => part.type === 'hour').value, 10)
  const minutes = parseInt(parts.find(part => part.type === 'minute').value, 10);
  const seconds = parseInt(parts.find( part => part.type === 'second').value, 10);
  const currentSeconds = hours * 3600 + minutes * 60 + seconds;

  const seenTrips = new Set();
  const filtered = [];

  for (const st of allStopTimes) {
    if (st.stopId !== normalizedStationId) continue;

    const tripIdStr = st.tripId; // Already string normalized from repository
    if (seenTrips.has(tripIdStr)) continue;

    const finalStopOfTrip = tripDestinationMap.get(tripIdStr);
    if (finalStopOfTrip && st.stopId === finalStopOfTrip.stopId) {
      continue;
    }

    const trip = tripMap.get(tripIdStr);
    if (!trip) continue;

    const isServiceActive = activeServices.includes(String(trip.serviceId).trim());
    if (!isServiceActive) continue;

    const departureSeconds = parseTimeToSeconds(st.departureTime || st.arrivalTime);
    if (departureSeconds < currentSeconds) continue;

    seenTrips.add(tripIdStr);

    let destinationName = 'Unknown Destination';
    if (finalStopOfTrip) {
      const targetStation = stationMap.get(finalStopOfTrip.stopId);
      if (targetStation) {
        destinationName = targetStation.name || targetStation.stop_name || 'Unknown Destination';
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
  const normalizedTripId = String(tripId).trim();
  const normalizedStopId = String(stopId).trim();
  
  const allStopTimes = await fetchStopTimes();
  return allStopTimes.find((st) => st.tripId === normalizedTripId && st.stopId === normalizedStopId) || null;
};