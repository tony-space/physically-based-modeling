function State(x, v){
    this.x = x;
    this.v = v;
}

State.prototype.scale = function(factor){
    this.x *= factor;
    this.v *= factor;
    return this;
}

State.prototype.scaled = function(factor){
    return new State(this.x, this.v).scale(factor);
}

State.prototype.add = function(delta){
    this.x += delta.x;
    this.v += delta.v;
    return this;
}

State.prototype.plus = function(delta){
    return new State(this.x, this.v).add(delta);
}

State.prototype.sub = function(delta){
    return this.add(delta.scaled(-1));
}

State.prototype.minus = function(delta){
    return new State(this.x, this.v).sub(delta);
}

State.prototype.magnitude = function(){
    return Math.sqrt(this.x * this.x + this.v * this.v);
}

State.prototype.derivative = function(t){
    //Hook's law
    var k = 1;
    var f = -this.x * k;
    var m = 1; 

    //dState/dt
    return new State(this.v, f/m);
}

State.prototype.ode = function (t0, h){
    // runge-kutta (bugs!)
    // var k1 = this.derivative(t0);
    // var k2 = this.plus(k1.scaled(h/2)).derivative(t0 + h/2);
    // var k3 = this.plus(k2.scaled(h/2)).derivative(t0 + h/2);
    // var k4 = this.plus(k3).derivative(t0 + h);

    // return k2.add(k3).scale(2).add(k1).add(k4).scale(h/6).add(this);

    // euler
    // return this.derivative(t0).scale(h).add(this);

    // midpoint
    return this.derivative().scale(h/2).add(this).derivative().scale(h).add(this);
}

function simulate(x0, t0, t1, h, accuracy, onStep){
    while(t0 <= t1){
        var xa = x0.ode(t0, h);
        var xb = x0.ode(t0, h/2).ode(t0 + h/2, h/2);

        var error = xa.minus(xb).magnitude() || accuracy;
        var scale = Math.pow(accuracy / error, 1 / 5);
        h = h * scale || accuracy; 

        x0 = x0.ode(t0, h);
        t0 += h;
        onStep(x0, t0);
    }
}


var ideal = [];
for(var t = 0; t <= 10; t += 0.1)
    ideal.push(t.toFixed(2) + ' ' + Math.cos(t).toFixed(2));

var simulated = [];
simulate(new State(1, 0), 0, 10, 0.0001, 0.0001, function(state, t){
    simulated.push(t.toFixed(2) + ' ' + state.x.toFixed(2));
});

if(typeof document == 'undefined') process.exit();

var plot = document.getElementById('plot');
var svgns = "http://www.w3.org/2000/svg";
var path = document.createElementNS(svgns, 'path');
path.setAttribute('d', 'M ' + ideal.join(' L '));
path.setAttribute('fill', 'none');
path.setAttribute('stroke', 'aqua');
path.setAttribute('stroke-width', '0.05');
plot.appendChild(path)

path = document.createElementNS(svgns, 'path');
path.setAttribute('d', 'M ' + simulated.join(' L '));
path.setAttribute('fill', 'none');
path.setAttribute('stroke', 'red');
path.setAttribute('stroke-width', '0.02');
plot.appendChild(path)