var colors = ['silver', 'gray', 'white', 'maroon', 'red',
  'purple', 'fuchsia', 'green', 'lime', 'olive',
  'yellow', 'navy', 'blue', 'teal', 'aqua']

const G = 9.81;
const DELTA_T = 0.01;
const MAX_Y_DOMAIN = 10;
  
var border = null;
objects = []
var y_chart = null;
var x_chart = null;

function polarToRect(a, phi) {
  return [a * Math.cos(phi), a * Math.sin(phi)];
}

function innerWidth(node) {
  var computedStyle = getComputedStyle(node);

  let width = node.clientWidth;

  width -= parseFloat(computedStyle.paddingLeft) + parseFloat(computedStyle.paddingRight);
  return width;
}

class Border {
  constructor(id, coefficient){
    this.id = id;
    this.DOMObject = document.getElementById(this.id);

    this.coefficient = coefficient;
    this.x_domain_start = 0;
    this.x_domain = MAX_Y_DOMAIN;
    this.y_domain_start = 0;
    this.y_domain = 10;
    this.width = 0;

    this.resize();
  }
  getDOMObject(){
    this.DOMObject = document.getElementById(this.id);
    return this.DOMObject;
  }
  resize() {
    let width = innerWidth(this.getDOMObject());
    if (width == this.width) {
      return
    }
    this.width = width;
    this.height = this.width / (this.x_domain - this.x_domain_start) * (this.y_domain - this.y_domain_start);
    this.DOMObject.style.height = Math.round(this.height) + 'px';
    this.DOMObject.style.width = Math.round(this.width) + 'px';
  }
}


is_moving = true;
next_step = false;
counter = 1;

setInterval(() => {
  if (is_moving || next_step) {
    objects.forEach(element => {
      element.move();
    });
    next_step = false;
  }

  return;
}, DELTA_T * 1000)

  
function makeCharts(velocity, velocity_angle, height, coefficient, mass) {
    let [x_velocity, y_velocity] = polarToRect(velocity, velocity_angle);

    function yAcceleration(y) {
        return (-coefficient * y - mass * G) / mass;
    }  

    function xAcceleration(x) {
        return (-coefficient * x) / mass;
    }

    tValues = [0];
    yValues = [height];  
    yVelocityValues = [y_velocity];
    yAccelerationValues = [yAcceleration(y_velocity)];

    xValues = [0];
    xVelocityValues = [x_velocity];
    xAccelerationValues = [xAcceleration(x_velocity)];

    let dt = 0.01;
    let new_y = yValues[yValues.length - 1];
    for (let t = dt; t <= 5; t += dt) {
        yAccelerationValues.push(yAcceleration(yVelocityValues[yVelocityValues.length - 1]))
        let new_y_velocity = yVelocityValues[yVelocityValues.length - 1] + dt * yAccelerationValues[yAccelerationValues.length - 1];
        if (new_y_velocity * dt + yValues[yValues.length - 1] < 0) {
            new_y_velocity *= -1;
        }
        yVelocityValues.push(new_y_velocity);
        new_y = new_y_velocity * dt + yValues[yValues.length - 1];

        xAccelerationValues.push(xAcceleration(xVelocityValues[xVelocityValues.length - 1]))

        xVelocityValues.push(xVelocityValues[xVelocityValues.length - 1] + dt * xAccelerationValues[xAccelerationValues.length - 1]);
        xValues.push(xVelocityValues[xVelocityValues.length - 1] * dt + xValues[xValues.length - 1]);
        

        yValues.push(new_y);
        tValues.push(t.toFixed(3));
    }

    if (y_chart != null) {
        y_chart.destroy();
    }  
    if (x_chart != null) {
        x_chart.destroy();
    }
    y_chart = new Chart("y_chart", {
        type: "line",
        data: {
        labels: tValues,
        datasets: [{
            label: "Высота y, м",
            fill: false,
            pointRadius: 1,
            borderColor: "rgba(255,0,0,0.5)",
            data: yValues
        }, {
            label: "Скорость v_y, м/с",
            fill: false,
            pointRadius: 1,
            borderColor: "rgba(0,0,255,0.5)",
            data: yVelocityValues
        }, {
            label: "Ускорение a_y, м/с^2",
            fill: false,
            pointRadius: 1,
            borderColor: "rgba(0,255,0,0.5)",
            data: yAccelerationValues
        }]
        },
    });
    x_chart = new Chart("x_chart", {
        type: "line",
        data: {
        labels: tValues,
        datasets: [{
            label: "Дальность x, м",
            fill: false,
            pointRadius: 1,
            borderColor: "rgba(255,0,0,0.5)",
            data: xValues
        }, {
            label: "Скорость v_x, м/с",
            fill: false,
            pointRadius: 1,
            borderColor: "rgba(0,0,255,0.5)",
            data: xVelocityValues
        }, {
            label: "Ускорение a_x, м/с^2",
            fill: false,
            pointRadius: 1,
            borderColor: "rgba(0,255,0,0.5)",
            data: xAccelerationValues
        }]
        },
    });

}


function reloadModel(velocity, velocity_angle, height, coefficient, mass, radius) {
    counter = 1;
    objects = [];
    border = new Border('border', coefficient);
    border.getDOMObject().innerHTML = "<div id=\"object1\"> </div>";
    
    var my_object1 = new MyObject('object1', [0, height], polarToRect(velocity, velocity_angle), mass, radius);
    objects.push(my_object1);

    makeCharts(velocity, velocity_angle, height, coefficient, mass);
}


function reloadForm() {
  const mass = parseFloat(document.getElementById('mass').value);
  const height = parseFloat(document.getElementById('height').value);
  const velocity = parseFloat(document.getElementById('velocity').value);
  const velocity_angle = parseFloat(document.getElementById('velocity_angle').value);
  const coefficient = parseFloat(document.getElementById('coefficient').value);

  let radius = 1;

  reloadModel(
    velocity,
    velocity_angle,
    height,
    coefficient,
    mass,
    radius
  );
}





window.onload = () => {
  const checkbox = document.getElementById('stop_simulation');
        
  checkbox.addEventListener('change', function() {
    is_moving = 1 - is_moving;
  });    
  const next_step_button = document.getElementById('next_step_simulation');    
  next_step_button.onclick = function() {
    next_step = true;
  };

  
  reloadForm();

  document.getElementById('collisionForm').addEventListener('submit', function(event) {
    event.preventDefault();
    reloadForm();
  });

}
