function newShip(id, x, y, aimX, aimY, rotateAngle, isUnderwater, speed, hp, radar)
{
  this.id = id;
  this.pos = createVector(x,y);
  this.aimVector = createVector(aimX,aimY);
  this.rotateAngle = rotateAngle;
  this.spawn = createVector(x,y);
  this.speed = speed;
  this.hp = hp;
  
  this.type = "submarine";
  this.vel = createVector(0,0);
  this.acc = createVector(0,0);
  this.bubbles = [];
  this.isUnderwater = isUnderwater;
  this.radar = radar;
  this.gunBattery = [];
  this.color = [51, 151];
  
  if(this.type == "submarine")
  {
    this.shipLength = 350;
    this.shipWidth = 50;
    this.maxHP = 4;
    this.gunBattery[0] = new GunBattery(75,0, 20, 2, 5, this.color);
    this.gunBattery[0].createGunBattery(this.spawn);
    this.gunBattery[1] = new GunBattery(-75,0, 20, 2, 5, this.color);
    this.gunBattery[1].createGunBattery(this.spawn);
  }
  else
  {
    print("ERROR NO SHIP TYPE CHOSEN");
    return;
  }
  
  this.show = function()
  {
    ellipseMode(CENTER);
    if(this.isUnderwater)
    {
      //fill(this.color[0]);
      //ellipse(0, 0, this.shipLength, this.shipWidth); 
      //ellipse(0, 0, this.shipLength/6, this.shipWidth/6);
      //this.gunBattery[0].show("underwater", this.aimVector);
      //this.gunBattery[1].show("underwater", this.aimVector);
    }
    else if (this.hp > 0)
    {
      fill(this.color[1]);
      ellipse(0, 0, this.shipLength, this.shipWidth); 
      ellipse(0, 0, this.shipLength/6, this.shipWidth/6);
      this.drawDamage();
      this.gunBattery[0].show("abovewater", this.aimVector);
      this.gunBattery[1].show("abovewater", this.aimVector);
    }
    
    //text(this.speed, 10, 30);
  }
  
  this.refresh = function(x, y, aimX, aimY, rotateAngle, isUnderwater, speed, hp, radar)
  {
	this.pos = createVector(x,y);
	this.aimVector = createVector(aimX,aimY);
	this.rotateAngle = rotateAngle;
	this.speed = speed;
	this.hp = hp;
	this.radar = radar;
  }
  
  this.update = function()
  {
    this.makeBubbles(this.pos.x - (this.shipLength/2 -5)*cos(this.rotateAngle), this.pos.y - (this.shipLength/2 -5)*sin(this.rotateAngle));

    this.move();
    this.pos.add(this.vel);
    this.vel.add(this.acc);
    this.acc.mult(0);
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
}