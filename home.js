(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(pointer: fine)');
  const progress = $('.read-progress');
  const hero = $('.hero');
  const motionButton = $('.motion-toggle');
  const canvas = $('#light-field');
  const context = canvas?.getContext('2d', { alpha: false });
  const state = { x: .58, y: .47, targetX: .58, targetY: .47, frame: 0, visible: true, paused: false, raf: 0, width: 0, height: 0, ratio: 1 };

  function syncProgress() {
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
    if (hero) hero.style.setProperty('--hero-scroll', `${Math.min(scrollY, innerHeight) * .13}px`);
  }
  addEventListener('scroll', syncProgress, { passive: true });
  syncProgress();

  const header = $('.site-header');
  const menu = $('.menu-toggle');
  function closeMenu() {
    header.classList.remove('open');
    menu.setAttribute('aria-expanded', 'false');
  }
  menu?.addEventListener('click', () => {
    const open = header.classList.toggle('open');
    menu.setAttribute('aria-expanded', String(open));
  });
  $$('#site-nav a').forEach(link => link.addEventListener('click', closeMenu));
  addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });

  if (!reduceMotion.matches) {
    document.documentElement.classList.add('motion-enabled');
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: .07, rootMargin: '0px 0px 80px 0px' });
    $$('.enter').forEach(element => revealObserver.observe(element));
  }

  function sizeCanvas() {
    if (!context) return;
    const bounds = hero.getBoundingClientRect();
    state.width = Math.max(1, bounds.width);
    state.height = Math.max(1, bounds.height);
    state.ratio = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(state.width * state.ratio);
    canvas.height = Math.round(state.height * state.ratio);
    context.setTransform(state.ratio, 0, 0, state.ratio, 0, 0);
    draw();
  }

  function ribbon(startX, startY, endX, endY, turn, width, opacity) {
    const w = state.width, h = state.height;
    const mx = (state.x - .5) * 24, my = (state.y - .5) * 16;
    const wave = Math.sin(state.frame * .012 + turn) * 15;
    const sx = startX * w, sy = startY * h, ex = endX * w, ey = endY * h;
    const gradient = context.createLinearGradient(sx, sy, ex, ey);
    gradient.addColorStop(0, 'rgba(95,166,119,0)');
    gradient.addColorStop(.28, `rgba(92,159,115,${opacity * .38})`);
    gradient.addColorStop(.57, `rgba(140,215,159,${opacity})`);
    gradient.addColorStop(1, 'rgba(174,232,170,0)');
    context.beginPath();
    context.moveTo(sx, sy);
    context.bezierCurveTo(w * (.19 + turn * .02) + mx, h * (.39 + turn * .12) + wave, w * (.67 + turn * .01) + mx, h * (.85 - turn * .1) - wave, ex, ey);
    context.bezierCurveTo(w * (.69 + turn * .01) + mx, h * (.85 - turn * .1) + width - wave, w * (.18 + turn * .02) + mx, h * (.39 + turn * .12) + width + wave, sx, sy + width);
    context.closePath();
    context.fillStyle = gradient;
    context.fill();
    context.beginPath();
    context.moveTo(sx, sy);
    context.bezierCurveTo(w * (.19 + turn * .02) + mx, h * (.39 + turn * .12) + wave, w * (.67 + turn * .01) + mx, h * (.85 - turn * .1) - wave, ex, ey);
    context.lineWidth = 1;
    context.strokeStyle = `rgba(191,244,199,${opacity * .62})`;
    context.stroke();
  }

  function draw() {
    if (!context) return;
    const w = state.width, h = state.height;
    state.x += (state.targetX - state.x) * .055;
    state.y += (state.targetY - state.y) * .055;
    context.fillStyle = '#101713';
    context.fillRect(0, 0, w, h);
    const topBeam = context.createRadialGradient(w * .3, -h * .09, 0, w * .3, -h * .09, w * .52);
    topBeam.addColorStop(0, 'rgba(121,172,125,.23)');
    topBeam.addColorStop(.55, 'rgba(70,115,78,.07)');
    topBeam.addColorStop(1, 'rgba(70,115,78,0)');
    context.fillStyle = topBeam;
    context.fillRect(0, 0, w, h * .8);
    const px = state.x * w, py = state.y * h;
    const halo = context.createRadialGradient(px, py, 0, px, py, Math.max(240, w * .29));
    halo.addColorStop(0, 'rgba(117,178,131,.16)');
    halo.addColorStop(.42, 'rgba(102,156,116,.045)');
    halo.addColorStop(1, 'rgba(97,143,107,0)');
    context.fillStyle = halo;
    context.fillRect(0, 0, w, h);
    context.save();
    context.globalCompositeOperation = 'screen';
    ribbon(-.12, .96, 1.18, .04, 0, Math.min(160, h * .18), .26);
    ribbon(-.23, 1.1, 1.1, .24, 1, Math.min(65, h * .075), .18);
    ribbon(-.3, .74, 1.15, .4, 2, Math.min(29, h * .037), .14);
    context.restore();
    for (let index = 0; index < 20; index++) {
      const x = ((index * 0.61803398875 + .13) % 1) * w;
      const y = ((index * 0.381966 + .17) % 1) * h;
      const blink = .08 + .1 * (1 + Math.sin(state.frame * .015 + index * 2.1));
      context.beginPath();
      context.arc(x, y, index % 5 === 0 ? 1.2 : .65, 0, Math.PI * 2);
      context.fillStyle = `rgba(216,242,215,${blink})`;
      context.fill();
    }
  }

  function animate() {
    if (!state.visible || state.paused || document.hidden || reduceMotion.matches) return;
    state.frame++;
    draw();
    state.raf = requestAnimationFrame(animate);
  }
  function syncAnimation() {
    cancelAnimationFrame(state.raf);
    if (state.visible && !state.paused && !document.hidden && !reduceMotion.matches) animate();
    else draw();
  }
  if (context) {
    addEventListener('resize', sizeCanvas, { passive: true });
    if (finePointer.matches) hero.addEventListener('pointermove', event => {
      const bounds = hero.getBoundingClientRect();
      state.targetX = (event.clientX - bounds.left) / bounds.width;
      state.targetY = (event.clientY - bounds.top) / bounds.height;
    }, { passive: true });
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      state.visible = entry.isIntersecting;
      syncAnimation();
    }, { threshold: .01 });
    visibilityObserver.observe(hero);
    document.addEventListener('visibilitychange', syncAnimation);
    motionButton?.addEventListener('click', () => {
      state.paused = !state.paused;
      motionButton.setAttribute('aria-pressed', String(state.paused));
      motionButton.textContent = state.paused ? '继续动效' : '暂停动效';
      syncAnimation();
    });
    if (reduceMotion.matches) motionButton.hidden = true;
    sizeCanvas();
    syncAnimation();
  }

  const reel = $('#motion-reel');
  const reelButton = $('.reel-control');
  function stopReel() {
    reel?.pause();
    if (reelButton) {
      reelButton.textContent = '播放片段 ▷';
      reelButton.setAttribute('aria-pressed', 'false');
    }
  }
  reelButton?.addEventListener('click', async () => {
    if (!reel.paused) { stopReel(); return; }
    try {
      if (reel.currentTime < 17 || reel.currentTime > 28) reel.currentTime = 17;
      await reel.play();
      reelButton.textContent = '暂停片段 Ⅱ';
      reelButton.setAttribute('aria-pressed', 'true');
    } catch { reelButton.textContent = '无法播放，查看完整作品 ↗︎'; }
  });
  reel?.addEventListener('timeupdate', () => { if (reel.currentTime > 27) reel.currentTime = 17; });
  if (reel) new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting && !reel.paused) stopReel();
  }, { threshold: .02 }).observe(reel);
})();
