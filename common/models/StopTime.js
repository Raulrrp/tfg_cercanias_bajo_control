export class StopTime {
    constructor({tripId, arrivalTime, departureTime, stopId, stopSequence}) {
        this.tripId = tripId;
        this.arrivalTime = arrivalTime;
        this.departureTime = departureTime;
        this.stopId = stopId;
        this.stopSequence = stopSequence;
    }

    static fromJson(json) {
        return new StopTime({
            tripId: json.tripId ?? json.trip_id,
            arrivalTime: json.arrivalTime ?? json.arrival_time,
            departureTime: json.departureTime ?? json.departure_time,
            stopId: json.stopId ?? json.stop_id,
            stopSequence: json.stopSequence ?? json.stop_sequence
        });
    }

    toJson() {
        return {
            tripId: this.tripId,
            arrivalTime: this.arrivalTime,
            departureTime: this.departureTime,
            stopId: this.stopId,
            stopSequence: this.stopSequence,
        };
    }
}
