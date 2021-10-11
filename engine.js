// Call for our function to execute when page is loaded
document.addEventListener('DOMContentLoaded', SetupCanvas);

// Reference to the canvas element
let canvas;
// Context provides functions used for drawing and working with Canvas
let c;
 
// Used to monitor whether paddles and ball are
// moving and in what direction
let DIRECTION = {
    STOPPED: 0,
    UP: 1,
    DOWN: 2,
    LEFT: 3,
    RIGHT: 4
};

let player;

let bullet;
const bullets = [];

let enemy;
const enemies = [];

let loveTile;
const loveTiles = [];

let snappedTiles = [];

// let aiPlayer;
let ball;
// Monitors whether ball is currently in play
let running = false;
let gameOver = false;
// Will be used to add a delay before play resumes
let delayAmount;
// Should ball target player or AI
let targetForBall;
// Used to play sounds when paddle hits a ball
let beepSound;
let AnimationId;
let refreshIntervalId;
let refreshIntervalTileId;

function SetupCanvas(){

    console.log("SetupCanvas.enter")

    // Reference to the canvas element
    canvas = document.querySelector("canvas");

    // Context provides functions used for drawing and 
    // working with Canvas
    c = canvas.getContext('2d');
    
    canvas.width = innerWidth;
    canvas.height = innerHeight;

    // Handle keyboard input
    document.addEventListener('keydown', MovePlayerPaddle);
    document.addEventListener('keyup', StopPlayerPaddle);

    // document.addEventListener('click', (event)=>{
    //     ShootIt(event);
    // });
    
    // LE: for testing purpose only. Not applicable to this game
    // document.addEventListener('click', (event)=>{
    //     ShootIt(event);
    // });


    // Draw player
    player = new Player((canvas.width/2), 'white');
    Draw();

    spawnEnemies();
}
class Player {

    constructor(x=(canvas.width/2), color){

        this.radius = 20;
        this.color = color;

        // Center the player
        this.x = x;
        // place player half off the bottom screen
        this.y = canvas.height-55;

        // Will hold the increasing score
        this.score = 0;
        // Defines movement direction of paddles
        this.move = DIRECTION.STOPPED;
        // Defines how quickly paddles can be moved
        this.velocity = 5;
        //console.log("Player created")
    }
    draw(){

        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI, false);
        c.fillStyle = this.color;
        c.fill();

        // debug
        // console.log(this);
        //console.log("Player drawn")
    }
}
class Bullet {

    constructor(x, y, radius, color, velocity){

        this.radius = radius;
        this.color = color;

        this.x = x;
        this.y = y;

        // Defines movement direction of paddles
        this.move = DIRECTION.STOPPED;
        // Defines how quickly paddles can be moved
        this.velocity = velocity;
        console.log("Bullet created")
    }
    draw(){
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
        c.fillStyle = this.color;
        c.fill();

        // debugs
        // console.log(this);
        //console.log("Bullet drawn")
    }
    update(){
        // this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}
class Enemy {

    constructor(x, y, radius, velocity, color){

        this.radius = radius;
        this.color = color;

        // Center the player
        this.x = x;
        // place player half off the bottom screen
        this.y = y;

        // Defines movement direction of paddles
        this.move = DIRECTION.STOPPED;
        // Defines how quickly paddles can be moved

        this.velocity = velocity;
        //console.log("Player created")
    }
    draw(){

        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();

        // debug
        // console.log(this);
        // console.log("Player drawn")
    }
    update(){
        // this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}
class LoveTile {

    constructor(x, y, velocity, color){

        this.color = color;

        // Center the player
        this.x = x;
        // place player half off the bottom screen
        this.y = y;

        this.width = 30;
        this.height = 30;

        this.velocity = velocity;

        // Defines movement direction of paddles
        this.move = DIRECTION.STOPPED;

        // Defines how quickly paddles can be moved
        this.velocity = velocity;
        //console.log("Player created")

        this.letter = generateString(1);

        this.snapped = false;

    }
    draw(){

        // c.beginPath();
        // c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        // c.fillStyle = this.color;
        // c.fill();

        c.fillStyle = this.color;
        c.fillRect(this.x, this.y, this.width, this.height);
        c.fill();
        // draw font in red
        c.fillStyle = "green";
        c.font = "15pt sans-serif";
        // c.fillText(this.letter, this.x, 100);
        c.strokeText(this.letter, this.x+10, this.y+20);

        // debug
        // console.log(this);
        // console.log("Player drawn")
    }
    update(){
        if(!this.snapped) this.y = this.y + this.velocity.y;
        
    }
}
function Draw(){

    // Clear the canvas
    c.clearRect(0,0,canvas.width,canvas.height);
    // Draw Canvas background
    // c.fillStyle = 'black';
    // c.fillRect(0, 0, canvas.width, canvas.height);
    c.fillStyle = 'rgb(0, 0, 0, 0.3)';
    c.fillRect(0, 0, canvas.width, canvas.height)

    // Draw scores
    // Set font for scores
    c.font = '60px Arial';
    c.textAlign = 'center';
    c.fillStyle = "yellow";
    c.fillText(player.score.toString(), (canvas.width/2), 60);

    // Draw player
    player.draw();
    
    // Draw love tiles
    loveTiles.forEach((loveTile, tileIndex) => {

        loveTile.update();
        loveTile.draw();

        // love tiles off the screen?
        if ((loveTile.y - loveTile.height > canvas.height) && loveTile.snapped==false){
            loveTiles.splice(tileIndex, 1);
            // console.log(enemies);
            return;
        }
        const dist = Math.hypot(loveTile.x - player.x, loveTile.y - player.y);

        // any love tile vs player collision? scorePoints
        if ((dist - loveTile.height  - player.radius) < 1 && loveTile.snapped==false){
            // remove from screen
            setTimeout(() => {

                // loveTile.x = 0 + loveTile.width;
                // loveTile.y = canvas.height - loveTile.height;
                loveTile.snapped = true;
                snappedTiles.push(loveTile);
 
                console.log("Move tile to Love message!");
            }, 0);   
        }
    });

    // Draw bullets
    bullets.forEach((bullet, bulletIndex) => {

        bullet.update();
        bullet.draw();
        
        // console.log("canvas height: " + canvas.height)
        // console.log("bullet posY: " + bullet.y)
        // console.log(bullets);

        // bullets off the screen?
        if (bullet.y - bullet.radius < 0){
            bullets.splice(bulletIndex, 1);
            return;
        }
        
    });

    // Draw enemies
    enemies.forEach((enemy, EnemyIndex) => {

        enemy.update();
        enemy.draw();

        // enemies off the screen?
        if (enemy.y - enemy.radius > canvas.height){
            enemies.splice(EnemyIndex, 1);
            // console.log(enemies);
            return;
        }

        const dist = Math.hypot(player.x-enemy.x, player.y-enemy.y);

        // any enemy vs player collion? gameover!
        if ((dist - enemy.radius  - player.radius) < 1){{
        }
            gameOver = true;
            cancelAnimationFrame(AnimationId)
            console.log("End the Game!")
        }

        bullets.forEach((bullet, bulletIndex) =>{
            
            // console.log("canvas height: " + canvas.height)

            // // bullets off the screen?
            // if (bullet.x - bullet.radius > canvas.height){
            //     bullets.splice(bulletIndex, 1);
            //     console.log(bullets);
            //     return;
            // }
            const dist = Math.hypot(bullet.x - enemy.x, bullet.y - enemy.y);
            // console.log(dist);
            // any enemy vs bullet collision? scorePoints
            if ((dist - enemy.radius  - bullet.radius) < 1){

                // score only after we made it smaller
                switch (true) {
                    case (enemy.radius<=10):
                        player.score += 100;
                        break;
                    case (enemy.radius>10 && enemy.radius<25):
                        player.score += 20;
                        break;
                    default:
                        player.score += 5;
                        break;
                }

                // console.log(EnemyIndex + ": enemy.radius: " + enemy.radius);
                if (enemy.radius > 15) {
                    enemy.radus -= 1
                    //setTimeout(() => {
                        enemies.splice(EnemyIndex, 1);   
                    //}, 0);

                } else {

                    // remove from screen
                    setTimeout(() => {
                        enemies.splice(EnemyIndex, 1);
                        bullets.splice(bulletIndex, 1); 
                    }, 0);   
                }

            }
        })

    });
    let tilePosX = 0;
    tilePosX = 0;

    snappedTiles.forEach((tile, tileIndex) => {

        // loveTile.y = canvas.height - loveTile.height;
        tilePosX += 25;
        tile.x =  tilePosX
        tile.y = canvas.height - tile.height;
    });
    // Declare a winner (LE: does not apply to this game)
    // if(player.score === 5){
    //     c.fillText("Player Wins", canvas.width/2, 100);
    //     gameOver = true;
    // }
}
function Update(){

    // Move player paddle if they are pressing down
    // buttons

    // up and down cases
    // if(player.move === DIRECTION.DOWN){
    //     player.y += player.speed;
    // } else if(player.move === DIRECTION.UP){
    //     player.y -= player.speed;
    // }

    // sideway cases
    if(player.move === DIRECTION.RIGHT){
        player.x += player.velocity;
    } else if(player.move === DIRECTION.LEFT){
        player.x -= player.velocity;
    }

    // If player tries to move off the board prevent that (LE: No need for this game)
    // if(player.y < 0){
    //     player.y = 0;
    // } else if(player.y >= (canvas.height - player.height)){
    //     player.y = canvas.height - player.height;
    // }

    //If player tries to move off the board prevent that
    if(player.x < player.radius){
        player.x = 0 + player.radius;
    } else if(player.x >= (canvas.width - player.radius)){
        player.x = canvas.width - player.radius;
    }
}
// If we are not in play mode start the game running and loop
// through updates and draws till the end of the game
function MovePlayerPaddle(key){

    if(running === false){
        running = true;
        window.requestAnimationFrame(GameLoop);
    }
 
    // console.log("key: " + key.keyCode);

    // Handle up arrow and w input
    if(key.keyCode === 38 || key.keyCode === 87) player.move = DIRECTION.UP;
    // Handle down arrow and s input
    if(key.keyCode === 40 || key.keyCode === 83) player.move = DIRECTION.DOWN;

    // Handle left arrow and a input
    if(key.keyCode === 37 || key.keyCode === 65) player.move = DIRECTION.LEFT
    // Handle right arrow and d input
    if(key.keyCode === 39 || key.keyCode === 68) player.move = DIRECTION.RIGHT;
    
    // Handle space bar for shooting
    if(key.keyCode === 32) {
        // console.log("shoot!!");
        ShootIt(null)
    }
    // handle scape as game over
    if(key.keyCode === 27) gameOver = true;
}
function ShootIt(event){

    if(event!=undefined)
    {
        const dy = event.clientY-player.y;
        const dx = event.clientX-player.x;
    
        const angle = Math.atan2(dy, dx);
        // console.log(angle);

        var velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }
        // console.log("Coordinates: " + velocity.x + ", " + velocity.y);

    } else {

        var velocity = {
            x: 0,
            y: -5
        }
        // console.log("Coordinates: " + velocity.x + ", " + velocity.y);
    }
    
    bullet = new Bullet(player.x, player.y, 5, 'white', velocity);
    bullets.push(bullet);
    bullet.draw();
    // console.log(bullets);

}
function StopPlayerPaddle(evt){
    player.move = DIRECTION.STOPPED;
}
// Loops constantly updating position of assets 
// while drawing them
function GameLoop(){

    // console.log("GameLoop.enter");

    Update();
    Draw();

    // Keep looping
    if(!gameOver) AnimationId = requestAnimationFrame(GameLoop);
    // if(!gameOver) requestAnimationFrame(SetRateVelocity);

    if(gameOver){

        clearInterval(refreshIntervalId);
        clearInterval(refreshIntervalTileId);

        c.font = '50px Arial';
        c.textAlign = 'center';
        c.fillStyle = "red";
        c.fillText("Game Over!!!", (canvas.width/2), (canvas.height/2));
        c.fillText("Score: " + player.score.toString(), (canvas.width/2), (canvas.height/2) + 50);

        // enemies = null;
        // bullets = null;
    }
}
// LE: just to slow dows frame for better debugging, 
//     however back to 60fps in production
var fps = 60
function SetRateVelocity(timestamp){
    setTimeout(function(){ //throttle requestAnimationFrame to 20fps
        requestAnimationFrame(GameLoop)
    }, 1000/fps)
}
function spawnEnemies(){

    // creating enemies
    refreshIntervalId = setInterval(() => {

        const x = Math.random() *  canvas.width;
        const y = 0 - player.radius;
        const radius = (Math.random() * (50-4) + 4);
        const color = 'hsl(' + Math.random()*360 + ', 50%, 50%)';
        const velocity = {
            x: 1,
            y: ((Math.random() * 4) - 1)
        }
        enemies.push(new Enemy(x, y, radius, velocity, color));

        // console.log(enemies);

    }, 1000)

    // creating love tiles
    refreshIntervalTileId = setInterval(() => {

        const x = Math.random() *  canvas.width;
        const y = 0 - player.radius;
        const velocity = {
            x: 1,
            y: ((Math.random() * 4) - 1)
        }
        loveTiles.push(new LoveTile(x, y, velocity, 'white'))

        // console.log(enemies);

    }, 2500)
}

// program to generate random strings
// Article reference: https://www.programiz.com/javascript/examples/generate-random-strings
// declare all characters
const characters ='EUAMO';
function generateString(length) {
    let result = ' ';
    const charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
}