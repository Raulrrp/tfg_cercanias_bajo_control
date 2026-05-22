export class Arrival{
    constructor({trip_id, line, urban_zone, last_station, current_station, scheduled_arrival, delay_seconds}){
        this.trip_id = trip_id;
        this.line = line;
        this.urban_zone = urban_zone;
        this.last_station = last_station;
        this.current_station = current_station;
        this.scheduled_arrival = scheduled_arrival;
        this.delay_seconds = delay_seconds;
    }
    static fromJson(json){
        return new Arrival({
            trip_id: json.trip_id,
            line: json.line,
            urban_zone: json.urban_zone,
            last_station: json.last_station,
            current_station: json.current_station,
            scheduled_arrival: json.scheduled_arrival,
            delay_seconds: json.delay_seconds
        })
    }
    toJson(){
        return {
            trip_id: this.trip_id,
            line: this.line,
            urban_zone: this.urban_zone,
            current_station: this.current_station,
            scheduled_arrival: this.scheduled_arrival,
            delay_seconds: this.delay_seconds,
        }
    }
}