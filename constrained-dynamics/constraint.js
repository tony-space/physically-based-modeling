'use strict';

if (typeof require !== 'undefined')
    var Matrix = require('./matrix');

class Constraint {
    constructor() {
        this._simulation = null;
    }

    setSimulation(sim) {
        this._simulation = sim;
    }

    static Nail(particle) {
        return new Nail(particle);
    }

    static Stick(particle1, particle2) {
        return new Stick(particle1, particle2);
    }

    compute() {
        throw new Error('abstract method invocation');
    }
}

class Nail extends Constraint {
    constructor(index) {
        super();
        this._index = 0;
    }

    setSimulation(sim) {
        super.setSimulation(sim);

        let particle = sim.getParticle(this._index);

        this._restPosition = particle.position.clone();
    }

    compute(q) {
        const dimensions = this._simulation.dimensions;

        let position = new Array(dimensions);
        for (let i = 0; i < dimensions; ++i)
            position[i] = q.getValue(this._index * dimensions + i, 0);

        let delta = Matrix.createVector(position).sub(this._restPosition);
        return delta.dot(delta);
    }
}

class Stick extends Constraint {
    constructor(index1, index2) {
        super();
        this._index1 = index1;
        this._index2 = index2;
    }

    setSimulation(sim) {
        super.setSimulation(sim);

        let particle1 = sim.getParticle(this._index1);
        let particle2 = sim.getParticle(this._index2);

        let delta = particle1.position.sub(particle2.position);
        this._distanceSquared = delta.dot(delta);
    }

    compute(q) {
        const dimensions = this._simulation.dimensions;
        
        let pos1 = new Array(dimensions);
        let pos2 = new Array(dimensions);
        
        for(let i = 0; i < dimensions; ++i){
            pos1[i] = q.getValue(this._index1 * dimensions + i, 0);
            pos2[i] = q.getValue(this._index2 * dimensions + i, 0);
        }

        let delta = Matrix.createVector(pos1).sub(Matrix.createVector(pos2));
        return delta.dot(delta) - this._distanceSquared;
    }
}

if (typeof module !== 'undefined')
    module.exports = Constraint;