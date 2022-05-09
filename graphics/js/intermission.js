(() => {
	const speedcontrolBundle = 'nodecg-speedcontrol';
  const UPCOMING_RUN_SLOTS = 7;

  dayjs.extend(window.dayjs_plugin_relativeTime);
  dayjs.extend(window.dayjs_plugin_duration);

  const runDataArray = nodecg.Replicant('runDataArray', speedcontrolBundle);
	const runDataActiveRunSurrounding = nodecg.Replicant('runDataActiveRunSurrounding', speedcontrolBundle);

  const urlSearchParams = new URLSearchParams(window.location.search);
  const params = Object.fromEntries(urlSearchParams.entries());

  if (params.maxUpcoming) {
    for (let i = Number(params.maxUpcoming) + 1; i <= UPCOMING_RUN_SLOTS; i += 1) {
      const runElem = document.querySelector(`.upcoming-run-${i}`);

      runElem.classList.add('ignored-for-layout');
    }
    
    document.querySelector('.items-scroll-bar').classList.add('hidden');
  }

  function updateUpcomingRuns() {
    const pendingRunId = runDataActiveRunSurrounding.value.next;

    let nextRunIndex = -1;

    for (const [index, run] of runDataArray.value.entries()) {
      if (run.id === pendingRunId) {
        nextRunIndex = index;
        break;
      }
    }

    let cumulativeRunTime = dayjs.duration(0);

    for (let i = 1; i <= UPCOMING_RUN_SLOTS; i += 1) {
      const runElem = document.querySelector(`.upcoming-run-${i}`);
      const upcomingRun = runDataArray.value[nextRunIndex + i - 1];

      if (nextRunIndex !== -1 && upcomingRun) {
        runElem.classList.remove('hidden');

        const normalizedGameName = upcomingRun.game.length > 24 ? upcomingRun.game.replace(/Pok[eé]mon/, '').trim() : upcomingRun.game;

        runElem.querySelector('.upcoming-run-name').textContent = normalizedGameName;

        const runnerTeams = upcomingRun.teams.filter(team => {
          const name = team.name?.toLowerCase() ?? '';
            
          return name.indexOf('host') === -1 && name.indexOf('commentary') === -1;
        });
        
        const runners = runnerTeams.reduce((acc, team) => [
          ...acc, 
          ...team.players.map(player => player.name),
        ], []);
  
        runElem.querySelector('.upcoming-run-runner').textContent = `${upcomingRun.category} by ${runners.join(', ')}`;

        runElem.querySelector('.upcoming-run-offset').innerHTML = cumulativeRunTime.asMilliseconds() === 0 ? 'Up next!' : `<div class="in-about">In about</div><div>${cumulativeRunTime.humanize()}</div>`;

        const durationSegments = upcomingRun.estimate?.split(':') ?? [];
        const duration = dayjs.duration({
          seconds: durationSegments[durationSegments.length - 1] ?? 0,
          minutes: durationSegments[durationSegments.length - 2] ?? 0,
          hours: durationSegments[durationSegments.length - 3] ?? 0,
        })

        cumulativeRunTime = cumulativeRunTime.add(duration);
      } else {
        runElem.classList.add('hidden');
      }
    }
  }

  NodeCG.waitForReplicants(runDataArray, runDataActiveRunSurrounding).then(() => {
		if (runDataActiveRunSurrounding.value) updateUpcomingRuns();
	});

  runDataActiveRunSurrounding.on('change', newVal => {
		if (newVal) updateUpcomingRuns();
	});
})();