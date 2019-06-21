function ServerShip(id, x, y, aimX, aimY)
{
  this.id = id;
  this.type = "submarine";
  this.spawn = createVector(x,y);
  this.pos = createVector(x,y);
  this.vel = createVector();
  this.acc = createVector();
  this.aimVector = createVector(aimX,aimY);
  
  this.speed = 0;
  this.bubbles = [];
  this.isUnderwater = false;

  this.gunBattery = [];
  this.color = [51, 151];
  
  if(this.type == "submarine")
  {
    this.shipLength = 350;
    this.shipWidth = 50;
    this.gunBattery[0] = new GunBattery(75,0, 20, 2, 5, this.color);
    this.gunBattery[0].createGunBattery(this.spawn);
    this.gunBattery[1] = new GunBattery(-75,0, 20, 2, 5, this.color);
    this.gunBattery[1].createGunBattery(this.spawn);
  }
  else
  {
    return;
  }

  this.count = 0;
  
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
    }
    
    text(this.speed, 10, 30);
  }
  
  this.update = function()
  {
    this.makeBubbles(this.pos.x - (this.shipLength/2 -5)*cos(this.rotateAngle), this.pos.y - (this.shipLength/2 -5)*sin(this.rotateAngle));

    translate(this.pos.x, this.pos.y);
    rotate(this.rotateAngle);
    
    this.move();
    this.pos.add(this.vel);
    this.vel.add(this.acc);
    this.acc.mult(0);

  }
  
  this.setAimVector = function(vec)
  {
    this.aimVector = vec;
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


