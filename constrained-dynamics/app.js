'use strict';

function Vector() {
    Array.call(this);
    this.length = arguments.length;
    for (var i = 0; i < arguments.length; ++i)
        this[i] = arguments[i];
}

Vector.prototype = Object.create(Array.prototype);
Vector.prototype.constructor = Vector;

Vector.prototype.add = function (v) {
    if (v.length != this.length)
        throw new RangeError();

    var result = new Vector();
    result.length = this.length;
    this.forEach((e, i) => result[i] = e + v[i]);
    return result;
};

Vector.prototype.sub = function (v) {
    if (v.length != this.length)
        throw new RangeError();

    var result = new Vector();
    result.length = this.length;
    this.forEach((e, i) => result[i] = e - v[i]);
    return result;
};

Vector.prototype.scale = function (f) {
    var result = new Vector();
    result.length = this.length;
    this.forEach((e, i) => result[i] = e * f);
    return result;
};

Vector.prototype.dot = function (v) {
    if (v.length != this.length)
        throw new RangeError();

    return this.reduce((sum, e, i) => sum + e * v[i], 0);
};

Vector.prototype.magnitude = function () {
    return Math.sqrt(this.dot(this));
};

Vector.prototype.clone = function () {
    var result = new Vector();
    result.length = this.length;
    this.forEach((e, i) => result[i] = e);
    return result;
};

function derivative(func, arg, epsilon) {
    if (epsilon === undefined)
        epsilon = 1e-6;

    if (arg.constructor == Number) {
        let left = func(arg - epsilon);
        let right = func(arg + epsilon);
        if (left.constructor == Number && right.constructor == Number)
            return (right - left) / (2 * epsilon)
        else if (left.constructor == Vector && right.constructor == Vector)
            return right.sub(left).scale(0.5 / epsilon);
        else
            throw new TypeError("not implemented yet");
    }
    else if (arg.constructor == Vector) {
        return arg.map((value, i) => {
            let left = arg.clone();
            let right = arg.clone();
            left[i] -= epsilon;
            right[i] += epsilon;

            left = func(left);
            right = func(right);

            if (left.constructor == Number && right.constructor == Number)
                return (right - left) / (2 * epsilon);
            else if (left.constructor == Vector && right.constructor == Vector)
                return right.sub(left).scale(0.5 / epsilon);
            else
                throw new TypeError("not implemented yet");
        });

    }
    else
        throw new TypeError("not implemented yet");
}

function Sphere(q) {
    return q.magnitude() - 5;
}

function Plane(q) {
    const normal = new Vector(0, 1, 0);
    return q.dot(normal);
}

function C(q) {
    return new Vector(Sphere(q), Plane(q));
}

const q = new Vector(0, 0, 5);

var JacobianMat = derivative(C, q);
console.log(JacobianMat);