'use strict';
(() => {
	// The bundle name where all the run information is pulled from.
	const speedcontrolBundle = 'nodecg-speedcontrol';
	
	const timerElem = document.querySelector('#timer');

	// This is where the timer information is received.
	// The "change" event is triggered whenever the time changes or the state changes.
	const timer = nodecg.Replicant('timer', speedcontrolBundle);

	timer.on('change', (newVal, oldVal) => {
		if (newVal) updateTimer(newVal, oldVal);
	});
	
	// Sets the timer text and classes.
	function updateTimer(newVal, oldVal) {
		// Change class on the timer to change the colour if needed.
		// See the common.css file for more information.
		if (oldVal) timerElem.classList.remove(`timer_${oldVal.state}`);
		timerElem.classList.add(`timer_${newVal.state}`);		

		timerElem.innerHTML = newVal.time;
	}

	document.body.classList.add('timer-loaded');
})();