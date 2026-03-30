export class Trip{
    constructor({routeId, serviceId, id, headsign, wheelchairAccessible, blockId, shapeId}){
        this.routeId = routeId;
        this.serviceId = serviceId;
        this.id = id;
        this.headsign = headsign;
        this.wheelchairAccessible = wheelchairAccessible;
        this.blockId = blockId;
        this.shapeId = shapeId;
    }
    static fromJson(json){
        return new Trip({
            routeId: json.routeId ?? json.route_id,
            serviceId: json.serviceId ?? json.service_id,
            id: json.id ?? json.trip_id,
            headsign: json.headsign ?? json.trip_headsign,
            wheelchairAccessible: json.wheelchairAccessible ?? json.wheelchair_accessible,
            blockId: json.blockId ?? json.block_id,
            shapeId: json.shapeId ?? json.shape_id
        });
    }
    toJson(){
        return {
            routeId: this.routeId,
            serviceId: this.serviceId,
            id: this.id,
            headsign: this.headsign,
            wheelchairAccessible: this.wheelchairAccessible,
            blockId: this.blockId,
            shapeId: this.shapeId
        };
    }
}