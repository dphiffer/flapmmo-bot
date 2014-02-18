// ==UserScript==
// @name        FlapMMO bot
// @namespace   http://phiffer.org/
// @description A bot to cheat at FlapMMO
// @include     http://flapmmo.com/
// @version     1
// @grant       none
// ==/UserScript==

var ctx;
var height = 150, lastFlap = 0;
var interval;

function id(id) {
  return document.getElementById(id);
}

function samplePoint(x, y) {
  return ctx.getImageData(x, y, 1, 1).data;
}

function brightness(color) {
  return (color[0] + color[1] + color[2]) / 255 * 3;
}

function detectPipe(x) {
  var y;
  showPipeDebug(x);
  for (var i = x - 10; i < x + 10; i++) {
    y = detectPipeIterate(i);
    if (y) {
      return y;
    }
  }
  return null;
}

function detectPipeIterate(x) {
  var matches = 0;
  var sample, top;
  for (var y = 0; y < 400; y += 4) {
    sample = brightness(samplePoint(x, y));
    if (sample < 1) {
      matches++;
    } else if (!top) {
      top = y;
    }
  }
  if (matches > 40) {
    return top + 20;
  } else {
    return 0;
  }
}

function detectBird() {
  var slice = [], p, seq = 0;
  for (var y = 0; y < 360; y++) {
    p = samplePoint(95, y);
    if (p[0] > 125 && p[0] - 25 > p[1] && p[0] - 25 > p[2]) {
      seq++;
      if (seq > 5) {
        return y - 30;
      }
    } else {
      seq = 0;
    }
  }
  return null;
}

function flap() {
  var event = document.createEvent('Events');
  event.initEvent('mousedown', true, false);
  id('canvas').dispatchEvent(event);
}

function showBirdDebug(birdY) {
  ctx.save();
  ctx.fillStyle = "rgba(0, 255, 0, 0.75)";
  ctx.fillRect(70, birdY, 70, 70);
  ctx.beginPath();
  ctx.moveTo(0, height);
  ctx.lineTo(800, height);
  ctx.stroke();
  ctx.restore();
}

function showPipeDebug(x) {
  ctx.save();
  ctx.fillStyle = "rgba(0, 0, 255, 0.25)";
  ctx.fillRect(x - 10, 0, 20, 400);
  ctx.restore();
}

function setFlapInterval() {
  if (interval) {
    clearInterval(interval);
    interval = null;
  }
  interval = setInterval(function() {
    var birdY = detectBird();
    if (birdY) {
      showBirdDebug(birdY);
      var now = new Date().getTime();
      if (birdY > height + 70 && now - lastFlap > 250) {
        lastFlap = now;
        flap();
      }
    }
  }, 15);
}

function init() {
  var canvas = id('canvas');
  ctx = canvas.getContext('2d');
  setFlapInterval();
  var close = false;
  setInterval(function() {
    var dist = close ? 266 : 333;
    close = !close;
    var pipeY = detectPipe(dist);
    if (pipeY) {
      setTimeout(setFlapInterval, 100);
      height = pipeY;
    }
  }, 60);
}

window.addEventListener('load', function() {
  init();
  //mouseMove();
  /*var n = 0;
  var sum = 0;
  var count = 0;
  document.addEventListener('mousedown', function() {
    var m = new Date().getTime();
    if (n) {
      var d = m - n;
      sum += d;
      count++;
      console.log(Math.round(sum / count));
    }
    n = m;
  });*/
}, false);

function mouseMove() {
  document.addEventListener('mousemove', function(e) {
    var x = e.pageX - id('canvas').offsetLeft;
    var y = e.pageY - id('canvas').offsetTop;
    var p = samplePoint(x, y);
    console.log(x + ', ' + y + ': [' + p[0] + ', ' + p[1] + ', ' + p[2] + ']');
  });
}