function Bubble(x, y, size, turbulence, type)
{
  this.turbulence = turbulence; 
  this.pos = createVector(x,y);
  this.size = size;
  this.bubbleType = 0;
  if(type == "splash")
  {
    this.bubbleType = 1;
  }
  
  this.show = function(canvas, color)
  {
    if(this.bubbleType == 1)
    {
      canvas.fill(51);
      bubbleCanvas.stroke(3);
    }
    else
    {
      bubbleCanvas.noStroke();
    }
    canvas.fill(color);
    //canvas.ellipse(this.pos.x, this.pos.y, 100, 100);
    canvas.ellipse((this.pos.x), this.pos.y, this.size, this.size);
    this.turbulence-= 0.001;
    this.size+=.05;
  }
}
