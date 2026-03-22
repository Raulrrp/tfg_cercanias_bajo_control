export class Update{
    constructor(id, trip_id, scheduledState, scheduledTime, delay, nextStopId){
        this.id = id;
        this.trip_id = trip_id;
        this.scheduledState = scheduledState;
        this.scheduledTime = scheduledTime;
        this.delay = delay;
        this.nextStopId = nextStopId;
    }
    static fromJson(json){
        return new Update(
            this.id = json.id,
            this.trip_id = json.trip_id,
            this.scheduledState = json.scheduledState,
            this.scheduledTime = json.scheduledTime,
            this.delay = json.delay,
            this.nextStopId = json.nextStopId,
        )
    }
    toJson(){
        return {
            id: this.id,
            trip_id: this.trip_id,
            scheduledState: this.scheduledState,
            scheduledTime: this.scheduledTime,
            delay: this.delay,
            nextStopId: this.nextStopId
        }
    }
}