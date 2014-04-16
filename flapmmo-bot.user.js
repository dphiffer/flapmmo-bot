// ==UserScript==
// @name        FlapMMObot
// @namespace   http://phiffer.org/
// @description Plays FlapMMO
// @include     http://flapmmo.com/
// @version     2
// @grant       none
// ==/UserScript==

var FlapMMObot = {
  
  showDebug: true,      // Draw on the canvas to debug vision
  ceiling: 150,         // y coord ceiling the bird flies under
  fallThresh: 70,       // How far the bird can fall before flapping
  lastFlap: 0,          // Keep track of the last time the bird flapped
  
  pipeDetection: {
    freq: 3,            // Check for pipe every [freq] iterations
    origin: 333,        // x coord to center detection rect on
    width: 10,          // Look in a rect this wide
    height: 210,        // Look in a rect this tall
    pixelThresh: 8      // Min number of matching pixels
  },
  
  birdDetection: {
    origin: 102,        // x coord to center detection rect on
    offset: -7,         // x offset from origin to sample pixels
    width: 60,          // Bird width
    height: 60,         // Bird height
    redAbs: 125,        // Minimum amount of red color in a bird
    redDiff: 25,        // Amount of additional red beyond green & blue
    pixelThresh: 5      // Min number of matching pixels
  },
  
  init: function() {
    var self = this;
    if (!this.id('canvas')) {
      window.addEventListener('load', function() {
        self.init();
      }, false);
    }
    this.ctx = this.id('canvas').getContext('2d');
    this.pipeCountdown = this.pipeDetection.freq;
    requestAnimationFrame(function() {
      self.main();
    });
    this.setupColorDebug();
  },
  
  main: function() {
    this.flyBird();
    this.watchForPipes();
    this.showCeilingDebug();
    var self = this;
    requestAnimationFrame(function() {
      self.main();
    });
  },
  
  flyBird: function(birdY) {
    var birdY = this.detectBird();
    if (birdY) {
      this.birdY = birdY;
      this.showBirdDebug();
      var now = (new Date()).getTime();
      var birdIsTooLow = this.birdY > this.ceiling + this.fallThresh;
      var dontDoubleClick = now - this.lastFlap > 250;
      if (birdIsTooLow && dontDoubleClick) {
        this.lastFlap = now;
        this.flap();
      }
    }
  },
  
  flap: function() {
    var event = document.createEvent('Events');
    event.initEvent('mousedown', true, false);
    this.id('canvas').dispatchEvent(event);
  },
  
  watchForPipes: function() {
    this.pipeCountdown--;
    if (this.pipeCountdown === 0) {
      this.pipeCountdown = this.pipeDetection.freq;
      var pipeY = this.detectPipe();
      if (pipeY) {
        this.ceiling = pipeY;
      }
    }
  },
  
  detectBird: function() {
    var rgb, matches = 0;
    var x = this.birdDetection.origin +
            this.birdDetection.offset;
    for (var y = 0; y < 360; y++) {
      rgb = this.samplePoint(x, y);
      if (rgb[0] > this.birdDetection.redAbs &&
          rgb[0] - this.birdDetection.redDiff > rgb[1] &&
          rgb[0] - this.birdDetection.redDiff > rgb[2]) {
        matches++;
        if (matches > this.birdDetection.pixelThresh) {
          return y - this.birdDetection.height / 2;
        }
      } else {
        matches = 0;
      }
    }
    return null;
  },

  detectPipe: function() {
    this.showPipeDebug();
    var y = null;
    var halfWidth = this.pipeDetection.width / 2;
    var start = this.pipeDetection.origin - halfWidth;
    var end = this.pipeDetection.origin + halfWidth;
    for (var x = start; x < end; x++) {
      y = this.detectPipeAtX(x);
      if (y) {
        return y;
      }
    }
    return null;
  },

  detectPipeAtX: function(x) {
    var matches = 0;
    var brightness, pipeTop;
    for (var y = 0; y < this.pipeDetection.height; y++) {
      brightness = this.brightness(this.samplePoint(x, y));
      if (brightness < 1) {
        matches++;
      } else if (!pipeTop) {
        pipeTop = y;
        if (matches > this.pipeDetection.pixelThresh) {
          return pipeTop + 21;
        }
      }
    }
    return null;
  },

  showBirdDebug: function() {
    if (!this.showDebug) {
      return;
    }
    var x = this.birdDetection.origin - this.birdDetection.width / 2;
    var y = this.birdY;
    this.ctx.save();
    this.ctx.fillStyle = "rgba(0, 255, 0, 0.75)";
    this.ctx.fillRect(x, y, this.birdDetection.width, this.birdDetection.height);
    this.ctx.restore();
  },
  
  showCeilingDebug: function() {
    if (!this.showDebug) {
      return;
    }
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.ceiling);
    this.ctx.lineTo(800, this.ceiling);
    this.ctx.stroke();
    this.ctx.restore();
  },

  showPipeDebug: function() {
    if (!this.showDebug) {
      return;
    }
    var x = this.pipeDetection.origin - this.pipeDetection.width / 2;
    var y = 0;
    var w = this.pipeDetection.width;
    var h = this.pipeDetection.height;
    this.ctx.save();
    this.ctx.fillStyle = "rgba(0, 0, 255, 0.25)";
    this.ctx.fillRect(x, y, w, h);
    this.ctx.restore();
  },
  
  setupColorDebug: function() {
    var self = this;
    document.addEventListener('mousemove', function(e) {
      var x = e.pageX - self.id('canvas').offsetLeft;
      var y = e.pageY - self.id('canvas').offsetTop;
      var rgb = self.samplePoint(x, y);
      if (x > 0 && x < self.id('canvas').offsetWidth &&
          y > 0 && y < self.id('canvas').offsetHeight) {
        self.showColorDebug(e.pageX, e.pageY, rgb);
      } else {
        self.hideColorDebug();
      }
    });
  },
  
  showColorDebug: function(x, y, rgb) {
    var div = this.id('colorDebug');
    if (!this.showDebug) {
      this.hideColorDebug();
      return;
    }
    if (!div) {
      div = document.createElement('div');
      div.setAttribute('id', 'colorDebug');
      div.style.padding = '100px 20px 10px 10px';
      div.style.width = '150px';
      div.style.height = '125px';
      div.style.font = '11px menlo, monospace';
      div.style.position = 'absolute';
      div.style.boxShadow = '3px 3px 3px rgba(0, 0, 0, 0.5)';
      document.body.appendChild(div);
    }
    var color = 'rgb(' + rgb[0] + ', ' + rgb[1] + ', ' + rgb[2] + ')';
    div.style.backgroundColor = color;
    div.style.display = 'block';
    div.style.left = (x + 10) + 'px';
    div.style.top = y + 'px';
    div.innerHTML = color;
  },
  
  hideColorDebug: function() {
    if (this.id('colorDebug')) {
      this.id('colorDebug').style.display = 'none';
    }
  },
  
  id: function(id) {
    return document.getElementById(id);
  },
  
  samplePoint: function(x, y) {
    return this.ctx.getImageData(x, y, 1, 1).data;
  },
  
  brightness: function(rgb) {
    return (rgb[0] + rgb[1] + rgb[2]) / 255 * 3;
  }
  
};

FlapMMObot.init();