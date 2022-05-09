'use strict';
(() => {
	// The bundle name where all the run information is pulled from.
	const speedcontrolBundle = 'nodecg-speedcontrol';
	
	const gameTitle = document.querySelectorAll('.game-title');
	const gameCategory = document.querySelectorAll('.game-category');
	const gameEstimate = document.querySelectorAll('.game-estimate');
	const gameConsole = document.querySelectorAll('.game-console');
	const runnerLeftInfo = document.querySelector('#runner-left');
	const runnerRightInfo = document.querySelector('#runner-right');
	const hostInfo = document.querySelectorAll('.host-info');
	const commentaryInfo = document.querySelectorAll('.commentary-info');
	const nextRunElem = document.querySelector('.up-next-text');
	const irlRunMarkerElems = [...document.querySelectorAll('.info-flair-irl')];
	const onlineRunMarkerElems = [...document.querySelectorAll('.info-flair-online')];
	
	// This is where the information is received for the run we want to display.
	// The "change" event is triggered when the current run is changed.
	const runDataArray = nodecg.Replicant('runDataArray', speedcontrolBundle);
	const runDataActiveRun = nodecg.Replicant('runDataActiveRun', speedcontrolBundle);
	const runDataActiveRunSurrounding = nodecg.Replicant('runDataActiveRunSurrounding', speedcontrolBundle);

	runDataActiveRun.on('change', newVal => {
		if (newVal) updateSceneFields(newVal);
	});

	function updateUpNext(id) {
		const nextRun = runDataArray.value.find(item => item.id === id);

		if (nextRun) {
			const runnerTeams = nextRun.teams.filter(team => (team.name || '').toLowerCase().indexOf('host') === -1);
			const runners = runnerTeams.reduce((acc, team) => [
				...acc, 
				...team.players.map(player => player.name),
			], []);

			nextRunElem.innerHTML = `${nextRun.game.replace('é', 'e')} ${nextRun.category} by ${runners.join(', ')}`;
		} else {
			nextRunElem.innerHTML = 'Finale!';
		}
	}

	NodeCG.waitForReplicants(runDataArray, runDataActiveRunSurrounding).then(() => {
		if (runDataActiveRunSurrounding.value) updateUpNext(runDataActiveRunSurrounding.value.next);

		document.body.classList.add('run-info-loaded');
	});
	
	runDataActiveRunSurrounding.on('change', newVal => {
		if (newVal) updateUpNext(newVal.next)
	});

	function updateElementSetHTML(elements, value) {
		[...elements].forEach(element => {
			element.innerHTML = value;
		})
	}

	function setRunnerInfo(elem, runner) {
		// speedcontrol has the ability to have multiple players in a team,
		// but for here we'll just return the 1st one.
		updateElementSetHTML(elem.querySelectorAll('.player'), runner.name);
		
		const pronounsElem = elem.querySelectorAll('.pronouns');

		updateElementSetHTML(pronounsElem, runner.pronouns);

		if (runner.pronouns) {
			[...pronounsElem].forEach(elem => {
				elem.classList.remove('hidden');
			});
		} else {
			[...pronounsElem].forEach(elem => {
				elem.classList.add('hidden');
			});
		}
	}
	
	function setCommentatorData(className, commentatorName, commentatorPronouns) {
		const parentElem = document.querySelector(className);

		if (!parentElem) return;

		parentElem.classList.remove('hidden');

		if (!commentatorName) {
			parentElem.classList.add('hidden');

			return;
		}

		parentElem.querySelector('.name').textContent = commentatorName;

		const pronounsBlock = parentElem.querySelector('.commentator-block-pronouns');

		pronounsBlock.classList.remove('hidden');

		if (commentatorPronouns) {
			pronounsBlock.querySelector('.pronouns').textContent = commentatorPronouns.toLowerCase();
		} else {
			pronounsBlock.classList.add('hidden');
		}
	}
	
	// Sets information on the pages for the run.
	function updateSceneFields(runData) {
		updateElementSetHTML(gameTitle, runData.game);
		updateElementSetHTML(gameCategory, runData.category);
		updateElementSetHTML(gameEstimate, runData.estimate);
		updateElementSetHTML(gameConsole, `${runData.system} - ${runData.release}`);
		
		const runnerTeams = runData.teams.filter(team => (team.name || '').toLowerCase().indexOf('host') === -1);

		const runner1InfoBlock = runnerTeams.length === 1 ? runnerRightInfo : runnerLeftInfo;
		const runner2InfoBlock = runnerTeams.length === 1 ? runnerLeftInfo : runnerRightInfo;

		setRunnerInfo(runner1InfoBlock, runnerTeams[0].players[0]);
	
		runner1InfoBlock.classList.remove('no-game-info');
		runner2InfoBlock?.classList.add('no-game-info');

		if (runnerTeams.length > 1) {
			runner1InfoBlock.classList.remove('solo');
			runner1InfoBlock.classList.remove('hidden');
			document.body.classList.remove('solo');

			setRunnerInfo(runner2InfoBlock, runnerTeams[1].players[0]);
		} else {
			runner1InfoBlock.classList.add('solo');
			runner2InfoBlock.classList.add('hidden');
			document.body.classList.add('solo');
		}
		
		irlRunMarkerElems.forEach(elem => elem.classList.remove('enabled'));
		onlineRunMarkerElems.forEach(elem => elem.classList.remove('enabled'));

		if (runData.customData.runLocation?.toLowerCase() === 'online') {
			onlineRunMarkerElems.forEach(elem => elem.classList.add('enabled'));
		} else if (runData.customData.runLocation?.toLowerCase() === 'offline') {
			irlRunMarkerElems.forEach(elem => elem.classList.add('enabled'));
		}

		setCommentatorData('.commentator-1', runData.customData.commentator1Name, runData.customData.commentator1Pronouns);
		setCommentatorData('.commentator-2', runData.customData.commentator2Name, runData.customData.commentator2Pronouns);
		setCommentatorData('.commentator-3', runData.customData.commentator3Name, runData.customData.commentator3Pronouns);
		setCommentatorData('.commentator-4', runData.customData.commentator4Name, runData.customData.commentator4Pronouns);
	}
})();