import { Shape } from '@tfg_cercanias_bajo_control/common/models/Shape.js';

export class RouteShapes {
  constructor({ routeId, routeColor, shapes, centerLatitude, centerLongitude }) {
    this.routeId = routeId;
    this.routeColor = routeColor ?? null;
    this.shapes = Array.isArray(shapes) ? shapes : [];
    this.centerLatitude = centerLatitude ?? null;
    this.centerLongitude = centerLongitude ?? null;
  }

  static fromJson(json) {
    return new RouteShapes({
      routeId: json.routeId,
      routeColor: json.routeColor,
      shapes: (json.shapes || []).map((shapeJson) => Shape.fromJson(shapeJson)),
      centerLatitude: json.centerLatitude,
      centerLongitude: json.centerLongitude,
    });
  }

  toJson() {
    return {
      routeId: this.routeId,
      routeColor: this.routeColor,
      shapes: this.shapes.map((shape) => shape.toJson()),
      centerLatitude: this.centerLatitude,
      centerLongitude: this.centerLongitude,
    };
  }
}