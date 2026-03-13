export class Station{
  constructor({id, name, latitude, longitude, address, zipcode, city, province}){
    this.id = id;
    this.name = name;
    this.latitude = latitude;
    this.longitude = longitude;
    this.address = address;
    this.zipcode = zipcode;
    this.city = city;
    this.province = province;
  }
  static fromJson(json) {
    return new Station({
      id: json.id,
      name: json.name,
      latitude: json.latitude,
      longitude: json.longitude,
      address: json.address,
      zipcode: json.zipcode,
      city: json.city,
      province: json.province
    });
  }

  toJson() {
    return {
      id: this.id,
      name: this.name,
      latitude: this.latitude,
      longitude: this.longitude,
      address: this.address,
      zipcode: this.zipcode,
      city: this.city,
      province: this.province
    };
  }
}