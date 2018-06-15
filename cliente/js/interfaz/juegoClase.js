/**
 * Created by Usuario on 15/10/2016.
 */
// http://phaser.io/docs/2.6.2/index - API

var game;
var juego;
var player;
var cursors;
var left_cursors = [];
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
var context = this;
var kitchen;
var mistake;
var jump;
var collect;
var start_button;
var touching_b = false;

window.mobilecheck = function () {
    var check = false;
    (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
};

function crearNivel() {
    evaluator.newTry();
    setScoreCounters(infoJuego.recipe);
    game = new Phaser.Game(800, 450, Phaser.AUTO, 'juegoId', { preload: preload, create: create, update: update });
    proxy.startKeylogger();
    proxy.startAffectivaDetection();
}

function preload() {
    //console.log(infoJuego);
    tiempo = 0;
    game.load.image('kitchen', 'assets/landscape/kitchen.png');
    game.load.image('ground', 'assets/landscape/platform.png');
    game.load.image('ground2', 'assets/landscape/platform2.png');
    game.load.image('button', 'assets/redSheet.png');

    //Food (valid and not valid)
    var ingredients = infoJuego.recipe.ingredients;
    for (var i = 0; i < ingredients.length; i++) {
        game.load.image(ingredients[i].name, 'assets/food/' + ingredients[i].name + '.png');
    }
    garbage = infoJuego.not_valid_food;
    for (var i = 0; i < garbage.length; i++) {
        game.load.image(garbage[i], 'assets/food/' + garbage[i] + '.png');
    }
    game.load.image('mistake', 'assets/landscape/mistake.png');

    //Player
    game.load.spritesheet('dude', 'assets/sora.png', 60, 56);

    //Sounds
    game.load.audio('mistake', 'assets/audio/wrong.mp3');
    game.load.audio('jump', 'assets/audio/jump.wav');
    game.load.audio('collect', 'assets/audio/collect.wav');
}

function create() {
    //Creamos builder de elementos
    builderObject = new Builder(infoJuego);
    //Creamos una lista de objetos Score que almacenarán la cantidad de elementos que tenemos
    //y controlará cuando hemos alcanzado el máxmo
    builderObject.createScores(Scores);

    //Añadimos el audio asociado a los fallos
    mistake = game.add.audio("mistake");
    jump = game.add.audio("jump");
    collect = game.add.audio("collect");
    //Habilita fisica
    game.physics.startSystem(Phaser.Physics.P2J);
    //Añadimos el fondo del juego
    kitchen = game.add.tileSprite(0, 0, 800, 450, 'kitchen');
    kitchen.scale.setTo(1, 1.02);
    //Para que el fondo no se mueva
    kitchen.fixedToCamera = true;

    //Añadimos grupos de plataformas y los configuramos
    PlatformGroup.platforms = game.add.group();
    PlatformGroup.cielo = game.add.group();
    enableBodyObject(PlatformGroup);

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
    for (var i = 0; i < (ingredients.length + garbage.length) * 3; i++) {
        createFoodElement();
    }

    //Establecemos los controles del juego
    cursors = game.input.keyboard.createCursorKeys();
    left_cursors.push(game.input.keyboard.addKey(Phaser.Keyboard.A));
    left_cursors.push(game.input.keyboard.addKey(Phaser.Keyboard.W));
    left_cursors.push(game.input.keyboard.addKey(Phaser.Keyboard.D));
    timer = game.time.events.loop(Phaser.Timer.SECOND, updateTiempo, this);


    //Añadimos valores de scores
    tiempoText = game.add.text(20, 22, 'Tiempo:0', { fontSize: '32px', fill: '#FFF' });
    mistakes = game.add.group();
    for (var i = 0; i < 5; i++) {
        var item = mistakes.create(game.world.width - i * 60 - 60, 25, 'mistake');
    }

    game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
    
    if(mobilecheck()){
        game.paused = true;
        start_button = game.add.button(game.world.centerX, game.world.centerY, 'button', gofull, this);
        start_button.inputEnabled = true;
        game.input.onDown.add(gofull, context);
        game.input.onUp.add(stopMovement, context);
        game.input.onTap.add(doubleTap, context);
    }
    //game.input.onDown.add(gofull, context);
    //game.input.onUp.add(stopMovement, context);
    console.log("Final de create");
}   

function touchMovement(pointer, event){
    touching_b = true;
    if(pointer.x < game.world.centerX){
        moveLeft();
    } else {
        moveRight();
    }
}

function doubleTap(pointer, double_t) {
    if(double_t){
        moveUp();
    }
}

function stopMovement(pointer, event){
    touching_b = false;
    player.animations.stop();
    player.body.velocity.x = 0;
    player.frame = 1;
    xCamera = 0;
}

function gofull(){
    if (game.scale.isFullScreen)
    {
        game.scale.stopFullScreen();
    }
    else
    {
        game.scale.startFullScreen(false);
    }
    game.paused = false;
    start_button.destroy();
    game.input.onDown.remove(gofull, context);
    game.input.onDown.add(touchMovement);
}

function setPlayer() {
    player = game.add.sprite(38, game.world.height - 230, 'dude');
    game.physics.enable(player);

    player.body.gravity.y = 350; //It sets the gravity that will affect the body (the height it can reach)
    player.body.collideWorldBounds = true; //Can the sprite go beyond the game borders? If it can, it CAN'T come back.

    player.animations.add('left', [3, 5], 15, true);
    player.animations.add('right', [6, 8], 15, true);
}

function update() {
    //Elementos que van a chocar entre sí
    game.physics.arcade.collide(player, PlatformGroup.platforms);
    //Que tiene que pasar cuando dos objetos se solapen
    game.physics.arcade.overlap(foodObjects, PlatformGroup.platforms, removeFood, null, this);
    game.physics.arcade.overlap(player, foodObjects, collectFoodElement, null, this);
    foodObjects.forEach(function (item) {
        item.angle++;
    });

    xCamera, yCamera = 0;
    //Si se esta pulsando la flecha izquierda
    if (cursors.left.isDown || left_cursors[0].isDown) {
        moveLeft();
    } //Si se esta pulsando la flecha derecha
    else if (cursors.right.isDown || left_cursors[2].isDown) {
        moveRight();
        //Si no se esta pulsando ninguna y tampoco se esta usando tactil
    } else if(!touching_b) {
        /*player.body.velocity.x = 0;
        player.animations.stop();
        player.frame = 1;
        xCamera = 0;
        */
       stopMovement();
    }
    if ((cursors.up.isDown || left_cursors[1].isDown) && player.body.touching.down) {
        moveUp();

    }
    if (!game.camera.atLimit.x) {
        kitchen.tilePosition.x -= (xCamera * game.time.physicsElapsed);
    }
    if (!game.camera.atLimit.y) {
        kitchen.tilePosition.y -= (yCamera * game.time.physicsElapsed);
    }
    
}

function moveLeft(){
    player.body.velocity.x = -xVelocity;
    if (!player.body.touching.left)
        xCamera = -xVelocity;
    else
        xCamera = 0;
    player.animations.play('left');
}

function moveRight(){
    player.body.velocity.x = xVelocity;
    if (!player.body.touching.right) {
        xCamera = xVelocity;
    }
    else {
        xCamera = 0;
    }
    player.animations.play('right');
}

function moveUp(){
    player.body.velocity.y = -yVelocity;
    yCamera = -yVelocity;
    jump.play();
}

function removeFood(food, platform) {
    food.kill();
    createFoodElement();
}

function createFoodElement() {
    var index, element;
    if (Math.random() <= infoJuego.probabilidad_ing_valido) {
        index = Math.floor((Math.random() * infoJuego.recipe.ingredients.length));
        element = foodObjects.create(game.rnd.integerInRange(0, 800), 10, infoJuego.recipe.ingredients[index].name);
    } else {
        index = Math.floor((Math.random() * garbage.length));
        element = foodObjects.create(game.rnd.integerInRange(0, 800), 10, garbage[index]);
    }
    game.physics.enable(element, Phaser.Physics.P2J)
    element.body.gravity.y = game.rnd.integerInRange(infoJuego.gravedad_nivel, infoJuego.gravedad_nivel + 75);
    element.anchor.setTo(0.5, 0.6);
    element.angle = 0.0;
}

function collectFoodElement(player, food) {
    if (isAValidIngredient(food.key)) {
        collect.play();
        Scores[food.key].increaseAmount();
        $("#" + food.key + "Score").text(Scores[food.key].amount);
        if (updateDoneCount() == _length(Scores)) {
            nextLevel();
        }
    } else {
        mistake.play();
        proxy.keyloggerMistakes();
        evaluator.keylogger.mistakes++;
        mistakes.removeChild(mistakes.getTop())
        if (mistakes.children.length == 0) {
            tiempo = 0;
            player.kill();
            game.destroy();
            proxy.stopAffectivaDetection();
            finJuego("Has cogido demasiados alimentos no válidos", proxy.disminuirDificultad);
            //showGameControls
        }
    }
    removeFood(food);
}

function evalEmotions(emotionResults) {
    if (emotionResults.browFurrow > 50) {
        for (var i = 0; i < 5; i++) {
            createFoodElement();
        }
    }
}

function updateTiempo() {
    tiempo++;
    tiempoText.setText('Tiempo: ' + tiempo);
}

function nextLevel() {
    console.log("Nivel completado");
    player.kill();
    PlatformGroup = {};
    Scores = {}
    game.time.events.remove(timer);
    xVelocity = 300;
    yVelocity = 400;
    proxy.stopAffectivaDetection();
    proxy.stopKeylogger();
    game.destroy();
    $("#juegoContainer").load('../html/intermedio.html', function () {
        console.log("INFO JUEGO");
        console.log(infoJuego);
        var html = "<ul class='no-list'>";
        for (var i = 0; i < infoJuego.recipe.ingredients.length; i++) {
            html += "<li>";
            html += "<img width='50' src='assets/food/";
            html += infoJuego.recipe.ingredients[i].name + ".png'>"
            var name = infoJuego.recipe.ingredients[i].name.replace("_", " ");
            html += '<h2> ' + name.charAt(0).toUpperCase() + name.slice(1);
            html += " X " + infoJuego.recipe.ingredients[i].goal + "</h2></li>";
        }
        html += "</ul>";
        $("#final-scores").append(html);
        $("#juegoContainer").append('<audio id="victory" src="assets/audio/tada.wav" type="audio/wav"></audio>');
        $("#victory")[0].play();
        $("#button-ready").on("click", function () {
            setDictation(infoJuego.recipe.sentences, tiempo, mistakes.children.length);
        });
    });
}

function enableBodyObject(obj) {
    for (element in obj) {
        obj[element].enableBody = true;
    }
}

function isAValidIngredient(food_name) {
    var answer = false;
    var ingredients = infoJuego.recipe.ingredients;
    for (var i = 0; i < ingredients.length; i++) {
        answer = answer || (ingredients[i].name == food_name);
        if (answer)
            return true;
    }
    return answer;
}

function updateDoneCount() {
    var count = 0;
    for (i in Scores) {
        if (Scores[i].done)
            count++;
    }
    return count;
}

function _length(obj) {
    return Object.keys(obj).length;
}

