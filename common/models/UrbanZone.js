export class UrbanZone {
  constructor({id, name, minLatitude, maxLatitude, minLongitude, maxLongitude }) {
    this.id = id;
    this.name = name;
    this.minLatitude = minLatitude ?? null;
    this.maxLatitude = maxLatitude ?? null;
    this.minLongitude = minLongitude ?? null;
    this.maxLongitude = maxLongitude ?? null;
  }

  static fromJson(json){
    return new UrbanZone({
      id: json.id,
      name: json.name,
      minLatitude: json.minLatitude,
      maxLatitude: json.maxLatitude,
      minLongitude: json.minLongitude,
      maxLongitude: json.maxLongitude
    });
  }

  toJson() {
    return{
        id: this.id,
        name: this.name,
        minLatitude: this.minLatitude,
        maxLatitude: this.maxLatitude,
        minLongitude: this.minLongitude,
        maxLongitude: this.maxLongitude
    }
  }
}