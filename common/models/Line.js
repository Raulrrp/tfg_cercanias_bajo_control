import { Shape } from '@tfg_cercanias_bajo_control/common/models/Shape.js';

export class Line {
  constructor({name, urbanZone, color, shape, minLatitude, maxLatitude, minLongitude, maxLongitude }) {
    // id: (name, urbanZone) combination
    this.id = `${String(name ?? '').trim()}-${String(urbanZone ?? '').trim()}`;
    this.name = name ?? null;
    this.urbanZone = urbanZone ?? null;
    this.color = color ?? null;
    this.shape = shape instanceof Shape || shape === null ? shape : null;
    this.minLatitude = minLatitude ?? null;
    this.maxLatitude = maxLatitude ?? null;
    this.minLongitude = minLongitude ?? null;
    this.maxLongitude = maxLongitude ?? null;
  }

  static fromJson(json) {
    return new Line({
      name: json.name,
      urbanZone: json.urbanZone,
      color: json.color,
      shape: json.shape ? Shape.fromJson(json.shape) : (json.shapes?.[0] ? Shape.fromJson(json.shapes[0]) : null),
      minLatitude: json.minLatitude,
      maxLatitude: json.maxLatitude,
      minLongitude: json.minLongitude,
      maxLongitude: json.maxLongitude,
    });
  }

  toJson() {
    return {
      id: this.id,
      name: this.name,
      urbanZone: this.urbanZone,
      color: this.color,
      shape: this.shape ? this.shape.toJson() : null,
      minLatitude: this.minLatitude,
      maxLatitude: this.maxLatitude,
      minLongitude: this.minLongitude,
      maxLongitude: this.maxLongitude,
    };
  }
}