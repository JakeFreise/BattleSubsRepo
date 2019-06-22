/*
 * @name Simple Shapes
 * @description This examples includes a circle, square, triangle, and a flower.
 */
 
var player;
var ships = [];
var radar = [];
var RADAR = false;

var socket;
var mapSize = 4;
var blockSize = 10;
var gridSize = 100;
var cols = blockSize;
var rows = blockSize;

let graphics;
let view;
let subView;
let bubbleCanvas;
let bulletCanvas;
let debubCanvas;
let backCanvas;

const constraints = gridSize*blockSize*mapSize;

const submarine = true;
const spawnX = 0;
const spawnY = 0;

var bubbles = [];
var bullets = [];
var torpedos = [];
var players = [];

var isAlive = 1;
var alive = 1;

function respawn()
{
  isAlive = 1;
  player.pos.x = randomLocation();
  player.pos.y = randomLocation();
  player.rotateAngle = towardsCenter();
  player.hp = player.maxHP;
}

function randomLocation()
{
  return Math.floor(Math.random() * (constraints - 500)) + 500;
}

function towardsCenter()
{
  var angle = radians(atan2(constraints/2 - player.pos.y, constraints/2 - player.pos.x) * 180 / PI);
  return angle;
}

function setup() {
  pixelDensity(1);
  createCanvas(2133,1200);
  backCanvas = createGraphics(constraints,constraints);
  graphics = createGraphics(constraints,constraints);
  bubbleCanvas = createGraphics(constraints, constraints);
  bulletCanvas = createGraphics(constraints, constraints);
  debugCanvas = createGraphics(constraints, constraints)
  
  backCanvas.background(51);
  bulletCanvas.fill('black');
  
  drawMap();
  
  view = createGraphics(1920,1080);
  view = createGraphics(1920,1080);
  //drawViewLimit(spawnX,spawnY, 1000, view);
  
  subview = createGraphics(displayWidth*4,displayHeight*4);
  
  drawViewLimit(displayWidth*2,displayHeight*2, 1000, subview);
  drawPeriscope(displayWidth*2, displayHeight*2, 1000, subview);
  

  socket = io.connect('https://battlesubs.herokuapp.com');
  //socket = io.connect('localhost:4000');
  
  player = new Ship(0, 2000, 2000);
  respawn();
  
  var data = {
    x: player.pos.x,
    y: player.pos.y,
    aimX: 0,
    aimY: 0,
    rotateAngle: player.rotateAngle,
    isUnderwater: player.isUnderwater
  };
  
  socket.emit('start', data);

  socket.on('heartbeat',
    function(data)
    {
  	  data.map(function(item, index){
        if(item.id != socket.id)
        {
          if(item.alive)
          {
            var savedBubbles = [];
            if(ships[index]!=null)
            {
              savedBubbles = ships[index].bubbles;
            }
            print("making new ship: " + index + " : " + item.id);
            var ship = new newShip(item.id, item.x, item.y, item.aimX, item.aimY, item.rotateAngle, item.isUnderwater, item.speed, item.hp, item.radar);
            ship.bubbles = savedBubbles;
            ships[index] = ship;
          }
          else if(item.id == ships[index].id)
          {
            ships.splice(index, 1);
          }
        }
  	  }); 
    }
  );
  
  socket.on('bulletbeat',
    function(data)
    {
  	  data.map(function(item, index)
  	  {   
  	      if(item.playerID != socket.id)
  	      {
            var bullet = createServerBullet(item);
            bullets.push(bullet);
  	      }
  	  }); 
    }
  );
  
  socket.on('torpedobeat',
    function(data)
    {
  	  data.map(function(item, index)
  	  {   
  	      if(item.playerID != socket.id)
  	      {
            var torpedo = createServerTorpedo(item);
            torpedos.push(torpedo);
  	      }
  	  }); 
    }
  );
  
  socket.on('hit',
    function(data)
    {
      if(data.damaged == socket.id)
      {
        print("we were hit");
        player.hit();
      }
      else if(data.damager == socket.id)
      {
        print("we hit someone");
      }
    }
  );
}

function createServerBullet(item)
{
  var location = createVector(item.x, item.y);
  var destination = createVector(item.desX, item.desY);
  var fireVel = createVector(item.fireVelX, item.fireVelY);
  var speed = item.speed;
  var caliber = item.caliber;
  return new Bullet(location, destination,fireVel, speed, caliber, false);
}

function createServerTorpedo(item)
{
  var location = createVector(item.x, item.y);
  var destination = createVector(item.desX, item.desY);
  var fireVel = createVector(item.fireVelX, item.fireVelY);
  var shipAngle = item.rotateAngle;
  return new Torpedo(location, destination,fireVel, shipAngle, false);
}

/*
function updatePlayers()
{
  ships = [];
  for(var i = 0; i<players.length; i++)
  {
    ships[i] = createShip(players[i].id, players[i].x, players[i].y, players[i].aimVector);
  }
}*/

function createShip(id, x, y, aimVector)
{
  var newShip = new Ship(id, x, y);
  newShip.setAimVector(aimVector);
  return newShip;
}

function draw() {
  
  if(player.hp <= 0)
  {
    isAlive = 0;
  }
  
  
  bulletCanvas.clear();
  bubbleCanvas.clear();
  background(0);
  
  push();
  translate(displayWidth/2 - player.pos.x, displayHeight/2 - player.pos.y);
  
  image(backCanvas, 0, 0);
  manageBubbles();
  
  if(isAlive)
  {
    if(player.isUnderwater)
    {
      drawPlayer();
      image(graphics, 0, 0);
      drawShips();
      drawView();
      image(bubbleCanvas, 0, 0);
    }
    else
    {
      image(graphics, 0, 0);
      image(bubbleCanvas, 0, 0);
      drawPlayer(); 
      drawShips();
      drawView();
    }
    image(bulletCanvas, 0, 0);
    image(debugCanvas, 0, 0);
  }
  else
  {
    translate(player.pos.x, player.pos.y);
    textSize(width/50);
    textAlign(CENTER, CENTER); 
    text('GET GOOD LOSER!',0,0);
    textSize(width/100);
    text('Click to respawn',0,-100);
  }
  //ellipse(100,100,100,100);
  pop();
  
  var data = {
    x: player.pos.x,
    y: player.pos.y,
    aimX: player.aimVector.x,
    aimY: player.aimVector.y,
    rotateAngle: player.rotateAngle,
    isUnderwater: player.isUnderwater,
    speed : player.speed,
    hp : player.hp,
	radar : RADAR,
    alive : isAlive
  };
  socket.emit('update', data);
}

function drawShips()
{
  for(var i = 0; i<ships.length; i++)
  {
    if(ships[i]!=null)
    {
      push();
      translate(ships[i].pos.x, ships[i].pos.y);
      rotate(ships[i].rotateAngle);
      ships[i].show();
      pop();
    }
  }
}

function updateShips()
{
  var newBubbles = [];
  for(var i = 0; i<ships.length; i++)
  {
    if(ships[i]!= null)
    {
      ships[i].update();
	  //radar[i] = ships[i].pos;
      newBubbles = newBubbles.concat(ships[i].bubbles);
    }
  }
  return newBubbles;
}

function manageBubbles()
{
  bubbles = player.getBubbles();
  bubbles = bubbles.concat(updateShips());
  bubbles = bubbles.concat(updateBullets());
  bubbles = bubbles.concat(updateTorpedos());
  drawBubbles(bubbles);
}

function drawPlayer()
{
  push();
  let v1 = createVector(mouseX-displayWidth/2, mouseY-displayHeight/2);
  v1.rotate(-player.rotateAngle);

  player.setAimVector(v1);
  player.update();
  player.show();
  pop();
}

function drawView()
{
  push();

  var v1 = player.aimVector;
  translate(player.pos.x, player.pos.y);
  rotate(player.rotateAngle);
  rotate(v1.heading());
  translate(-displayWidth*2, -displayHeight*2);
  
  if(player.isUnderwater)
  {
    image(subview, 0, 0);
  }
  else
  {
    image(view, 0, 0);
  }
    
  pop();
  
  push();
  drawRadar();
  pop();
  
  push();
  
  translate(player.pos.x, player.pos.y);

  rotate(player.rotateAngle);
  
  let v0 = createVector(0, 0);
  drawArrow(v0, v1, 'black');
  
  drawUI(v0, v1);

  pop();
  //drawUI();
}

function drawRadar()
{
	var x1 = player.pos.x;
	var y1 = player.pos.y;
	var locationVector = createVector(x1, y1);
	textSize("20");
	
	for(var i = 0; i<ships.length; i++)
	{
		if(ships[i]!= null)
		{
			if(!ships[i].isUnderwater&&(RADAR||ships[i].radar))
			{
				var x2 = ships[i].pos.x;
				var y2 = ships[i].pos.y;
				var distance = int(dist(x1, y1, x2, y2));
				
				var targetVector = createVector(x2,y2);
				var radarVector = p5.Vector.sub(locationVector, targetVector);
				var vectorMag = distance/10;
				
				radarVector.normalize();
				drawArrow(locationVector, radarVector.mult(-vectorMag), 'blue');
				
				coord = locationToCoord(targetVector);
				
				push();
				translate(locationVector.x, locationVector.y);
				rotate(radarVector.heading());
				translate(radarVector.mag(), 0);
				fill("white");
				text(distance, 0, 20);
				text(coord, 0, 0);
				pop();
			}
		}
	}
}

function updateTorpedos()
{
  var bubbles = [];
  for(var i = torpedos.length-1; i>=0; i--)
  {
    torpedos[i].update();
    torpedos[i].show(bulletCanvas);
    bubbles = bubbles.concat(torpedos[i].bubbles);
    
    if(torpedos[i].isSplashed)
    {
      bubbles.push(torpedos[i].splash());
      if(torpedos[i].isDoneSplashing)
      {
        torpedos.splice(i, 1);
      }
    }
  }
  return bubbles;
}

function updateBullets()
{
  var splash = [];
  //bullets = bullets.concat(serverBullets);
  for(var i = bullets.length-1; i>=0; i--)
  {
    bullets[i].update();
    if(bullets[i].isSplashed)
    {
      splash.push(bullets[i].splash());
      if(bullets[i].isDoneSplashing)
      {
        bullets.splice(i, 1);
      }
    }
    else
    {
      bullets[i].show(bulletCanvas);
    }
  }
  return splash;
}

function drawBubbles(bubbles)
{
  for(var i = bubbles.length-1; i>=0; i--)
  {
    if(bubbles[i].turbulence > 0.001)
    {
      bubbles[i].show(bubbleCanvas, color(200, map(bubbles[i].turbulence, 0,1, 0, 255)));
    }
    else
    {
      bubbles.splice(i,1);
    }
  }
}

function drawUI(base, vec)
{
  var myColor = 'white';
  
  if(RADAR)
  {
	fill('blue');
	ellipse(base.x, base.y, 10, 10);
  }
  fill('white');
  textSize("18");
  text(floor(player.speed*100)+"%", 10, 40);
   
  if(player.weapon==1)
  {
    if((abs(player.torpedoAngle)<=30 || (abs(player.torpedoAngle)>=150)) && vec.dist(base) > 400)
    {
      myColor = color('green');
    }
    else
    {
      myColor = color('red');
    }
  }

  stroke(myColor);
  fill(myColor)
  textSize("32");
  textAlign(BOTTOM);
  rotate(-player.rotateAngle);
  
  var aim = createVector(player.aimVector.x, player.aimVector.y);
  var aimAngle = player.aimVector.heading();
  aim.rotate(player.rotateAngle);
  
  var destination = p5.Vector.add(aim, player.pos);
  
  
  text(locationToCoord(destination), mouseX-displayWidth/2+25, mouseY-displayHeight/2);
  text(floor(vec.dist(base)), mouseX-displayWidth/2+25, mouseY-displayHeight/2+25);
  text(player.currentAmmo + ", " + player.currentTorpedos, mouseX-displayWidth/2+25, mouseY-displayHeight/2 + 50);
}

// draw an arrow for a vector at a given base position
function drawArrow(base, vec, myColor) {
  push();
  stroke(myColor);
  strokeWeight(3);
  fill(myColor);
  translate(base.x, base.y);
  line(0, 0, vec.x, vec.y);
  rotate(vec.heading());
  let arrowSize = 7;
  translate(vec.mag() - arrowSize, 0);
  triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);
  pop();
}

function drawPeriscope(x, y, size, canvas)
{
  canvas.strokeWeight(size/50);
  angleMode(DEGREES);
  
  for(var angle = 0; angle<160; angle++)
  {
    canvas.line(x,y,x - size*cos(angle), y - size*sin(angle));
  }
  for(var angle = 200; angle<360; angle++)
  {
    canvas.line(x,y,x - size*cos(angle), y - size*sin(angle));
  }
  angleMode(RADIANS);
}

function locationToCoord(location)
{
	var xletter='?';
	var yletter='?';
	var xnumber='?';
	var ynumber='?';
	
	for(var i = 0; i<mapSize; i++)
	{
		if(location.x<(i+1)*blockSize*gridSize)
		{
			xletter = String.fromCharCode((i+1)+64);
			
			for(j = 0; j<=blockSize; j++)
			{
				if((location.x-(i)*blockSize*gridSize)<=j*gridSize)
				{
					j--;
					xnumber = j.toString();
					break;
				}
			}
			break;
		}
	}
	
	for(var i = 0; i<mapSize; i++)
	{
		if(location.y<(i+1)*blockSize*gridSize)
		{
			yletter = String.fromCharCode((i+1)+64);
			
			for(j = 0; j<=blockSize; j++)
			{
				if((location.y-(i)*blockSize*gridSize)<=j*gridSize)
				{
					j--;
					ynumber = j.toString();
					break;
				}
			}
			break;
		}
	}
	var coord = xletter.concat(yletter,xnumber,ynumber); 
	return coord;
}

function drawViewLimit(x, y, size, canvas)
{
  canvas.noFill();
  canvas.strokeWeight(8000-(size*2));
  canvas.ellipseMode(CENTER);
  canvas.ellipse(x,y,8000,8000);
}

function drawMap()
{
	for(var i = 0; i<mapSize; i++)
	{
		for(var j = 0; j<mapSize; j++)
		{
			var xletter = String.fromCharCode((i+1)+64);
			var yletter = String.fromCharCode((j+1)+64);
			var location = xletter.concat(yletter);
			drawGrid(location, (i)*blockSize*gridSize, (j)*blockSize*gridSize);
		}
	}
}

function drawGrid(blockLocation, offsetX, offsetY)
{
  graphics.textSize(12);
  graphics.textAlign(LEFT, BOTTOM);
  for(var j = 0; j<(cols+1); j++)
  {
    for(var k = 0; k<(rows+1); k ++)
    {
      var x = j.toString();
      var y = k.toString();
      var location = x.concat(y);
      //location = blockLocation.concat(location);
      
      if(j<cols && k<rows)
      {
		graphics.textStyle(BOLD);
		graphics.text(blockLocation, gridSize*(j) + offsetX, gridSize*(k+1) + offsetY);
		graphics.textStyle(NORMAL);
        graphics.text(location, gridSize*(j) + offsetX+17, gridSize*(k+1) + offsetY);
      }
      
      graphics.line(0 + offsetX, gridSize*k + offsetY, gridSize*j + offsetX, gridSize*k + offsetY);
      graphics.line(gridSize*j + offsetX, 0 + offsetY, gridSize*j + offsetX, gridSize*k + offsetY);
    }
  }
}

function mouseWheel(event) 
{
  //move the square according to the vertical scroll amount
  player.adjustVector(event.delta);
  //uncomment to block page scrolling
  return false;
}

function keyPressed() {
  
  if(keyCode == 65)
  {
    player.pressLeft();
  } 
  if (keyCode == 68)
  {
    player.pressRight();
  }
  else if(keyCode == 87)
  {
    player.pressW();
  }
  else if(keyCode == 83)
  {
    player.pressS();
  }
  else if(keyCode == 32)
  {
	if (RADAR){RADAR = false;}
    player.pressSpace();
  }
  else if(keyCode == 70)
  {
    player.weaponSwap();
  }
  else if(keyCode == 113)
  {
    let fs = fullscreen();
    fullscreen(!fs);
  }
  else if(keyCode == 82)
  {
	  if (RADAR){RADAR = false;}
	  else if(!player.isUnderwater) {RADAR = true;}
  }
  return 0;
}

function keyReleased() 
{
  if(keyCode == 65)
  {
    player.releaseLeft();
  }
  else if (keyCode == 68){
    player.releaseRight();
  }
  else if (keyCode == 87)
  {
    player.releaseW();
  }
  else if (keyCode == 83)
  {
    player.releaseS();
  }
  return 0
}

function mousePressed() 
{
  if(player.weapon == 0 && player.hp>0 && !player.isUnderwater)
  {
    var newBullet = player.fire("bullet", debugCanvas);
    if(newBullet != -1)
    {
      emitBullet(newBullet[0]);
      bullets = bullets.concat(newBullet);
    }
  }
  else if(player.weapon == 1 && player.hp>0)
  {
    newTorpedo = player.fire("torpedo", debugCanvas);
    
    if(newTorpedo != -1)
    {
      emitTorpedo(newTorpedo);     
      torpedos.push(newTorpedo);
    }
  }
  else if(!isAlive)
  {
    respawn();
  }
}

function emitBullet(newBullet)
{
  var data = {
    x: newBullet.pos.x,
    y: newBullet.pos.y,
    desX: newBullet.des.x,
    desY: newBullet.des.y,
    fireVelX: newBullet.fireVelX,
    fireVelY: newBullet.fireVelY,
    speed: newBullet.speed,
    caliber: newBullet.caliber,
    playerID: socket.id
  };
  socket.emit('bullet', data);
}

function emitTorpedo(newTorpedo)
{
  var data = {
    x: newTorpedo.pos.x,
    y: newTorpedo.pos.y,
    desX: newTorpedo.des.x,
    desY: newTorpedo.des.y,
    fireVelX: newTorpedo.vel.x,
    fireVelY: newTorpedo.vel.y,
    playerID: socket.id,
    rotateAngle: newTorpedo.angle
  };
  socket.emit('torpedo', data);
}

function emitExplosion(location, r, dmg)
{
  var data = {
    x: location.x,
    y: location.y,
    r: r,
    dmg: dmg,
    playerID: socket.id
  };
  socket.emit('explosion', data);
}
