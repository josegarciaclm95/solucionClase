/**
 * Created by Usuario on 15/10/2016.
 */
// http://phaser.io/docs/2.6.2/index - API
// Third parameter - Phaser.CANVAS, Phaser.WEBGL, or Phaser.AUTO. When AUTO is set, Phaser checks if the device supports WebGL.
// Else, it use Phaser.CANVAS
// Fourth parameter - id of DOM element
var game;
var juego;
var player;
var badguy;
var platforms;
var cielo;
var cursors;
var stars;
var score = 0;
var vidasText;
var tiempoText;
var scoreText;
var timer;
var lastKeyPress = undefined;
var explosions;
var PlatformGroup = {};
var infoJuego = {};
var builderObject;
var bolt;
var xVelocity = 250; 
var yVelocity = 400;
var bubble;
var shield; 

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
    game.load.image('sky', 'assets/sky2.png');
    game.load.image('heaven', 'assets/heaven.png');
    game.load.image('ground', 'assets/platform.png');
    game.load.image('ground2', 'assets/platform2.png');
    game.load.image('star', 'assets/star.png');
    game.load.image('bolt', 'assets/bolt.png');
    game.load.image('bubble', 'assets/bubble.png');
    game.load.image('shield', 'assets/shield.png');

    game.load.spritesheet('dude', 'assets/sora.png', 60, 56);
    game.load.spritesheet('boom','assets/explosion.png',100,100);
    game.load.spritesheet('rain', 'assets/rain.png', 17, 17);
    
    //game.load.spritesheet('boom','assets/explosion2.png',269,264);
}

function create() {
    //Creamos builder de elementos
    $("body").prepend('<audio id="gameMusic" src="assets/sorrow.mp3" autoplay="true" loop="true"></audio>');
    builderObject = new Builder(infoJuego);
   
    var emitter = game.add.emitter(300, 0, 400);
    emitter.width = game.world.width;
	emitter.angle = 30;
    emitter.makeParticles('rain');
	emitter.minParticleScale = 1;
	emitter.maxParticleScale = 2;
	emitter.setYSpeed(300, 500);
	emitter.setXSpeed(-5, 5);
	emitter.minRotation = 0;
	emitter.maxRotation = 0;
	emitter.start(false, 1600, 5, 0);

    //Habilita fisica
    game.physics.startSystem(Phaser.Physics.ARCADE);

    var sky = game.add.sprite(0, 10, 'sky');
    sky.scale.setTo(1.1,1.2);
    //Adding de grupos de plataformas y configutacion de las mismas
    PlatformGroup.platforms = game.add.group();
    PlatformGroup.cielo = game.add.group();

    enableBodyObject(PlatformGroup);
    
    var ground = PlatformGroup.platforms.create(0, game.world.height - 110, 'ground');
    var heav = PlatformGroup.cielo.create(0, -25, 'heaven');
    ground.scale.setTo(2, 2);
    heav.scale.setTo(3,1);
    ground.body.immovable = true;
    ground.visible = false;
    heav.body.immovable = true;

    //Creamos las plataformas
    builderObject.buildFloors(PlatformGroup.platforms);

    //Seteamos jugador
    setPlayer();

    stars = game.add.group();
    stars.enableBody = true;

    for (var i = 0; i <infoJuego.starsNumber; i++) {
        var star = stars.create(i * (game.world.width/infoJuego.starsNumber), 0, 'star');
        game.physics.enable(star,Phaser.Physics.ARCADE);
        star.body.gravity.y = game.rnd.integerInRange(50,200);
        //star.body.velocity.x = game.rnd.integerInRange(-200,200);
    }

    explosions = game.add.group();
    explosions.createMultiple(30, 'boom');
    explosions.forEach(setupExplosions, this);

    cursors = game.input.keyboard.createCursorKeys();
    scoreText = game.add.text(16, 22, 'Vidas: 5', { fontSize: '32px', fill: '#000' });

    tiempoText = game.add.text(game.world.width-170,22,'Tiempo:0',{ fontSize: '32px', fill: '#000' });
    tiempo = 0;
    timer = game.time.events.loop(Phaser.Timer.SECOND,updateTiempo,this);

    bolt = game.add.sprite(100, game.world.height - 230, 'bolt');
    game.physics.enable(bolt,Phaser.Physics.ARCADE);
    bolt.body.gravity.y = 350;

    bubble = game.add.image(-10, -10, 'bubble');
    bubble.visible = false;
    shield = game.add.sprite(220, 200, 'shield');
    game.physics.enable(shield,Phaser.Physics.ARCADE);
    shield.body.gravity.y = 350;
}

function setupExplosions(expl){
    expl.animations.add("boom");
}

function setPlayer(){
    player = game.add.sprite(38, game.world.height - 230, 'dude');
    player.vidas = 5;
    game.physics.arcade.enable(player);

    player.body.bounce.y = 0.2; //Bouncing of the sprite when jumping. 1 = keeps bouncing a lot. 0.2 = jump is more natural
    player.body.gravity.y = 350; //It sets the gravity that will affect the body (the height it can reach)
    player.body.collideWorldBounds = true; //Can the sprite go beyond the game borders? If it can, it CAN'T come back.

    player.animations.add('left', [3, 5],10, true);
    player.animations.add('right', [6, 8],10, true);
}

function update() {

    game.physics.arcade.collide(player, PlatformGroup.platforms);
    game.physics.arcade.collide(bolt, PlatformGroup.platforms);
    game.physics.arcade.collide(shield, PlatformGroup.platforms);

    game.physics.arcade.overlap(stars, PlatformGroup.platforms ,killStar,null,this);
    game.physics.arcade.overlap(player, stars, collectStar, null, this);
    game.physics.arcade.overlap(player, PlatformGroup.cielo, nextLevel, null, this);
    game.physics.arcade.overlap(player, bolt, fastenPlayer, null, this);
    game.physics.arcade.overlap(player, shield, protectPlayer, null, this);

    player.body.velocity.x = 0;

    if (cursors.left.isDown) {
        player.body.velocity.x = -xVelocity;
        player.animations.play('left');
    }
    else if (cursors.right.isDown) {
        player.body.velocity.x = xVelocity;
        player.animations.play('right');
    }
    else {
        player.animations.stop();
        player.frame = 1;
    }
    if (cursors.up.isDown && player.body.touching.down) {
        player.body.velocity.y = -yVelocity;
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
    var explosion = explosions.getFirstExists(false);
    explosion.reset(star.body.x-30, star.body.y-50);
    explosion.play('boom', 30, false, true);
    crearNuevaEstrella();
}

function crearNuevaEstrella(){
    var j=Math.floor(Math.random()*765+1);
    var strella = stars.create(j, 0, 'star');
    game.physics.enable(strella,Phaser.Physics.ARCADE)
    strella.body.gravity.y = game.rnd.integerInRange(50,200);
    //strella.body.velocity.x = game.rnd.integerInRange(-200,200);
}

function collectStar(player, star) {
    console.log(player);
    console.log(player.children)
    star.kill();
    var explosion = explosions.getFirstExists(false);
    explosion.reset(star.body.x-30, star.body.y-50);
    explosion.play('boom', 30, false, true);
    crearNuevaEstrella();
    if(player.children.length == 0){
            player.vidas -= 1;
    } else if(player.children[0].key != "bubble"){
        player.vidas -= 1;
    } 
    scoreText.text = 'Vidas: ' + player.vidas;
    if (player.vidas==0){
        player.kill();
        game.time.events.remove(timer);
        game.destroy();
        finJuego("Lo siento,  has perdido",mostrarInfoJuego2);
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
    game.time.events.remove(timer);
    xVelocity = 250;
    yVelocity = 400;
    nivelCompletado(tiempo, player.vidas);
}

function enableBodyObject(obj){
    for(element in obj){
        obj[element].enableBody = true;
    }
}
