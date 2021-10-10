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

    document.addEventListener('click', (event)=>{
        // console.log(event);

        ShootIt(event);

    });

    // Draw player
    player = new Player((canvas.width/2), 'blue');
    Draw();
}
class Player {

    constructor(x=(canvas.width/2), color){

        this.radius = 30;
        this.color = color;

        // Center the player
        this.x = x;
        // place player half off the bottom screen
        this.y = canvas.height;

        // Will hold the increasing score
        this.score = 0;
        // Defines movement direction of paddles
        this.move = DIRECTION.STOPPED;
        // Defines how quickly paddles can be moved
        this.speed = 11;
    }
    draw(){

        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();

        // debug
        // console.log(this);
        console.log("player created")
    }
}
class Bullet {

    constructor(x, y, radius, color, velocity){

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
    }
    draw(){
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();

        // debugs
        // console.log(this);
        console.log("Bullet created")
    }
    update(){
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}
function Draw(){

    // Clear the canvas
    c.clearRect(0,0,canvas.width,canvas.height);
    // Draw Canvas background
    c.fillStyle = 'black';
    c.fillRect(0, 0, canvas.width, canvas.height);

    // Draw scores
    // Set font for scores
    c.font = '80px Arial';
    c.textAlign = 'center';
    c.fillStyle = "yellow";
    c.fillText(player.score.toString(), (canvas.width/2), 100);

    // Draw Paddles
    player.draw();
    // bullet.draw();

    // Declare a winner
    if(player.score === 5){
        c.fillText("Player Wins", canvas.width/2, 100);
        gameOver = true;
    }
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
        player.x += player.speed;
    } else if(player.move === DIRECTION.LEFT){
        player.x -= player.speed;
    }
    bullet.update();

}
// If we are not in play mode start the game running and loop
// through updates and draws till the end of the game
function MovePlayerPaddle(key){
    if(running === false){
        running = true;
        window.requestAnimationFrame(GameLoop);
    }
 
    console.log("key: " + key.keyCode);

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
        console.log("shoot!!");
    }
    // handle scape as game over
    if(key.keyCode === 27) gameOver = true;
}
 function ShootIt(event){

    const dy = event.clientY-player.y;
    const dx = event.clientX-player.x;
    
    // const angle = Math.atan2(
    //     (event.clientY-player.y),
    //     (event.clientX-player.x)
    // );

    // const angle = Math.atan2(dy, dx) * 180  / Math.PI;
    const angle = Math.atan2(dy, dx);

    console.log(angle);
    const velocity = {
        x: Math.cos(angle),
        y: Math.sin(angle)
    }
    bullet = new Bullet(player.x, player.y, 1, 'white', velocity);
    bullets.push(bullet);
    bullet.draw();

    console.log(bullets);
}
function StopPlayerPaddle(evt){
    player.move = DIRECTION.STOPPED;
}
// Loops constantly updating position of assets 
// while drawing them
function GameLoop(){

    console.log("GameLoop.enter");


    //Update();
    //Draw();
    // Keep looping
    if(!gameOver) requestAnimationFrame(GameLoop);
    // if(!gameOver) requestAnimationFrame(SetRateVelocity);
    

    bullets.forEach(projectile => {
        projectile.update();
        projectile.draw();
    });


    if(gameOver){
        c.font = '50px Arial';
        c.textAlign = 'center';
        c.fillStyle = "red";
        c.fillText("Game Over!!!", (canvas.width/2), (canvas.height/2));
    }
}
// just to slow dows frame for better debuggin, 
// however back to 60fps in production
var fps = 60
function SetRateVelocity(timestamp){
    setTimeout(function(){ //throttle requestAnimationFrame to 20fps
        requestAnimationFrame(GameLoop)
    }, 1000/fps)
}