// @if phone

const isMobile = {
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
}

// constants
//const REWIND = 'REWIND'
const FORWARD = 'FORWARD'
const minCap = 1000

const container = document.getElementById('video')
const playerForward = document.getElementById('playerForward')

// preloading
var req1 = new XMLHttpRequest()
req1.open('GET', '/video/dark.mp4', true)
req1.responseType = 'blob'

req1.onload = function() {
	// Onload is triggered even on 404
	// so we need to check the status code
	if (this.status === 200) {
	   var videoBlob = this.response
	   var vid = URL.createObjectURL(videoBlob) // IE10+
	   // Video is now downloaded
	   // and we can set it as source on the video element
	   playerForward.src = vid
	}
}

req1.send()

// debouncer
function debounce(func, wait, immediate) {
	let timeout
	return function(...args) {
		const later = () => {
			timeout = null
			if (!immediate) func(...args)
		}
		
		const callNow = immediate && !timeout

		clearTimeout(timeout)
		timeout = setTimeout(later, wait)
		if (callNow) func(...args)
	}
}

// resetters
let seekTimer
let intervalRewind

let activePlayer = playerForward
let mainSEEK = FORWARD

playerForward.onloadeddata = function() {
	playerForward.playbackRate = 0
	playerForward.play()
}

playerForward.onended = function() {
	playerForward.playbackRate = 0
	playerForward.play()
}

const videoInfo = {
	_speed: 0,
	get speed() {
		return this._speed
	},
	set speed(val) {
		if(val < 0.0625 && val !== 0) val = 0.0625 // because val = 0 is allowed
		if(val > 2.5) val = 2.5 // cap
		this._speed = val
		activePlayer.playbackRate = this._speed
	}
}

let ts, touchduration = 20, revTimer, forTimer

// Touch devices

document.getElementById('forward').addEventListener('touchstart', e => {
	console.log('Touching forward')
	forTimer = setInterval(_ => {
		var event = new CustomEvent('proceed')
		event.forcedDelta = -3
		event.initEvent("proceed", false, true)
		container.dispatchEvent(event)

	}, touchduration)
})

document.getElementById('forward').addEventListener('touchend', e => {
	console.log('Touching forward over')

	clearInterval(forTimer)
})


// Mouse

document.addEventListener('mousedown', e => {
	console.log('Mouse down')

	forTimer = setInterval(_ => {
		var event = new CustomEvent('proceed')
		event.forcedDelta = -3
		event.initEvent("proceed", false, true)
		container.dispatchEvent(event)

	}, touchduration)

}, false)

document.addEventListener('mouseup', e => {
	
	console.log('Mouse forward over')

	clearInterval(forTimer)
	
}, false)

container.addEventListener('proceed', debounce(handleScroll, touchduration/2, true), false)

async function handleScroll(e) {
	const delta = e.forcedDelta // forcedDelta => touchmove => mobile

	const seekDirection = delta > 0 ? REWIND : FORWARD

	!activePlayer.paused && await activePlayer.play()

	clearTimeout(seekTimer)
	//console.log('Requesting and setting speed')
	
	
	//if(delta < 0) {
		// scrolling forward, +ve playbackrate
	if(isNaN(videoInfo.speed)) videoInfo.speed = 0
	videoInfo.speed += Math.abs(delta)
	//} else {
		// scrolling back but -ve playback not allowed
	//	videoInfo.negSpeed += Math.abs(delta)
	//}
	//console.log('Speed set')

	seekTimer = setTimeout(() => {
		const intv = setInterval(() => {
			//console.log('Requesting speed')
			let deacceleration
			const speed = videoInfo.speed
			
			if(speed > 2) { // too much speed, reduce fast
				deacceleration = 0.1*speed
			} else if(speed > 1.5) {
				deacceleration = 0.07*speed
			} else {
				deacceleration = 0.05*speed
			}
			//videoInfo.speed -= 0.05*videoInfo.speed
			//if(delta < 0) {
			//	console.log('Forward deacc')
				videoInfo.speed = speed - deacceleration
		//	} else {
		//		console.log('Rewind deacc')
		//		rewind(speed - deacceleration)
				videoInfo.negSpeed = speed - deacceleration
		//	}
		//	console.log('Requesting speed 2')
			if(videoInfo.speed < 0.07) {
		//		console.log('Setting speed 2')
				videoInfo.speed = 0
				clearInterval(intv)
			} else {
				//console.log(videoInfo.speed)
			}
		}, 10)
	}, 50)

	//console.log(e.wheelDeltaY)
}