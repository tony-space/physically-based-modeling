'use strict';

function Matrix(rows, cols) {
    this._rows = rows;
    this._cols = cols;

    this._data = new Array(rows * cols);
    for (let i = 0; i < this._data.length; ++i)
        this._data[i] = 0;
}

Matrix.prototype.rows = function () {
    return this._rows;
};

Matrix.prototype.columns = function () {
    return this._cols;
};

Matrix.prototype.clone = function () {
    let result = new Matrix(this.rows(), this.columns());
    for (let i = 0; i < this.rows(); ++i)
        for (let j = 0; j < this.columns(); ++j)
            result.set(i, j, this.get(i, j));
    return result;
};

Matrix.prototype.set = function (row, col, v) {
    if (row < 0 || col < 0 || row >= this.rows() || col >= this.columns())
        throw new RangeError("invalid index");

    this._data[col + row * this.columns()] = v;
};

Matrix.prototype.get = function (row, col) {
    if (row < 0 || col < 0 || row >= this.rows() || col >= this.columns())
        throw new RangeError("invalid index");

    return this._data[col + row * this.columns()];
};

Matrix.prototype.add = function (m) {
    if (m.rows() != this.rows() || m.columns() != this.columns())
        throw new TypeError("invalid argument");

    let result = new Matrix(this.rows(), this.columns());
    for (let i = 0; i < this.rows(); ++i)
        for (let j = 0; j < this.columns(); ++j)
            result.set(i, j, this.get(i, j) + m.get(i, j));
    return result
};

Matrix.prototype.sub = function (m) {
    if (m.rows() != this.rows() || m.columns() != this.columns())
        throw new TypeError("invalid argument");

    let result = new Matrix(this.rows(), this.columns());
    for (let i = 0; i < this.rows(); ++i)
        for (let j = 0; j < this.columns(); ++j)
            result.set(i, j, this.get(i, j) - m.get(i, j));
    return result
};

Matrix.prototype.mult = function (tensor) {
    if (tensor.constructor === Number) {
        let result = new Matrix(this.rows(), this.columns());
        for (let i = 0; i < this.rows(); ++i)
            for (let j = 0; j < this.columns(); ++j)
                result.set(i, j, this.get(i, j) * tensor);
        return result;
    }
    else if (tensor.constructor === Matrix) {
        if (this.columns() != tensor.rows())
            throw new RangeError("invalid size");

        let result = new Matrix(this.rows(), tensor.columns());
        for (let i = 0; i < this.rows(); ++i)
            for (let j = 0; j < tensor.columns(); ++j) {
                let sum = 0;
                for (let k = 0; k < this.columns(); ++k)
                    sum += this.get(i, k) * tensor.get(k, j);
                result.set(i, j, sum);
            }

        return result;
    }
    else
        throw new TypeError("not implemented yet");
};

Matrix.prototype.transpose = function () {
    let result = new Matrix(this.columns(), this.rows());

    for (let i = 0; i < this.rows(); ++i)
        for (let j = 0; j < this.columns(); ++j)
            result.set(j, i, this.get(i, j));

    return result;
};

Matrix.createVector = function (data) {
    let result = new Matrix(data.length, 1);
    data.forEach((e, i) => result.set(i, 0, e));
    return result;
};

function derivative(func, arg, epsilon) {
    if (epsilon === undefined)
        epsilon = 1e-6;

    if (arg.constructor === Number) {
        let left = func(arg - epsilon);
        let right = func(arg + epsilon);
        if (left.constructor === Number)
            return (right - left) / (2 * epsilon)
        else if (left.constructor === Mathrix && left.columns() === 1)
            return right.sub(left).mult(0.5 / epsilon);
        else
            throw new TypeError("not implemented yet");
    }
    else if (arg.constructor === Matrix && arg.columns() === 1) {
        let result;
        for (let i = 0; i < arg.rows(); ++i) {
            let left = arg.clone();
            let right = arg.clone();

            left.set(i, 0, left.get(i, 0) - epsilon);
            right.set(i, 0, right.get(i, 0) + epsilon);

            left = func(left);
            right = func(right);

            if (left.constructor === Number) {
                if (!result) result = new Matrix(1, arg.rows());
                result.set(0, i, (right - left) / (2 * epsilon));
            }
            else if (left.constructor === Matrix && left.columns() === 1) {
                if (!result) result = new Matrix(left.rows(), arg.rows());
                let deriv = right.sub(left).mult(0.5 / epsilon);
                for (let j = 0; j < deriv.rows(); ++j)
                    result.set(j, i, deriv.get(j, 0));
            }
            else
                throw new TypeError("not implemented yet");
        }
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
let q = Matrix.createVector([-2.5, 0, 2.5, 0]);
let v = Matrix.createVector([0, 5, 0, -5]);
let j = J(q);
let cv = Cv(v, q);
let jv = Jv(v, q)

let jwjt = j.mult(w).mult(j.transpose());
let jvv = jv.mult(v).mult(-1);
let lambda = jvv.get(0, 0) / jwjt.get(0, 0);

//gotcha!
let a = w.mult(j.transpose().mult(lambda));

function C(q) {
    let dx = q.get(0, 0) - q.get(2, 0);
    let dy = q.get(1, 0) - q.get(3, 0);
    return dx * dx + dy * dy - r * r;
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