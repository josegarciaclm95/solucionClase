/**
 * Created by Usuario on 16/10/2016.
 */

function Builder(JSONObjetc){
    this.json = JSONObjetc;
    this.buildFloors = buildFloors;
}

function buildFloors(PlatformObject){
    var aux;
    for (p in this.json.platforms){
        aux = PlatformObject.create(this.json.platforms[p].x,this.json.platforms[p].y,this.json.platforms[p].asset);
        aux.body.immovable = true;
   }
}
