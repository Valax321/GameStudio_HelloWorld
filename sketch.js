var DELTATIME = 1 / 60;

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
        loadJSON(particleTemplate, (template) =>
        {
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
        for (var i = 0; i < this.instances.length; i++)
        {
            //Iterate over each instance and move it.
        }
    }
}

class ParticleInstance
{
    constructor(x, y, system)
    {
        this.x = x;
        this.y = y;
        this.system = system;
        this.collide = getSingleValueProperty(system.template, "collide");
        this.radius = getSingleValueProperty(system.template, "radius");
        this.lifetime = getNumberProperty(system.template, "lifetime");
    }

    draw()
    {
        push();
        pop();
    }
}

var time = 0;
var cameraRot;
var devTexture;
var particleTest;

function preload()
{
    devTexture = loadImage("assets/textures/devtexture.png");
    particleTest = new ParticleSystem("assets/particles/particle_test.json");
}

function setup()
{
    createCanvas(windowWidth, windowHeight);
}

function windowResized()
{
    resizeCanvas(windowWidth, windowHeight);
}

function draw()
{
    background('#383838');
}
