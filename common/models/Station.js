export class Station{
  constructor({id, code, name, latitude, longitude, address, zipcode, city, province}){
    this.id = id;
    this.code = code;
    this.name = name;
    this.latitude = latitude;
    this.longitude = longitude;
    this.address = address;
    this.zipcode = zipcode;
    this.city = city;
    this.province = province;
  }
}