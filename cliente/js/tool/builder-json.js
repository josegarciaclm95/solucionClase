/**
 * Created by Usuario on 16/10/2016.
 */

function Builder(JSONObjetc){
    this.json = JSONObjetc;
    this.buildFloors = buildFloors;
    this.createScores = createScores;
}

function buildFloors(PlatformObject){
    var aux;
    for (p in this.json.platforms){
        aux = PlatformObject.create(this.json.platforms[p].x,this.json.platforms[p].y,this.json.platforms[p].asset);
        aux.body.immovable = true;
   }
}

function createScores(ScoreObject){
    var ingredients = this.json.recipe.ingredients;
    for (i in ingredients){
        ScoreObject[ingredients[i].name] = new Score(ingredients[i].goal);
    }
    console.log(ScoreObject);
}

function Score(goal){
    this.amount = 0;
    this.goal = goal;
    this.done = false;
    this.increaseAmount = function(){
        if(!this.done){
            this.amount++;
            if(this.amount == this.goal){
                this.done = true;
            }
        }
    }
}
