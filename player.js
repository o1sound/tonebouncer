let canvas = null;
let context = null;

// web audio globals
let auContext = null, oscillator, gainNode;

// UI flags
let running = false;
let needsAnimate = true;

let dim = {}, 
	shape = {x:0,y:0,r:56}, 
	fct = {
		x:Math.random() < 0.5 ? -1 : 1,
		y:Math.random() < 0.5 ? -1 : 1
	},
	strokewidth = 20;

function playOsc(freq) {
	let currentTime = auContext.currentTime;
	let oscillator = auContext.createOscillator();
		oscillator.type = "sine";
		oscillator.frequency.setValueAtTime(freq,currentTime);
		
		oscillator.connect(gainNode);

		oscillator.start(currentTime);
		oscillator.stop(currentTime + 0.25); // quarter second
}

function draw() {
	// clear the frame
	context.globalAlpha = 0.1;
	context.fillStyle = "#000000";
	context.fillRect(0,0,dim.w,dim.h);
	
	// reset alpha back to 1
	context.globalAlpha = 1;
	
	// draw the border
	context.beginPath();
	context.rect(0,0,dim.w,dim.h);
	context.strokeStyle = "#ffffff";
	context.lineWidth = strokewidth;
	context.stroke();
	context.closePath();
	
	// draw the circle
	context.beginPath();
    context.fillStyle = "#00aaff";
    context.arc(shape.x, shape.y, 0.5*shape.r, 0, 2*Math.PI, true);
    context.fill();
}

function animate() {
    requestAnimationFrame(animate); // ~60fps
	
	if (!running) {return;}
	
    shape.x += 3*fct.x;
    shape.y += 3*fct.y;
	
    draw(); // draw and move things (afterward)
    
    // bounce circle off wall!
    var freq = -1; // this will be the frequency per each wall
    if (shape.x > (dim.w-0.5*(shape.r+0.5*strokewidth))) { 		// right wall
    	shape.x = dim.w-0.5*(shape.r+0.5*strokewidth);
    	fct.x *= -1; 
    	freq = 550;
    } 
    if (shape.y > (dim.h-0.5*(shape.r+0.5*strokewidth))) {		// bottom wall
    	shape.y = dim.h-0.5*(shape.r+0.5*strokewidth);
    	fct.y *= -1; 
    	freq = 220;
    } 
    if (shape.x < 0.5*(shape.r+0.5*strokewidth)) {				// left wall
    	shape.x = 0.5*(shape.r+0.5*strokewidth);
    	fct.x *= -1; 
    	freq = 440;
    }
    if (shape.y < 0.5*(shape.r+0.5*strokewidth)) {				// top wall
    	shape.y = 0.5*(shape.r+0.5*strokewidth);
    	fct.y *= -1; 
    	freq = 770;
    }
    
    // play audio when it bounces
    if (freq != -1) { playOsc(freq); }
}

function resize() {

    dim.ratio = window.devicePixelRatio || 1;
    dim.w = window.innerWidth;
    dim.h = window.innerHeight;

    canvas.style.width = `${dim.w}px`;
    canvas.style.height = `${dim.h}px`;

    canvas.width =  dim.w*dim.ratio;
    canvas.height =  dim.h*dim.ratio;

    context.scale(dim.ratio,dim.ratio);
}

window.onload = function() {
    canvas = document.getElementById('canvas');
    context = canvas.getContext('2d');
	
	// Initialize audioContext
    auContext = new (window.AudioContext || window.webkitAudioContext)(); // normal
   	
   	gainNode = auContext.createGain(); // for when not connected to panner
   	gainNode.gain.setValueAtTime(0.4, auContext.currentTime);
   	
   	gainNode.connect(auContext.destination);

	resize();
	
	// after resize: set circle
	shape.x = 0.5*dim.w;
	shape.y = 0.5*dim.h;
	
	draw();
    
    window.addEventListener("keypress", doKeyDown, false);
    window.addEventListener("touchstart", touchdown, false);
    window.addEventListener("mousedown", touchdown, false);
}
window.onresize = resize;

function togglerunning() {
	if (needsAnimate) { animate(); needsAnimate = false;} 
	running = !running; // toggle
}

function touchdown(e) {
	e.preventDefault();
	if (auContext.state === 'suspended') {auContext.resume();} // for mobile safari
	togglerunning();
}

function doKeyDown(e) {
	//alert( e.keyCode );
	
	e.preventDefault; // no need to trigger slideshow when embedded
	
	if ( e.keyCode == 32 ) {  // q
		togglerunning();
	}
	if ( e.keyCode == 100 ) {  // d
		animate(); // because crazy
	}
}