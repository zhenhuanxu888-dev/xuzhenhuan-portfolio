(() => {
  const fine = matchMedia('(pointer: fine)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const prototype = location.pathname.includes('/prototypes/');
  if (prototype) document.documentElement.classList.add('site-cursor-prototype');

  const cursor = document.createElement('div');
  cursor.className = 'site-cursor';
  cursor.setAttribute('aria-hidden', 'true');
  cursor.innerHTML = `<img src="${prototype ? '../' : ''}assets/images/magic-cat.png" alt="">`;
  const effects = document.createElement('div');
  effects.className = 'site-cursor-effects';
  effects.setAttribute('aria-hidden', 'true');
  document.body.append(cursor, effects);

  let active = false;
  let lastTrail = 0;
  let lastX = 0;
  let lastY = 0;
  let lastTarget = null;
  let pounceTimer = 0;
  const isAllowed = () => fine.matches && !reduced.matches;
  const paused = () => document.body.classList.contains('motion-paused');
  const hide = () => cursor.classList.remove('is-visible');
  const interactiveSelector = 'a,button,summary,[role="button"],.case-figure img,.masonry-item img,.system-board img,.storyboard-grid img,.photo-wall img';
  const editableSelector = 'input,textarea,select,[contenteditable="true"],iframe';

  function lightSurface(element) {
    for (let node = element; node instanceof Element; node = node.parentElement) {
      const match = getComputedStyle(node).backgroundColor.match(/rgba?\(([^)]+)\)/);
      if (!match) continue;
      const [red, green, blue, alpha = 1] = match[1].split(/[\s,\/]+/).filter(Boolean).map(Number);
      if (alpha < .8) continue;
      return (.2126 * red + .7152 * green + .0722 * blue) > 153;
    }
    return false;
  }

  function syncPreference() {
    if (!isAllowed()) {
      active = false;
      hide();
      document.documentElement.classList.remove('site-cursor-enabled');
      effects.replaceChildren();
    }
  }
  fine.addEventListener('change', syncPreference);
  reduced.addEventListener('change', syncPreference);

  function addEffect(className, x, y, variables = {}) {
    const effect = document.createElement('i');
    effect.className = className;
    effect.style.left = `${x}px`;
    effect.style.top = `${y}px`;
    for (const [name, value] of Object.entries(variables)) effect.style.setProperty(name, value);
    effects.append(effect);
    effect.addEventListener('animationend', () => effect.remove(), { once: true });
    setTimeout(() => effect.remove(), 1400);
  }

  addEventListener('pointermove', event => {
    if (!isAllowed() || event.pointerType !== 'mouse') return;
    const target = event.target;
    const editable = target instanceof Element && Boolean(target.closest(editableSelector));
    if (editable) { hide(); return; }
    if (!active) {
      active = true;
      document.documentElement.classList.add('site-cursor-enabled');
    }
    if (prototype && window.parent !== window && !cursor.classList.contains('is-visible')) {
      window.parent.postMessage({ type: 'portfolio-cursor-inside-frame' }, '*');
    }
    cursor.classList.add('is-visible');
    cursor.classList.toggle('is-interactive', target instanceof Element && Boolean(target.closest(interactiveSelector)));
    if (target !== lastTarget && target instanceof Element) {
      const light = lightSurface(target);
      cursor.classList.toggle('is-on-light', light);
      effects.classList.toggle('is-on-light', light);
      lastTarget = target;
    }
    cursor.style.transform = `translate3d(${event.clientX - (prototype ? 12 : 15)}px,${event.clientY - (prototype ? 9 : 12)}px,0)`;
    document.querySelector('.hero')?.classList.add('has-active-cat-cursor');

    const now = performance.now();
    const distance = Math.hypot(event.clientX - lastX, event.clientY - lastY);
    if (!paused() && !prototype && now - lastTrail > 125 && distance > 24 && effects.childElementCount < 24) {
      addEffect('site-cursor-trail', event.clientX - 10, event.clientY + 16);
      lastTrail = now;
    }
    lastX = event.clientX;
    lastY = event.clientY;
  }, { passive: true });

  addEventListener('pointerdown', event => {
    if (!isAllowed() || event.pointerType !== 'mouse' || event.button !== 0 || paused()) return;
    if (event.target instanceof Element && event.target.closest(editableSelector)) return;
    cursor.classList.remove('is-pouncing');
    void cursor.offsetWidth;
    cursor.classList.add('is-pouncing');
    clearTimeout(pounceTimer);
    pounceTimer = setTimeout(() => cursor.classList.remove('is-pouncing'), 450);
    if (effects.childElementCount > 36) return;
    addEffect('site-cursor-flash', event.clientX, event.clientY);
    const count = prototype ? 4 : 7;
    for (let index = 0; index < count; index++) {
      const angle = (index / count) * Math.PI * 2 + Math.random() * .24;
      const distance = (prototype ? 17 : 28) + Math.random() * (prototype ? 24 : 40);
      addEffect('site-cursor-star', event.clientX, event.clientY, {
        '--dx': `${Math.cos(angle) * distance}px`,
        '--dy': `${Math.sin(angle) * distance}px`,
        '--size': `${(prototype ? 9 : 12) + Math.round(Math.random() * (prototype ? 8 : 13))}px`,
        '--spin': `${index % 2 ? -90 : 90}deg`,
        '--duration': `${750 + Math.round(Math.random() * 220)}ms`
      });
    }
  }, { passive: true });

  addEventListener('pointerout', event => { if (!event.relatedTarget || event.relatedTarget instanceof HTMLIFrameElement) hide(); });
  addEventListener('message', event => {
    if (event.data?.type !== 'portfolio-cursor-inside-frame') return;
    if ([...document.querySelectorAll('.prototype iframe')].some(frame => frame.contentWindow === event.source)) hide();
  });
  addEventListener('blur', hide);
  document.addEventListener('visibilitychange', () => { if (document.hidden) hide(); });
})();
