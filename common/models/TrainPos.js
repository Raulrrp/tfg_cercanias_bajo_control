import {Train} from "./Train.js";
export class TrainPos {
  constructor({ id, train, tripId, latitude, longitude, status, timestamp, nextStationId}) {
    this.id = id;
    this.train = train;
    this.tripId = tripId;
    this.latitude = latitude;
    this.longitude = longitude;
    this.status = status;
    this.timestamp = timestamp;
    this.nextStationId = nextStationId;
  }
  static fromJson(json){
    return new TrainPos({
      id: json.id,
      train: Train.fromJson(json.train),
      tripId: json.tripId,
      latitude: json.latitude,
      longitude: json.longitude,
      status: json.status,
      timestamp: json.timestamp,
      nextStationId: json.nextStationId
      });
    }
  toJson(){
    return{
      id: this.id,
      train: this.train.toJson(),
      tripId: this.tripId,
      latitude: this.latitude,
      longitude: this.longitude,
      status: this.status,
      timestamp: this.timestamp,
      nextStationId: this.nextStationId
    };
  }
}