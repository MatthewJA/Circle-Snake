var width = 0;
var height = 0;
var context = null;

var s = 2;
var x = 0;
var y = 0;
var d = 0;
var dd = 0.07;

var foodX = 0;
var foodY = 0;

var tail = [];
var score = 0;
var tailBoostTimeout = 10;

var colliding = false;

var leftDown = false;
var rightDown = false;

var angleSliderPosition = 0;

var gameOver = false;

var foodAnimationStep = 0;

function setNormalFill() {context.fillStyle = "rgb(239, 239, 239)"; context.strokeStyle = "rgb(239, 239, 239)"; context.lineWidth = 4;};
function setDarkerFill() {context.fillStyle = "rgb(101, 101, 101)"; context.strokeStyle = "rgb(101, 101, 101)"; context.lineWidth = 4;};
function setGreenFill() {context.fillStyle = "rgb(100, 255, 100)"; context.strokeStyle = "rgb(100, 255, 100)"; context.lineWidth = 4;};
function randomiseFood() {
	foodX = Math.random() * (width-60) + 30;
	foodY = Math.random() * (height-60) + 30;
	foodAnimationStep = 40;
};

function update() {

	document.getElementById('sound').playbackRate = Math.min(4, Math.max(0.5, 5 * (score / 40))+0.5);

	context.clearRect(0, 0, width, height);

	if(foodAnimationStep > 0) {
		foodAnimationStep -= 1;
	}

	if(s < 10) {
		s = 2 + score/5;
	}

	// draw the tail
	setNormalFill();
	context.beginPath();
	context.moveTo(tail[0][0], tail[0][1]);
	for (var i = 0; i < tail.length; i++) {
		context.lineTo(tail[i][0], tail[i][1]);
	};
	context.stroke();

	// draw food
	context.beginPath();
	setGreenFill();
	context.arc(foodX, foodY, 10*Math.cos(foodAnimationStep/(80/Math.PI)), 0, 2 * Math.PI, false);
	context.closePath();
	context.fill();

	// if the coordinates are non-background-coloured, we've crashed
	var nx = x + s * Math.cos(d);
	var ny = y + s * Math.sin(d);

	var pixels = context.getImageData(Math.round(nx), Math.round(ny), 1, 1).data;
	
	if(pixels[0] == 100) {
		score += 1;
		tailBoostTimeout += 10;
		randomiseFood();
	} else if(pixels[0] == 239 || x < 0 || y < 0 || x >= width || y >= height) {
		gameOver = true;
	};

	setNormalFill();
	context.beginPath();
	context.arc(x, y, 4, 0, 2 * Math.PI, false);
	context.closePath();
	context.fill();

	x = nx;
	y = ny;

	if(!gameOver) {
		if(leftDown) dd -= 0.05;
		if(rightDown) dd += 0.05;
	}
	d += dd;

	tail.push([x, y]);
	if(tailBoostTimeout <= 0) {
		tail.shift();
	} else {
		tailBoostTimeout -= 1;
	}

	// draw left and right arrows
	
	setDarkerFill();
	
	// left

	context.beginPath();
	context.moveTo(5, height-25);
	context.lineTo(20, height-10);
	context.lineTo(20, height-20);
	context.lineTo(40, height-20);
	context.lineTo(40, height-30);
	context.lineTo(20, height-30);
	context.lineTo(20, height-40);
	context.closePath();
	context.fill();

	// right

	context.beginPath();
	context.moveTo(width-10, height-25);
	context.lineTo(width-20, height-15);
	context.lineTo(width-20, height-22);
	context.lineTo(width-40, height-22);
	context.lineTo(width-40, height-28);
	context.lineTo(width-20, height-28);
	context.lineTo(width-20, height-35);
	context.closePath();
	context.fill();

	// show the angle line
	setDarkerFill();
	context.moveTo(40, height-25);
	context.lineTo(width-40, height-25);
	context.closePath();
	context.stroke();

	// and show the angle.
	var intendedXPosition = ((width/2-40)*(dd/(Math.PI/3))) + width/2;
	angleSliderPosition = (intendedXPosition + angleSliderPosition*3)/4;
	context.arc(
		angleSliderPosition, height-25, 10, 0, 2 * Math.PI, false
	);
	context.fill();

	if(gameOver) {
		context.fillStyle = 'rgba(255, 133, 133, .6)';
		context.fillRect(0, 0, width, height);
		foodX = -100;
		foodY = -100;
		setNormalFill();
		context.font = "bold 25px sans-serif";
		context.textBaseline = "middle";
		context.textAlign = "center";
		context.fillText("Game over! You scored: "+score, width/2, height/2);
		context.font = "bold 12px sans-serif";
		context.fillText("<Enter> to restart", width/2, height/2+25);
	}

	leftDown = false;
	rightDown = false;

	// show the score
	setDarkerFill();
	context.font = "bold 25px sans-serif";
	context.textBaseline = "bottom";
	context.textAlign = "right";
	context.fillText(score, width-10, height-50);
};

$(document).ready(function() {
	var canvas = $("#canvas");
	context = canvas.get(0).getContext("2d");

	width = window.innerWidth;
	height = window.innerHeight;
	context.canvas.width = width;
	context.canvas.height = height;

	x = width/2;
	y = height/2;
	tail.push([x, y]);
	randomiseFood();
	angleSliderPosition = width/2;

	setNormalFill();

	setInterval(update, 30);

	$('#canvas').bind('keydown.left', function() {leftDown = true;});
	$('#canvas').bind('keydown.right', function() {rightDown = true;});
	$('#canvas').bind('keydown.return', restart);
	$('#canvas').focus()
	$('#mute').click(function() {
		var audio = document.getElementById('sound');
		if(audio.muted) {
			$('#mute').attr('src', './mute.png');
			audio.muted = false;
		} else {
			$('#mute').attr('src', './unmute.png');
			audio.muted = true;
		}
		$('#canvas').focus();
	});
	document.getElementById('sound').addEventListener('ended', function() {
		this.currentTime = 0;
		this.play();
	}, false);
});

function restart() {
	x = width/2;
	y = height/2;
	score = 0;
	gameOver = false;
	angleSliderPosition = width/2;
	tail = [[x, y]];
	randomiseFood();
	setNormalFill();
	d = 0;
	dd = 0.07;
	tailBoostTimeout = 10;
};