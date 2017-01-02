'use strict';

if (typeof require !== 'undefined')
    var Matrix = require('./matrix');

var Constraint = class {
    constructor() {
        this._simulation = null;
    }

    setSimulation(sim) {
        this._simulation = sim;
    }

    updateVisual() {

    }

    static Nail(particle, staticPoint) {
        return new Nail(particle, staticPoint);
    }

    static Stick(particle1, particle2) {
        return new Stick(particle1, particle2);
    }
}

class Nail extends Constraint {
    constructor(index, staticPoint) {
        super();
        this._index = 0;
        this._staticPoint = staticPoint;
    }

    setSimulation(sim) {
        super.setSimulation(sim);

        let particle = sim.getParticle(this._index);

        let delta = particle.position.sub(this._staticPoint);
        this._distanceSquared = delta.dot(delta);
    }

    compute(q) {
        const dimensions = this._simulation.dimensions;

        let position = new Array(dimensions);
        for (let i = 0; i < dimensions; ++i)
            position[i] = q.getValue(this._index * dimensions + i, 0);

        position = Matrix.createVector(position);
        let delta = position.sub(this._staticPoint);
        return delta.dot(delta) - this._distanceSquared;
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

        if (typeof document === 'undefined')
            return;

        const svgns = 'http://www.w3.org/2000/svg';
        this._line = document.createElementNS(svgns, 'line');
        this._line.setAttribute('stroke', 'red');
        this._line.setAttribute('stroke-width', '0.05');
        this.updateVisual();
        document.getElementById('plot').appendChild(this._line);
    }

    updateVisual() {
        let p1 = this._simulation.getParticle(this._index1);
        let p2 = this._simulation.getParticle(this._index2);

        if (!this._line) return;
        this._line.setAttribute('x1', p1.position.getValue(0, 0).toFixed(2));
        this._line.setAttribute('y1', p1.position.getValue(1, 0).toFixed(2));

        this._line.setAttribute('x2', p2.position.getValue(0, 0).toFixed(2));
        this._line.setAttribute('y2', p2.position.getValue(1, 0).toFixed(2));
    }

    compute(q) {
        const dimensions = this._simulation.dimensions;

        let pos1 = new Array(dimensions);
        let pos2 = new Array(dimensions);

        for (let i = 0; i < dimensions; ++i) {
            pos1[i] = q.getValue(this._index1 * dimensions + i, 0);
            pos2[i] = q.getValue(this._index2 * dimensions + i, 0);
        }

        let delta = Matrix.createVector(pos1).sub(Matrix.createVector(pos2));
        return delta.dot(delta) - this._distanceSquared;
    }

}

if (typeof module !== 'undefined')
    module.exports = Constraint;