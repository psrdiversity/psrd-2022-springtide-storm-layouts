'use strict';
(() => {
	const ANIMATE_TIME_MS = 500;

	// TO GET DONATION TOTALS, YOU MUST INSTALL AN EXTRA BUNDLE THAT SUPPLIES THEM (SEE THE nodecg-speedcontrol DOCUMENTATION).
	// The bundle name where all the tracker information is pulled from.
	// Here, we're listening for the Tiltify total by default.
	// Other bundle names that could be supplied here: speedcontrol-srcomtracker
	const trackerBundle = 'speedcontrol-gdqtracker'
	
	const donationTotalElem = document.querySelector('#donationTotal');
	
	// This is where the donation total is received.
	// The "change" event is triggered when the donation total changes.
	const donationTotal = nodecg.Replicant('donationTotal', trackerBundle);

	const animationIntervalId = { current: null };

	donationTotal.on('change', (newVal, oldVal) => {
		// There's no old value on initial page load, so no animation is needed.
		if (!oldVal) {
			// Toggle the commenting on these lines if you don't want cents/pence on your donation totals.
			// ALSO SEE BELOW INSIDE animateDonationTotal.
			// Math.floor(newVal) removes the cents/pence.
			// "toLocaleString" adds commas to the donation total to separate 1000s.
			
			const value = Math.floor(newVal + 560).toLocaleString('en-US', { minimumFractionDigits: 0 });
			//var value = newVal.toLocaleString('en-US', {minimumFractionDigits: 0});

			donationTotalElem.innerHTML = `$${value}`;
			if (animationIntervalId.current) clearInterval(animationIntervalId.current);
		} else {
			animateTotal(Number(newVal) + 560);
		}
	});
	
	function animateTotal(value) {
		if (animationIntervalId.current) clearInterval(animationIntervalId.current);

		const currentValue = Number(donationTotalElem.innerHTML.replace('$', '').replace(',', ''));

		console.log('av', donationTotalElem.innerHTML, currentValue);
		const timeBeforeIncrement = Math.max(ANIMATE_TIME_MS / (value - currentValue), 1);

		animationIntervalId.current = setInterval(() => {
			console.log(donationTotalElem.innerHTML);
			const nextValue = Number(donationTotalElem.innerHTML.replace('$', '').replace(',', '')) + 1;
			console.log('nv', nextValue);
			donationTotalElem.innerHTML = `$${nextValue}`;
			if (nextValue >= value) clearInterval(animationIntervalId.current);
		}, timeBeforeIncrement);
	}
	
	setTimeout(() => animateTotal(1000), 1000);
	// setTimeout(() => animateTotal(1500), 5000);
	// setTimeout(() => animateTotal(1500), 8000);
})();

