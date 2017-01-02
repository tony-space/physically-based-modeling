'use strict';

if (typeof module !== 'undefined')
    var Matrix = require('./matrix');

var Particle = class {
    constructor(config) {
        this.mass = config.mass || 1;
        this.position = config.position.clone();
        this.velocity = config.velocity.clone();
        this.force = Matrix.createVector([0, 0]);
        
        this._simulation = null;

        if (typeof document === 'undefined')
            return;

        const svgns = 'http://www.w3.org/2000/svg';
        this._circle = document.createElementNS(svgns, 'circle');
        this._circle.setAttribute('r', (this.mass / 10).toString());
        this.updateVisual();
        document.getElementById('plot').appendChild(this._circle);
    }

    setSimulation(sim) {
        this._simulation = sim;
    }

    updateVisual() {
        if (!this._circle) return;

        this._circle.setAttribute('cx', this.position.getValue(0, 0).toFixed(2));
        this._circle.setAttribute('cy', this.position.getValue(1, 0).toFixed(2));
    }
}

if (typeof module !== 'undefined')
    module.exports = Particle;