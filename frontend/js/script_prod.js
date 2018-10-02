'use strict';

// @if phone

var isMobile = {
	Android: function Android() {
		return navigator.userAgent.match(/Android/i);
	},
	BlackBerry: function BlackBerry() {
		return navigator.userAgent.match(/BlackBerry/i);
	},
	iOS: function iOS() {
		return navigator.userAgent.match(/iPhone|iPad|iPod/i);
	},
	Opera: function Opera() {
		return navigator.userAgent.match(/Opera Mini/i);
	},
	Windows: function Windows() {
		return navigator.userAgent.match(/IEMobile/i);
	},
	any: function any() {
		return isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows();
	}
};

if (isMobile.any()) {
	document.getElementById('forward').style.display = 'flex';
	//document.getElementById('rewind').style.display = 'block'
}

// constants
var REWIND = 'REWIND';
var FORWARD = 'FORWARD';
var minCap = 1000;

var container = document.getElementById('video');
var playerForward = document.getElementById('playerForward');
var playerBackward = document.getElementById('playerBackward');

// preloading
var req1 = new XMLHttpRequest();
var req2 = new XMLHttpRequest();

req1.open('GET', 'video/dark.webm', true);
req2.open('GET', 'video/krad.webm', true);
req1.responseType = 'blob';
req2.responseType = 'blob';

req1.onload = function () {
	// Onload is triggered even on 404
	// so we need to check the status code
	if (this.status === 200) {
		var videoBlob = this.response;
		var vid = URL.createObjectURL(videoBlob); // IE10+
		// Video is now downloaded
		// and we can set it as source on the video element
		playerForward.src = vid;
	}
};

req1.onerror = function (e) {
	console.log(e);
};

req2.onload = function () {
	// Onload is triggered even on 404
	// so we need to check the status code
	if (this.status === 200) {
		var videoBlob = this.response;
		var vid = URL.createObjectURL(videoBlob); // IE10+
		// Video is now downloaded
		// and we can set it as source on the video element
		playerBackward.src = vid;
		playerBackward.onloadedmetadata = function (_) {
			playerBackward.currentTime = vid.duration;
		};
	}
};

req1.send();

if (!isMobile.any()) {
	// don't need rewind video if on phone
	req2.send();
}

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

// polyfill for negative playback
function rewind(rewindSpeed) {

	console.log('Rewinding with', rewindSpeed);
	clearInterval(intervalRewind);

	if (rewindSpeed < 0.07) {
		return activePlayer.playbackRate = 0;
	}

	intervalRewind = setInterval(function () {
		console.log('intv running');
		if (activePlayer.currentTime <= 0) {
			//player.pause()
			activePlayer.playbackRate = 0;
			activePlayer.currentTime = 0;
			return clearInterval(intervalRewind);
		}
		activePlayer.currentTime -= 0.02; // Math.max(startVideoTime - elapsed*rewindSpeed/1000.0, 0)
	}, 30);
}

var activePlayer = playerForward;
var mainSEEK = FORWARD;

playerBackward.onloadeddata = function () {
	playerBackward.playbackRate = 0;
	//playerBackward.currentTime = playerBackward.duration
	playerBackward.play();
};

playerForward.onloadeddata = function () {
	playerForward.playbackRate = 0;
	playerForward.play();
};

playerForward.onended = function () {
	playerForward.playbackRate = 0;
	playerForward.play();
};

playerBackward.onended = function () {
	playerBackward.playbackRate = 0;
	playerBackward.play();
};[playerForward, playerBackward].forEach(function (player) {
	player.addEventListener('timeupdate', function (_) {
		if (activePlayer == playerForward) {
			var time = playerForward.duration - playerForward.currentTime;
			//playerBackward.querySelector('source').setAttribute('src', '/x.mp4#t='+time)
			playerBackward.currentTime = time;
			//playerBackward.load()
		} else {
			var _time = playerBackward.duration - playerBackward.currentTime;
			//playerForward.querySelector('source').setAttribute('src', '/x.mp4#t='+time)
			playerForward.currentTime = _time;
			//playerForward.load()
		}
	});
});

var videoInfo = {
	_speed: 0,
	get speed() {
		//console.log('Getting speed => ', this._speed)
		return this._speed;
	},
	/*get negSpeed() {
 	return this._speed
 },*/
	set speed(val) {
		if (val < 0.0625 && val !== 0) val = 0.0625; // because val = 0 is allowed
		if (val > 2.5) val = 2.5; // cap
		this._speed = val;
		activePlayer.playbackRate = this._speed;
	}
};

//container.addEventListener('wheel', debounce(handleScroll, 15, true), false)

var ts = void 0,
    touchduration = 20,
    revTimer = void 0,
    forTimer = void 0;
var isHelperTextAvailable = true;

document.getElementById('forward').addEventListener('touchstart', function (e) {
	console.log('Touching forward');
	forTimer = setInterval(function (_) {

		var event = new CustomEvent('wheel');
		event.forcedDelta = -600;
		event.initEvent("wheel", false, true);
		container.dispatchEvent(event);
	}, touchduration);

	if (isHelperTextAvailable) {
		var el = document.getElementById('forward');
		el.innerText = '';
		isHelperTextAvailable = false;
	}
});

/* Disabling rewind on mobile devices
document.getElementById('rewind').addEventListener('touchstart', function (e) {
	console.log('Touching rewind');
	revTimer = setInterval(function (_) {

		var event = new CustomEvent('wheel');
		event.forcedDelta = 600;
		event.initEvent("wheel", false, true);
		container.dispatchEvent(event);
	}, touchduration);
});
*/

document.getElementById('forward').addEventListener('touchend', function (e) {
	console.log('Touching forward over');

	clearInterval(forTimer);
});

/* Disabling rewind on mobile devices
document.getElementById('rewind').addEventListener('touchend', function (e) {
	console.log('Touching rewind over');

	clearInterval(revTimer);
});*/

//if(!isMobile.any()) {
// if it's not a phone, add a scrolling event
container.addEventListener('wheel', debounce(handleScroll, 15, true), false);
//}


function handleScroll(e) {
	var delta, seekDirection;
	return Promise.resolve().then(function () {
		delta = (e.wheelDeltaY || e.forcedDelta) / 200; // forcedDelta => touchmove => mobile


		if (!(!!e.forcedDelta && !isMobile.any())) {
			return Promise.resolve().then(function () {

				console.log('delta = ', delta);

				seekDirection = delta > 0 ? REWIND : FORWARD;


				if (seekDirection === REWIND) {
					console.log('REWINDING');
					//playerBackward.currentTime = playerForward.duration - playerForward.currentTime
					activePlayer = playerBackward;
					document.getElementById('playerBackward').classList.remove('hide');
					document.getElementById('playerForward').classList.add('hide');
				} else {
					//playerForward.currentTime = playerBackward.duration - playerBackward.currentTime
					activePlayer = playerForward;
					document.getElementById('playerForward').classList.remove('hide');
					document.getElementById('playerBackward').classList.add('hide');
				}

				return Promise.resolve().then(function () {
					return activePlayer.play();
				}).catch(function (e) {
					console.log('Safari?', e);
				});
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
	}).then(function () {});
}