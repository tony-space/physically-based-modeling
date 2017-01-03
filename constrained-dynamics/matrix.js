'use strict';

var Matrix = class {
    constructor(rows, cols) {
        this._rows = rows;
        this._cols = cols;

        this._data = new Array(rows * cols);
        for (let i = 0; i < this._data.length; ++i)
            this._data[i] = 0;
    }

    get rows() {
        return this._rows;
    }

    get columns() {
        return this._cols;
    }

    setValue(row, col, v) {
        if (row < 0 || col < 0 || row >= this.rows || col >= this.columns)
            throw new RangeError("invalid index");

        this._data[col + row * this.columns] = v;
    }

    getValue(row, col) {
        if (row < 0 || col < 0 || row >= this.rows || col >= this.columns)
            throw new RangeError("invalid index");

        return this._data[col + row * this.columns];
    }

    clone() {
        let result = new Matrix(this.rows, this.columns);
        for (let i = 0; i < this.rows; ++i)
            for (let j = 0; j < this.columns; ++j)
                result.setValue(i, j, this.getValue(i, j));
        return result;
    }

    add(m) {
        if (m.rows != this.rows || m.columns != this.columns)
            throw new TypeError("invalid argument");

        let result = new Matrix(this.rows, this.columns);
        for (let i = 0; i < this.rows; ++i)
            for (let j = 0; j < this.columns; ++j)
                result.setValue(i, j, this.getValue(i, j) + m.getValue(i, j));
        return result;
    }

    sub(m) {
        if (m.rows != this.rows || m.columns != this.columns)
            throw new TypeError("invalid argument");

        let result = new Matrix(this.rows, this.columns);
        for (let i = 0; i < this.rows; ++i)
            for (let j = 0; j < this.columns; ++j)
                result.setValue(i, j, this.getValue(i, j) - m.getValue(i, j));
        return result;
    }

    mult(tensor) {
        if (typeof tensor === 'number') {
            let result = new Matrix(this.rows, this.columns);
            for (let i = 0; i < this.rows; ++i)
                for (let j = 0; j < this.columns; ++j)
                    result.setValue(i, j, this.getValue(i, j) * tensor);
            return result;
        }
        else if (tensor instanceof Matrix) {
            if (this.columns != tensor.rows)
                throw new RangeError("invalid size");

            let result = new Matrix(this.rows, tensor.columns);

            for (let i = 0; i < this.rows; ++i)
                for (let j = 0; j < tensor.columns; ++j) {
                    var sum = 0;
                    for (let k = 0; k < this.columns; ++k)
                        sum += this.getValue(i, k) * tensor.getValue(k, j);

                    result.setValue(i, j, sum);
                }

            return result;
        }
        else
            throw new TypeError("not implemented yet");
    }

    transpose() {
        let result = new Matrix(this.columns, this.rows);

        for (let i = 0; i < this.rows; ++i)
            for (let j = 0; j < this.columns; ++j)
                result.setValue(j, i, this.getValue(i, j));

        return result;
    }

    inverse() {
        if (this.rows != this.columns || this.rows < 1)
            throw new TypeError("invalid matrix sizes");

        let result = Matrix.createIdentity(this.rows);
        let self = this.clone();

        for (let i = 0; i < self.rows; ++i) {
            let diagonal = self.getValue(i, i);
            if (diagonal === 0)
                throw new Error("determinants equals zero");

            for (let j = 0; j < self.columns; ++j) {
                self.setValue(i, j, self.getValue(i, j) / diagonal);
                result.setValue(i, j, result.getValue(i, j) / diagonal);
            }

            for (let k = 0; k < self.rows; ++k) {
                if (k === i) continue;
                var coefficient = self.getValue(k, i);
                for (let j = 0; j < self.columns; ++j) {
                    self.setValue(k, j, self.getValue(k, j) - self.getValue(i, j) * coefficient);
                    result.setValue(k, j, result.getValue(k, j) - result.getValue(i, j) * coefficient);
                }
            }
        }

        return result;
    }

    //only for vectors
    dot(tensor) {
        if (!(this.columns === 1 && tensor.columns === 1 && this.rows === tensor.rows))
            throw TypeError('invalid tensor types');
        var sum = 0;
        for (let i = 0; i < this.rows; ++i)
            sum += this.getValue(i, 0) * tensor.getValue(i, 0);
        return sum;
    }

    static createVector(data) {
        let result = new Matrix(data.length, 1);
        data.forEach((e, i) => result.setValue(i, 0, e));
        return result;
    }

    static createIdentity(n) {
        let result = new Matrix(n, n);
        for (let i = 0; i < n; ++i)
            result.setValue(i, i, 1);
        return result;
    }
}

if (typeof module !== 'undefined')
    module.exports = Matrix;