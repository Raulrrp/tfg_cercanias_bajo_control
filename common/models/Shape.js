export class Shape{

    constructor({id, shapePoint}){
        this.id = id;
        // If it's already an array, keep it. If it's a single item, put it in an array.
        // If it's missing, make it an empty array.
        if (!shapePoint) {
            this.shapePoints = [];
        } else {
            this.shapePoints = Array.isArray(shapePoint) ? shapePoint : [shapePoint];
        }
    }
    static fromJson(json) {
        return new Shape({
            id: json.id,
            shapePoints: json.shapePoints?.map(point => ShapePoint.fromJson(point)) || []
        });
    }
    toJson() {
        return {
            id: this.id,
            shapePoints: this.shapePoints.map(point => point.toJson())
        };
    }
    addShapePoint(shapePoint) {
        this.shapePoints.push(shapePoint);
    }
}