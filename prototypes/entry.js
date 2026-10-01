/* Portfolio entry points only; original prototype interactions remain intact. */
(() => {
  const entry = new URLSearchParams(location.search).get('entry');
  try {
    if (location.pathname.endsWith('tianyan-onboarding.html')) {
      if (entry === 'scene') nextPhase(2);
      if (entry === 'task') { skipAll(); toggleTaskPanel(); }
    }
    if (location.pathname.endsWith('tianyan-team.html')) {
      firstTeamEntry = false;
      switchWorkspace('team');
      if (entry === 'knowledge') showView('kb');
      if (entry === 'flow' || entry === 'room') {
        goToDemoNode();
        if (entry === 'room') openNodeRoom(2);
      }
    }
    if (location.pathname.endsWith('xinghe.html')) {
      if (entry === 'brand') navTo('dna');
      else if (entry === 'agents') navTo('agents');
      else {
        navTo('create');
        gotoStep(({ intent: 1, insight: 2, strategy: 3, edit: 5, publish: 6 })[entry] || 1);
      }
    }
    parent.postMessage({ type: 'portfolio-prototype-ready' }, '*');
  } catch (error) {
    console.error('Prototype entry could not be opened', error);
    parent.postMessage({ type: 'portfolio-prototype-error' }, '*');
  }
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') parent.postMessage({ type: 'portfolio-prototype-escape' }, '*');
  });
})();
