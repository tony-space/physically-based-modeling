'use strict';

if(typeof require !== 'undefined'){
    var Matrix = require('./matrix');
    var Simulation = require('./simulation');
    var Particle = require('./particle');
    var Constraint = require('./constraint');
}

let simulation = new Simulation();

simulation.addParticle(new Particle({
    mass: 2,
    position: Matrix.createVector([0, 0]),
    velocity: Matrix.createVector([0, 0])
}));

simulation.addParticle(new Particle({
    mass: 3,
    position: Matrix.createVector([5, 0]),
    velocity: Matrix.createVector([0, -5])
}));

simulation.addParticle(new Particle({
    mass: 5,
    position: Matrix.createVector([7, 0]),
    velocity: Matrix.createVector([0, -7])
}));

simulation.addConstraint(Constraint.Nail(0));
simulation.addConstraint(Constraint.Stick(0, 1));
simulation.addConstraint(Constraint.Stick(1, 2));

let j = simulation.jacobian(simulation.q);