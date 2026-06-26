import fs from 'fs/promises';
import path from 'path';
import url from 'url';
import { parse } from 'csv-parse/sync';
import { Calendar } from '@tfg_cercanias_bajo_control/common/models/Calendar.js';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const CALENDAR_FILE_PATH = path.resolve(__dirname, '../../../data_files/calendar.txt');

let cachedCalendar = null;

export const fetchCalendarEntries = async () => {
  try {
    if (cachedCalendar) return cachedCalendar;

    const content = await fs.readFile(CALENDAR_FILE_PATH, 'utf-8');

    const records = parse(content, {
      delimiter: ',',
      columns: false,
      from_line: 2,
      skip_empty_lines: true,
      trim: true,
    });

    const entries = records.map((record) => {
      const [serviceId, monday, tuesday, wednesday, thursday, friday, saturday, sunday, startDate, endDate] = record;

      return new Calendar({
        serviceId,
        monday: parseInt(monday, 10),
        tuesday: parseInt(tuesday, 10),
        wednesday: parseInt(wednesday, 10),
        thursday: parseInt(thursday, 10),
        friday: parseInt(friday, 10),
        saturday: parseInt(saturday, 10),
        sunday: parseInt(sunday, 10),
        startDate: parseInt(startDate, 10),
        endDate: parseInt(endDate, 10),
      });
    });

    cachedCalendar = entries;
    return cachedCalendar;
  } catch (error) {
    console.error('Error processing calendar file:', error);
    throw error;
  }
};