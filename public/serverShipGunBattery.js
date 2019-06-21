function ServerGunBattery(x, y, size, numberOfGuns, spacing, color) 
{
  this.pos = createVector(x, y);
  this.offset = createVector(0, 0);
  this.size = size;
  this.numberOfGuns = numberOfGuns;
  this.spacing = spacing;
  this.weaponView;
  this.caliber = 3;
  this.bulletSpeed = 10;
  this.gunPos = [];

  this.createGunBattery = function(vector) {
    this.offset = vector;
    this.weaponView = createGraphics(displayWidth, displayWidth);
    this.weaponView.ellipseMode(CENTER);
    this.drawGunBattery(this.weaponView, color[1]);
  }

  this.show = function(state, aim) {
    push()
    translate(this.pos.x, 0);
    if (state == "abovewater") 
    {
      rotate(aim.heading());
      image(this.weaponView, -this.offset.x - this.pos.x, -this.offset.y);
    } 
    else if (state == "underwater") 
    {
      image(this.submergedView, -this.offset.x - this.pos.x, -this.offset.y);
    }
    pop();
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
          var x = this.offset.x + this.pos.x;
          var y = this.offset.y;
          this.createGun(x, y, 0, view);
        } 
        else 
        {
          //create gun 1 space up 
          var x = this.offset.x + this.pos.x;
          var y = this.offset.y - spacing;
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
        var x = this.offset.x + this.pos.x;
        var y = this.offset.y - spacing;
        this.createGun(x, y, -spacing, view);

        //create gun 1 space down 
        y = this.offset.y + spacing;
        this.createGun(x, y, +spacing, view);
      }
    }
    view.fill(color);
    view.ellipse(this.offset.x + this.pos.x, this.offset.y - this.pos.y, this.size, this.size);
  }
  
  this.createGun = function(x, y, spacing, canvas)
  {
    this.drawGun(x, y, this.size, canvas);
    var gunLocation = createVector(this.size, spacing);
    this.gunPos.push(gunLocation);
  }

  this.drawGun = function(x, y, size, view) 
  {
    view.push();
    view.stroke('black');
    view.strokeWeight(this.caliber);

    let v0 = createVector(x, y);
    let t0 = createVector(x + size, y);
    view.line(v0.x, v0.y, t0.x, t0.y);
    view.pop();
  }
}