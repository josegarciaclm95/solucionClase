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


function crearNivel(nivel){
    switch(nivel){
        case '1':
             game = new Phaser.Game(800, 600, Phaser.AUTO, 'juegoId', { preload: preload, create: create0, update: update });
        break;
        case '2':

        break;
        default:
            noHayNiveles();
        break;
    }
}
function crearJuego(){
    game = new Phaser.Game(800, 600, Phaser.AUTO, 'juegoId', { preload: preload, create: create0, update: update });
    //salvarPuntuacion(0);
}


//Game has a Loader object which allows us to insert resources in our game.
//load methods (load.image, load.audio...) inserts this key-value in queue of elements that will be loaded on create
function preload() {
    game.load.image('sky', 'assets/sky.png');
    game.load.image('heaven', 'assets/heaven.png');
    game.load.image('ground', 'assets/platform.png');
    game.load.image('ground2', 'assets/platform2.png');
    game.load.image('star', 'assets/star.png');
    game.load.spritesheet('dude', 'assets/sora.png', 60, 56);
    //game.load.spritesheet('badguy','assets/baddie.png',33,33)
    //game.load.spritesheet('dude', 'assets/kirby.png', 56, 51);

    //this last funcion takes also the size we want the sprite to be.

}

function create0() {

    //  We're going to be using physics, so enable the Arcade Physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);

    //  A simple background for our game. add.sprite receives the (x,y) point to place the sprite and its id (id set on preload)
    game.add.sprite(0, 0, 'sky');

    //  The platforms group contains the ground and the 2 ledges we can jump on
    // A group is a container. Putting stuff in groups allows us to apply some changes to every child in the group
    // with a single command. The call return us the group to work with it.
    platforms = game.add.group();
    cielo = game.add.group();
    //  We will enable physics for any object that is created in this group. If we set it after inserting the sprites, it
    // won't have effect. SET BEFORE ADDING ANYTHING.
    platforms.enableBody = true;
    cielo.enableBody = true;
    // Here we create the ground.
    // Create works like the add method used before
    // World property from game is a space that conteins the whole game (sprites, images) and properties
    var ground = platforms.create(0, game.world.height - 64, 'ground');
    var heav = cielo.create(0, -25, 'heaven');
    //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
    // scale is a ScaleManager to set the size.
    // setTo does xSize * FirstParameter, ySize * Second
    ground.scale.setTo(2, 2);
    heav.scale.setTo(3,1);
    //  This stops it from falling away when you jump on it
    ground.body.immovable = true;
    heav.body.immovable = true;
    //  Now let's create two ledges
    var ledge = platforms.create(400, 400, 'ground');
    ledge.body.immovable = true;

    ledge = platforms.create(-150, 250, 'ground');
    ledge.body.immovable = true;

    ledge = platforms.create(300, 150, 'ground2');
    ledge.body.immovable = true;
    // The player and its settings
    //If we set the player under the ground, it won't be able to jump
    //112 = 64 (point where the ground starts) + 62 (height of the player)
    player = game.add.sprite(38, game.world.height - 150, 'dude');
    //badguy = game.add.sprite(50, game.world.height - 150, 'badguy');

    //  We need to enable physics on the player
    game.physics.arcade.enable(player);
   // game.physics.arcade.enable(badguy);
    //  Player physics properties. Give the little guy a slight bounce.
    // We do this after enable some Physics 
    player.body.bounce.y = 0.2; //Bouncing of the sprite when jumping. 1 = keeps bouncing a lot. 0.2 = jump is more natural
    player.body.gravity.y = 350; //It sets the gravity that will affect the body (the height it can reach)
    player.body.collideWorldBounds = true; //Can the sprite go beyond the game borders? If it can, it CAN'T come back.
    /*
    badguy.body.bounce.y = 0.2; //Bouncing of the sprite when jumping. 1 = keeps bouncing a lot. 0.2 = jump is more natural
    badguy.body.gravity.y = 350; //It sets the gravity that will affect the body (the height it can reach)
    badguy.body.collideWorldBounds = true; //Can the sprite go beyond the game borders? If it can, it CAN'T come back.
    */
    //  Our two animations, walking left and right.
    player.animations.add('left', [3, 5],10, true);
    player.animations.add('right', [6, 8],10, true);

    //badguy.animations.add('left', [0, 1],10, true);
    //badguy.animations.add('right', [2, 3],10, true);

    //player.animations.add('left', [4,5,6,7,8,9,10,11,12,13], 10, true);
    // Name of the animation - frames it use - time to play - use in loop (yes/no)
    //player.animations.add('right', [14,15,16,17,18,19,20,21,22,23], 10, true);

    //player.animations.add("jumpUp",[24,25,26,27,28,29,30,31,32,33],10,true);
    //player.animations.add("fall",[34,35,36,37,38,39,40,41,42,43],10,true);
    //player.animations.add("stayStill",[0,1,2,3],10,true);

    //  Finally some stars to collect
    stars = game.add.group();

    //  We will enable physics for any star that is created in this group
    stars.enableBody = true;

    //  Here we'll create 12 of them evenly spaced apart
    for (var i = 0; i <20; i++) {
        //  Create a star inside of the 'stars' group
        var star = stars.create((i * 40) % 600, 0, 'star');

        //  Let gravity do its thing
        star.body.gravity.y = 300;

        //  This just gives each star a slightly random bounce value
        star.body.bounce.y = 0.8 + Math.random() * 0.2;
    }

    //  The score
    //scoreText = game.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

    //  Our controls.
    cursors = game.input.keyboard.createCursorKeys();

}

function update() {

    //  Collide the player and the stars with the platforms
    game.physics.arcade.collide(player, platforms);
    game.physics.arcade.collide(stars, platforms);
    game.physics.arcade.collide(stars, cielo);
    //game.physics.arcade.collide(player, cielo);
    //game.physics.arcade.collide(player, badguy);
    //game.physics.arcade.collide(badguy, platforms);

    //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
    game.physics.arcade.overlap(player, stars, collectStar, null, this);
    game.physics.arcade.overlap(player, cielo, nextLevel, null, this);
    //game.physics.arcade.overlap(player, badguy, reduceHealth, null, this);
    //  Reset the players velocity (movement)
    player.body.velocity.x = 0;
    //badguy.body.velocity.x = -180;
    //badguy.animations.play('left');
    if (cursors.left.isDown) {
        //  Move to the left
        player.body.velocity.x = -180;

        player.animations.play('left');
    }
    else if (cursors.right.isDown) {
        //  Move to the right
        player.body.velocity.x = 180;

        player.animations.play('right');
    }
    else {
        //  Stand still
        player.animations.stop();
        //player.animations.play("stayStill");
        player.frame = 1;
    }

    //  Allow the player to jump if they are touching the ground.
    if (cursors.up.isDown && player.body.touching.down) {
        player.body.velocity.y = -350;
        //player.animations.play("jumpUp");
    }
    if (player.body.velocity.y <= 0){
        //player.animations.play("fall");
    }
}

function collectStar(player, star) {

    // Removes the star from the screen
    star.kill();

    //  Add and update the score
    score += 10;
    actualizarPuntuacion(score);
    //scoreText.text = 'Score: ' + score;
    if(score == 120){
        salvarPuntuacion(score);
    }
}
function reduceHealth(player, badguy){
    //badguy.body.velocity.x = -(badguy.body.velocity.x);
    actualizarVida(-1);
}

function nextLevel(player, heaven){
    console.log("Nivel completado");
    $("#juegoId").remove();
    alert("Has ganado!!!");
    game = null;
}

