function Ship(id, x, y)
{
  this.id = id;
  this.type = "submarine";
  this.spawn = createVector(x,y);
  this.pos = createVector(x,y);
  this.vel = createVector();
  this.acc = createVector();
  this.rotateAngle = 0;
  this.rotateDelta = 0;
  this.mass = 1;
  this.thrust = 1;
  this.speed = 0;
  this.maxspeed = 1;
  this.maxTurn = 1;
  this.maximumRotateDelta = .003;
  
  this.leftPressed = false;
  this.rightPressed = false;
  this.wPressed = false;
  this.sPresed = false;
  this.bubbles = [];
  this.isUnderwater = false;
  this.aimVector;
  this.aimDelta = 0;
  
  this.tid = 0;
  this.tid2 = 0;
  
  this.pressAcc = 100;
  
  this.torpedoAngle;
  
  this.gunBattery = [];
  this.torpedoTube = [];
  
  this.weapon = 0;
  this.maxAmmo = 4;
  this.reloads = [];
  
  this.currentAmmo = this.maxAmmo;
  
  this.maxTorpedos = 2;
  this.currentTorpedos = this.maxTorpedos;
  
  this.color = [51, 151];
  
  if(this.type == "submarine")
  {
    this.shipLength = 350;
    this.shipWidth = 50;
    this.gunBattery[0] = new GunBattery(-75,0, 20, 2, 5, this.color);
    this.gunBattery[0].createGunBattery(this.spawn);
    this.gunBattery[1] = new GunBattery(75,0, 20, 2, 5, this.color);
    this.gunBattery[1].createGunBattery(this.spawn);
    
    this.currentBattery = 0;
    this.numberOfBatteries = 2;
    
    this.torpedoTube[0] = new torpedoTube(175,-12);
    this.torpedoTube[1] = new torpedoTube(175, 12);
    this.torpedoTube[2] = new torpedoTube(-175,-12);
    this.torpedoTube[3] = new torpedoTube(-175, 12);
    this.maxHP = 4;
  }
  else
  {
    return;
  }

  this.hp = this.maxHP;
  
  this.show = function()
  {
    ellipseMode(CENTER);
    if(this.isUnderwater)
    {
      fill(this.color[0]);
      ellipse(0, 0, this.shipLength, this.shipWidth); 
      ellipse(0, 0, this.shipLength/6, this.shipWidth/6);
      this.gunBattery[0].show("underwater", this.aimVector);
      this.gunBattery[1].show("underwater", this.aimVector);
    }
    else
    {
      fill(this.color[1]);
      ellipse(0, 0, this.shipLength, this.shipWidth); 
      ellipse(0, 0, this.shipLength/6, this.shipWidth/6);
      this.gunBattery[0].show("abovewater", this.aimVector);
      this.gunBattery[1].show("abovewater", this.aimVector);
      this.drawDamage();
    }
  }
  
  this.drawDamage = function()
  {
    fill(color('red'));
    for(var count = 0; count<this.maxHP-this.hp; count++)
    {
      ellipse(135 - count*90, 0, 10, 10);
    }
    fill(color('white'));
  }
  
  this.hit = function()
  {
    if(this.hp>0)
    {
      this.hp--;
    }
  }
  
  this.update = function()
  {
    this.makeBubbles(this.pos.x - (this.shipLength/2 -5)*cos(this.rotateAngle), this.pos.y - (this.shipLength/2 -5)*sin(this.rotateAngle));
    //this.turn();
    translate(this.pos.x, this.pos.y);
    rotate(this.rotateAngle);
    
    this.move();
    this.pos.add(this.vel);
    this.vel.add(this.acc);
    this.acc.mult(0);
    
    this.constrainToMap();
    
	var turn = (this.rotateDelta * this.maximumRotateDelta) * atan(this.speed+.33);
	if(this.underwater)
	{
		this.turn *= .5;
	}
	
	console.log(turn);
    this.rotateAngle += turn;
  }
  
  this.constrainToMap = function()
  {
    if((this.pos.x + (this.shipLength/2)*cos(this.rotateAngle)) > constraints || (this.pos.x + (this.shipLength/2)*cos(this.rotateAngle)) < 0)
  	{
  	  if(this.rotateAngle)
  		this.vel.x = -this.vel.x;
  		this.pos.x = constrain(this.pos.x, 0, constraints);
  	}
  
  	if((this.pos.y + (this.shipLength/2)*sin(this.rotateAngle)) > constraints || (this.pos.y + (this.shipLength/2)*sin(this.rotateAngle)) < 0)
  	{
  		this.vel.y = -this.vel.y;
  		this.pos.y = constrain(this.pos.y, 0, constraints);
  	}
  }
  
  this.fire = function(type, canvas)
  {
	var newEntity;
	
    if(type == "bullet" && this.currentAmmo>0)
    {
	  newEntity = this.fireBullets(canvas);
	  if(newEntity != -1)
	  {
		this.currentAmmo--;
		var that = this;
		this.reloads[this.maxAmmo - this.currentAmmo] = setTimeout(function(){ reloadBullet(that); }, 4000);
		return newEntity;
	  }	
    }
    else if(type == "torpedo" && this.currentTorpedos>0)
    {
      newEntity = this.fireTorpedo(canvas);
	  if(newEntity != -1)
	  {
		this.currentTorpedos--;
		var that = this;
		setTimeout(function(){ reloadTorpedo(that); }, 10000);
		return newEntity;
	  }
    }
    return -1;
  }
  
  this.fireBullets = function(canvas)
  {
      var bullets = [];
      if(this.currentBattery <= this.numberOfBatteries - 1)
      {
        var newBullet = this.gunBattery[this.currentBattery].shoot(this.pos, this.aimVector, this.rotateAngle, this.vel, canvas);
        bullets.push(newBullet);
        
        if(this.currentBattery == this.numberOfBatteries-1)
        {
          this.currentBattery = 0;
        }
        else
        {
          this.currentBattery++;
        }
      }
      return bullets;
  }
  
  this.fireTorpedo = function(canvas)
  {
    var base = createVector(0,0);
    if(this.torpedoAngle <= 30 && this.torpedoAngle >= 0 && (this.aimVector.dist(base))>400)
    {
      return this.torpedoTube[1].shoot(this.pos, this.aimVector, this.rotateAngle, this.vel, canvas);
    }
    else if(this.torpedoAngle >= -30 && this.torpedoAngle <= 0 && (this.aimVector.dist(base))>400)
    {
      return this.torpedoTube[0].shoot(this.pos, this.aimVector, this.rotateAngle, this.vel, canvas);
    }
    else if(this.torpedoAngle >= 150 && (this.aimVector.dist(base))>400)
    {
      return this.torpedoTube[3].shoot(this.pos, this.aimVector, this.rotateAngle, this.vel, canvas);
    }
    else if(this.torpedoAngle <= -150 && (this.aimVector.dist(base))>400)
    {
      return this.torpedoTube[2].shoot(this.pos, this.aimVector, this.rotateAngle, this.vel, canvas);
    }
    return -1;
  }
  
  this.setAimVector = function(vec)
  {
    this.aimVector = vec;
    this.aimVector.setMag(vec.mag() + this.aimDelta);
    this.torpedoAngle = this.aimVector.heading();
    this.torpedoAngle + this.rotateAngle;
    this.torpedoAngle = degrees(this.torpedoAngle);
  }
  
  this.turn = function()
  {
    if((!this.leftPressed && !this.rightPressed) || (this.leftPressed && this.rightPressed))
    {
      this.rotateStop();
    }
  }
  
  this.move = function()
  {
    var engineForce = createVector(1,0);
    engineForce.rotate(this.rotateAngle);
    engineForce.setMag(this.speed);
    
    var dragForce = this.getDrag();
    
    this.applyForce(dragForce);
    this.applyForce(engineForce);
  }
  
  this.getDrag = function()
  {
    var c = -0.5;
    if(this.isUnderwater)
    {
      c = -1;
    }
    
    var resistance = createVector(this.vel.x, this.vel.y);
    resistance.normalize();
    var speed = this.vel.mag();
    var newMag = c * speed * speed;
    resistance.setMag(newMag);
    return resistance;
  }
  
  this.applyForce = function(f){
    this.acc.add(f);
  }
  
  this.accelerateVector = function()
  {
     return createVector(1,0);
  }
  
  this.getBubbles = function()
  {
    return this.bubbles;
  }
  
  this.makeBubbles = function(x,y)
  {
    var turbulence;
    
    if(this.isUnderwater||turbulence <= 0)
    {
      turbulence = this.speed - .5;
      if(turbulence < 0)
      {
        return; 
      }
    }
    else
    {
      turbulence = this.speed;
    }
    
    var b = new Bubble(x,y,(5+this.bubbles.length/(10000)),turbulence);
    this.bubbles.push(b);
    
    if(this.bubbles.length > map(turbulence, 0, 1, 0, 2500))
    {
      this.bubbles.splice(0,1)
    }
  }
  
  this.adjustVector = function(delta)
  {
    var sign = delta && delta / Math.abs(delta);
    if((this.aimDelta - 2*sign*100) >= -100)
    {
      this.aimDelta -= sign*100;
    }
    //print(this.aimDelta);
  }
  
  this.pressSpace = function()
  {
    if(!this.isUnderwater)
    {
      this.isUnderwater = true;
	  this.currentAmmo = 0;
	  for(var i = 0; i<this.reloads.length; i++)
	  {
		  clearTimeout(this.reloads[i]);
	  }
    }
    else
    {
      this.isUnderwater = false;
	  this.currentAmmo = 0;
	  
	  var that = this;
	  clearTimeout(setTimeout(function(){ reloadBullet(that); }, 4000));
	  for(var i = 0; i<this.maxAmmo; i++)
	  {
		setTimeout(function(){ reloadBullet(that); }, 4000);
	  }
    }
	
  }
  
  this.increaseSpeed = function()
  {
	if(this.speed<this.maxspeed)
    {
      this.speed+= 0.01;
    } 
  }
  
  this.decreaseSpeed = function()
  {
	if(this.speed > 0)
    {
      this.speed -= 0.01;
    }
    if(this.speed < .001)
    {
      this.speed = 0;
      this.rotateStop();
    }
  }
  
  this.toggleOn = function(func)
  {
    if(this.tid==0)
	{
        this.tid=setInterval(func,this.pressAcc);
    }
  }
  
  this.toggleOff = function(){
    if(this.tid!=0){
        clearInterval(this.tid);
        this.tid=0;
    }
  }
  
  this.adjustTurn = function(func)
  {
    if(this.tid2==0)
	{
        this.tid2=setInterval(func,this.pressAcc);
    }
  }
  
  this.stopTurn = function(){
    if(this.tid2!=0){
        clearInterval(this.tid2);
        this.tid2=0;
    }
  }
  
  this.pressW = function()
  {
	this.toggleOn('player.increaseSpeed()');
    this.wPressed = true;
  }
  
  this.pressS = function()
  {
	this.toggleOn('player.decreaseSpeed()');
    this.sPressed = true;
  }
  
  this.releaseW = function()
  {
	this.toggleOff();
    this.wPressed = false;
  }
  
  this.releaseS = function()
  {
	this.toggleOff();
    this.sPressed = false;
  }
  
  this.pressLeft = function()
  {
    this.leftPressed = true;
	this.adjustTurn('player.increaseLeft()');
  }
  
  this.pressRight = function()
  {
    this.rightPressed = true;
	this.adjustTurn('player.increaseRight()');
  }
  
  this.releaseLeft = function()
  {
    this.leftPressed = false;
	this.stopTurn();
  }
  
  this.releaseRight = function()
  {
    this.rightPressed = false;
	this.stopTurn();
  }
  
  this.isLeftPressed = function()
  {
    this.leftPressed;
  }
  
  this.isRightPressed = function()
  {
    this.rightPressed;
  }
  

  
  this.increaseRight = function()
  {
	if(this.rotateDelta < this.maxTurn)
    {
      this.rotateDelta += 0.1;
    }
	else
	{
		this.rotateDelta = this.maxTurn;
	}	
  }
  
  this.increaseLeft = function()
  {
	if(this.rotateDelta > -this.maxTurn)
    {
      this.rotateDelta += -0.1;
    }
	else
	{
		this.rotateDelta = -this.maxTurn;
	}
  }
  
  
  this.rotateStop = function()
  {
    this.rotateDelta = 0;
  }
  

  
  this.weaponSwap = function()
  {
    if(this.weapon == 1)
    {
      this.weapon = 0;
    }
    else
    {
      this.weapon = 1;
    }
  }
}

function reloadBullet(theShip)
{
  if((theShip.currentAmmo < theShip.maxAmmo) && !this.isUnderwater)
  {
    theShip.currentAmmo++;
  }
}

function reloadTorpedo(theShip)
{
  if(theShip.currentTorpedos < theShip.maxTorpedos)
  {
    theShip.currentTorpedos++;
  }
}