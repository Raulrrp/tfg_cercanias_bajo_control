import {Train} from "./Train.js";
export class TrainPos {
  constructor({ id, train, trip_id, latitude, longitude, status, timestamp, nextStop}) {
    this.id = id;
    this.train = train;
    this.trip_id = trip_id;
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
      trip_id: json.trip_id,
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
      trip_id: this.trip_id,
      latitude: this.latitude,
      longitude: this.longitude,
      status: this.status,
      timestamp: this.timestamp,
      nextStop: this.nextStop
    };
  }
}