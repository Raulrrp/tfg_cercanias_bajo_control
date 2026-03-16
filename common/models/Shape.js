import {ShapePoint} from "@tfg_cercanias_bajo_control/common/models/ShapePoint.js";

export class Shape{

    // you can give the fist point or not
    constructor({id, shapePoints}){
        this.id = id;
        // If it's already an array, keep it. If it's a single item, put it in an array.
        // If it's missing, make it an empty array.
        if (!shapePoints) {
            this.shapePoints = [];
        } else {
            this.shapePoints = Array.isArray(shapePoints) ? shapePoints : [shapePoints];
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