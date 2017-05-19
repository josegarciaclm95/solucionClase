/**
 * Created by Usuario on 15/10/2016.
 */
// http://phaser.io/docs/2.6.2/index - API

var game;
var juego;
var player;
var cursors;
var infoJuego = {};
var PlatformGroup = {};
var Scores = {};
var mistakes;
var timer;
var tiempo = 0;
var foodObjects = {};
var builderObject;
var garbage;
var xVelocity = 300; 
var yVelocity = 400;
var xCamera = xVelocity;
var yCamera = yVelocity;

var kitchen;
var mistake;

var forbidden_actions = 0;
var forb_act_timer = 0;

function crearNivel(){
   /*
    console.log('Llamada a /datosJuego/'+$.cookie("id"));
    $.ajax({
        url: '/datosJuego/'+$.cookie("id"),
        dataType: 'json',
        async: false,
        success: function (data) {
            console.log("Datos devultos a crearNivel")
            console.log(data);
            if(data.nivel == -1 || data == {}){
                finJuego("Lo siento, no tenemos más niveles",resetControl);
            } else {
                infoJuego = data;
                //keyControl = new KeyLogger(infoJuego.nivel);
                setScoreCounters(infoJuego.recipe);
                game = new Phaser.Game(800, 450, Phaser.AUTO, 'juegoId', { preload: preload, create: create, update: update });
                console.log("Datos recibidos correctos: " + (infoJuego.nivel != -1));
            }
        }
    });
    */
    setScoreCounters(infoJuego.recipe);
    game = new Phaser.Game(800, 450, Phaser.AUTO, 'juegoId', { preload: preload, create: create, update: update });
}

function preload() {
    //console.log(infoJuego);
    game.load.image('kitchen', 'assets/landscape/kitchen.png');
    game.load.image('ground', 'assets/landscape/platform.png');
    game.load.image('ground2', 'assets/landscape/platform2.png');

    //Food (valid and not valid)
    var ingredients = infoJuego.recipe.ingredients;
    for(var i = 0; i < ingredients.length; i++){
        game.load.image(ingredients[i].name, 'assets/food/' + ingredients[i].name + '.png');
    }
    garbage = infoJuego.not_valid_food;
    for(var i = 0; i < garbage.length; i++){
        game.load.image(garbage[i], 'assets/food/' + garbage[i] + '.png');
    }
    game.load.image('mistake', 'assets/landscape/mistake.png');

    //Player
    game.load.spritesheet('dude', 'assets/sora.png', 60, 56);

    //Sounds
    game.load.audio('mistake', 'assets/audio/wrong.mp3');
}

function create() {
    //Creamos builder de elementos
    //$("body").prepend('<audio id="gameMusic" src="assets/audio/sorrow.mp3" autoplay="true" loop="true"></audio>');
    builderObject = new Builder(infoJuego);
    //Creamos una lista de objetos Score que almacenarán la cantidad de elementos que tenemos
    //y controlará cuando hemos alcanzado el máxmo
    builderObject.createScores(Scores);
    //console.log(Scores);

    //Añadimos el audio asociado a los fallos
    mistake = game.add.audio("mistake");

    //Habilita fisica
    game.physics.startSystem(Phaser.Physics.P2J);

    //Añadimos el fondo del juego
    kitchen = game.add.tileSprite(0, 0, 800, 450, 'kitchen');
    kitchen.scale.setTo(1,1.02);
    //Para que el fondo no se mueva
    kitchen.fixedToCamera = true;

    //Añadimos grupos de plataformas y los configuramos
    PlatformGroup.platforms = game.add.group();
    PlatformGroup.cielo = game.add.group();
    enableBodyObject(PlatformGroup);
    //Para que el jugador se pueda mover mas alla de lo que se ve en el canvas en un momento dado
    //game.world.setBounds(0, 0, 1600, 450);

    //Habilitamos el suelo (plataforma invisible)
    var ground = PlatformGroup.platforms.create(0, game.world.height - 80, 'ground');
    ground.scale.setTo(2, 4);
    ground.body.immovable = true;
    ground.visible = false;

    //Creamos las plataformas en el propio juego
    builderObject.buildFloors(PlatformGroup.platforms);

    //Seteamos jugador
    setPlayer();
    //Para que la camara siga al jugador
    game.camera.follow(player);

    //Poblamos el "techo" del juego de los elementos que van a caer
    foodObjects = game.add.group();
    var ingredients = infoJuego.recipe.ingredients;
    for(var i = 0; i < (ingredients.length + garbage.length) * 3; i++){
        createFoodElement();
    }

    //Establecemos los controles del juego
    cursors = game.input.keyboard.createCursorKeys();
    timer = game.time.events.loop(Phaser.Timer.SECOND,updateTiempo,this);
    /* 
    game.input.keyboard.onDownCallback = function (e){
        console.log(e);
    }
    */

    //Añadimos valores de scores
    tiempoText = game.add.text(20,22,'Tiempo:0',{ fontSize: '32px', fill: '#FFF' });
    mistakes = game.add.group();
    for(var i = 0; i < 5; i++){
        var item = mistakes.create(game.world.width - i*60 - 60, 25, 'mistake');
    }

    var forb_act_timer = game.time.now;
	console.log("Final de create");
}

function setPlayer(){
    player = game.add.sprite(38, game.world.height - 230, 'dude');
    game.physics.enable(player);

    player.body.gravity.y = 350; //It sets the gravity that will affect the body (the height it can reach)
    player.body.collideWorldBounds = true; //Can the sprite go beyond the game borders? If it can, it CAN'T come back.

    player.animations.add('left', [3, 5],15, true);
    player.animations.add('right', [6, 8],15, true);
}

function update() {
    //Elementos que van a chocar entre sí
    game.physics.arcade.collide(player, PlatformGroup.platforms);
    //Que tiene que pasar cuando dos objetos se solapen
    game.physics.arcade.overlap(foodObjects, PlatformGroup.platforms, removeFood,null,this);
    game.physics.arcade.overlap(player, foodObjects, collectFoodElement, null, this);
    foodObjects.forEach(function(item){
        item.angle++;
    });

    player.body.velocity.x = 0;
    xCamera, yCamera = 0;

    if (cursors.left.isDown) {
        player.body.velocity.x = -xVelocity;
        if(!player.body.touching.left) 
            xCamera = -xVelocity;
        else 
            xCamera = 0;
        player.animations.play('left');
    } 
    else if (cursors.right.isDown) {
        player.body.velocity.x = xVelocity;
        if(!player.body.touching.right){
            xCamera = xVelocity;
        }
         else {
            xCamera = 0;
         }
        player.animations.play('right');
    } else {
        player.animations.stop();
        player.frame = 1;
        xCamera = 0;
    }
    if (cursors.up.isDown && player.body.touching.down) {
        player.body.velocity.y = -yVelocity;
        yCamera = -yVelocity;
    }
    
    if(cursors.up.isDown && !player.body.touching.down &&
            !player.body.touching.up && !player.body.touching.left &&
            !player.body.touching.right) {
                forbidden_actions++;
                //console.log("+1");
                //console.log((game.time.now - forb_act_timer)/1000)
    }
    
    if (!game.camera.atLimit.x)
    {
        kitchen.tilePosition.x -= (xCamera * game.time.physicsElapsed);
    }

    if (!game.camera.atLimit.y)
    {
        kitchen.tilePosition.y -= (yCamera * game.time.physicsElapsed);
    }
    var aux = game.time.now - forb_act_timer;
    if(aux/1000 >= 3){
        if (forbidden_actions/(aux/1000) >= 3){
            console.log ("Forbiden actions - " + forbidden_actions);
            console.log ("Forbiden counter - " + aux/1000);
        };
        forbidden_actions = 0;
        forb_act_timer = game.time.now;
    } 
}

function removeFood(food,platform){
    food.kill();
    createFoodElement();
}

function createFoodElement(){
    var index, element;
    if(Math.random() <= 0.6){
        index = Math.floor((Math.random() * infoJuego.recipe.ingredients.length));
        element = foodObjects.create(game.rnd.integerInRange(0, 800), 10, infoJuego.recipe.ingredients[index].name);
    } else {
        index = Math.floor((Math.random() * garbage.length));
        element = foodObjects.create(game.rnd.integerInRange(0, 800), 10, garbage[index]);
    }
    game.physics.enable(element, Phaser.Physics.P2J)
    element.body.gravity.y = game.rnd.integerInRange(50,200);
    element.anchor.setTo(0.5, 0.6);
    element.angle = 0.0;
}

function collectFoodElement(player, food){
    if(isAValidIngredient(food.key)){
        Scores[food.key].increaseAmount();
        $("#" + food.key + "Score").text(Scores[food.key].amount);
        if(updateDoneCount() == _length(Scores)){
            nextLevel();
        }
    } else {
        mistake.play();
        mistakes.removeChild(mistakes.getTop())
        proxy.affdexDetector.setDetectionFlag();
        if(mistakes.children.length == 0){
             player.kill();
             game.destroy();
            finJuego("Has cogido demasiada basura :S", showGameControls);
        }
    }
    removeFood(food);
}

function evalEmotions(emotionResults){
    console.log(emotionResults);
    if(emotionResults.browFurrow > 50){
        for(var i = 0; i < 10; i++){
            createFoodElement();
        }
    }
}

function updateTiempo(){
    tiempo++;
    tiempoText.setText('Tiempo: '+tiempo);
}

function nextLevel(){
    console.log("Nivel completado");
    player.kill();
    PlatformGroup = {};
    infoJuego = {};
    Scores = {}
    game.time.events.remove(timer);
    xVelocity = 300;
    yVelocity = 400;
    proxy.stopAffectivaDetection();
    //onStop();
    nivelCompletado(tiempo, player.vidas);
}

function enableBodyObject(obj){
    for(element in obj){
        obj[element].enableBody = true;
    }
}

function isAValidIngredient(food_name){
    var answer = false;
    var ingredients = infoJuego.recipe.ingredients;
    for(var i = 0; i < ingredients.length; i++){
        answer = answer || (ingredients[i].name == food_name);
        if(answer)
            return true;
    }
    return answer;
}

function updateDoneCount(){
    var count = 0;
    for(i in Scores){
        if(Scores[i].done)
            count++;
    }
    return count;
}

function _length(obj){
    return Object.keys(obj).length;
}