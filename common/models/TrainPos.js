import {Train} from "./Train.js";
export class TrainPos {
  constructor({ id, train, trip, latitude, longitude, status, timestamp, nextStop}) {
    this.id = id;
    this.train = train;
    this.trip = trip;
    this.latitude = latitude;
    this.longitude = longitude;
    this.status = status;
    this.timestamp = timestamp;
    this.nextStop = nextStop;
  }
  static fromJson(json){
    return new TrainPos({
      id: json.id,
      train: Train.fromJson(json.train),
      trip: json.trip,
      latitude: json.latitude,
      longitude: json.longitude,
      status: json.status,
      timestamp: json.timestamp,
      nextStop: json.nextStop
      });
    }
  toJson(){
    return{
      id: this.id,
      train: this.train.toJson(),
      trip: this.trip,
      latitude: this.latitude,
      longitude: this.longitude,
      status: this.status,
      timestamp: this.timestamp,
      nextStop: this.nextStop
    };
  }
}