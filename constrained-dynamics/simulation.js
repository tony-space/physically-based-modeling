'use strict';

if (typeof require !== 'undefined')
    var Matrix = require('./matrix');


function derivative(func, arg, epsilon) {
    if (epsilon === undefined)
        epsilon = 1e-6;

    if (typeof arg === 'number') {
        let left = func(arg - epsilon);
        let right = func(arg + epsilon);
        if (typeof left === 'number')
            return (right - left) / (2 * epsilon)
        else if (left instanceof Matrix && left.columns() === 1)
            return right.sub(left).mult(0.5 / epsilon);
        else
            throw new TypeError("not implemented yet");
    }
    else if (arg instanceof Matrix && arg.columns === 1) {
        let result;
        for (let i = 0; i < arg.rows; ++i) {
            let left = arg.clone();
            let right = arg.clone();

            left.setValue(i, 0, left.getValue(i, 0) - epsilon);
            right.setValue(i, 0, right.getValue(i, 0) + epsilon);

            left = func(left);
            right = func(right);

            if (typeof left === 'number') {
                if (!result) result = new Matrix(1, arg.rows());
                result.setValue(0, i, (right - left) / (2 * epsilon));
            }
            else if (left instanceof Matrix && left.columns === 1) {
                if (!result) result = new Matrix(left.rows, arg.rows);
                let deriv = right.sub(left).mult(0.5 / epsilon);
                for (let j = 0; j < deriv.rows; ++j)
                    result.setValue(j, i, deriv.getValue(j, 0));
            }
            else
                throw new TypeError("not implemented yet");
        }
        return result;
    }
    else
        throw new TypeError("not implemented yet");
}

var Simulation = class {
    constructor() {
        this._particles = [];
        this._constrants = [];
    }

    get ks() {
        return 1;
    }

    get kd() {
        return 1;
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

    computeForces() {
        const kd = -0.5;
        const gravity = Matrix.createVector([0, 9.8]);
        this._particles.forEach(p => {
            p.force = gravity.add(p.velocity.mult(kd));
        })
    }

    get Q() {
        let result = new Array(this._particles.length * this.dimensions);

        this._particles.forEach((p, i) => {
            for (let k = 0; k < this.dimensions; ++k)
                result[i * this.dimensions + k] = p.force.getValue(k, 0);
        })

        return Matrix.createVector(result);
    }

    get q() {
        let result = new Array(this._particles.length * this.dimensions);

        this._particles.forEach((p, i) => {
            for (let k = 0; k < this.dimensions; ++k)
                result[i * this.dimensions + k] = p.position.getValue(k, 0);
        })

        return Matrix.createVector(result);
    }

    set q(q) {
        const dimensions = this.dimensions;
        this._particles.forEach((p, i) => {
            for (let j = 0; j < dimensions; ++j)
                p.position.setValue(j, 0, q.getValue(i * dimensions + j, 0));

            p.updateVisual();
        });

        this._constrants.forEach(c => c.updateVisual());
    }

    get v() {
        let result = new Array(this._particles.length * this.dimensions);

        this._particles.forEach((p, i) => {
            for (let k = 0; k < this.dimensions; ++k)
                result[i * this.dimensions + k] = p.velocity.getValue(k, 0);
        })

        return Matrix.createVector(result);
    }

    set v(v) {
        const dimensions = this.dimensions;
        this._particles.forEach((p, i) => {
            for (let j = 0; j < dimensions; ++j)
                p.velocity.setValue(j, 0, v.getValue(i * dimensions + j, 0));
        });
    }

    get a() {
        const dimensions = this.dimensions;
        let q = this.q;
        let v = this.v;
        let Q = this.Q;

        let c = Matrix.createVector(this._constrants.map(c => c.compute(q)));
        let j = this.jacobian(q);
        let cv = j.mult(v);
        let jv = this.jacobianDerivative(q, v);

        let jw = j.clone();
        this._particles.forEach((p, i) => this._constrants.forEach((c, j) => {
            for (let k = 0; k < dimensions; ++k)
                jw.setValue(j, i * dimensions + k, jw.getValue(j, i * dimensions + k) / p.mass);
        }));

        let jwjt = jw.mult(j.transpose());
        let jvv = jv.mult(v).mult(-1);
        let jwq = jw.mult(Q);

        let lambda = jwjt.inverse().mult(jvv.sub(jwq).sub(c.mult(this.ks)).sub(cv.mult(this.kd)));
        let constraintForce = j.transpose().mult(lambda);
        this._particles.forEach((p, i) => {
            for (let k = 0; k < dimensions; ++k)
                p.force.setValue(k, 0, p.force.getValue(k, 0) + constraintForce.getValue(i * dimensions + k, 0));
        });

        let a = constraintForce.clone();
        this._particles.forEach((p, i) => {
            for (let j = 0; j < dimensions; ++j)
                a.setValue(i * dimensions + j, 0, p.force.getValue(j, 0) / p.mass);
        });
        return a;
    }

    jacobian(q) {
        return derivative(q => Matrix.createVector(this._constrants.map(c => c.compute(q))), q, this.epsilon);
    }

    jacobianDerivative(q, v) {
        return derivative(q => this.jacobian(q).mult(v), q, this.epsilon);
    }

    validate() {
        let c = Matrix.createVector(this._constrants.map(c => c.value));
    }

    step(dt) {
        //runge-kutta
    }
}

if (typeof module !== 'undefined')
    module.exports = Simulation;