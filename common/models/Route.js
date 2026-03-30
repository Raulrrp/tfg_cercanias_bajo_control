export class Route{
    constructor({id, shortName, longName, type, color, textColor}){
        this.id = id;
        this.shortName = shortName;
        this.longName = longName;
        this.type = type;
        this.color = color;
        this.textColor = textColor;
    }
    static fromJson(json){
        return new Route({
            id: json.id ?? json.route_id,
            shortName: json.shortName ?? json.route_short_name,
            longName: json.longName ?? json.route_long_name,
            type: json.type ?? json.route_type,
            color: json.color ?? json.route_color,
            textColor: json.textColor ?? json.route_text_color
        });
    }
    toJson(){
        return {
            id: this.id,
            shortName: this.shortName,
            longName: this.longName,
            type: this.type,
            color: this.color,
            textColor: this.textColor
        };
    }
}