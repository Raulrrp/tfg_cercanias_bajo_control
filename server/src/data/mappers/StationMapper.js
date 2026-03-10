import { Station } from '@tfg_cercanias_bajo_control/common/models/Station.js';

export class StationMapper {
  // Aquí vive el conocimiento del "record[10] === 'SI'"
  static toDomain(record) {
    return new Station({
      id: record[0],
      code: parseInt(record[1], 10),
      name: record[2],
      latitude: parseFloat(record[3]),
      longitude: parseFloat(record[4]),
      address: record[5],
      zipcode: parseInt(record[6], 10),
      city: record[7]
    });
  }
}