export class Arrival{
    constructor({train_id, trip_id, line_name, urban_zone_name, station_name, scheduled_arrival, delay_seconds, timestamp}){
        this.train_id = train_id;
        this.trip_id = trip_id;
        this.line_name = line_name;
        this.urban_zone_name= urban_zone_name;
        this.station_name = station_name;
        this.scheduled_arrival = scheduled_arrival;
        this.delay_seconds = delay_seconds;
        this.timestamp = timestamp;
    }
    static fromJson(json){
        return new Arrival({
            train_id: json.train_id,
            trip_id: json.trip_id,
            line_name: json.line_name,
            urban_zone_name: json.urban_zone_name,
            station_name: json.station_name,
            scheduled_arrival: json.scheduled_arrival,
            delay_seconds: json.delay_seconds,
            timestamp: json.timestamp,
        })
    }
    toJson(){
        return {
            train_id: this.train_id,
            trip_id: this.trip_id,
            line_name: this.line_name,
            urban_zone_name: this.urban_zone_name,
            station_name: this.station_name,
            scheduled_arrival: this.scheduled_arrival,
            delay_seconds: this.delay_seconds,
            timestamp: this.timestamp,
        }
    }
}