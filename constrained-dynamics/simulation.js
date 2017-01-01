'use strict';

if (typeof require !== 'undefined')
    var Matrix = require('./matrix');

class Simulation {
    constructor() {
        this._particles = [];
        this._constrants = [];
    }

    get dimensions() {
        return 2;
    }

    get epsilon() {
        return 1e-6;
    }

    addParticle(particle) {
        this._particles.push(particle);
    }

    addConstraint(constraint) {
        this._constrants.push(constraint);
        constraint.setSimulation(this);
    }

    getParticle(index) {
        if (index < 0 || index > this._particles.length)
            throw new RangeError('invalid index');
        return this._particles[index];
    }

    get q() {
        let result = new Array(this._particles.length * this.dimensions);

        this._particles.forEach((p, i) => {
            result[i * this.dimensions] = p.x;
            result[i * this.dimensions + 1] = p.y;
        })

        return Matrix.createVector(result);
    }

    get v() {
        let result = new Array(this._particles.length * this.dimensions);

        this._particles.forEach((p, i) => {
            result[i * this.dimensions] = p.vx;
            result[i * this.dimensions + 1] = p.vy;
        })

        return Matrix.createVector(result);
    }

    jacobian(q) {
        let result = new Matrix(this._constrants.length, this.dimensions * this._particles.length);

        for (let i = 0; i < q.rows; ++i) {
            let left = q.clone();
            let right = q.clone();

            left.setValue(i, 0, q.getValue(i, 0) - this.epsilon);
            right.setValue(i, 0, q.getValue(i, 0) + this.epsilon);

            this._constrants.forEach((c, j) => {
                result.setValue(j, i, (c.compute(right) - c.compute(left)) / (2 * this.epsilon));
            });
        }

        return result;
    }

    validate() {
        let c = Matrix.createVector(this._constrants.map(c => c.value));
    }
}

if (typeof module !== 'undefined')
    module.exports = Simulation;