export class ShapePoint{
    constructor({latitude, longitude, sequence}){
        this.latitude = latitude;
        this.longitude = longitude;
        this.sequence = sequence;
    }
    static fromJson(json) {
        return new ShapePoint({
            latitude: json.latitude,
            longitude: json.longitude,
            sequence: json.sequence
        });
    }
    toJson() {
        return {
            latitude: this.latitude,
            longitude: this.longitude,
            sequence: this.sequence
        };
    }
}