function torpedoTube(x, y){
  this.pos = createVector(x, y);
  
  this.shoot = function(location, aimDirection, shipAngle, vel, canvas) 
  {
    var aim = createVector(aimDirection.x, aimDirection.y);
    var aimAngle = aim.heading();
    aim.rotate(shipAngle)
    
    var batteryPos = createVector(this.pos.x, this.pos.y);
    var rotatedPos = batteryPos.rotate(shipAngle);
    
    var destination = p5.Vector.add(location, aim);
    
    var tube = this.getBarrelLocation(this.pos, location, rotatedPos, shipAngle, aimAngle);
    
    return new Torpedo(tube, destination, vel, shipAngle, true);
  }
  
  
  this.getBarrelLocation = function(relativeGunLocation, shipLocation, batteryPos, shipAngle,aimAngle)
  {
      var barrelInitial = createVector(relativeGunLocation.x, relativeGunLocation.y);
      barrelInitial.rotate(shipAngle);
      
      var barrel = p5.Vector.add(shipLocation, barrelInitial);
      
      return barrel;
  }
}