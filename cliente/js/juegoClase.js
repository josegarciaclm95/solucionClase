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
var scoreText;
var lastKeyPress = undefined;


function crearNivel(nivel){
    switch(nivel){
        case '0':
            game = new Phaser.Game(800, 600, Phaser.AUTO, 'juegoId', { preload: preload, create: create0, update: update });
            break;
        case '1':

            break;
        default:
            noHayNiveles();
            break;
    }
}
function crearJuego(){
    game = new Phaser.Game(800, 600, Phaser.AUTO, 'juegoId', { preload: preload, create: create0, update: update });
}



function preload() {
    game.load.image('sky', 'assets/sky.png');
    game.load.image('heaven', 'assets/heaven.png');
    game.load.image('ground', 'assets/platform.png');
    game.load.image('ground2', 'assets/platform2.png');
    game.load.image('star', 'assets/star.png');
    game.load.spritesheet('dude', 'assets/sora.png', 60, 56);
}

function create0() {

    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.add.sprite(0, 0, 'sky');
    platforms = game.add.group();
    cielo = game.add.group();
    platforms.enableBody = true;
    cielo.enableBody = true;

    var ground = platforms.create(0, game.world.height - 64, 'ground');
    var heav = cielo.create(0, -25, 'heaven');

    ground.scale.setTo(2, 2);
    heav.scale.setTo(3,1);
    ground.body.immovable = true;
    heav.body.immovable = true;

    var ledge = platforms.create(400, 400, 'ground');
    ledge.body.immovable = true;
    ledge = platforms.create(-150, 250, 'ground');
    ledge.body.immovable = true;
    ledge = platforms.create(300, 150, 'ground2');
    ledge.body.immovable = true;

    player = game.add.sprite(38, game.world.height - 150, 'dude');
    game.physics.arcade.enable(player);

    player.body.bounce.y = 0.2; //Bouncing of the sprite when jumping. 1 = keeps bouncing a lot. 0.2 = jump is more natural
    player.body.gravity.y = 350; //It sets the gravity that will affect the body (the height it can reach)
    player.body.collideWorldBounds = true; //Can the sprite go beyond the game borders? If it can, it CAN'T come back.

    player.animations.add('left', [3, 5],10, true);
    player.animations.add('right', [6, 8],10, true);

    stars = game.add.group();
    stars.enableBody = true;

    for (var i = 0; i <20; i++) {
        var star = stars.create((i * 40) % 600, 0, 'star');
        star.body.gravity.y = 300;
        star.body.bounce.y = 0.8 + Math.random() * 0.2;
    }
    cursors = game.input.keyboard.createCursorKeys();
}

function update() {

    game.physics.arcade.collide(player, platforms);
    game.physics.arcade.collide(stars, platforms);
    game.physics.arcade.collide(stars, cielo);

    game.physics.arcade.overlap(player, stars, collectStar, null, this);
    game.physics.arcade.overlap(player, cielo, nextLevel, null, this);

    player.body.velocity.x = 0;

    if (cursors.left.isDown) {
        player.body.velocity.x = -180;
        player.animations.play('left');
        lastKeyPress = cursors.left;
    }
    else if (cursors.right.isDown) {
        player.body.velocity.x = 180;
        player.animations.play('right');
        lastKeyPress = cursors.right;
    }
    else {
        player.frame = 1;
    }
    if (cursors.up.isDown && player.body.touching.down) {
        player.body.velocity.y = -350;
    }
}

function collectStar(player, star) {
    star.kill();
    score += 10;
    actualizarPuntuacion(score);
    if(score == 120){
        salvarPuntuacion(score);
    }
}
function reduceHealth(player, badguy){
    actualizarVida(-1);
}

function nextLevel(player, heaven){
    console.log("Nivel completado");
    $("#juegoId").remove();
    $("#juegoContainer").append('<span class="infoPersonaje">¡¡¡HAS GANADO!!!</span>');
    //alert("Has ganado!!!");
    game = null;
}

