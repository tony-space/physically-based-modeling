'use strict';

function Vector(items) {
    if (!items || items.constructor !== Array)
        this._data = [];
    else
        this._data = items.slice(0);
}

Vector.prototype.add = function (v) {
    if (v._data.length != this._data.length)
        throw new RangeError();

    return new Vector(this._data.map((e, i) => e + v._data[i]));
};

Vector.prototype.sub = function (v) {
    if (v._data.length != this._data.length)
        throw new RangeError();

    return new Vector(this._data.map((e, i) => e - v._data[i]));
};

Vector.prototype.scale = function (f) {
    return new Vector(this._data.map(e => e * f));
};

Vector.prototype.dot = function (v) {
    if (v._data.length != this._data.length)
        throw new RangeError();

    return this._data.reduce((sum, e, i) => sum + e * v._data[i], 0);
};

Vector.prototype.magnitude = function () {
    return Math.sqrt(this.dot(this));
};

Vector.prototype.clone = function () {
    return new Vector(this._data);
};

Vector.prototype.size = function () {
    return this._data.length;
};

Vector.prototype.get = function (i) {
    if (i < 0 || i >= this._data.length)
        throw new RangeError("invalid index");
    return this._data[i];
};

Vector.prototype.set = function (i, v) {
    if (i < 0 || i >= this._data.length)
        throw new RangeError("invalid index");
    return this._data[i] = v;
};

Vector.prototype.data = function () {
    return this._data;
};

function Matrix(rows, cols) {
    this._rows = rows;
    this._cols = cols;

    this._data = new Array(rows * cols);
    for(var i = 0; i < this._data.length; ++i)
        this._data[i] = 0;
}

Matrix.prototype.set = function (row, col, v) {
    if (row < 0 || col < 0 || row >= this._rows || col >= this._cols)
        throw new RangeError("invalid index");

    this._data[col + row * this._cols] = v;
};

Matrix.prototype.get = function (row, col) {
    if (row < 0 || col < 0 || row >= this._rows || col >= this._cols)
        throw new RangeError("invalid index");

    return this._data[col + row * this._cols];
};

Matrix.prototype.rows = function () {
    return this._rows;
};

Matrix.prototype.columns = function () {
    return this._cols;
};

Matrix.prototype.mult = function (tensor) {
    if (tensor.constructor === Number) {
        let result = new Matrix(this._rows, this._cols);
        this._data.forEach((e, i) => result._data[i] = e * tensor);
        return result;
    }
    else if (tensor.constructor === Vector) {
        if (tensor.size() != this.columns())
            throw new RangeError("invalid size");
        let result = new Vector();
        result._data = new Array(this._rows);
        for (let row = 0; row < this._rows; ++row)
            result._data[row] = tensor._data.reduce((sum, e, col) => sum + e * this.get(row, col), 0);
        return result;
    }
    else if (tensor.constructor === Matrix) {
        if (this.columns() != tensor.rows())
            throw new RangeError("invalid size");

        let result = new Matrix(this._rows, tensor._cols);
        for (let i = 0; i < this._rows; ++i)
            for (let j = 0; j < tensor._cols; ++j) {
                let sum = 0;
                for(let k = 0; k < this._cols; ++k)
                    sum += this.get(i, k) * tensor.get(k, j);
                result.set(i, j, sum);
            }

        return result;
    }
    else
        throw new TypeError("not implemented yet");
};

Matrix.prototype.transpose = function () {
    var result = new Matrix(this._cols, this._rows);

    for (let i = 0; i < this._rows; ++i)
        for (let j = 0; j < this._cols; ++j)
            result.set(j, i, this.get(i, j));

    return result;
}

function derivative(func, arg, epsilon) {
    if (epsilon === undefined)
        epsilon = 1e-6;

    if (arg.constructor === Number) {
        let left = func(arg - epsilon);
        let right = func(arg + epsilon);
        if (left.constructor === Number && right.constructor === Number)
            return (right - left) / (2 * epsilon)
        else if (left.constructor === Vector && right.constructor === Vector)
            return right.sub(left).scale(0.5 / epsilon);
        else
            throw new TypeError("not implemented yet");
    }
    else if (arg.constructor === Vector) {
        let left = func(arg);
        let result = new Matrix(left.constructor === Number ? 1 : left.size(), arg.size());
        let data = arg.data();

        data.forEach((argE, col) => {
            let orig = data[col];
            data[col] += epsilon;
            let right = func(arg);
            data[col] = orig;
            if (left.constructor !== right.constructor)
                throw new TypeError("invalid state");
            if (right.constructor === Number)
                result.set(0, col, (right - left) / epsilon);
            else if (right.constructor === Vector) {
                right.sub(left).scale(1 / epsilon).data().forEach((e, row) => result.set(row, col, e));
            }
            else
                throw new TypeError("not implemented yet");
        });

        return result;
    }
    else
        throw new TypeError("not implemented yet");
}

const m1 = 2;
const m2 = 3;
const w = new Matrix(4, 4);

w.set(0, 0, 1 / m1);
w.set(1, 1, 1 / m1);
w.set(2, 2, 1 / m2);
w.set(3, 3, 1 / m2);

const r = 5;
let q = new Vector([-2.5, 0, 2.5, 0]);
let v = new Vector([0, 5, 0, -5]);
let j = J(q);
let cv = Cv(v, q);
let jv = Jv(v, q)

var jwjt = j.mult(w).mult(j.transpose());
var jvv = jv.mult(v).scale(-1);
var lambda = jvv.get(0, 0) / jwjt.get(0, 0);

//gotcha!
var a = w.mult(j.transpose().mult(lambda));

function C(q) {
    let dx = q.get(0) - q.get(2);
    let dy = q.get(1) - q.get(3);
    return dx * dx + dy * dy - r;
}

function J(q) {
    return derivative(C, q);
}

function Cv(v, q) {
    return J(q).mult(v);
}

function Jv(v, q) {
    return derivative(Cv.bind(null, v), q);
}