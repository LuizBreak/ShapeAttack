// Call for our function to execute when page is loaded
document.addEventListener('DOMContentLoaded', SetupCanvas);

// Handle keyboard input
document.addEventListener('keydown', MovePlayerPaddle);
document.addEventListener('keyup', StopPlayerPaddle);

// Reference to the canvas element
// let canvas;
// Context provides functions used for drawing and 
// working with Canvas
let ctx;
 
// Used to monitor whether paddles and ball are
// moving and in what direction
let DIRECTION = {
    STOPPED: 0,
    UP: 1,
    DOWN: 2,
    LEFT: 3,
    RIGHT: 4
};

// let player;
let aiPlayer;
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

//     // Get reference to canvas element
//     canvas = document.getElementById('canvas');
//     // Get methods for manipulating the canvas
//     c = canvas.getContext('2d');
//     // Define canvas size
//     canvas.width = innerWidth;
//     canvas.height = innerHeight;
}
// If we are not in play mode start the game running and loop
// through updates and draws till the end of the game
function MovePlayerPaddle(key){
    if(running === false){
        running = true;
        window.requestAnimationFrame(GameLoop);
    }
 
    // Handle up arrow and w input
    if(key.keyCode === 38 || key.keyCode === 87) player.move = DIRECTION.UP;
 
    // Handle down arrow and s input
    if(key.keyCode === 40 || key.keyCode === 83) player.move = DIRECTION.DOWN;
}
 
function StopPlayerPaddle(evt){
    player.move = DIRECTION.STOPPED;
}

const canvas = document.querySelector("canvas");
const c = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight;


class Player {

    constructor(x, y, radius, color){

        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;

    }
    draw(){
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
    }
}

const x = canvas.width / 2;
// const y = canvas.height / 2;

const player = new Player(x, canvas.height, 20, 'red');
player.draw();
console.log(player);
console.log("game over")
