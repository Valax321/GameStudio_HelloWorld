Particle Demo created by Andrew Castillo
-----------------------------------------------------------

Uses the p5.collide2D library for particle collision detection.

HOW TO PLAY: click anywhere on-screen to spawn a particle effect.

Particle systems are controlled by json files that specify parameters like velocity, gravity, rotation and texture.
They use an object-oriented model where each particle instance is responsible for drawing itself.

The demo uses some newer JS features such as Java-style classes, so it might not work on older browser versions.

ISSUES
-----------------------------------------------------------

The main issue I had was that p5.js's tint() function has very bad performance, so I wasn't able to tint each particle at runtime.
All colour information had to be part of its texture. This occurs because web technologies aren't well made, and JavaScript's canvas
system has no support for hardware tinting. p5.js gets around this by implementing a very inefficient method on the CPU that iterates
over every pixel in the source image, multiplies its colour and then writes it to another canvas. Unfortunately, this is a limitation
of p5.js that I wouldn't be able to realistically fix without editing the library itself.
