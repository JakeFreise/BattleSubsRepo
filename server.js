var players = [];
var bullets = [];
var torpedos = [];
var explosions = [];

var express = require('express');

var port = 4000;

var app = express();
port = process.env.PORT || port;
var server = app.listen(port, '0.0.0.0', 

  function() {

  console.log('Listening to port:  ' + port);

});

app.use(express.static('public'));

console.log("My socket server is running");

var socket = require('socket.io');

var io = socket(server);

setInterval(heartbeat, 33);

function heartbeat()
{
  io.sockets.emit('heartbeat', players);
  io.sockets.emit('bulletbeat', bullets);
  io.sockets.emit('torpedobeat', torpedos);
  
  checkCollisions();
  
  bullets = [];
  torpedos = [];
  explosions = [];
}

io.sockets.on('connection', newConnection);

function newConnection(socket)
{
  console.log('new connection: ' + socket.id);

  socket.on('start', 
    function (data)
    {
      console.log(socket.id + ", " + data.x + ", " + data.y);
      var player = new Player(socket.id, data.x, data.y);
      players.push(player);
    }
  );
  
  socket.on('update',
    function(data) 
    {
      var player;
      for (var i = 0; i < players.length; i++) 
      {
        if (socket.id == players[i].id) 
        {
          player = players[i];
        }
      }
      if(player != null)
      {
        player.x = data.x;
        player.y = data.y;
        player.rotateAngle = data.rotateAngle;
        player.isUnderwater = data.isUnderwater;
        player.speed = data.speed;
        player.hp = data.hp;
        player.alive = data.alive;
		player.radar = data.radar;
        //console.log(data.x);
      }
    }
  );
  
  
  socket.on('bullet', 
    function(data) 
    {
      var bullet = new Bullet(data.x, data.y, data.desX, data.desY, data.fireVelX, data.fireVelY, data.speed, data.caliber, data.playerID);
      bullets.push(bullet);
    }
  );
  
  socket.on('torpedo', 
    function(data) 
    {
      var torpedo = new Torpedo(data.x, data.y, data.desX, data.desY, data.fireVelX, data.fireVelY, data.playerID, data.rotateAngle);
      torpedos.push(torpedo);
    }
  );
  
  socket.on('explosion', 
    function(data) 
    {
      //console.log(data.x +", " + data.y +", " + data.r +", " + data.dmg);
      var explosion = new Explosion(data.x, data.y, data.r, data.dmg, data.playerID);
      explosions.push(explosion);
    }
  );
  
  socket.on('disconnect', 
    function() 
    {
      for (var i = 0; i < players.length; i++) 
      {
        if (socket.id == players[i].id) 
        {
          console.log(players[i].id + "has disconnected");
          players.splice(i,1);
        }
      }
    }
  );
  
}

function checkCollisions()
{
  for(var j = 0; j<explosions.length; j++)
  {
    for(var k = 0; k<players.length; k++)
    {
      var distance = Math.hypot(explosions[j].x-players[k].x, explosions[j].y-players[k].y);
      if(intersects(explosions[j], players[k]) && players[k].id != explosions[j].playerID)
      {
        console.log(players[k].id + ", " + explosions[j].playerID);
        
        var data = {
          damaged: players[k].id,
          damager: explosions[j].playerID
        };
        
        for(i = 0; i<explosions[j].dmg; i++)
        {
          //console.log("HIT");
          io.sockets.emit('hit', data);
        }
      }
    }
  }
}

function intersects(circle, rect)
{
	
    var circleDistancex = Math.abs(circle.x - rect.x);
    var circleDistancey = Math.abs(circle.y - rect.y);

    if (circleDistancex > (rect.width/2 + circle.r)) { return false; }
    if (circleDistancey > (rect.height/2 + circle.r)) { return false; }

    if (circleDistancex <= (rect.width/2)) { return true; } 
    if (circleDistancey <= (rect.height/2)) { return true; }

    var cornerDistance_sq = (circleDistancex - rect.width/2)^2 +
                         (circleDistancey - rect.height/2)^2;

    return (cornerDistance_sq <= (circle.r^2));
}

function Player(id, x, y, aimX, aimY)
{
  this.id = id;
  this.x = x;
  this.y = y;
  this.rotateAngle;
  this.isUnderwater;
  this.speed;
  this.hp;
  this.alive
  this.radar;
  this.width = 350;
  this.height = 50;
}

function Bullet(x, y, desX, desY, fireVelX, fireVelY, speed, caliber, playerID)
{
  this.x = x;
  this.y = y;
  this.desX = desX;
  this.desY = desY;
  this.fireVelX = fireVelX;
  this.fireVelY = fireVelY;
  this.speed = speed;
  this.caliber = caliber;
  this.playerID = playerID;
}

function Torpedo(x, y, desX, desY, fireVelX, fireVelY, playerID, rotateAngle)
{
  this.x = x;
  this.y = y;
  this.desX = desX;
  this.desY = desY;
  this.fireVelX = fireVelX;
  this.fireVelY = fireVelY;
  this.playerID = playerID;
  this.rotateAngle = rotateAngle;
}

function Explosion(x, y, r, dmg, id)
{
  this.x = x;
  this.y = y;
  this.r = r;
  this.dmg = dmg;
  this.playerID = id;
}
