export class UrbanZone {
  constructor({ id, name, centerLat, centerLon }) {
    this.id = id;
    this.name = name;
    this.centerLat = centerLat ?? null;
    this.centerLon = centerLon ?? null;
  }

  static fromJson(json) {
    return new UrbanZone({
      id: json.id,
      name: json.name,
      centerLat: json.centerLat ?? json.center_lat,
      centerLon: json.centerLon ?? json.center_lon
    });
  }

  toJson() {
    return {
      id: this.id,
      name: this.name,
      centerLat: this.centerLat,
      centerLon: this.centerLon
    };
  }
}