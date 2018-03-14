const Constants =
{
    gravity: {x: 0, y: 918},
    deltaTime: 1 / 60
}

var timeScale = 1;

function scaledDeltaTime()
{
    return (1 / getFrameRate()) * timeScale;
}

function clamp(value, min, max)
{
    if (value >= max) return max;
    else if (value <= min) return min;
    else return value;
}

/**
 * Get a random number from a template.
 * @param template The template object to get the number from.
 * @param parameter The parameter string
 */
function getNumberProperty(template, parameter)
{
    if (template[parameter] !== null)
    {
        var count = template[parameter];
        if (Array.isArray(count))
        {
            return random(count[0], count[1]);
        }
        else
        {
            return count;
        }
    }
}

/**
 * Get an object from a template.
 * @param template The template object to get the number from.
 * @param parameter The parameter string
 */
function getObjectProperty(template, parameter)
{
    if (template[parameter] !== null)
    {
        var arr = template[parameter];
        if (Array.isArray(arr))
        {
            return random(arr);
        }
        else
        {
            return arr;
        }
    }
}

/**
 * Get a vector from a template.
 * NOTE: this vector doesn't have p5.js's vector prototype, so you can't call functions on it.
 * @param template The template object to get the number from.
 * @param parameter The parameter string
 */
function getVectorProperty(template, parameter)
{
    if (template[parameter] !== null)
    {
        var arr = template[parameter];
        if (Array.isArray(arr))
        {
            return createVector(random(arr[0].x, arr[1].x), random(arr[0].y, random(arr[1].y)));
        }
        else
        {
            return createVector(arr.x, arr.y);
        }
    }
}

function templateHasProperty(template, parameter)
{
    return template[parameter] !== null;
}

/**
 * Get a non-random single value from a template.
 * @param template The template object to get the number from.
 * @param parameter The parameter string
 */
function getSingleValueProperty(template, parameter)
{
    if (template[parameter] !== null)
    {
        return template[parameter];
    }
}

function groundRect()
{
    return {x: 0, y: windowHeight - 80, width: windowWidth, height: 80}
}

/**
 * Data storage for a particle system.
 */
class ParticleSystem
{
    constructor(particleTemplate)
    {
        //this.template = particleTemplate;
        loadJSON(particleTemplate, (template) =>
        {
            this.template = template;
            this.texture = loadImage(getSingleValueProperty(template, "texture"));
        });

        this.instances = [];
    }

    spawnInstance(x, y)
    {
        var count = getNumberProperty(this.template, "count");
        for (var i = 0; i < count; i++)
        {
            this.instances.push(new ParticleInstance(x, y, this));
        }
    }

    draw()
    {
        var instancesToRemove = [];
        for (var i = 0; i < this.instances.length; i++)
        {
            //Iterate over each instance and move it.
            if (this.instances[i].draw())
            {
                instancesToRemove.push(this.instances[i]);
            }
        }

        if (instancesToRemove.length > 0)
        {
            /*
            Technique to remove multiple objects from an array without a for loop from:
            https://stackoverflow.com/questions/5767325/how-do-i-remove-a-particular-element-from-an-array-in-javascript
            */
            this.instances = this.instances.filter(item => !instancesToRemove.includes(item)); //TODO: recent JS addition, does it work everywhere?
        }
    }
}

/**
 * Instance of a particle in a system.
 */
class ParticleInstance
{
    constructor(x, y, system)
    {
        this.position = createVector(x, y);
        this.system = system;
        this.collide = getSingleValueProperty(system.template, "collide");
        this.gravity = getSingleValueProperty(system.template, "gravity");
        this.radius = getNumberProperty(system.template, "radius");
        this.lifetime = getNumberProperty(system.template, "lifetime");
        this.velocity = getVectorProperty(system.template, "velocity");
        //this.color = getObjectProperty(system.template, "color"); //Color doesn't work well, as tint() has awful performance.
        this.rotation = getNumberProperty(system.template, "startRotation");
        this.rotationRate = getNumberProperty(system.template, "rotationRate");
        this.bounceScale = getNumberProperty(system.template, "bounceScale");
        //this.imageSize = {x: system.texture.width, y: system.texture.height};
        this.time = 0;
    }

    lifetimeScale()
    {
        return clamp(this.time / this.lifetime, 0, 1);
    }

    // NOTE: p5.js's _getTintedImageCanvas() is a joke. It loops over every pixel using the CPU and tints it on another canvas.
    // https://gist.github.com/mattdesl/1d734646184649c8bd8d //Blend mode version.
    // https://www.sitepoint.com/parallel-javascript-with-paralleljs/ multithreading insanity method.
    draw()
    {
        push();
        imageMode(CENTER);
        translate(this.position.x, this.position.y);
        rotate(this.rotation);
        scale(this.radius);
        //console.time('image');
        image(this.system.texture, 0, 0);
        //console.timeEnd('image');
        pop();

        var size = this.radius * 2 * this.system.texture.width;

        if (this.gravity)
        {
            //Add delta scaled gravity to the velocity this frame
            var move = createVector(Constants.gravity.x * scaledDeltaTime(), Constants.gravity.y * scaledDeltaTime());
            this.velocity.add(move);
        }
        var move2 = createVector(this.velocity.x * scaledDeltaTime(), this.velocity.y * scaledDeltaTime()); //How far to move based on velocity
        var newPosition = p5.Vector.add(this.position, move2);
        var ground = groundRect();
        if (this.collide && collideRectCircle(ground.x, ground.y, ground.width, ground.height, newPosition.x, newPosition.y, this.radius))
        {
            this.position.add(createVector(move2.x, move2.y * -this.bounceScale));
            this.velocity.y *= -this.bounceScale; //Lazy! Reflect on the Y axis if we hit the grond (collision doesn't return a normal to properly reflect off)
        }
        else
        {
            this.position.add(move2);
        }
        this.rotation += this.rotationRate * scaledDeltaTime();
        this.time += scaledDeltaTime();
        if (this.time >= this.lifetime || this.position.x < -size || this.position.x > windowWidth + size) //If we go off-screen, destroy immediately.
        {
            return true;
        }
        else return false;
    }
}

var time = 0;
var cameraRot;
var devTexture;
var particleTest;
var smoke;

var lowRumbleOsc;
var rumbleIdleFreq = 50;
var rumbleHitFreq = 5000;
var desiredRumbleFreq = rumbleIdleFreq;
var rumbleDecaySpeed = 10000;

function preload()
{
    devTexture = loadImage("assets/textures/devtexture.png");
}

function setup()
{
    createCanvas(windowWidth, windowHeight);
    angleMode(DEGREES);
    lowRumbleOsc = new p5.Oscillator();
    lowRumbleOsc.setType('triangle');
    lowRumbleOsc.freq(desiredRumbleFreq);
    lowRumbleOsc.amp(0.3);
    lowRumbleOsc.start();
    particleTest = new ParticleSystem("assets/particles/particle_test.json");
    smoke = new ParticleSystem("assets/particles/smoke.json");
}

function windowResized()
{
    resizeCanvas(windowWidth, windowHeight);
}

var currentBackgroundColor = [56, 56, 56];
var desiredBackgroundColor = [56, 56, 56];
var fadeSpeed = 500;

function stepColor()
{
    for (var i = 0; i < 3; i++)
    {
        currentBackgroundColor[i] = clamp(currentBackgroundColor[i] - fadeSpeed * scaledDeltaTime(), desiredBackgroundColor[i], 255);
    }
}

function stepAudio()
{
    desiredRumbleFreq = clamp(desiredRumbleFreq - rumbleDecaySpeed * scaledDeltaTime(), rumbleIdleFreq, rumbleHitFreq);
    lowRumbleOsc.freq(desiredRumbleFreq);
}

function draw()
{
    rectMode(CORNER);
    ellipseMode(CENTER);
    stepColor();
    stepAudio();
    background(color(currentBackgroundColor[0], currentBackgroundColor[1], currentBackgroundColor[2]));

    /*
    This did a superhot-like time slowdown when you weren't moving the mouse.
    I turned it off because it was pretty pointless
    */
    //var lastMPos = createVector(pmouseX / windowWidth, pmouseY / windowHeight);
    //var curMPos = createVector(mouseX / windowWidth, mouseY /  windowHeight);
    //var mSpeed = p5.Vector.sub(curMPos, lastMPos).mag() * getFrameRate();

    //timeScale = lerp(0.05, 1, clamp(mSpeed * 0.3, 0, 1));
    //timeScale = 1;

    smoke.draw();
    particleTest.draw();
    var ground = groundRect();
    rect(ground.x, ground.y, ground.width, ground.height);
}

function mousePressed()
{
    smoke.spawnInstance(mouseX, mouseY);
    particleTest.spawnInstance(mouseX, mouseY);
    currentBackgroundColor = [255, 165, 0];
    desiredRumbleFreq = rumbleHitFreq;
    return false;
}
