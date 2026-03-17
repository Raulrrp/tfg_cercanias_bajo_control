export class Train{
    constructor({id, label}){
        this.id = id;
        this.label = label;
    }
    static fromJson(json){
        return new Train({
            id: json.id,
            label: json.label
        });
    }
    toJson(){
        return{
            id: this.id,
            label: this.label
        }
    }
}