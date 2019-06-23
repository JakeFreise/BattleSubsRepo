function GunBattery(x, y, size, numberOfGuns, spacing, color) {
  this.pos = createVector(x, y);
  this.offset = createVector(100, 100);
  this.size = size;
  this.numberOfGuns = numberOfGuns;
  this.currentGun = 0;
  this.spacing = spacing;
  this.weaponView;
  this.submergedView;
  this.caliber = 3;
  this.bulletSpeed = 10;
  //this.color = [];
  this.gunPos = [];

  this.createGunBattery = function(vector) {
    //this.offset = 100;
    this.weaponView = createGraphics(130, 130);
    this.submergedView = createGraphics(130, 130);
    this.weaponView.ellipseMode(CENTER);
    this.drawGunBattery(this.weaponView, color[1]);
    this.drawGunBattery(this.submergedView, color[0]);
  }

  this.show = function(state, aim) {
    push();
    translate(this.pos.x, 0);
    if (state == "abovewater") 
	{
      rotate(aim.heading());
      image(this.weaponView, -100, -100);
    } 
	else if (state == "underwater") 
	{
      image(this.submergedView, -this.offset.x, -this.offset.y);
    }
    pop();
  }

  this.shoot = function(location, aimDirection, shipAngle, vel, canvas) {

    var batteryPos = createVector(this.pos.x, this.pos.y);
    var rotatedPos = batteryPos.rotate(shipAngle);
    
    var aim = createVector(aimDirection.x, aimDirection.y);
    var aimAngle = aim.heading();
    aim.rotate(shipAngle);
    
    var destination = p5.Vector.add(location, aim);
    //var target = p5.Vector.add(rotatedPos, destination);
    
    
    if(this.currentGun <= this.numberOfGuns-1)
    {
      var barrel = this.getBarrelLocation(this.gunPos[this.currentGun], location, rotatedPos, shipAngle, aimAngle);
      
      if(this.currentGun == this.numberOfGuns-1)
      {
        this.currentGun = 0;
      }
      else
      {
        this.currentGun++;
      }
    }
    var b = new Bullet(barrel, destination, vel, this.bulletSpeed, this.caliber, true);
    return b;
  }
  
  this.getBarrelLocation = function(relativeGunLocation, shipLocation, batteryPos, shipAngle,aimAngle)
  {
      var barrelInitial = createVector(relativeGunLocation.x, relativeGunLocation.y);
      barrelInitial.rotate(shipAngle);
      barrelInitial.rotate(aimAngle);
      barrelWithShip = p5.Vector.add(barrelInitial, batteryPos);
      var barrel = p5.Vector.add(shipLocation, barrelWithShip);
      
      return barrel;
  }

  this.drawGunBattery = function(view, color) 
  {
    if (numberOfGuns % 2 != 0) //if odd number of guns
    {
      //how many lines + one middle gun
      var lines = floor(this.numberOfGuns / 2) + 1;

      for (var gunCount = 0; gunCount < lines; gunCount++) 
      {
        if (gunCount == 0) //if first gun
        {
          //drawn in the middle (no spacing)
          var x = this.offset.x;
          var y = this.offset.y;
          this.createGun(x, y, 0, view);
        } 
        else 
        {
          //create gun 1 space up 
          var x = this.offset.x;
          var y = this.offset.y;
          this.createGun(x, y, -spacing, view);
  
          //create gun 1 space down 
          y = this.offset.y + spacing;
          this.createGun(x, y, +spacing, view);
  
          //signify we drew 2 at once
          gunCount++;
        }
      }
    } 
    else //even number of guns
    {
      var lines = floor(this.numberOfGuns / 2);

      for (var gunCount = 0; gunCount < lines; gunCount += 2) 
      {
        //create gun 1 space up 
        var x = this.offset.x;
        var y = this.offset.y - spacing;
        this.createGun(x, y, -spacing, view);

        //create gun 1 space down 
        y = this.offset.y + spacing;
        this.createGun(x, y, +spacing, view);
      }
    }
    view.fill(color);
	view.ellipse(100,100,this.size,this.size);
    //view.ellipse(this.offset.x, this.offset.y, this.size, this.size);
  }
  
  this.createGun = function(x, y, spacing, canvas)
  {
    this.drawGun(x, y, this.size, canvas);
    var gunLocation = createVector(this.size, spacing);
    this.gunPos.push(gunLocation);
  }

  this.drawGun = function(x, y, size, view) {
    view.push();
    view.stroke('black');
    view.strokeWeight(this.caliber);

    let v0 = createVector(x, y);
    let t0 = createVector(x + size, y);
    view.line(v0.x, v0.y, t0.x, t0.y);
    view.pop();
  }
}