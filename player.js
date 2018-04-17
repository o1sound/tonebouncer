var canvas = null, context = null;

// web audio globals
var auContext, oscillator, gainNode;

// UI flags
var running = false;
var needsAnimate = true;

var dim = {}, 
	shape = {"x":0,"y":0,"r":56}, 
	fct = {"x":Math.random() < 0.5 ? -1 : 1,"y":Math.random() < 0.5 ? -1 : 1},
	strokewidth = 20;

function playOsc(freq) {
	var currentTime = auContext.currentTime;
	var oscillator = auContext.createOscillator();
		oscillator.type = 'sine';
		oscillator.frequency.setValueAtTime(freq,currentTime);
		
		oscillator.connect(gainNode);

		oscillator.start(currentTime);
		oscillator.stop(currentTime + 0.25); // quarter second
}

function draw() {
	// clear the frame
	context.globalAlpha = 0.1;
	context.fillStyle = '#000';
	context.fillRect(0,0,dim.w*dim.ratio,dim.h*dim.ratio);
	
	// reset alpha back to 1
	context.globalAlpha = 1;
	
	// draw the border
	context.beginPath();
	context.rect(0,0,dim.w*dim.ratio,dim.h*dim.ratio);
	context.strokeStyle = '#fff';
	context.lineWidth = strokewidth;
	context.stroke();
	context.closePath();
	
	// draw the circle
	context.beginPath();
    context.fillStyle = '#00aaff';
    context.arc(shape.x*dim.ratio, shape.y*dim.ratio, 0.5*shape.r*dim.ratio, 0, 2*Math.PI, true);
    context.fill();
}

function animate() {
    requestAnimationFrame(animate);
	
	if (!running) {return;}
	
    shape.x += 3*fct.x*dim.ratio;
    shape.y += 3*fct.y*dim.ratio;
	
    draw(); // draw and move things (afterward)
    
    // bounce circle off wall!
    var freq = -1; // this will be the frequency per each wall
    if (shape.x > (dim.w-0.5*(shape.r+0.5*strokewidth))) { 	// right wall
    	shape.x = dim.w-0.5*(shape.r+0.5*strokewidth);
    	fct.x *= -1; 
    	freq = 550;
    } 
    if (shape.y > (dim.h-0.5*(shape.r+0.5*strokewidth))) {	// bottom wall
    	shape.y = dim.h-0.5*(shape.r+0.5*strokewidth);
    	fct.y *= -1; 
    	freq = 220;
    } 
    if (shape.x < 0.5*(shape.r+0.5*strokewidth)) {	// left wall
    	shape.x = 0.5*(shape.r+0.5*strokewidth);
    	fct.x *= -1; 
    	freq = 440;
    }
    if (shape.y < 0.5*(shape.r+0.5*strokewidth)) {	// top wall
    	shape.y = 0.5*(shape.r+0.5*strokewidth);
    	fct.y *= -1; 
    	freq = 770;
    }
    
    // play audio when it bounces
    if (freq != -1) { playOsc(freq); }
}

function resize() {
    var devicePixelRatio = window.devicePixelRatio || 1;
    var backingStoreRatio = canvas.webkitBackingStorePixelRatio ||
        canvas.mozBackingStorePixelRatio ||
        canvas.msBackingStorePixelRatio ||
        canvas.oBackingStorePixelRatio ||
        canvas.backingStorePixelRatio || 1;

    dim.ratio = devicePixelRatio / backingStoreRatio;
    dim.w = window.innerWidth;
    dim.h = window.innerHeight;

    canvas.width =  dim.w*dim.ratio;
    canvas.height =  dim.h*dim.ratio;
    canvas.style.width = dim.w + 'px';
    canvas.style.height = dim.h + 'px';
}

window.onload = function() {
    canvas = document.getElementById("canvas");
    context = canvas.getContext('2d');
	
	// Use audioContext from webaudio_tools.js
   	auContext = new (window.AudioContext || window.webkitAudioContext)();
   	
   	gainNode = auContext.createGain(); // for when not connected to panner
   	gainNode.gain.setValueAtTime(0.4, auContext.currentTime);
   	
   	gainNode.connect(auContext.destination);

	resize();
	
	// after resize: set circle
	shape.x = 0.5*dim.w;
	shape.y = 0.5*dim.h;
	draw();
    
    window.addEventListener( "keypress", doKeyDown, false );
}
window.onresize = resize;

function doKeyDown(e) {
	//alert( e.keyCode );
	
	e.preventDefault; // no need to trigger slideshow when embedded
	
	if ( e.keyCode == 32 ) {  // space bar
		if (needsAnimate) { animate(); needsAnimate = false;} 
		running = !running; // toggle
	}
	if ( e.keyCode == 100 ) {  // d
		animate(); // because crazy
	}
}