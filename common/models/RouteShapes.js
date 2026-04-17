import { Shape } from '@tfg_cercanias_bajo_control/common/models/Shape.js';

export class RouteShapes {
  constructor({ routeId, routeColor, shapes, minLatitude, maxLatitude, minLongitude, maxLongitude }) {
    this.routeId = routeId;
    this.routeColor = routeColor ?? null;
    this.shapes = Array.isArray(shapes) ? shapes : [];
    this.minLatitude = minLatitude ?? null;
    this.maxLatitude = maxLatitude ?? null;
    this.minLongitude = minLongitude ?? null;
    this.maxLongitude = maxLongitude ?? null;
  }

  static fromJson(json) {
    return new RouteShapes({
      routeId: json.routeId,
      routeColor: json.routeColor,
      shapes: (json.shapes || []).map((shapeJson) => Shape.fromJson(shapeJson)),
      minLatitude: json.minLatitude,
      maxLatitude: json.maxLatitude,
      minLongitude: json.minLongitude,
      maxLongitude: json.maxLongitude,
    });
  }

  toJson() {
    return {
      routeId: this.routeId,
      routeColor: this.routeColor,
      shapes: this.shapes.map((shape) => shape.toJson()),
      minLatitude: this.minLatitude,
      maxLatitude: this.maxLatitude,
      minLongitude: this.minLongitude,
      maxLongitude: this.maxLongitude,
    };
  }
}