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

var kitchen;
var mistake;
var jump;
var collect;

function crearNivel() {
    setScoreCounters(infoJuego.recipe);
    game = new Phaser.Game(800, 450, Phaser.AUTO, 'juegoId', { preload: preload, create: create, update: update });
    proxy.startKeylogger();
    proxy.startAffectivaDetection();
}

function preload() {
    //console.log(infoJuego);
    game.load.image('kitchen', 'assets/landscape/kitchen.png');
    game.load.image('ground', 'assets/landscape/platform.png');
    game.load.image('ground2', 'assets/landscape/platform2.png');

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
    console.log("Final de create");
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

    player.body.velocity.x = 0;
    xCamera, yCamera = 0;

    if (cursors.left.isDown || left_cursors[0].isDown) {
        player.body.velocity.x = -xVelocity;
        if (!player.body.touching.left)
            xCamera = -xVelocity;
        else
            xCamera = 0;
        player.animations.play('left');
    }
    else if (cursors.right.isDown || left_cursors[2].isDown) {
        player.body.velocity.x = xVelocity;
        if (!player.body.touching.right) {
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
    if ((cursors.up.isDown || left_cursors[1].isDown) && player.body.touching.down) {
        player.body.velocity.y = -yVelocity;
        yCamera = -yVelocity;
        jump.play();

    }
    if (!game.camera.atLimit.x) {
        kitchen.tilePosition.x -= (xCamera * game.time.physicsElapsed);
    }
    if (!game.camera.atLimit.y) {
        kitchen.tilePosition.y -= (yCamera * game.time.physicsElapsed);
    }
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
    tiempo = 0;
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
            html += '<h2> ' + infoJuego.recipe.ingredients[i].name.charAt(0).toUpperCase() + infoJuego.recipe.ingredients[i].name.slice(1);
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