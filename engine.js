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

// let snappedTiles = [];
let loveMessage;

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

// for particles color declaration
let hue = 0;

//const targetLoveMessage ='TE-AMO-NEGO-MIO';
const targetLoveMessage ='AMO'; // LE: for test only

function SetupCanvas(){

    console.log("SetupCanvas.enter")

    // Reference to the canvas element
    canvas = document.querySelector("canvas");

    // Context provides functions used for drawing and 
    // working with Canvas
    ctx = canvas.getContext('2d');
    
    canvas.width = innerWidth;
    canvas.height = innerHeight;

    // Handle keyboard input
    document.addEventListener('keydown', MovePlayerPaddle);
    document.addEventListener('keyup', StopPlayerPaddle);
    
    // LE: for testing purpose only. Not applicable to this game
    // document.addEventListener('click', (event)=>{
    //     ShootIt(event);
    // });

    // Draw player
    player = new Player((canvas.width/2), 'white');
    loveMessage = new LoveMessage(targetLoveMessage);
    // loveMessage.msgBannerArray = snappedTiles;

    Draw();

    spawnDroppingElements();
}
// game elements
class Player {

    constructor(x=(canvas.width/2), color){

        this.radius = 20;
        this.color = color;

        // Center the player
        this.x = x;
        this.y = canvas.height-55;

        // Will hold the increasing score
        this.score = 0;
        // Defines movement direction of paddles
        this.move = DIRECTION.STOPPED;
        // Defines how quickly paddles can be moved
        this.velocity = 5;
        //console.log("Player created")
        this.winner = false;

    }
    draw(){

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI, false);
        ctx.fillStyle = this.color;
        ctx.fill();

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
        // console.log("Bullet created")
    }
    draw(){
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
        ctx.fillStyle = this.color;
        ctx.fill();

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

        this.x = x;
        this.y = y;

        // Defines movement direction of paddles
        this.move = DIRECTION.STOPPED;

        // Defines how quickly paddles can be moved
        this.velocity = velocity;
        
        this.wasGiant = radius;
    }
    draw(){

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();

    }
    update(){
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}
class Particle {

    constructor(x, y, radius, velocity, color){

        this.radius = radius;

        // this is the raibow technique
        this.color = 'hsl(' + (color) + ', 100%, 50%)';;
        
        // this is just the color of the enemy destroyed
        // this.color = color;

        this.x = x;
        this.y = y;

        this.velocity = velocity;
        this.alpha = 1;
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
        console.log('particles color: ' + this.color)
    }
    update(){
        ctx.fillStyle = this.color;
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
        this.alpha -=  0.01;
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

        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fill();

        // draw font in red
        ctx.fillStyle = 'rgba(0,0,255)'; // Legal;
        ctx.font = "15pt sans-serif";
        // c.fillText(this.letter, this.x, 100);
        ctx.strokeText(this.letter, this.x+10, this.y+20);

        // debug
        // console.log(this);
        // console.log("Player drawn")
    }
    update(){
        if(!this.snapped) this.y = this.y + this.velocity.y;
        
    }
}
class LoveMessage{

    constructor(loveMessage){

        this.loveTargetMessage = loveMessage.split('');
        this.snappedTiles = [];
        this.isMsgCompleted = false;
    }


    checkChar(char, index){

        // when the SnappedTiles is empty then we need to assume this is 
        // to be the first desired letter for the sequence
        // if(index=-1) {
        //     console.log("Tiles empty: reset index to 0")
        //     index=0;

        // }
        
        const targetLetter =  targetLoveMessage.split('');
        //console.log(targetLetter);
        // console.log("Selected Letter: " + char + " targetLetter: " + targetLetter[index] + " Index: " + index)
        //console.log('char.length ' + char.length + " targetLetter " + targetLetter[index].length)
        if (char.trim() == targetLetter[index]){
            // console.log(char + " was true. - checkChar");
            return true;
        } else {
            // console.log(char + " was false. - checkChar");
            return false;
        }
    }
    getUserLoveMessage(){
        let userLoveMessage = "";
        // console.log("Snapped.length: " + this.snappedTiles.length)
        for (let index = 0; index < this.snappedTiles.length; index++) {
            let loveTile = this.snappedTiles[index];
            userLoveMessage += loveTile.letter.trim();
        }
        // console.log("UserMsg: " + userLoveMessage)
        return userLoveMessage;
    }
    pushToBanner(loveTile){

        let index = 0;
        // if(this.snappedTiles.length != undefined){
             index = this.snappedTiles.length;
        // }
        // console.log("snappedTiles.length: " + index)
        // console.log("snappedTiles: " + this.snappedTiles)
        // console.log(this.snappedTiles);

        if(this.checkChar(loveTile.letter.trim(), index)){
            // console.log('got here. checkChar=true');
            this.snappedTiles.push(loveTile);
            this.draw();

            // console.log(loveTile)
            // console.log(this.snappedTiles)
            // console.log("Target.join - " + this.loveTargetMessage.join(''))
            if(this.getUserLoveMessage() == this.loveTargetMessage.join('')){
                this.isMsgCompleted = true;
            }
            
            // if(JSON.stringify(this.snappedTiles)==JSON.stringify(this.loveTargetMessage)){
            //     isCompleted = true;
            // }
            return true;
        } else {
            // console.log('got here. checkChar=false');
            // console.log("false-> snappedTiles.length: " + this.snappedTiles.length)
            return false;
        }

    }
    popFromBanner(penalty){
        // console.log('penalty: ' + penalty + ' and snapped.length ' + this.snappedTiles.length)
        for (let index = 0; index < penalty; index++) {
            if(this.snappedTiles.length>0) {
                // console.log('just popped one tile out.')
                this.snappedTiles.pop();
            }
        }
    }
    draw(){

        //Draw banner
        ctx.beginPath();
        // ctx.fillStyle = 'rgba(255,255,255, 0.7)'; // Works partially. I would like it to be all white

        ctx.fillStyle = 'white';
        ctx.fillRect(0, canvas.height-30, 160 , 50)
        ctx.stroke();
        ctx.fill();

        var gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        gradient.addColorStop("0", "magenta");
        gradient.addColorStop("0.5", "blue");
        gradient.addColorStop("1.0", "red");

        // Fill with gradient
        ctx.font = "20px Arial";
        ctx.strokeStyle = gradient;
        ctx.strokeText("Love Letter => ",90, canvas.height-8);

        // Draw individual love tiles into banner
        let tilePosX = 135;
        for (let index = 0; index < this.snappedTiles.length; index++) {
            const element = this.snappedTiles[index];
            tilePosX += 25;
            element.x =  tilePosX
            element.y = canvas.height - element.height;
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
            // console.log(enemies);
            return;
        }

        // console.log(CircleCollisionDetection(player, loveTile));
        // if(CircleCollisionDetection(player, loveTile)){
        //     console.log("Boom!!! Circle & Rec Collided")
        // }


        const dist = Math.hypot(loveTile.x - player.x, loveTile.y - player.y);

        // any love tile vs player collision? scorePoints
        if ((dist - loveTile.height  - player.radius) < 1 && loveTile.snapped==false){
            // remove from screen
            setTimeout(() => {

                // place love tile in the love message banner
                if (loveMessage.pushToBanner(loveTile)){
                    loveTile.snapped = true;
                    // console.log("Move tile to Love message banner!");
                    if(loveMessage.isMsgCompleted){
                        player.winner = true;
                        gameOver = true;
                        return
                    } else {
                        // does not receive any point, this is just your obligation
                    }
                } else {
                    // console.log('player.score -= 100 and PopIt');
                    // wrong letter, deserves a penalty (points and remove one last letter from banner)
                    player.score -= 1;
                    loveMessage.popFromBanner(1);
                    return
                }

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

        // any enemy vs player collison? gameover!
        if ((dist - enemy.radius  - player.radius) < 1){{
        }
            gameOver = true;
            cancelAnimationFrame(AnimationId)
            // console.log("End the Game!")
        }

        // any enemy vs bullet collision? Explode them
        bullets.forEach((bullet, bulletIndex) =>{
            
            // console.log("canvas height: " + canvas.height)

            // bullets off the screen?
            if (bullet.y - bullet.radius < 0){
                bullets.splice(bulletIndex, 1);
                // console.log(bullets);
                return;
            }

            const dist = Math.hypot(bullet.x - enemy.x, bullet.y - enemy.y);
            // console.log(dist);
            // any enemy vs bullet collision? scorePoints
            if ((dist - enemy.radius  - bullet.radius) < 1){
                // console.log(bullet.x + ", " + bullet.y)

                // splashIt(bullet, enemy.color);

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

                // console.log(EnemyIndex + ": enemy.radius: " + enemy.radius);
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
                        // if(enemy.wasGiant>30) 
                        // splashIt(bullet, enemy.color);
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
            // console.log("show particles on screeen")
            // console.log(particle);
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
        // used for shooting toward clicks events
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
    if(!gameOver) {
        AnimationId = requestAnimationFrame(GameLoop);
        // if(!gameOver) requestAnimationFrame(SetRateVelocity); LE: for testing purpose only (slow down the frames)
    }  else {
        // Finish the game
        clearInterval(refreshIntervalId);
        clearInterval(refreshIntervalTileId);

        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillStyle = "red";
        if(player.winner){
            ctx.fillText("CONGRATULATIONS!!! You Won!", (canvas.width/2), (canvas.height/2));
        } else {
            ctx.fillText("Game Over!!!", (canvas.width/2), (canvas.height/2));
        }
        ctx.fillText("Score: " + player.score.toString(), (canvas.width/2), (canvas.height/2) + 50);

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
function spawnDroppingElements(){

    // creating enemies
    refreshIntervalId = setInterval(() => {

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
        loveTiles.push(new LoveTile(x, y, velocity, 'yellow'))
        // console.log(enemies);

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
// return true if the rectangle and circle are colliding
function RectCircleColliding(circle, rect){

    // console.log("cicle: x-" + circle.x + " y-" + circle.y);

    var distX = Math.abs(circle.x - rect.x-rect.w/2);
    var distY = Math.abs(circle.y - rect.y-rect.h/2);

    if (distX > (rect.w/2 + circle.r)) { return false; }
    if (distY > (rect.h/2 + circle.r)) { return false; }

    if (distX <= (rect.w/2)) { return true; } 
    if (distY <= (rect.h/2)) { return true; }

    var dx=distX-rect.w/2;
    var dy=distY-rect.h/2;
    return (dx*dx+dy*dy<=(circle.r*circle.r));
}
function originalDraw(){

    // Clear the canvas
    ctx.clearRect(0,0,canvas.width,canvas.height);

    // Draw Canvas background
    ctx.fillStyle = 'rgb(0, 0, 0, 0.3)';
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
            // console.log(enemies);
            return;
        }
        const dist = Math.hypot(loveTile.x - player.x, loveTile.y - player.y);

        // any love tile vs player collision? scorePoints
        if ((dist - loveTile.height  - player.radius) < 1 && loveTile.snapped==false){
            // remove from screen
            setTimeout(() => {

                // place love tile in the love message banner
                if (loveMessage.pushToBanner(loveTile)){
                    loveTile.snapped = true;
                    // console.log("Move tile to Love message banner!");
                    if(loveMessage.isMsgCompleted){
                        player.winner = true;
                        gameOver = true;
                        return
                    } else {
                        // does not receive any point, this is just your obligation
                    }
                } else {
                    // console.log('player.score -= 100 and PopIt');
                    // wrong letter, deserves a penalty (points and remove one last letter from banner)
                    player.score -= 1;
                    loveMessage.popFromBanner(1);
                    return
                }

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
            // console.log("End the Game!")
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
                    // make it smaller gradually
                    enemy.radus += 1
                    setTimeout(() => {
                        enemies.splice(EnemyIndex, 1);   
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
}
function splashIt(bullet, color){

    // console.log("Boom - Enemy Splased!!!")

    for (let index = 0; index < 8; index++) {
        // particles.push(new Particle(bullet.x, bullet.y, bullet.radius, {x: Math.random()-0.5, y: Math.random()-0.5}, color))    
        particles.push(new Particle(bullet.x, bullet.y, bullet.radius, {x: Math.random()*3-1.5, y: Math.random()*3-1.5}, hue))    
    }
    // console.log(particles)
}