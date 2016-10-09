// http://phaser.io/docs/2.6.2/index - API
// Third parameter - Phaser.CANVAS, Phaser.WEBGL, or Phaser.AUTO. When AUTO is set, Phaser checks if the device supports WebGL.
// Else, it use Phaser.CANVAS
// Fourth parameter - id of DOM element
var game;
var juego;
var player;
var platforms;
var cursors;
var stars;
var score = 0;
var scoreText;

function crearJuego(){
    game = new Phaser.Game(800, 600, Phaser.AUTO, 'juegoId', { preload: preload, create: create, update: update });
    salvarPuntuacion(0);
}


//Game has a Loader object which allows us to insert resources in our game.
//load methods (load.image, load.audio...) inserts this key-value in queue of elements that will be loaded on create
function preload() {
    game.load.image('sky', 'assets/sky.png');
    game.load.image('ground', 'assets/platform.png');
    game.load.image('star', 'assets/star.png');
    game.load.spritesheet('dude', 'assets/sora.png', 60, 56);
    //this last funcion takes also the size we want the sprite to be.

}

function create() {

    //  We're going to be using physics, so enable the Arcade Physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);

    //  A simple background for our game. add.sprite receives the (x,y) point to place the sprite and its id (id set on preload)
    game.add.sprite(0, 0, 'sky');

    //  The platforms group contains the ground and the 2 ledges we can jump on
    // A group is a container. Putting stuff in groups allows us to apply some changes to every child in the group
    // with a single command. The call return us the group to work with it.
    platforms = game.add.group();

    //  We will enable physics for any object that is created in this group. If we set it after inserting the sprites, it
    // won't have effect. SET BEFORE ADDING ANYTHING.
    platforms.enableBody = true;

    // Here we create the ground.
    // Create works like the add method used before
    // World property from game is a space that conteins the whole game (sprites, images) and properties
    var ground = platforms.create(0, game.world.height - 64, 'ground');

    //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
    // scale is a ScaleManager to set the size.
    // setTo does xSize * FirstParameter, ySize * Second
    ground.scale.setTo(2, 2);

    //  This stops it from falling away when you jump on it
    ground.body.immovable = true;

    //  Now let's create two ledges
    var ledge = platforms.create(400, 400, 'ground');
    ledge.body.immovable = true;

    ledge = platforms.create(-150, 250, 'ground');
    ledge.body.immovable = true;

    // The player and its settings
    //If we set the player under the ground, it won't be able to jump
    //112 = 64 (point where the ground starts) + 62 (height of the player)
    player = game.add.sprite(38, game.world.height - 150, 'dude');

    //  We need to enable physics on the player
    game.physics.arcade.enable(player);

    //  Player physics properties. Give the little guy a slight bounce.
    // We do this after enable some Physics 
    player.body.bounce.y = 0.2; //Bouncing of the sprite when jumping. 1 = keeps bouncing a lot. 0.2 = jump is more natural
    player.body.gravity.y = 350; //It sets the gravity that will affect the body (the height it can reach)
    player.body.collideWorldBounds = true; //Can the sprite go beyond the game borders? If it can, it CAN'T come back.

    //  Our two animations, walking left and right.
    player.animations.add('left', [3, 5, 3, 5], 8, true);
    // Name of the animation - frames it use - time to play - use in loop (yes/no)
    player.animations.add('right', [6, 8, 6, 8], 8, true);

    //  Finally some stars to collect
    stars = game.add.group();

    //  We will enable physics for any star that is created in this group
    stars.enableBody = true;

    //  Here we'll create 12 of them evenly spaced apart
    for (var i = 0; i < 12; i++) {
        //  Create a star inside of the 'stars' group
        var star = stars.create(i * 70, 0, 'star');

        //  Let gravity do its thing
        star.body.gravity.y = 300;

        //  This just gives each star a slightly random bounce value
        star.body.bounce.y = 0.7 + Math.random() * 0.2;
    }

    //  The score
    scoreText = game.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

    //  Our controls.
    cursors = game.input.keyboard.createCursorKeys();

}

function update() {

    //  Collide the player and the stars with the platforms
    game.physics.arcade.collide(player, platforms);
    game.physics.arcade.collide(stars, platforms);

    //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
    game.physics.arcade.overlap(player, stars, collectStar, null, this);

    //  Reset the players velocity (movement)
    player.body.velocity.x = 0;

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
        player.frame = 1;
    }

    //  Allow the player to jump if they are touching the ground.
    if (cursors.up.isDown && player.body.touching.down) {
        player.body.velocity.y = -350;
    }

}

function collectStar(player, star) {

    // Removes the star from the screen
    star.kill();

    //  Add and update the score
    score += 10;
    
    scoreText.text = 'Score: ' + score;
    if(score == 120){
        salvarPuntuacion(score);
    }
}
