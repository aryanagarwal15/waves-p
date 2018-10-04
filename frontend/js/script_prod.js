'use strict';

// @if phone
window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || function (f) {
	return setTimeout(f, 1000 / 60);
}; // simulate calling code 60

// constants
//const REWIND = 'REWIND'
var FORWARD = 'FORWARD';
var minCap = 1000;

var container = document.getElementById('video');
var playerForward = document.getElementById('playerForward');

// preloading
var req1 = new XMLHttpRequest();
req1.open('GET', '/video/dark.mp4', true);
req1.responseType = 'blob';

req1.onload = function () {
	if (this.status === 200) {
		var videoBlob = this.response;
		var vid = URL.createObjectURL(videoBlob); // IE10+
		playerForward.src = vid;

		var elem = document.getElementById('pre-load'); //.style.display = 'none';
		elem.parentNode.removeChild(elem);
	}
};

req1.send();

// debouncer
function debounce(func, wait, immediate) {
	var timeout = void 0;
	return function () {
		for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
			args[_key] = arguments[_key];
		}

		var later = function later() {
			timeout = null;
			if (!immediate) func.apply(undefined, args);
		};

		var callNow = immediate && !timeout;

		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(undefined, args);
	};
}

// resetters
var seekTimer = void 0;
var intervalRewind = void 0;

var activePlayer = playerForward;
var mainSEEK = FORWARD;

playerForward.onloadeddata = function () {
	playerForward.playbackRate = 0;
	playerForward.play();
};

playerForward.onended = function () {
	playerForward.playbackRate = 0;
	playerForward.pause();

	var register = document.getElementById('registerEnd');

	register.style.display = 'flex';
	register.style.opacity = 0;

	requestAnimationFrame(showRegister);
};

function showRegister() {

	var register = document.getElementById('registerEnd');

	if (+register.style.opacity < 1) {
		register.style.opacity = +register.style.opacity + 0.1;
		requestAnimationFrame(showRegister);
	}
}

var videoInfo = {
	_speed: 0,
	get speed() {
		return this._speed;
	},
	set speed(val) {
		if (val < 0.0625 && val !== 0) val = 0.0625; // because val = 0 is allowed
		if (val > 2.5) val = 2.5; // cap
		this._speed = val;
		activePlayer.playbackRate = this._speed;
	}
};

var ts = void 0,
    touchduration = 20,
    revTimer = void 0,
    forTimer = void 0;

function touchStart() {
	console.log('Touching forward');

	document.getElementById('forward').innerText = '';

	clearInterval(forTimer);
	forTimer = setInterval(function (_) {
		var event = new CustomEvent('proceed');
		event.forcedDelta = -3;
		event.initEvent("proceed", false, true);
		container.dispatchEvent(event);
	}, touchduration);
}

function touchEnd() {
	console.log('Touch forward over');

	clearInterval(forTimer);
}

// Touch devices

document.getElementById('forward').addEventListener('touchstart', touchStart);

document.getElementById('forward').addEventListener('touchend', touchEnd);

// Mouse

document.addEventListener('mousedown', touchStart, false);

document.addEventListener('mouseup', touchEnd, false);

container.addEventListener('proceed', debounce(handleScroll, touchduration / 2, true), false);

function handleScroll(e) {
	var delta, seekDirection;
	return Promise.resolve().then(function () {
		delta = e.forcedDelta; // forcedDelta => touchmove => mobile

		seekDirection = delta > 0 ? REWIND : FORWARD;
		return !activePlayer.paused && activePlayer.play();
	}).then(function () {

		clearTimeout(seekTimer);
		//console.log('Requesting and setting speed')


		//if(delta < 0) {
		// scrolling forward, +ve playbackrate
		if (isNaN(videoInfo.speed)) {
			videoInfo.speed = 0;
		}videoInfo.speed += Math.abs(delta);
		//} else {
		// scrolling back but -ve playback not allowed
		//	videoInfo.negSpeed += Math.abs(delta)
		//}
		//console.log('Speed set')

		seekTimer = setTimeout(function () {
			var intv = setInterval(function () {
				//console.log('Requesting speed')
				var deacceleration = void 0;
				var speed = videoInfo.speed;

				if (speed > 2) {
					// too much speed, reduce fast
					deacceleration = 0.1 * speed;
				} else if (speed > 1.5) {
					deacceleration = 0.07 * speed;
				} else {
					deacceleration = 0.05 * speed;
				}
				//videoInfo.speed -= 0.05*videoInfo.speed
				//if(delta < 0) {
				//	console.log('Forward deacc')
				videoInfo.speed = speed - deacceleration;
				//	} else {
				//		console.log('Rewind deacc')
				//		rewind(speed - deacceleration)
				videoInfo.negSpeed = speed - deacceleration;
				//	}
				//	console.log('Requesting speed 2')
				if (videoInfo.speed < 0.07) {
					//		console.log('Setting speed 2')
					videoInfo.speed = 0;
					clearInterval(intv);
				} else {
					//console.log(videoInfo.speed)
				}
			}, 10);
		}, 50);

		//console.log(e.wheelDeltaY)
	});
}