import { Station } from '@tfg_cercanias_bajo_control/common/models/Station.js';

export class StationMapper {
  static #counter = 0;
  static toDomain(record) {
    this.#counter++;
    return new Station({
      id: this.#counter,
      code: parseInt(record[0], 10),
      name: record[1],
      latitude: parseFloat(record[2]),
      longitude: parseFloat(record[3]),
      address: record[4],
      zipcode: parseInt(record[5], 10),
      city: record[6],
      province: record[7]
    });
  }

  // resets the counter
  static resetCounter(){
    this.#counter = 0;
  }
}