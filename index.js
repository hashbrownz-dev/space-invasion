//SPACE INVASION
/*
OBJECTIVE ->
Create a fully responsive Space Invaders Clone

REQUIREMENTS ->
I.      -Must be playable in all current browsers on both desktop and mobile devices.
II.     -Must scale in difficulty with each new level.
III.    -Must look identical to the original Space Invaders.
IV.     -The desktop version must have an option to rebind keys
V.      -Must have a progressive skill system.
VI.     -Must have scrolling background elements (STRETCH include an illustrated background like space invaders)
VII.    -Must have a particle effect system.

STRETCH REQUIREMENTS ->
I.      -CREATE CUSTOM ARTWORK
II.     -SCALE GRAPHICS TO 800 X 600

BUILDING THE ENGINE
I.      -INITIALIZE OUR CANVAS
II.     -CREATE A GAME LOOP
III.    -GET PLAYER INPUT
IV.     -MOVE PLAYER CHARACTER
V.      -MAKE SOME ENEMIES
VI.     -SPRITES
VII.    -SCOREBOARD
VIII.   -DIFFICULTY ALGORITHM
IX.     -SCROLLING BACKGROUND
X.      -PARTICLE SYSTEM
XI.     -SOUND EFFECTS

*/

const display = document.getElementById('display');
const ctx = display.getContext('2d');

const resizeDisplay = () => {
    //Get our viewport height: window.innerHeight...
    //our view ratio is 8:7...
    //so we divide our innerHeight by 8 and the multiply that result by 7
    //i.e we multiply the quotient of innerHeight / 8 by seven...
    //(innerHeight / 8) * 7 = width...
    //const h = (window.innerHeight > 256) ? window.innerHeight : 256;
    const min = 256,
        max = 640;
    let h = window.innerHeight;
    if(h < min) h = min;
    if(h > max) h = max;
    display.height = h;
    display.width = (h/8) * 7;
    //return scale -> current / native
    return h / min;
}
const scaleDisplay = (scale) => {
    //scale * native = current
    display.height = 256 * scale;
    display.width = (display.height/8) * 7;
    return scale;
}

const main = () => {
    //initialize display...
    let scale = resizeDisplay();
    window.addEventListener('resize', ()=>{ scale = resizeDisplay(); });
    document.getElementById('one').onclick = ()=> {scale = scaleDisplay(1)};
    document.getElementById('one-point-five').onclick = ()=> {scale = scaleDisplay(1.5)};
    document.getElementById('two').onclick = ()=> {scale = scaleDisplay(2)};
    document.getElementById('two-point-five').onclick = ()=> {scale = scaleDisplay(2.5)};

    let previousTime = 0;
    const keys = ['ArrowLeft','ArrowRight',' '];
    const controller = trackKeys(keys);
    buildMobileControls(keys,controller);

    let playerOne = new Ship(105);
    //TEST PLAYER
    getPlayerParams(playerOne);
    const update = (timeStamp) => {
        requestAnimationFrame(update);
        if(!previousTime) previousTime = timeStamp;
        const elapsed = timeStamp - previousTime;
        previousTime = timeStamp;
        //test

        //game logic
        if(playerOne){
            playerOne.canShoot--;
            getInput(keys,controller,playerOne);
            for(const missile of playerOne.missiles){
                missile.update();
            }
        }
        //drawing
        ctx.clearRect(0,0,display.width,display.height);
        ctx.scale(scale,scale);
        if(playerOne){
            playerOne.draw(scale);
            for(const missile of playerOne.missiles){
                missile.draw();
            }
        }
        ctx.resetTransform();
    }
    requestAnimationFrame(update);
}

//GET PLAYER INPUT

const trackKeys = (keys) => {
    let down = Object.create(null);
    const track = (event) => {
        //event.preventDefault();
        if(keys.includes(event.key)){
            down[event.key] = event.type == 'keydown';
        }
    }
    window.addEventListener('keydown', track);
    window.addEventListener('keyup', track);
    return down;
}

const getInput = (keys, controller, player) => {
    if(controller[keys[0]])player.move('left');
    if(controller[keys[1]])player.move('right');
    if(controller[keys[2]])player.shoot();;
}

const buildMobileControls = (keys, controller) => {
    const left = document.getElementById('left-button');
    const right = document.getElementById('right-button');
    const shoot = document.getElementById('shoot-button');
    left.ontouchstart = (event) => { controller[keys[0]] = true };
    left.ontouchend = (event) => { controller[keys[0]] = false };
    right.ontouchstart = (event) => { controller[keys[1]] = true };
    right.ontouchend = (event) => { controller[keys[1]] = false };
    shoot.ontouchstart = (event) => { controller[keys[2]] = true };
    shoot.ontouchend = (event) => { controller[keys[2]] = false };
}

const removeElement = (array, element) => {
    const index = array.indexOf(element);
    if(index > -1){
        array.splice(index,1);
    }
}

const upgradePlayer = (player, upgrades) => {
    for( const [key,value] of Object.entries(upgrades)){
        player[key] = value;
    }
}

class Ship{
    constructor(x){
        this.x = x;
        this.y = 240;
        this.health = 3;
        this.speed = 1;
        this.missiles = [];
        this.missileCapacity = 1;
        this.missileSpeed = 3;
        this.rateOfFire = 15;
        this.canShoot = 0;
    }
    move(direction){
        if(direction == 'left') this.x -= this.speed;
        if(direction == 'right') this.x += this.speed;
    }
    shoot(){
        if(this.missiles.length < this.missileCapacity){
            if(this.canShoot <= 0) {
                this.missiles.push(new Missile(this.x + 7,this.y - 4,this.missileSpeed,this.missiles));
                this.canShoot = this.rateOfFire;
            }
        }
    }
    draw(scale){
        ctx.fillRect(this.x,this.y,15,8);
    }
}

class Missile{
    constructor(x,y,speed,owner){
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.owner = owner;
    }
    update(){
        this.y -= this.speed;
        if(this.y < 0){
            //remove this from owner array.
            removeElement(this.owner, this);
        }
    }
    draw(scale){
        ctx.fillRect(this.x,this.y,1,4);
    }
}

// TESTING

//KEY BINDING
const bindKeys = (keys) => {
    const left = document.getElementById('control-left'),
        right = document.getElementById('control-right'),
        shoot = document.getElementById('control-shoot');
    const keyObject = {
        [left.value]:()=>{console.log('Go Left')},
        [right.value]:()=>{console.log('Go Right')},
        [shoot.value]:()=>{console.log('Shoot')}
    };
    keys[0] = left.value;
    keys[1] = right.value;
    keys[2] = shoot.value;
}

//  PLAYER PARAMETERS

const getPlayerParams = (player) => {
    document.getElementById('update-player').onclick = () => {
        upgradePlayer(player, {
            speed: Number(document.getElementById('speed').value),
            missileCapacity: Number(document.getElementById('missile-capacity').value),
            missileSpeed: Number(document.getElementById('missile-speed').value),
            rateOfFire: Number(document.getElementById('rate-of-fire').value)
        });
    }
}
//  CANVAS SCALING

const testScaling = (scale) => {
    //we need a way to affect the scale variable that gets passed into this function
    document.getElementById('one').onclick = ()=> {scale = scaleDisplay(1)};
    document.getElementById('one-point-five').onclick = ()=> {scale = scaleDisplay(1.5)};
    document.getElementById('two').onclick = ()=> {scale = scaleDisplay(2)};
    document.getElementById('two-point-five').onclick = ()=> {scale = scaleDisplay(2.5)};
}

//RUN
main();