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

const _gameHeight = 256;
const _gameWidth = 224;

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
    let invaders = new Invaders(32);
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
            playerOne.checkForCollisions(invaders.missiles);
        }
        if(!invaders.cleared) {
            invaders.update();
            for(const missile of invaders.missiles) missile.update();
            invaders.checkForCollisions(playerOne.missiles);
        }
        //drawing
        ctx.clearRect(0,0,display.width,display.height);
        ctx.scale(scale,scale);
        if(playerOne){
            playerOne.draw();
            for(const missile of playerOne.missiles){
                missile.draw();
            }
        }
        if(invaders){
            invaders.draw();
            for(const missile of invaders.missiles) missile.draw();
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
        this.y = 208;
        this.w = 16;
        this.h = 8;
        this.health = 3;
        this.speed = 1;
        this.missiles = [];
        this.missileCapacity = 1;
        this.missileSpeed = 3;
        this.rateOfFire = 15;
        this.canShoot = 0;
    }
    move(direction){
        if(direction == 'left'){
             this.x -= this.speed;
             if(this.x < 0)this.x = 0;
        }
        if(direction == 'right'){
            this.x += this.speed;
            if(this.x > _gameWidth - 15) this.x = _gameWidth - 15;
        }
    }
    shoot(){
        if(this.missiles.length < this.missileCapacity){
            if(this.canShoot <= 0) {
                this.missiles.push(new Missile(this.x + 7,this.y - 4,-this.missileSpeed,this.missiles));
                this.canShoot = this.rateOfFire;
            }
        }
    }
    checkForCollisions(missiles){
        for(const missile of missiles){
            if(overlap(missile,this)){
                removeElement(missiles, missile);
            }
        }
    }
    draw(){
        ctx.fillRect(this.x,this.y,15,8);
    }
}

class Missile{
    constructor(x,y,speed,owner){
        this.x = x;
        this.y = y;
        this.w = 1;
        this.h = 4;
        this.speed = speed;
        this.owner = owner;
    }
    update(){
        this.y += this.speed;
        if(this.y < 0 || this.y > _gameHeight){
            //remove this from owner array.
            removeElement(this.owner, this);
        }
    }
    draw(scale){
        ctx.fillRect(this.x,this.y,this.w,this.h);
    }
}

class Invaders{
    constructor(startY){
        this.grid = spawnInvaders(startY);
        this.tick = 54; //this represents the invader to update each frane.
        this.right = true; //boolean
        this.descend = false;
        this.missiles = [];
        this.missileSpeed  = 2;
    }
    update(){
        //Math.ceil(tick / 11 = row)... 55 / 11 = 5 (5-1)
        //tick % 11 = col... 55 % 11 = 0 54 % 11 = 10, 53 % 11 = 9... etc
        //so if tick % 11 == 0... then you are starting a new row
        //so when we are going through the row... we'll go through each index:
        //in ASCENDING order 0-10 if we are going LEFT
        //ignore 0... and then subtract 11 by tick % 11... 
        //and DESCENDING order 10-0 if we are going RIGHT
        //ignore 0... and then subtract 1 from tick % 11...
        //const row = Math.ceil(this.tick / 11) - 1;
        //SHOOTER
        if(!this.missiles.length){
            this.shoot(this.shooter);
        }

        //const row = Math.floor(this.tick / 11);
        let newX = -2;
        if(this.right) newX = 2;
        const invader = this.nextInvader;

        if(invader){
            if(this.descend){
                invader.move('y', 8);
            } else {
                invader.move('x', newX);
            }
            this.tick--;
        } else {
            if(!this.descend){
                if(this.isAtBoundary) this.descend = true;
            } else {
                this.descend = false;
                if(this.right){
                    this.right = false;
                } else {
                    this.right = true;
                }
            }
            this.tick = 54;
            this.update();
        }
    }
    getColumn(col){
        const column = [];
        for(const row of this.grid){
            if(row[col]) column.push(row[col]);
        }
        return column;
    }
    getRow(row){
        return this.grid[row];
    }
    get isAtBoundary(){
        let column, c;
        if(this.right){
            c = 10;
            column = this.getColumn(c);
            while(!column.length){
                c--;
                if(c<0)return false;
                column = this.getColumn(c);
            }
            return column.every( (invader) => invader.x >= _gameWidth - 16 );
        } else {
            c = 0;
            column = this.getColumn(c);
            while(!column.length){
                c++;
                if(c>10)return false;
                column = this.getColumn(c);
            }
            return column.every( (invader) => invader.x <= 0 );
        }
    }
    get invaders(){
        const i = [];
        for(const row of this.grid){
            for(const col of row){
                if(col)i.push(col);
            }
        }
        return i;
    }
    get nextInvader(){
        if(this.tick < 0)return false;
        const row = Math.floor(this.tick / 11);
        let col;
        if(this.right){
            col = this.tick % 11;
        }else{
            col = 10 - this.tick % 11;
        }
        const invader = this.grid[row][col];
        if(invader){
            return invader;
        }else{
            this.tick--;
            return this.nextInvader;
        }
    }
    get cleared(){
        if(!this.invaders.length) return true;
        return false;
    }
    get shooter(){
        const validColumns = [];
        for(let c = this.grid[0].length - 1; c >= 0; c--){
            const column = this.getColumn(c);
            if(column.length) validColumns.push(column); 
        }
        const column = validColumns[Math.floor(Math.random() * validColumns.length)];
        return column[column.length-1];
    }
    shoot(shooter){
        this.missiles.push(new Missile(shooter.x + 8, shooter.y + 8, this.missileSpeed, this.missiles));
    }
    checkForCollisions(missiles){
        for(const missile of missiles){
            for(let row = this.grid.length - 1; row >= 0; row--){
                for(let col = this.grid[0].length - 1; col >= 0; col--){
                    if(this.grid[row][col]){
                        //check for collision
                        const invader = this.grid[row][col].hitBox;
                        if(overlap(missile,invader)){
                            removeElement(missiles, missile);
                            this.grid[row][col] = '';
                            //removeElement(this.grid[row],invader);
                        }
                    }
                }
            }
        }
    }
    draw(){
        for(const invader of this.invaders){
            invader.draw();
        }
    }
}

class Invader{
    constructor(x,y,w){
        this.x = x;
        this.y = y;
        this.h = 8;
        //w = [ 8, 11, 12]
        this.w = w
    }
    move(axis,distance){
        if(axis == 'x') this.x += distance;
        if(axis == 'y') this.y += distance;
    }
    get xOffset(){
        return this.x + Math.floor((16 - this.w)/2);
    }
    get hitBox(){
        return {x: this.xOffset, y:this.y, w:this.w, h:this.h };
    }
    draw(){
        //test draw routine...
        //draw primitive
        ctx.fillStyle = 'blue';
        ctx.fillRect(this.xOffset, this.y, this.w, this.h);
        //draw border
        ctx.strokeStyle = 'lime';
        ctx.strokeRect(this.x, this.y, 16, 8);
    }
}

const spawnInvaders = (startY) => {
    const startX = 16;
    //populate a grid... 5 rows... 11 columns
    //each individual grid must contain an invader with an x and y
    //the x and y are based on their cell position
    const invaders = [];
    for(let r = 0; r < 5; r++){
        const row = [];
        for(let c = 0; c< 11; c++){
            const x = startX + (16 * c);
            const y = startY + (16 * r);
            let w;
            if(r == 0) w = 8;
            if(r > 0 && r < 3) w = 11;
            if(r > 2) w = 12;
            row.push(new Invader(x,y,w));
        }
        invaders.push(row);
    }
    return invaders;
}

//COLLISIONS

function overlapX(a,b){
    if(((a.x > b.x) && (a.x < b.x + b.w)) || ((a.x +a.w > b.x ) && (a.x + a.w < b.x + b.w))) return true;
}

function overlapY(a,b){
    if(((a.y > b.y) && (a.y < b.y + b.h)) || ((a.y + a.h > b.y) && (a.y + a.h < b.y + b.h))) return true;
}

function overlap(a,b){
    if( overlapX(a,b) && overlapY(a,b) ) return true;
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