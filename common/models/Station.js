export class Station {
  constructor(record) {
    if (!record) return;

    this.id = record[0];
    this.code = parseInt(record[1], 10);
    this.name = record[2];
    this.latitude = parseFloat(record[3]);
    this.longitude = parseFloat(record[4]);
    this.address = record[5];
    this.zipcode = parseInt(record[6], 10);
    this.city = record[7];
  }
}