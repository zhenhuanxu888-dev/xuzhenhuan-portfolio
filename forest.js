(() => {
  const hero = document.querySelector('.hero');
  const scene = document.querySelector('.forest-scene');
  const layers = [...document.querySelectorAll('.forest-layer')];
  const motionButton = document.querySelector('.motion-toggle');
  const introButton = document.querySelector('.intro-toggle');
  const tiltButton = document.querySelector('.tilt-toggle');
  if (!hero || !scene || !layers.length) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(pointer: fine)');
  const touchDevice = matchMedia('(pointer: coarse), (hover: none)');
  const state = { x: 0, y: 0, targetX: 0, targetY: 0, scroll: 0, targetScroll: 0, paused: false, visible: true, frame: 0, raf: 0 };
  let touchX = 0;
  let touchY = 0;
  let touchUntil = 0;
  let tiltX = 0;
  let tiltY = 0;
  let orientationBase = null;
  let tiltEnabled = false;
  const clamp = value => Math.max(-1, Math.min(1, value));

  function setCopyVisible(visible) {
    hero.classList.toggle('is-copy-visible', visible);
    hero.classList.toggle('is-copy-hidden', !visible);
    if (introButton) {
      introButton.textContent = visible ? '收起介绍 ↗︎' : '显示介绍 ↗︎';
      introButton.setAttribute('aria-expanded', String(visible));
    }
  }
  if (reduced.matches) {
    if (introButton) {
      introButton.hidden = false;
      introButton.textContent = '收起介绍 ↗︎';
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
    if (touchDevice.matches) {
      const touchWeight = Math.max(0, Math.min(1, (touchUntil - performance.now()) / 750));
      state.targetX = tiltX * (1 - touchWeight) + touchX * touchWeight;
      state.targetY = tiltY * (1 - touchWeight) + touchY * touchWeight;
    }
    state.x += (state.targetX - state.x) * .07;
    state.y += (state.targetY - state.y) * .07;
    state.scroll += (state.targetScroll - state.scroll) * .09;
    layers.forEach(layer => {
      const depth = Number(layer.dataset.depth);
      const x = state.x * depth * 98;
      const y = state.y * depth * 62 + state.scroll * depth * (touchDevice.matches ? .18 : .12);
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
    if (!fine.matches || event.pointerType !== 'mouse' || state.paused || reduced.matches) return;
    const rect = hero.getBoundingClientRect();
    state.targetX = Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1));
    state.targetY = Math.max(-1, Math.min(1, (event.clientY - rect.top) / rect.height * 2 - 1));
  }, { passive: true });
  hero.addEventListener('pointerleave', () => { state.targetX = 0; state.targetY = 0; });
  function setTouchTarget(clientX, clientY) {
    if (state.paused || reduced.matches) return;
    const rect = hero.getBoundingClientRect();
    touchX = clamp((clientX - rect.left) / rect.width * 2 - 1) * .82;
    touchY = clamp((clientY - rect.top) / rect.height * 2 - 1) * .82;
    touchUntil = performance.now() + 1050;
  }
  hero.addEventListener('touchstart', event => {
    if (event.touches.length === 1) setTouchTarget(event.touches[0].clientX, event.touches[0].clientY);
  }, { passive: true });
  hero.addEventListener('touchmove', event => {
    if (event.touches.length === 1) setTouchTarget(event.touches[0].clientX, event.touches[0].clientY);
  }, { passive: true });
  function onOrientation(event) {
    if (!tiltEnabled || state.paused || reduced.matches || event.beta == null || event.gamma == null) return;
    if (!orientationBase) orientationBase = { beta: event.beta, gamma: event.gamma };
    tiltX = clamp((event.gamma - orientationBase.gamma) / 24) * .58;
    tiltY = clamp((event.beta - orientationBase.beta) / 28) * .58;
  }
  function disableTilt() {
    tiltEnabled = false;
    tiltX = 0;
    tiltY = 0;
    orientationBase = null;
    removeEventListener('deviceorientation', onOrientation);
    if (tiltButton) {
      tiltButton.textContent = '开启倾斜视差';
      tiltButton.setAttribute('aria-pressed', 'false');
    }
  }
  if (touchDevice.matches && 'DeviceOrientationEvent' in window && !reduced.matches) {
    if (typeof DeviceOrientationEvent.requestPermission === 'function' && tiltButton) {
      tiltButton.hidden = false;
      tiltButton.addEventListener('click', async () => {
        if (tiltEnabled) { disableTilt(); return; }
        try {
          const permission = await DeviceOrientationEvent.requestPermission();
          if (permission !== 'granted') { tiltButton.textContent = '倾斜权限未开启'; return; }
          tiltEnabled = true;
          orientationBase = null;
          addEventListener('deviceorientation', onOrientation, { passive: true });
          tiltButton.textContent = '关闭倾斜视差';
          tiltButton.setAttribute('aria-pressed', 'true');
        } catch { tiltButton.textContent = '倾斜视差不可用'; }
      });
    } else {
      tiltEnabled = true;
      addEventListener('deviceorientation', onOrientation, { passive: true });
    }
    addEventListener('orientationchange', () => { orientationBase = null; }, { passive: true });
  }
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

  hero.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'mouse' || reduced.matches || state.paused) return;
    const resident = hero.querySelector('.forest-cat');
    if (!resident) return;
    resident.classList.remove('is-jumping');
    void resident.offsetWidth;
    resident.classList.add('is-jumping');
    setTimeout(() => resident.classList.remove('is-jumping'), 690);
  }, { passive: true });
})();
