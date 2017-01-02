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

//box
simulation.addParticle(new Particle({
    mass: 1,
    position: Matrix.createVector([4, 0]),
    velocity: Matrix.createVector([0, 0])
}));

simulation.addParticle(new Particle({
    mass: 1,
    position: Matrix.createVector([5, 1]),
    velocity: Matrix.createVector([0, 0])
}));

simulation.addParticle(new Particle({
    mass: 1,
    position: Matrix.createVector([7, 0]),
    velocity: Matrix.createVector([0, 0])
}));

simulation.addParticle(new Particle({
    mass: 1,
    position: Matrix.createVector([6, -1]),
    velocity: Matrix.createVector([0, 0])
}));

simulation.addConstraint(Constraint.Nail(0, Matrix.createVector([-1, -1])));
simulation.addConstraint(Constraint.Nail(0, Matrix.createVector([1, -1])));

//chain
simulation.addConstraint(Constraint.Stick(0, 1));
simulation.addConstraint(Constraint.Stick(1, 2));
simulation.addConstraint(Constraint.Stick(2, 3));

simulation.addConstraint(Constraint.Stick(3, 4));

//box
simulation.addConstraint(Constraint.Stick(4, 5));
//simulation.addConstraint(Constraint.Stick(4, 6));
simulation.addConstraint(Constraint.Stick(4, 7));
simulation.addConstraint(Constraint.Stick(5, 6));
simulation.addConstraint(Constraint.Stick(5, 7));
simulation.addConstraint(Constraint.Stick(6, 7));

let lastTime = Date.now();

let timer = setInterval(function () {
    try {
        let q = simulation.q;
        let v = simulation.v;
        simulation.computeForces();
        let a = simulation.a;

        let curTime = Date.now();
        let dt = Math.min((curTime - lastTime) / 1000.0, 0.005);
        lastTime = curTime;

        q = q.add(v.mult(dt));
        v = v.add(a.mult(dt));
        simulation.q = q;
        simulation.v = v;
    }
    catch(ex){
        console.log(ex.message);
        clearInterval(timer);
    }
}, 0);