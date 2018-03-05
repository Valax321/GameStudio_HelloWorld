const Constants =
{
    gravity: {x: 0, y: 91.8},
    deltaTime: 1 / 60
}

function clamp(value, min, max)
{
    if (value => max) return max;
    else if (value <= min) return min;
    else return value;
}

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

function getSingleValueProperty(template, parameter)
{
    if (template[parameter] !== null)
    {
        return template[parameter];
    }
}

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

class ParticleInstance
{
    constructor(x, y, system)
    {
        this.position = createVector(x, y);
        this.system = system;
        this.collide = getSingleValueProperty(system.template, "collide");
        this.radius = getNumberProperty(system.template, "radius");
        this.lifetime = getNumberProperty(system.template, "lifetime");
        this.velocity = getVectorProperty(system.template, "velocity");
        //this.color = getObjectProperty(system.template, "color"); //Color doesn't work well, as tint() has awful performance.
        this.rotation = getNumberProperty(system.template, "startRotation");
        this.rotationRate = getNumberProperty(system.template, "rotationRate");
        //this.imageSize = {x: system.texture.width, y: system.texture.height};
        this.time = 0;
    }

    lifetimeScale()
    {
        return clamp(this.time / this.lifetime, 0, 1);
    }

    draw()
    {
        push();
        imageMode(CENTER);
        translate(this.position.x, this.position.y);
        rotate(this.rotation);
        scale(this.radius);
        //tint(200, 100, 0);
        image(this.system.texture, 0, 0);
        pop();
        var move = createVector(Constants.gravity.x * Constants.deltaTime, Constants.gravity.y * Constants.deltaTime);
        this.velocity.add(move);
        this.position.add(this.velocity);
        this.rotation += this.rotationRate * Constants.deltaTime;
        this.time += Constants.deltaTime;
        if (this.time >= this.lifetime)
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

function preload()
{
    devTexture = loadImage("assets/textures/devtexture.png");
}

function setup()
{
    createCanvas(windowWidth, windowHeight);
    angleMode(DEGREES);
    particleTest = new ParticleSystem("assets/particles/particle_test.json");
}

function windowResized()
{
    resizeCanvas(windowWidth, windowHeight);
}

function draw()
{
    background('#383838');
    particleTest.draw();
}

function mousePressed()
{
    particleTest.spawnInstance(mouseX, mouseY);
    return false;
}
