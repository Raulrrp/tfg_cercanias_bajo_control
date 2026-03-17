import { Station } from '@tfg_cercanias_bajo_control/common/models/Station.js';

export class StationMapper {
  static toDomain(record) {
    return new Station({
      id: parseInt(record[0], 10),
      name: record[1],
      latitude: parseFloat(record[2].replace(',', '.')),
      longitude: parseFloat(record[3].replace(',', '.')),
      address: record[4],
      zipcode: parseInt(record[5], 10),
      city: record[6],
      province: record[7]
    });
  }
}