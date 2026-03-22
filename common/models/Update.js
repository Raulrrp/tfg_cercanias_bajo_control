export class Update{
    constructor(id, tripId, scheduledState, scheduledTime, delay, nextStopId){
        this.id = id;
        this.tripId = tripId;
        this.scheduledState = scheduledState;
        this.scheduledTime = scheduledTime;
        this.delay = delay;
        this.nextStopId = nextStopId;

    }
    static fromJson(json){
        return new Update(
            json.id,
            json.tripId,
            json.scheduledState,
            json.scheduledTime,
            json.delay,
            json.nextStopId
        )
    }
    toJson(){
        return {
            id: this.id,
            tripId: this.tripId,
            scheduledState: this.scheduledState,
            scheduledTime: this.scheduledTime,
            delay: this.delay,
            nextStopId: this.nextStopId
        }
    }
}