'use strict';

if (typeof require !== 'undefined') {
    var Matrix = require('./matrix');
    var Simulation = require('./simulation');
    var Particle = require('./particle');
    var Constraint = require('./constraint');
}

let simulation = new Simulation();

simulation.addParticle(new Particle({
    mass: 1,
    position: Matrix.createVector([0, 0]),
    velocity: Matrix.createVector([0, 0])
}));

simulation.addParticle(new Particle({
    mass: 1,
    position: Matrix.createVector([1, 0]),
    velocity: Matrix.createVector([0, 0])
}));

simulation.addParticle(new Particle({
    mass: 1,
    position: Matrix.createVector([2, 0]),
    velocity: Matrix.createVector([0, 0])
}));

simulation.addParticle(new Particle({
    mass: 1,
    position: Matrix.createVector([3, 0]),
    velocity: Matrix.createVector([0, 0])
}));

simulation.addConstraint(Constraint.Nail(0, Matrix.createVector([-1, -1])));
simulation.addConstraint(Constraint.Nail(0, Matrix.createVector([1, -1])));

simulation.addConstraint(Constraint.Stick(0, 1));
simulation.addConstraint(Constraint.Stick(1, 2));
simulation.addConstraint(Constraint.Stick(2, 3));

let lastTime = Date.now();

setInterval(function () {    
    let q = simulation.q;
    let v = simulation.v;
    simulation.computeForces();    
    let a = simulation.a;
    
    let curTime = Date.now();
    let dt = Math.min((curTime - lastTime) / 1000.0, 0.001);
    lastTime = curTime;

    q = q.add(v.mult(dt));
    v = v.add(a.mult(dt));
    simulation.q = q;
    simulation.v = v;
}, 0);