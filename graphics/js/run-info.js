'use strict';
(() => {
	// The bundle name where all the run information is pulled from.
	const speedcontrolBundle = 'nodecg-speedcontrol';
	
	const gameTitle = document.querySelector('#gameTitle');
	const gameCategory = document.querySelector('#gameCategory');
	const gameEstimate = document.querySelector('#gameEstimate');
	const runnerInfo = document.querySelector('#runner-info');
	const hostInfo = document.querySelector('#host-info');
	const commentaryInfo = document.querySelector('#commentary-info');
	
	// This is where the information is received for the run we want to display.
	// The "change" event is triggered when the current run is changed.
	const runDataActiveRun = nodecg.Replicant('runDataActiveRun', speedcontrolBundle);

	runDataActiveRun.on('change', newVal => {
		if (newVal) updateSceneFields(newVal);
	});

	function setRunnerInfo(elem, runner) {
		// speedcontrol has the ability to have multiple players in a team,
		// but for here we'll just return the 1st one.
		elem.querySelector('.player').innerHTML = runner.name;
		
		const pronounsElem = elem.querySelector('.pronouns');

		if (pronounsElem) pronounsElem.innerHTML = `(${runner.pronouns})`;

		if (runner.pronouns) {
			pronounsElem.classList.remove('hidden');
		} else {
			pronounsElem.classList.add('hidden');
		}
	}
	
	// Sets information on the pages for the run.
	function updateSceneFields(runData) {
		if(gameTitle) gameTitle.innerHTML = runData.game;
		if(gameCategory) gameCategory.innerHTML = runData.category;
		if(gameEstimate) gameEstimate.innerHTML = runData.estimate; 
		
		if (runnerInfo) {
			// Open the webpage with a hash parameter on the end to choose the team.
			// eg: http://localhost:9090/bundles/speedcontrol-simpletext/graphics/player.innerHTML = #2
			// If this can't be found, defaults to 1.
			const playerNumber = parseInt(window.location.hash.replace('#', '')) || 1;
			
			// Arrays start from 0 and not 1, so have to adjust for that.
			const runnerTeams = runData.teams.filter(team => team.name?.toLowerCase().indexOf('runner') !== -1);
			const team = runnerTeams[playerNumber-1];
			
			setRunnerInfo(runnerInfo, team.players[0]);
		}

		if (hostInfo) {
			const hostTeam = runData.teams.find(team => team.name?.toLowerCase().indexOf('host') !== -1);

			if (hostTeam) {
				setRunnerInfo(hostInfo, hostTeam.players[0])
			}
		}

		if (commentaryInfo) {
			const commentaryTeam = runData.teams.find(team => {
				const name = team.name?.toLowerCase();
				
				return name?.indexOf('commentators') !== -1 || name?.indexOf('commentary') !== -1;
			});

			if (commentaryTeam) {
				const runnerText = commentaryTeam.players.map(player => {
					if (player.pronouns) return `${player.name} (${player.pronouns})`;

					return player.name
				});

				commentaryInfo.innerHTML = runnerText.join(', ');
			}
		}
	}
})();