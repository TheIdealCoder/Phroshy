let c = document.querySelector(".c");
let tooltipCanvas = document.querySelector(".tooltipCanvas");
var [width, height] = [c.width, c.height] = [innerWidth, innerHeight];
[tooltipCanvas.width, tooltipCanvas.height] = [width, height];
const ctx = c.getContext("2d");
const tooltip = tooltipCanvas.getContext("2d");

var keys = [];

var savedCanvas = null;

let mouseControl = false;

class tooltipnotification {
  constructor(string) {
    this.string = string;
    this.alpha = 1;
  }
  
  show() {
    tooltip.save();
    tooltip.resetTransform();
    tooltip.globalAlpha = this.alpha;
    tooltip.beginPath();
    tooltip.fillStyle = "#111111dd";
    tooltip.roundRect(width / 10, height - 100, width / 10 * 8, 50, [0, 20]);
    tooltip.fill();
    tooltip.closePath();
    tooltip.beginPath();
    tooltip.fillStyle = "#eeeeeedd";
    tooltip.textAlign = "center";
    tooltip.font = "30px Impact";
    tooltip.textBaseline = "middle";
    tooltip.fillText(this.string, width / 2, height - 75);
    tooltip.closePath();
    tooltip.restore();
    this.alpha -= 0.008;
  }
}

var tooltipnotifications = [];

class ball {
  constructor(xPosition, yPosition, type = "default") {
    this.type = type;
    this.position = [xPosition, yPosition];
  }
  
  show() {
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = "#7ac6e4";
    ctx.lineWidth = 1;
    ctx.shadowBlur = 10;
    ctx.shadowColor = "skyblue";
    ctx.fillStyle = "skyblue";
    ctx.arc(this.position[0], this.position[1], 20, 0, Math.PI*2);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
    ctx.restore();
  }
  
  collide() {
    if (dist(position[0], position[1], this.position[0] - width / 2, this.position[1] - height / 2) < 40) {
      let distance = dist(position[0], position[1], this.position[0] - width / 2, this.position[1] - height / 2);
      let delta = Math.sqrt(movementSpeed[0]**2 + movementSpeed[1]**2);
      movementSpeed[0] = 0.7 * delta * (position[0] - (this.position[0] - width / 2)) / distance;
      movementSpeed[1] = 0.7 * delta * (position[1] - (this.position[1] - height / 2)) / distance;
    
      position[0] = (this.position[0] - width / 2) + 40 * (position[0] - (this.position[0] - width / 2)) / distance;
      position[1] = (this.position[1] - height / 2) + 40 * (position[1] - (this.position[1] - height / 2)) / distance;
    }
  }
}

var balls = [];

let position = [0, 0];
let camera = [0, 0];
let cameraSpeedPercentage = 0.1;
let movementSpeed = [0, 0];
let movementAccelerationSpeed = 0.55;
let movementDeaccelerationSpeed = 0.95;
let movementAccelerationMaximum = 8;

balls.push(new ball(200, 450));
balls.push(new ball(370, 320));
balls.push(new ball(100, 90));

loop();
function loop() {
  tooltip.clearRect(0, 0, width, height);
  
  for (let i = 0; i < tooltipnotifications.length; i++) {
    let notification = tooltipnotifications[i];
    notification.show();
    if (notification.alpha < 0) {
      tooltipnotifications.splice(i, 1);
      i--;
    }
  }
  
  movementSpeed[0] = accelerationaryConstraint(movementSpeed[0], movementAccelerationMaximum);
  movementSpeed[1] = accelerationaryConstraint(movementSpeed[1], movementAccelerationMaximum);
  
  if (keys[0]) movementSpeed[1] -= movementAccelerationSpeed;
  if (keys[1]) movementSpeed[0] -= movementAccelerationSpeed;
  if (keys[2]) movementSpeed[1] += movementAccelerationSpeed;
  if (keys[3]) movementSpeed[0] += movementAccelerationSpeed;
  
  if (mouseControl) {
    movementSpeed[0] += movementAccelerationSpeed * constraint((mouseX - width / 2) / (width / 4), -1, 1);
    movementSpeed[1] += movementAccelerationSpeed * constraint((mouseY - height / 2) / (height / 4), -1, 1);
  }
  
  position[0] += movementSpeed[0];
  position[1] += movementSpeed[1];
  
  camera[0] += (position[0] - camera[0]) * cameraSpeedPercentage;
  camera[1] += (position[1] - camera[1]) * cameraSpeedPercentage;
  
  if (!keys[0] && !keys[2]) movementSpeed[1] *= movementDeaccelerationSpeed;
  if (!keys[1] && !keys[3]) movementSpeed[0] *= movementDeaccelerationSpeed;
  
  position[0] = constraint(position[0], -500 - width / 2 + 19.5, 1000 - width / 2 - 19.5, x=>{movementSpeed[0] = 0; return x;});
  position[1] = constraint(position[1], -500 - height / 2 + 19.5, 1000 - height / 2 - 19.5, x=>{movementSpeed[1] = 0; return x;});
  
  ctx.save();
  ctx.fillStyle = "#202124";
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
  
  ctx.translate(-camera[0], -camera[1]);
  
  ctx.save();
  ctx.beginPath();
  ctx.shadowBlur = 10;
  ctx.shadowColor = "#f8fafe";
  ctx.fillStyle = "#f8fafe";
  ctx.roundRect(-500, -500, 1500, 1500, 20.5);
  ctx.fill();
  ctx.closePath();
  ctx.restore();
  
  ctx.save();
  ctx.beginPath();
  ctx.shadowBlur = 10;
  ctx.shadowColor = "#000000";
  ctx.fillStyle = "black";
  ctx.arc(position[0] + width / 2, position[1] + height / 2, 20, 0, Math.PI*2);
  ctx.fill();
  ctx.closePath();
  ctx.restore();
  
  for (let i = 0; i < balls.length; i++) {
    balls[i].show();
    balls[i].collide();
  }
  
  ctx.resetTransform();
  
  requestAnimationFrame(loop);
}

function dist(x1, y1, x2, y2) {
  return Math.sqrt((x1-x2)**2+(y1-y2)**2);
}

function accelerationaryConstraint(variable, constrainValue) {
  return constraint(variable, -constrainValue, constrainValue);
}

function constraint(variable, minimum, maximum, executeFunction = x=>x) {
  if (variable > maximum) return executeFunction(maximum);
  if (variable < minimum) return executeFunction(minimum);
  return variable;
}

window.focus();

window.addEventListener("keydown", e=>{
  if (e.key === "w") keys[0] = true;
  if (e.key === "a") keys[1] = true;
  if (e.key === "s") keys[2] = true;
  if (e.key === "d") keys[3] = true;
  
  if (e.key === "e") {
    mouseControl = !mouseControl;
    tooltipnotifications.push(new tooltipnotification("Mouse Control: " + (mouseControl ? "ON" : "OFF")));
  }
});
window.addEventListener("keyup", e=>{
  if (e.key === "w") keys[0] = false;
  if (e.key === "a") keys[1] = false;
  if (e.key === "s") keys[2] = false;
  if (e.key === "d") keys[3] = false;
});

var [mouseX, mouseY] = [0, 0];
let thing = (isMobile() ? "touchmove" : "mousemove");
window.addEventListener(thing, e=>{
  let elm = (isMobile() ? e.touches[0] : e);
  [mouseX, mouseY] = [elm.clientX, elm.clientY];
});

if (isMobile()) {
  window.addEventListener("touchend", e=>{
    [mouseX, mouseY] = [width / 2, height / 2];
  });
}

function isMobile() {
  try {
    document.createEvent("TouchEvent");
    return true;
  } catch (e) {
    return false;
  }
}
