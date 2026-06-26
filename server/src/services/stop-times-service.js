import { fetchStopTimes } from '../data/files/stop-times-repo.js';
import { fetchCalendarEntries } from '../data/files/calendar-repo.js';
import { fetchTrips } from '../data/files/trip-repo.js';

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
  
  const activeServices = getActiveServiceIdsForToday(calendarEntries);

  const tripServiceMap = new Map();
  allTrips.forEach(trip => {
    tripServiceMap.set(String(trip.id), String(trip.serviceId));
  });

  // calculate current time in seconds since midnight
  const now = new Date();
  const currentSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

  const seenTrips = new Set();
  const filtered = [];

  for (const st of allStopTimes) {
    if (String(st.stopId) !== String(stopId)) continue;

    const tripIdStr = String(st.tripId);
    // strict check to avoid duplicate departures for the same trip at this station
    if (seenTrips.has(tripIdStr)) continue;

    const serviceId = tripServiceMap.get(tripIdStr);
    if (!serviceId || !activeServices.includes(serviceId)) continue;

    // filter out past departures, keep only upcoming ones
    const departureSeconds = parseTimeToSeconds(st.departureTime || st.arrivalTime);
    if (departureSeconds < currentSeconds) continue;

    seenTrips.add(tripIdStr);
    filtered.push(st);
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