export class Shape{
    constructor({id, latitude, longitude, sequence}){
        this.id = id;
        this.latitude = latitude;
        this.longitude = longitude;
        this.sequence = sequence;
    }
    static fromJson(json) {
        return new Shape({
            id: json.id,
            latitude: json.latitude,
            longitude: json.longitude,
            sequence: json.sequence
        });
    }
    toJson() {
        return {
            id: this.id,
            latitude: this.latitude,
            longitude: this.longitude,
            sequence: this.sequence
        };
    }
}