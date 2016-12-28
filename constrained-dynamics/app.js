'use strict';

function Vector(){
    Array.call(this);
    this.length = arguments.length;
    for(var i = 0; i < arguments.length; ++i)
        this[i] = arguments[i];
}

Vector.prototype = Object.create(Array.prototype);
Vector.prototype.constructor = Vector;

Vector.prototype.add = function(v){
    if(v.length != this.length)
        throw new RangeError();

    return this.map((e, i)=> e + v[i]);
};

Vector.prototype.sub = function(v){
    if(v.length != this.length)
        throw new RangeError();

    return this.map((e, i)=> e - v[i]);
};

Vector.prototype.scale = function(f){
    return this.map(e => e * f);
};

Vector.prototype.dot = function(v){
    if(v.length != this.length)
        throw new RangeError();

    return this.reduce((sum, e, i) => sum + e*v[i], 0);
};

Vector.prototype.magnitude = function(){
    return Math.sqrt(this.dot(this));
};

Vector.prototype.clone = function(){
    var result = new Vector();
    result.length = this.length;
    this.forEach((e,i) => result[i] = e);
    return result;
};

function derivative(func, arg, epsilon){
    if(epsilon === undefined)
        epsilon = 1e-6;

    if(initialValue.constructor == Number){
        if(arg.constructor == Number)
            return (func(arg + epsilon) - func(arg + epsilon))/(2*epsilon);

        if(arg.constructor == Vector){
            
        }
    }
    else if(initialValue.constructor == Vector){

    }
    else
        throw new TypeError("not implemented yet");
}