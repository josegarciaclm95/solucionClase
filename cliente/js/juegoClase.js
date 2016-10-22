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
var ni;
var maxNiveles = 4;
var builderObject;

function crearNivel(nivel){
    ni = parseInt(nivel);
    console.log("El nivel es " + ni);
    if(ni < maxNiveles)
    {
        game = new Phaser.Game(800, 600, Phaser.AUTO, 'juegoId', { preload: preload, create: create, update: update });
        /*
        $.getJSON('/datosJuego/nivel'+ni, function (datos) {
              infoJuego = datos;  
              console.log("Datos llegados a infoJuego -> " + JSON.stringify(infoJuego));

            });
        */
        $.ajax({
        url: '/datosJuego/nivel'+ni,
        dataType: 'json',
        async: false,
        success: function (data) {
            infoJuego = data;  
            console.log("Datos llegados a infoJuego -> " + JSON.stringify(infoJuego));
        }
        });
    }
    else{
        noHayNiveles();
    }
}

function preload() {
    game.load.image('sky', 'assets/sky.png');
    game.load.image('heaven', 'assets/heaven.png');
    game.load.image('ground', 'assets/platform.png');
    game.load.image('ground2', 'assets/platform2.png');
    game.load.image('star', 'assets/star.png');
    game.load.spritesheet('dude', 'assets/sora.png', 60, 56);
    game.load.spritesheet('boom','assets/explosion.png',100,100);
    //game.load.spritesheet('boom','assets/explosion2.png',269,264);
}

function create() {
    //Creamos builder de elementos
    
    builderObject = new Builder(infoJuego);

    //Habilita fisica
    game.physics.startSystem(Phaser.Physics.ARCADE);

    game.add.sprite(0, 0, 'sky');

    //Adding de grupos de plataformas y configutacion de las mismas
    PlatformGroup.platforms = game.add.group();
    PlatformGroup.cielo = game.add.group();
    enableBodyObject(PlatformGroup);
    
    var ground = PlatformGroup.platforms.create(0, game.world.height - 64, 'ground');
    var heav = PlatformGroup.cielo.create(0, -25, 'heaven');
    ground.scale.setTo(2, 2);
    heav.scale.setTo(3,1);
    ground.body.immovable = true;
    heav.body.immovable = true;

    //Creamos las plataformas
    builderObject.buildFloors(PlatformGroup.platforms);

    //Seteamos jugador
    setPlayer();

    stars = game.add.group();
    stars.enableBody = true;

    for (var i = 0; i <12; i++) {
        var star = stars.create(i * 70, 0, 'star');
        star.body.gravity.y = 50;
        //star.body.velocity.x = 200;
    }

    explosions = game.add.group();
    explosions.createMultiple(30, 'boom');
    explosions.forEach(setupExplosions, this);

    cursors = game.input.keyboard.createCursorKeys();
    scoreText = game.add.text(16, 22, 'Vidas: 5', { fontSize: '32px', fill: '#000' });

    tiempoText = game.add.text(game.world.width-170,22,'Tiempo:0',{ fontSize: '32px', fill: '#000' });
    tiempo = 0;
    timer = game.time.events.loop(Phaser.Timer.SECOND,updateTiempo,this);
}

function setupExplosions(expl){
    expl.animations.add("boom");
}

function setPlayer(){
    player = game.add.sprite(38, game.world.height - 150, 'dude');
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

    game.physics.arcade.overlap(stars, PlatformGroup.platforms ,killStar,null,this);
    game.physics.arcade.overlap(player, stars, collectStar, null, this);
    game.physics.arcade.overlap(player, PlatformGroup.cielo, nextLevel, null, this);

    player.body.velocity.x = 0;

    if (cursors.left.isDown) {
        player.body.velocity.x = -220;
        player.animations.play('left');
        //lastKeyPress = cursors.left;
    }
    else if (cursors.right.isDown) {
        player.body.velocity.x = 180;
        player.animations.play('right');
        //lastKeyPress = cursors.right;
    }
    else {
        player.animations.stop();
        player.frame = 1;
    }
    if (cursors.up.isDown && player.body.touching.down) {
        player.body.velocity.y = -400;
    }
}

function killStar(star,platform){
    star.kill();
    var explosion = explosions.getFirstExists(false);
    explosion.reset(star.body.x-30, star.body.y-50);
    explosion.play('boom', 30, false, true);
    crearNuevaEstrella();
}

function crearNuevaEstrella(){
    var x=Math.floor(Math.random()*765+1);
    var strella = stars.create(x, 0, 'star');
    strella.body.gravity.y = 50;
    //strella.body.velocity.x = Math.random * 100 - 50;
}

function collectStar(player, star) {
    star.kill();
    player.vidas -= 1;
    //actualizarVida(-1);
    //score += 10;
    //actualizarPuntuacion(score);
    scoreText.text = 'Vidas: ' + player.vidas;
    if (player.vidas==0){
        player.kill();
        game.time.events.remove(timer);
    }
    /*
    if(score == 120){
        salvarPuntuacion(score);
    }
    */
}
function reduceHealth(player, badguy){
    actualizarVida(-1);
}

function updateTiempo(){
    tiempo++;
    tiempoText.setText('Tiempo: '+tiempo);
}

function nextLevel(player, heaven){
    console.log("Nivel completado");
    //$("#juegoId").remove();
    //$("#juegoContainer").append('<span class="infoPersonaje">¡¡¡HAS GANADO!!!</span>');
    player.kill();
    PlatformGroup = {};
    infoJuego = {};
    game.time.events.remove(timer);
    nivelCompletado(tiempo);
}

function enableBodyObject(obj){
    for(element in obj){
        obj[element].enableBody = true;
    }
}
