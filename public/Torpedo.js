function Torpedo(location, destination,fireVel, shipAngle, ownedByPlayer)
{
  
  this.pos = createVector(location.x, location.y);
  this.des = createVector(destination.x, destination.y);
  this.vel = createVector(fireVel.x, fireVel.y);
  this.fireForce = p5.Vector.sub(destination, location);
  this.acc = createVector(0,0);

  this.maxSpeed = 4;
  this.torpedoLength = 25;
  this.torpedoWidth = 10;
  this.bubbles = [];
  
  this.isSplashed = false;
  this.isDoneSplashing = 0;
  this.currentSplash = 0;
  this.maxSplash = 250;
  this.fireForce.setMag(.01);
  
  this.missPos;
  this.missed = 0;
  
  this.angle = shipAngle;
  
  this.isMine = ownedByPlayer;
  
  var distance = this.des.dist(this.pos);
  this.maxRange = distance;
 

  this.applyForce = function(f)
  {
    this.acc.add(f);
    print("FIRED")
  }

  this.applyForce(this.fireForce);
  
   this.show = function(canvas)
   {
      if(!this.isSplashed && this.isMine)
      {
        if(this.missed)
        {
          canvas.push();
          canvas.stroke('red');
          canvas.line(this.missedPos.x, this.missedPos.y, this.des.x, this.des.y);
          canvas.pop();
        }
        else
        {
          //canvas.stroke('black');
          canvas.line(this.pos.x, this.pos.y, this.des.x, this.des.y);
        }
      }
   }
  
   this.update = function()
   {
     this.makeBubbles(this.pos.x, this.pos.y);
     var distance = this.des.dist(this.pos);
     
     if((distance <= 10 && !this.isSplashed) || this.missed)
     {
       this.isSplashed = true;
       if(this.isMine)
       {
        emitExplosion(this.pos, this.maxSplash, 2);
       } 
     }
     else if(distance>10)
     {
       var yDiff = abs(this.pos.y - this.des.y);
       var xDiff = abs(this.pos.x - this.des.x);

       var angle = abs(degrees(this.angle));
       var shipVer = angle >=45 && angle <=135;
       var shipHor = angle <=45 || angle >=135;
       
       if((xDiff < 5 && shipVer) || (yDiff < 5 && shipHor) && !this.missed)
       {
        this.missed = 1;
        this.missedPos = createVector(this.pos.x, this.pos.y);
       }
      
       this.pos.add(this.vel);
       this.vel.add(this.acc);
       this.vel.limit(this.maxSpeed);
     }
     
     if(this.isSplashed && !this.isDoneSplashing)
     {
       this.currentSplash++;
       if(this.currentSplash>=this.maxSplash)
       {
         this.isDoneSplashing = true;
       }
     }
   }
   
   this.splash = function()
   {
     return new Bubble(this.pos.x,this.pos.y, this.currentSplash, (this.maxSplash-this.currentSplash)/this.maxSplash, "splash");
   }
   
  this.makeBubbles = function(x,y)
  {
    var turbulence;

    turbulence = map(this.vel.mag(), 0, 4, .3, 1);

    var b = new Bubble(x,y,(this.bubbles.length/100),turbulence);
    this.bubbles.push(b);
    
    if(this.bubbles.length > map(turbulence, 0, 1, 0, 25))
    {
      this.bubbles.splice(0,1)
    }
  }
}