'use strict';

if (typeof module !== 'undefined')
    var Matrix = require('./matrix');

class Particle {
    constructor(config) {
        this.mass = config.mass || 1;
        this.position = config.position.clone();
        this.velocity = config.velocity.clone();
        this._force = Matrix.createVector([0, 0]);
        this._simulation = null;
    }

    setSimulation(sim) {
        this._simulation = sim;
    }

    get x() {
        return this.position.getValue(0, 0);
    }

    get y() {
        return this.position.getValue(1, 0);
    }

    get vx() {
        return this.velocity.getValue(0, 0);
    }

    get vy() {
        return this.velocity.getValue(1, 0);
    }
}

if (typeof module !== 'undefined')
    module.exports = Particle;