var time = 0;
var cameraRot;

function preload()
{

}

function setup()
{
  createCanvas(windowWidth, windowHeight, WEBGL);
  cameraRot = createVector(0, 0, 0);
}

function windowResized()
{
  resizeCanvas(windowWidth, windowHeight);
}

function draw()
{
  time += 1 / 60; //60 is default update rate
  background(abs(sin(time) * 1.5) * 256, abs(cos(time)) * 256, abs(sin(time) * 0.5) * 256);
  var cameraDist = lerp(0, 600, sin(time));
  var camPos = p5.Vector.mult(cameraRot, cameraDist);
  var forward = p5.Vector.sub(camPos, createVector(0, 0, 0)).normalize();
  var right = p5.Vector.cross(forward, createVector(0, 1, 0));
  var up = p5.Vector.cross(forward, right);
  camera(camPos.x, camPos.y, camPos.z, 0, 0, 0, up.x, up.y, up.z);
  fill(128, 80, 0);
  box(50);
}
