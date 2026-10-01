(() => {
  const hero = document.querySelector('.hero');
  const scene = document.querySelector('.forest-scene');
  const layers = [...document.querySelectorAll('.forest-layer')];
  const motionButton = document.querySelector('.motion-toggle');
  const introButton = document.querySelector('.intro-toggle');
  if (!hero || !scene || !layers.length) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(pointer: fine)');
  const state = { x: 0, y: 0, targetX: 0, targetY: 0, scroll: 0, targetScroll: 0, paused: false, visible: true, frame: 0, raf: 0 };

  function setCopyVisible(visible) {
    hero.classList.toggle('is-copy-visible', visible);
    hero.classList.toggle('is-copy-hidden', !visible);
    if (introButton) {
      introButton.textContent = visible ? '收起介绍 ↗' : '显示介绍 ↗';
      introButton.setAttribute('aria-expanded', String(visible));
    }
  }
  if (reduced.matches) {
    if (introButton) {
      introButton.hidden = false;
      introButton.textContent = '收起介绍 ↗';
      introButton.setAttribute('aria-expanded', 'true');
    }
  } else {
    hero.classList.add('is-entering');
    setTimeout(() => {
      hero.classList.add('intro-has-played');
      setCopyVisible(true);
    }, 2850);
    setTimeout(() => {
      setCopyVisible(false);
      hero.classList.add('intro-complete');
      if (introButton) introButton.hidden = false;
    }, 7800);
  }
  introButton?.addEventListener('click', () => {
    const visible = hero.classList.contains('is-copy-visible') || (!hero.classList.contains('is-entering') && !hero.classList.contains('is-copy-hidden'));
    setCopyVisible(!visible);
  });

  for (let index = 0; index < 18; index++) {
    const light = document.createElement('i');
    light.className = 'forest-firefly';
    light.style.setProperty('--x', `${(index * 47.31 + 13) % 100}%`);
    light.style.setProperty('--y', `${(index * 31.67 + 9) % 85}%`);
    light.style.setProperty('--delay', `${(index % 7) * -.73}s`);
    light.style.setProperty('--size', `${index % 4 === 0 ? 4 : 2}px`);
    scene.append(light);
  }

  function paint() {
    state.x += (state.targetX - state.x) * .07;
    state.y += (state.targetY - state.y) * .07;
    state.scroll += (state.targetScroll - state.scroll) * .09;
    layers.forEach(layer => {
      const depth = Number(layer.dataset.depth);
      const x = state.x * depth * 98;
      const y = state.y * depth * 62 + state.scroll * depth * .12;
      layer.style.transform = `translate3d(calc(-50% + ${x.toFixed(2)}px),calc(-50% + ${y.toFixed(2)}px),0)`;
    });
  }
  function frame() {
    if (state.paused || !state.visible || document.hidden || reduced.matches) return;
    state.frame++;
    paint();
    state.raf = requestAnimationFrame(frame);
  }
  function sync() {
    cancelAnimationFrame(state.raf);
    if (!state.paused && state.visible && !document.hidden && !reduced.matches) frame();
  }
  hero.addEventListener('pointermove', event => {
    if (!fine.matches || state.paused || reduced.matches) return;
    const rect = hero.getBoundingClientRect();
    state.targetX = Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1));
    state.targetY = Math.max(-1, Math.min(1, (event.clientY - rect.top) / rect.height * 2 - 1));
  }, { passive: true });
  hero.addEventListener('pointerleave', () => { state.targetX = 0; state.targetY = 0; });
  addEventListener('scroll', () => { state.targetScroll = Math.min(scrollY, hero.offsetHeight); }, { passive: true });
  new IntersectionObserver(([entry]) => { state.visible = entry.isIntersecting; sync(); }, { threshold: .01 }).observe(hero);
  document.addEventListener('visibilitychange', sync);
  motionButton?.addEventListener('click', () => {
    state.paused = !state.paused;
    motionButton.setAttribute('aria-pressed', String(state.paused));
    motionButton.textContent = state.paused ? '继续动效' : '暂停动效';
    document.body.classList.toggle('motion-paused', state.paused);
    sync();
  });
  if (reduced.matches && motionButton) motionButton.hidden = true;
  sync();

  hero.addEventListener('pointerdown', () => {
    if (reduced.matches || state.paused) return;
    const resident = hero.querySelector('.forest-cat');
    if (!resident) return;
    resident.classList.remove('is-jumping');
    void resident.offsetWidth;
    resident.classList.add('is-jumping');
    setTimeout(() => resident.classList.remove('is-jumping'), 690);
  }, { passive: true });
})();
