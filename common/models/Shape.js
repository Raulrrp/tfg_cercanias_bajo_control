class Shape{
    constructor({id, shape_id, latitude, longitude, sequence}){
        this.id = id;
        this.shape_id = shape_id;
        this.latitude = latitude;
        this.longitude = longitude;
        this.sequence = sequence;
    }
    static fromJson(json) {
        return new Shape({
            id: json.id,
            shape_id: json.shape_id,
            latitude: json.latitude,
            longitude: json.longitude,
            sequence: json.sequence
        });
    }
    toJson() {
        return {
            id: this.id,
            shape_id: this.shape_id,
            latitude: this.latitude,
            longitude: this.longitude,
            sequence: this.sequence
        };
    }
}