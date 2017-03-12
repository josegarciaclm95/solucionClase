/**
 * Created by Usuario on 15/10/2016.
 */
// http://phaser.io/docs/2.6.2/index - API

var game;
var juego;
var player;
var cursors;
var apples;
var score = 0;
var vidasText;
var tiempoText;
var scoreText;
var timer;
var PlatformGroup = {};
var infoJuego = {};
var builderObject;
var bolt;
var xVelocity = 250; 
var yVelocity = 400;
var xCamera = xVelocity;
var yCamera = yVelocity;
var bubble;
var shield; 
var num_apples = 0;
var kitchen;

function crearNivel(){
    console.log('Llamada a /datosJuego/'+$.cookie("id"));
    $.ajax({
        url: '/datosJuego/'+$.cookie("id"),
        dataType: 'json',
        async: false,
        success: function (data) {
            console.log("Datos devultos a crearNivel")
            console.log(data);
            if(data.nivel == -1 || data == {}){
                //game.destroy();
                finJuego("Lo siento, no tenemos más niveles",resetControl);
            } else {
                infoJuego = data;  
                game = new Phaser.Game(800, 550, Phaser.AUTO, 'juegoId', { preload: preload, create: create, update: update });
                console.log(infoJuego);
                console.log("Datos llegados a infoJuego -> " + JSON.stringify(infoJuego));
            }
        }
    });
}

function preload() {
    game.load.image('kitchen', 'assets/landscape/kitchen.png');
    game.load.image('ground', 'assets/landscape/platform.png');
    game.load.image('ground2', 'assets/landscape/platform2.png');

    //Fruits
    game.load.image('apple', 'assets/fruits/apple.png');
    game.load.image('apple', 'assets/fruits/banana.png');

    //Power-Ups
    game.load.image('bolt', 'assets/powerups/bolt.png');
    game.load.image('bubble', 'assets/powerups/bubble.png');
    game.load.image('shield', 'assets/powerups/shield.png');

    game.load.spritesheet('dude', 'assets/sora.png', 60, 56);
}

function create() {
    //Creamos builder de elementos
    //$("body").prepend('<audio id="gameMusic" src="assets/audio/sorrow.mp3" autoplay="true" loop="true"></audio>');
    builderObject = new Builder(infoJuego);
    
    //Habilita fisica
    game.physics.startSystem(Phaser.Physics.P2J);

    kitchen = game.add.tileSprite(0, 0, 800, 550, 'kitchen');
    kitchen.scale.setTo(1.33,1.3);
    //Para que el fondo no se mueva
    kitchen.fixedToCamera = true;

    //Adding de grupos de plataformas y configutacion de las mismas
    PlatformGroup.platforms = game.add.group();
    PlatformGroup.cielo = game.add.group();

    enableBodyObject(PlatformGroup);
    //Para que el jugador se pueda mover mas alla de lo que se ve en el canvas en un momento dado
    game.world.setBounds(0, 0, 1600, 550);

    var ground = PlatformGroup.platforms.create(0, game.world.height - 80, 'ground');
    ground.scale.setTo(2, 4);
    ground.body.immovable = true;
    ground.visible = false;

    //Creamos las plataformas
    builderObject.buildFloors(PlatformGroup.platforms);

    //Seteamos jugador
    setPlayer();
    //Para que la camara siga al jugador
    game.camera.follow(player);
    
    apples = game.add.group();
    apples.enableBody = true;

    for (var i = 0; i <infoJuego.starsNumber; i++) {
        var apple = apples.create(i * (game.world.width/infoJuego.starsNumber), 0, 'apple');
        game.physics.enable(apple,Phaser.Physics.P2JS);
        apple.body.gravity.y = game.rnd.integerInRange(50,200);
        apple.anchor.setTo(0.5, 0.6);
        apple.angle = 0.0;
        num_apples++;
        //star.body.velocity.x = game.rnd.integerInRange(-200,200);
    }

    cursors = game.input.keyboard.createCursorKeys();
    tiempoText = game.add.text(game.world.width-170,22,'Tiempo:0',{ fontSize: '32px', fill: '#fff' });
    scoreText = game.add.text(16, 22, 'Vidas: 5', { fontSize: '32px', fill: '#FFF' });


    //tiempoText = game.add.text(game.world.width-170,22,'Tiempo:0',{ fontSize: '32px', fill: '#000' });
    tiempo = 0;
    timer = game.time.events.loop(Phaser.Timer.SECOND,updateTiempo,this);

    bolt = game.add.sprite(100, game.world.height - 230, 'bolt');
    game.physics.enable(bolt,Phaser.Physics.P2J);
    bolt.body.gravity.y = 350;

    bubble = game.add.image(-10, -10, 'bubble');
    bubble.visible = false;
    shield = game.add.sprite(220, 200, 'shield');
    game.physics.enable(shield,Phaser.Physics.P2J);
    shield.body.gravity.y = 350;
    
    
	console.log("Final de create");
}

function setPlayer(){
    player = game.add.sprite(38, game.world.height - 230, 'dude');
    player.apples = 0;
    game.physics.enable(player);
    //game.physics.arcade.enable(player);

    //player.body.bounce.y = 0.2; //Bouncing of the sprite when jumping. 1 = keeps bouncing a lot. 0.2 = jump is more natural
    player.body.gravity.y = 350; //It sets the gravity that will affect the body (the height it can reach)
    player.body.collideWorldBounds = true; //Can the sprite go beyond the game borders? If it can, it CAN'T come back.

    player.animations.add('left', [3, 5],10, true);
    player.animations.add('right', [6, 8],10, true);
}

function update() {
    game.physics.arcade.collide(player, PlatformGroup.platforms);
    game.physics.arcade.collide(bolt, PlatformGroup.platforms);
    game.physics.arcade.collide(shield, PlatformGroup.platforms);

    game.physics.arcade.overlap(apples, PlatformGroup.platforms ,killStar,null,this);
    game.physics.arcade.overlap(player, apples, collectStar, null, this);
    game.physics.arcade.overlap(player, PlatformGroup.cielo, nextLevel, null, this);
    game.physics.arcade.overlap(player, bolt, fastenPlayer, null, this);
    game.physics.arcade.overlap(player, shield, protectPlayer, null, this);

    apples.forEach(function(item){
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
    if (!game.camera.atLimit.x)
    {
        kitchen.tilePosition.x -= (xCamera * game.time.physicsElapsed);
    }

    if (!game.camera.atLimit.y)
    {
        kitchen.tilePosition.y -= (yCamera * game.time.physicsElapsed);
    }
}

function fastenPlayer(player, bolt){
    bolt.kill();
    xVelocity += 100;
    yVelocity += 100;
}

function protectPlayer(player, shield){
    shield.kill();
    bubble.visible = true;
    player.addChild(bubble);
}

function killStar(star,platform){
    star.kill();
    num_apples--;
    game.time.events.pause();
    crearNuevaManzana();
}

function crearNuevaManzana(){
    var apple = apples.create(game.world.randomX, 0, 'apple');
    game.physics.enable(apple,Phaser.Physics.P2J)
    apple.body.gravity.y = game.rnd.integerInRange(50,200);
    apple.anchor.setTo(0.5, 0.6);
    apple.angle = 0.0;
}

function evalEmotions(emotionResults){
    console.log(emotionResults);
    if(emotionResults.browFurrow > 50 && num_apples < 25){
        for(var i = 0; i < 10; i++){
            crearNuevaManzana();
        }
    }
}

function collectStar(player, star) {
    star.kill();
    crearNuevaManzana();
    if(player.children.length == 0){
            //player.vidas -= 1;
    } else if(player.children[0].key != "bubble"){
        //player.vidas -= 1;
    } 
    player.apples++;
    scoreText.text = 'Manzanas: ' + player.apples;
    if (player.apples==5){
        player.kill();
        game.time.events.remove(timer);
        game.destroy();
        onStop();
        num_apples = 0;
        finJuego("¡ENHORABUENA!",mostrarInfoJuego2);
    }
}

function updateTiempo(){
    tiempo++;
    tiempoText.setText('Tiempo: '+tiempo);
}

function nextLevel(player, heaven){
    console.log("Nivel completado");
    player.kill();
    PlatformGroup = {};
    infoJuego = {};
    num_apples = 0;
    game.time.events.remove(timer);
    xVelocity = 250;
    yVelocity = 400;
    onStop();
    nivelCompletado(tiempo, player.vidas);
}

function enableBodyObject(obj){
    for(element in obj){
        obj[element].enableBody = true;
    }
}
