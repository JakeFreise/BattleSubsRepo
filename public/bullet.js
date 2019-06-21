function Bullet(location, destination,fireVel, speed, caliber, isOwnedByPlayer)
{
  this.pos = createVector(location.x, location.y);
  this.des = createVector(destination.x, destination.y);
  this.startingVel = createVector(fireVel.x, fireVel.y);
  this.vel = createVector(fireVel.x, fireVel.y);
  this.fireForce = p5.Vector.sub(destination, location);
  this.acc = createVector(0,0);
  this.speed = speed;
  this.caliber = caliber;
  this.isSplashed = false;
  this.isDoneSplashing = 0;
  this.currentSplash = 0;
  this.maxSplash = 100;
  this.fireForce.setMag(1);
  
  this.isMine = isOwnedByPlayer;
  
  this.applyForce = function(f)
  {
    this.acc.add(f);
    //print("FIRED")
  }

  this.applyForce(this.fireForce);
  
   this.show = function(canvas)
   {
      //canvas.line(this.pos.x, this.pos.y, this.des.x, this.des.y);
      canvas.ellipse(this.pos.x, this.pos.y, this.caliber, this.caliber);
   }
  
   this.update = function()
   {
     this.pos.add(this.vel);
     this.vel.add(this.acc);
     this.vel.limit(this.speed);
     
     var distance = this.des.dist(this.pos);
     
     if((distance <= this.caliber+40 && !this.isSplashed) || distance>10000)
     {
       this.isSplashed = true;
       
       if(this.isMine)
       {
        emitExplosion(this.pos, 50, 1);
       }
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
     return new Bubble(this.des.x,this.des.y, this.currentSplash, (this.maxSplash-this.currentSplash)/this.maxSplash, "splash");
   }
   
   
}