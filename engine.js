// Call for our function to execute when page is loaded
document.addEventListener('DOMContentLoaded', SetupCanvas);

// Reference to the canvas element
let canvas;
// Context provides functions used for drawing and working with Canvas
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

let player;

let bullet;
const bullets = [];

let enemy;
const enemies = [];

let loveTile;
const loveTiles = [];

let particle;
const particles = [];


let loveMessage;

// Monitors whether ball is currently in play
let running = false;
let gameOver = false;

let beepSound;

let oShoot;
let oExplode;
let oGameOver;


let AnimationId;
let refreshIntervalEnemiesId;
let refreshIntervalTileId;

// for particles color declaration / fading away logic
let hue = 0;

// const targetLoveMessage ='TE-AMO-NEGO-MIO';
const targetLoveMessage ='AMOR'; // LE: for test only

function SetupCanvas(){

    console.log("SetupCanvas.enter")

    // Reference to the canvas element
    canvas = document.querySelector("canvas");

    // Context provides functions used for drawing and  working with Canvas
    ctx = canvas.getContext('2d');
    
    canvas.width = 620;
    canvas.height = 480;

    // Handle keyboard input
    document.addEventListener('keydown', MovePlayerPaddle);
    document.addEventListener('keyup', StopPlayerPaddle);
    
    oShoot = new SoundPlayer('beepSound1', "asset/beep.wav");
    oExplode = new SoundPlayer('beepSound2', "asset/jump.mp3");
    oGameOver = new SoundPlayer('beepSound3', "asset/mario-bros-die.mp3");

    player = new Player((canvas.width/2), 'white');
    loveMessage = new LoveMessage(targetLoveMessage);

    Draw();

    spawnDroppingElements();
}
// game elements
class Player {

    constructor(x=(canvas.width/2), color){

        this.radius = 20;
        this.color = color;

        this.x = x;
        this.y = canvas.height-(this.radius*2);

        this.score = 0;
        // Defines movement direction of paddles
        this.move = DIRECTION.STOPPED;
        // Defines how quickly paddles can be moved
        this.velocity = 5;

        //console.log("Player created")
        // TBD this.winner = false;

    }
    draw(){

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2*Math.PI, true);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.stroke();

        this.#drawImage(this.x, this.y)

    }
    #drawImage(x, y){

        const spriteImg  = new Image();
        spriteImg.src = './asset/cupid-bow-smal.png'
        ctx.drawImage(spriteImg, 1, 1, 104, 124, x-25 ,  y-20 ,  80, 80);
    }
}
class Bullet {

    constructor(x, y, radius, color, velocity){

        this.radius = radius;
        this.color = color;

        this.x = x;
        this.y = y;

        this.velocity = velocity;
    }
    draw(){
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.stroke();
    }
    update(){
        // this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}
class Enemy {

    constructor(x, y, radius, velocity, color){

        this.x = x;
        this.y = y;

        this.radius = radius;

        this.velocity = velocity;
        this.color = color;
        
        this.wasGiant = radius;
    }
    draw(){

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();

    }
    update(){
        // this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}
class Particle {

    constructor(x, y, radius, velocity, color){

        this.x = x;
        this.y = y;
        
        this.radius = radius;


        this.velocity = velocity;
        
        // this is the raibow technique
        this.color = 'hsl(' + (color) + ', 100%, 50%)';;

        this.alpha = 1; // manage fadding away of particles
    }
    draw(){

        ctx.save();

        this.color = 'hsl(' + (hue) + ', 100%, 50%)';;
        canvas.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color
        ctx.fill();

        ctx.restore();
    }
    update(){

        // causing rainbow effect
        ctx.fillStyle = this.color;
        
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
        
        this.alpha -=  0.01;
    }
}
class LoveTile {

    width = 30;
    height = 30;
    wasTouched = false;

    constructor(x, y, velocity, bgColor, foreColor){

        this.x = Math.floor(x);
        this.y = Math.floor(y);

        this.velocity = velocity;

        this.bgColor = bgColor;
        this.foreColor = foreColor;

        this.letter = generateString(1);
        this.snapped = false;
    }
    draw(){

        ctx.save();
        ctx.fillStyle = this.bgColor;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.restore();

        ctx.save();
        ctx.fillStyle = this.foreColor;
        ctx.font = "15pt sans-serif";

        // Article reference: https://www.w3schools.com/tags/canvas_textalign.asp
        ctx.textAlign = "center";
        ctx.fillText(this.letter,  this.x+12, this.y+23);
        // ctx.strokeText(this.letter, this.x+12, this.y+23);
        ctx.restore();
    }
    update(){
        if(!this.snapped) this.y = this.y + this.velocity.y;
    }
}
class LoveMessage{

    #tilePosX = 140;
    #tilePosY = 30;

    #messageDock = [];

    constructor(loveMessage){

        this.loveTargetMessage = loveMessage.split('');

        this.snappedTiles = [];
        this.isMsgCompleted = false;

        // create message dock to help the user to know what the target message is
        for (let index = 0; index < this.loveTargetMessage.length; index++) {

            this.#tilePosX += 30;
            const oTile =  new LoveTile(this.#tilePosX, canvas.height - this.#tilePosY, 0, 'black', 'white' );
            oTile.letter = this.loveTargetMessage[index];
            this.#messageDock.push(oTile);
        }
    }
    checkChar(char, index){
        
        const targetLetter =  targetLoveMessage.split('');
        // console.log("Selected Letter: " + char + " targetLetter: " + targetLetter[index] + " Index: " + index)
        if (char.trim() == targetLetter[index]){
            return true;
        } else {
            return false;
        }
    }
    getUserLoveMessage(){

        let userLoveMessage = "";

        for (let index = 0; index < this.snappedTiles.length; index++) {
            let loveTile = this.snappedTiles[index];
            userLoveMessage += loveTile.letter.trim();
        }
        // console.log("UserMsg: " + userLoveMessage)
        return userLoveMessage;
    }
    pushToBanner(loveTile){

        let index = this.snappedTiles.length;

        if(this.checkChar(loveTile.letter.trim(), index)){
            this.snappedTiles.push(loveTile);
            this.draw();

            // console.log(loveTile)
            console.log(this.snappedTiles)
            // console.log("Target.join - " + this.loveTargetMessage.join(''))
            if(this.getUserLoveMessage() == this.loveTargetMessage.join('')){
                this.isMsgCompleted = true;
            }
            return true;
        } else {
            // console.log("false-> snappedTiles.length: " + this.snappedTiles.length)
            return false;
        }

    }
    popFromBanner(penalty){
        // console.log('penalty: ' + penalty + ' and snapped.length ' + this.snappedTiles.length)
        for (let index = 0; index < penalty; index++) {

            if(this.snappedTiles.length>0) {

                console.log(this.snappedTiles);
                console.log('just popped one tile out.')
                const element = this.snappedTiles[this.snappedTiles.length-1];
                ctx.clearRect(element.x, element.y, element.width, element.height);

                this.snappedTiles.pop();
                console.log(this.snappedTiles);
            }
        }
    }
    draw(){


        //Draw banner
        ctx.save();

        ctx.beginPath();
        // ctx.fillStyle = 'rgba(255,255,255, 0.7)'; // Works partially. I would like it to be all white

        ctx.fillStyle = 'white';
        ctx.fillRect(0, canvas.height-30, 160 , 50)

        var gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        gradient.addColorStop("0", "magenta");
        gradient.addColorStop("0.5", "blue");
        gradient.addColorStop("1.0", "red");

        // Fill with gradient
        ctx.font = "20px Arial";
        ctx.strokeStyle = gradient;
        ctx.strokeText("Love Letter => ", 90, canvas.height-8);
        ctx.restore();


        this.#ShowMessageDock();

        // position individual love tiles into banner over the message dock
        // console.log('snappedTiles.length' + this.snappedTiles.length)
        this.#tilePosX = 140;
        for (let index = 0; index < this.snappedTiles.length; index++) {
            const element = this.snappedTiles[index];
            this.#tilePosX += 30;
            element.x =  this.#tilePosX
            element.y = canvas.height - element.height;
            // console.log('draw it now')
            element.draw();
            // console.log(element);
            // console.log('love tile: (x, y, letter)' + element.x + ", " + element.y + ", " + element.letter)
        }


    }
    #ShowMessageDock(){

        for (let index = 0; index < this.#messageDock.length; index++) {
            const element = this.#messageDock[index];
            console.log('Draw Message Dock it now')
            element.draw();
        }
    }
}
class Stopwatch {
    constructor(id, delay=100) { //Delay in ms
      this.state = "paused";
      this.delay = delay;
      this.display = document.getElementById(id);
      this.value = 0;
    }
    
    formatTime(ms) {
      var hours   = Math.floor(ms / 3600000);
      var minutes = Math.floor((ms - (hours * 3600000)) / 60000);
      var seconds = Math.floor((ms - (hours * 3600000) - (minutes * 60000)) / 1000);
      var ds = Math.floor((ms - (hours * 3600000) - (minutes * 60000) - (seconds * 1000))/100);
   
      if (hours   < 10) {hours   = "0"+hours;}
      if (minutes < 10) {minutes = "0"+minutes;}
      if (seconds < 10) {seconds = "0"+seconds;}
      return hours+':'+minutes+':'+seconds+'.'+ds;
    }
    
    update() {
      if (this.state=="running") {
        this.value += this.delay;
      }
      //this.display.innerHTML = this.formatTime(this.value);
      return this.formatTime(this.value);
    }
    
    start() {
      if (this.state=="paused") {
        this.state="running";
        if (!this.interval) {
          var t=this;
          this.interval = setInterval(function(){t.update();}, this.delay);
        }
      }
    }
    
    stop() {
         if (this.state=="running") {
        this.state="paused";
      if (this.interval) {
        clearInterval(this.interval);
        this.interval = null;
      }
         }
    }
    
    reset() {
      this.stop();
      this.value=0;
      this.update();
    }
}
class SoundPlayer {

    // Used to play sounds when requested
    #beepSound;

    constructor(id, source){

        // Allow for playing sound
        this.#beepSound = document.getElementById(id);
        this.#beepSound.src = source;
        // console.log(this.#beepSound)
    }

    play(){
        this.#beepSound.play();
    }
}
class MessageBox{

    constructor(x, y, wWith, wHeight, bgColor, foreColor, font, message){

        this.x = (x-(wWith/2));
        this.y = (y-(wHeight/2));

        this.wWith = wWith;
        this.wHeight = wHeight;

        this.bgColor = bgColor;
        this.foreColor = foreColor;
        this.font = font;

        this.message = message;

    }
    draw(){

        ctx.save();

        // creating rectangle
        ctx.beginPath();
        ctx.rect(this.x, this.y, this.wWith, this.wHeight);
        
        ctx.fillStyle = this.bgColor;
        ctx.fill();

        ctx.strokeStyle = 'green'
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.closePath();

        ctx.fillStyle = this.foreColor;
        ctx.font = this.font
        ctx.textAlign = "center";
        ctx.fillText(this.message, this.x + (this.wWith/2), this.y + (this.wHeight/2));

        ctx.restore();

    }
    update(newMessage){

        if (newMessage != undefined){
            this.message = newMessage;
        } 
    }
}

function Draw(){

    // Clear the canvas
    // ctx.clearRect(0,0,canvas.width,canvas.height);

    // Draw Canvas background
    // https://youtu.be/Yvz_axxWG4Y min 37 (opacity effect - Particle trails )
    ctx.fillStyle = 'rgb(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height)


    // Draw score board
    // Set font for scores
    ctx.font = '60px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = "yellow";
    ctx.fillText(player.score.toString(), (canvas.width/2), 60);

    // Draw player
    player.draw();
    
    // Draw love tiles
    loveTiles.forEach((loveTile, tileIndex) => {

        loveTile.update();
        loveTile.draw();

        // love tiles off the screen?
        if ((loveTile.y - loveTile.height > canvas.height) && loveTile.snapped==false){
            loveTiles.splice(tileIndex, 1);
            return;
        }

        if(!loveTile.wasTouched)
        {            
            const dist = Math.hypot(loveTile.x - player.x, loveTile.y - player.y);
            // console.log('dist: ' + dist) + ' x: ' + loveTile.x  + ', y: ' + loveTile.y;

            // any love tile vs player collision? scorePoints
            if ((dist - loveTile.height  - player.radius) < 1 && loveTile.snapped==false){
                // console.log('crashed with Love tile')
                // remove from screen

                setTimeout(() => {
                    // place love tile in the love message banner if it matches letter
                    if (loveMessage.pushToBanner(loveTile)){
                        loveTile.snapped = true;
                        loveTile.touched = true;
                        // console.log("Move tile to Love message banner!");
                        if(loveMessage.isMsgCompleted){
                            player.winner = true;
                            gameOver = true;
                            return
                        } else {
                            // does not receive any point, this is just your obligation
                        }
                    } else {
                        // wrong letter, deserves a penalty (points and remove one last letter from banner)
                        console.log('player.score -= 1 and PopIt');
                        player.score -= 1;
                        loveMessage.popFromBanner(1);
                        loveTile.touched = true;
                    }

                }, 0);   
            }
        }

    });

    // Draw bullets
    bullets.forEach((bullet, bulletIndex) => {

        bullet.update();
        bullet.draw();

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
            return;
        }

        const dist = Math.hypot(player.x-enemy.x, player.y-enemy.y);

        // any enemy vs player collison? gameover!
        if ((dist - enemy.radius  - player.radius) < 1){{
        }
            gameOver = true;
        }

        // any enemy vs bullet collision? Explode them
        bullets.forEach((bullet, bulletIndex) =>{

            // bullets off the screen?
            if (bullet.y - bullet.radius < 0){
                bullets.splice(bulletIndex, 1);
                return;
            }

            const dist = Math.hypot(bullet.x - enemy.x, bullet.y - enemy.y);

            // any enemy vs bullet collision? scorePoints
            if ((dist - enemy.radius  - bullet.radius) < 1){

                oExplode.play();

                // score only after we made it smaller
                switch (true) {
                    case (enemy.radius<=10):
                        player.score += 100;
                        break;
                    case (enemy.radius>10 && enemy.radius<25):
                        player.score += 20;
                        break;
                    default:
                        player.score += 1;
                        break;
                }

                if (enemy.radius > 30) {
                    // make it smaller gradually Library: https://cdnjs.com/libraries/gsap
                    gsap.to(enemy, {
                        radius: enemy.radius - 7
                    });
                    setTimeout(() => {
                        bullets.splice(bulletIndex, 1);
                        splashIt(bullet, enemy.color);
   
                    }, 0);

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
    
    // Draw love banner
    loveMessage.draw();

    // Draw particles  
    hue+=5;  // change particle colors
    particles.forEach((particle, particleIndex) => {

        if (particle.alpha <= 0) {
            // after alpha hit < 0 the particle reappears on the screen. 
            // let's make sure that does not happe
            particles.splice(particleIndex, 1)
        } else {
            particle.update();
            particle.draw();    
        }
    })
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
    
        const angle = Math.atan2(dy, dx);
        // console.log(angle);

        var velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }

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
    oShoot.play()

}
// Loops constantly updating position of assets 
// while drawing them
function GameLoop(){

    // console.log("GameLoop.enter");

    Update();
    Draw();

    // Keep looping
    if(!gameOver) {
        AnimationId = requestAnimationFrame(GameLoop);
        // if(!gameOver) requestAnimationFrame(SetRateVelocity); LE: for testing purpose only (slow down the frames)
    }  else {

        if(player.winner){
            setGameOver("CONGRATULATIONS!!! You Won!")

        } else {
            setGameOver("Game Over!!!")
        }
        ctx.fillText("Score: " + player.score.toString(), (canvas.width/2), (canvas.height/2) + 50);
        ctx.stroke();
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
function StopPlayerPaddle(){
    player.move = DIRECTION.STOPPED;

}
function spawnDroppingElements(){

    // creating enemies
    refreshIntervalEnemiesId = setInterval(() => {

        const x = Math.random() *  canvas.width;
        const y = 0 - player.radius;
        const radius = (Math.random() * (50-4) + 4);
        const color = 'hsl(' + Math.random()*360 + ', 50%, 50%)';
        const velocity = {
            x: 0, 
            // TODO: Seek better diagonal patter for x velocity->  (Math.random()*2-1),
            y: ((Math.random() * 4) - 1)
        }
        enemies.push(new Enemy(x, y, radius, velocity, color));

    }, 1000)

    // creating dropping love tiles
    refreshIntervalTileId = setInterval(() => {

        const x = Math.random() *  canvas.width;
        const y = 0 - player.radius;
        const velocity = {
            x: 1,
            y: (Math.random() * 4) - 1
        }
        loveTiles.push(new LoveTile(x, y, velocity, 'white', 'black'))

    }, 2000)
}
// program to generate random strings
// Article reference: https://www.programiz.com/javascript/examples/generate-random-strings
// declare all characters
function generateString(length) {
    let result = ' ';
    const charactersLength = targetLoveMessage.length;
    for ( let i = 0; i < length; i++ ) {
        result += targetLoveMessage.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
}
function recCollisionDection(rec1, rec2){

    if (rect1.x < rect2.x + rect2.w &&
        rect1.x + rect1.w > rect2.x &&
        rect1.y < rect2.y + rect2.h &&
        rect1.h + rect1.y > rect2.y) {
        // collision detected!
        this.color("green");
        return true
    } else {
        // no collision
        this.color("blue");
        return false;
    }

}
function CircleCollisionDetection(circle1, circle2){

    // Article reference: https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection

    var dx = (circle1.x + circle1.radius) - (circle2.x + circle2.radius);
    var dy = (circle1.y + circle1.radius) - (circle2.y + circle2.radius);
    var distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < circle1.radius + circle2.radius) {
        // collision detected!
        // this.color = "green";
        return true;
    } else {
        // no collision
        // this.color = "blue";
        return false;
    }
}
function splashIt(bullet, color){

    // console.log("Boom - Enemy Splased!!!")

    for (let index = 0; index < 8; index++) {
        // particles.push(new Particle(bullet.x, bullet.y, bullet.radius, {x: Math.random()-0.5, y: Math.random()-0.5}, color))    
        particles.push(new Particle(bullet.x, bullet.y, bullet.radius, {x: Math.random()*3-1.5, y: Math.random()*3-1.5}, hue))    
    }
    // console.log(particles)
}
function setGameOver(message){

    // Finish the game
    clearInterval(refreshIntervalEnemiesId);
    clearInterval(refreshIntervalTileId);
    cancelAnimationFrame(AnimationId)

    oGameOver.play();

    oMessageBox = new MessageBox((canvas.width/2)-100, (canvas.height/2)-40, 200, 80, 'black', 'red', "20px Courier", message);
    oMessageBox.draw();
    
}
function RectCircleColliding(rect,circle){
    var dx=Math.abs(circle.x-(rect.x+rect.width/2));
    var dy=Math.abs(circle.y-(rect.y+rect.height/2));

    if( dx > circle.radius+rect.width/2 ){ return(false); }
    if( dy > circle.radius+rect.height/2 ){ return(false); }

    if( dx <= rect.width ){ return(true); }
    if( dy <= rect.height ){ return(true); }

    var dx=dx-rect.width;
    var dy=dy-rect.height
    return(dx*dx+dy*dy<=circle.radius*circle.radius);
}