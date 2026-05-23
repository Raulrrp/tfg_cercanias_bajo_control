export class Arrival{
    constructor({train_id, trip_id, line_id, urban_zone_id, last_station, current_station, scheduled_arrival, delay_seconds}){
        this.train_id = train_id;
        this.trip_id = trip_id;
        this.line_id = line_id;
        this.urban_zone_id = urban_zone_id;
        this.last_station = last_station;
        this.current_station = current_station;
        this.scheduled_arrival = scheduled_arrival;
        this.delay_seconds = delay_seconds;
    }
    static fromJson(json){
        return new Arrival({
            train_id: json.train_id,
            trip_id: json.trip_id,
            line_id: json.line_id,
            urban_zone_id: json.urban_zone_id,
            last_station: json.last_station,
            current_station: json.current_station,
            scheduled_arrival: json.scheduled_arrival,
            delay_seconds: json.delay_seconds
        })
    }
    toJson(){
        return {
            train_id: this.train_id,
            trip_id: this.trip_id,
            line_id: this.line_id,
            urban_zone_id: this.urban_zone_id,
            last_station: this.last_station,
            current_station: this.current_station,
            scheduled_arrival: this.scheduled_arrival,
            delay_seconds: this.delay_seconds,
        }
    }
}