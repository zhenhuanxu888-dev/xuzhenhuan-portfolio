const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];

const progress = $('.scroll-progress');
const updateProgress = () => {
  if (!progress) return;
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.width = `${max > 0 ? (scrollY / max) * 100 : 0}%`;
};
addEventListener('scroll', updateProgress, { passive: true });
updateProgress();

const nav = $('.nav');
const menuToggle = $('.menu-toggle');
const closeNavigation = () => {
  nav?.classList.remove('open');
  menuToggle?.setAttribute('aria-expanded', 'false');
};
menuToggle?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
});
$$('.nav-links a').forEach(a => a.addEventListener('click', closeNavigation));
addEventListener('keydown', event => { if (event.key === 'Escape') closeNavigation(); });

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('in'); });
}, { threshold: .12 });
$$('.reveal').forEach(el => revealObserver.observe(el));

const signals = [
  {
    kicker: '产品走查',
    number: '27',
    unit: '条产品需求记录',
    description: '把使用过程中的卡点转化为可描述、可排序、可跟进的产品问题。'
  },
  {
    kicker: '体验测试',
    number: '34',
    unit: '条 Bug 与异常记录',
    description: '补全环境、步骤、预期与实际结果，让问题能够复现、修复和复测。'
  },
  {
    kicker: '产品研究',
    number: '550+',
    unit: '条公开内容样本',
    description: '从公开内容中识别任务信号，筛选 180 条高价值样本并推导产品方向。'
  }
];

const signalStory = $('.signal-story');
if (signalStory) {
  const number = $('#signalNumber');
  const kicker = $('#signalKicker');
  const unit = $('#signalUnit');
  const description = $('#signalDescription');
  const counter = $('#signalIndex');
  const steps = $$('.signal-step');
  let activeSignal = -1;
  const setSignal = index => {
    index = Math.max(0, Math.min(signals.length - 1, index));
    if (index === activeSignal) return;
    activeSignal = index;
    const item = signals[index];
    [number, kicker, unit, description].forEach(el => {
      el.animate([{opacity:.18,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:520,easing:'cubic-bezier(.22,1,.36,1)'});
    });
    number.textContent = item.number;
    kicker.textContent = item.kicker;
    unit.textContent = item.unit;
    description.textContent = item.description;
    counter.textContent = String(index + 1).padStart(2,'0');
    steps.forEach((step, i) => step.classList.toggle('active', i === index));
  };
  const syncSignals = () => {
    const rect = signalStory.getBoundingClientRect();
    const scrollable = signalStory.offsetHeight - innerHeight;
    const passed = Math.max(0, Math.min(scrollable, -rect.top));
    setSignal(Math.min(2, Math.floor((passed / Math.max(1, scrollable)) * 3)));
  };
  addEventListener('scroll', syncSignals, { passive:true });
  syncSignals();
}

const heroVideo = $('.hero-video');
const hero = $('.hero');
if (heroVideo && hero) {
  const heroObserver = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) heroVideo.play().catch(() => {});
    else heroVideo.pause();
  }, { threshold: .05 });
  heroObserver.observe(hero);
}

const heroLayers = $$('.hero [data-depth]');
if (heroLayers.length && matchMedia('(pointer:fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  addEventListener('pointermove', e => {
    const rx = (e.clientX / innerWidth - .5) * 2;
    const ry = (e.clientY / innerHeight - .5) * 2;
    heroLayers.forEach(el => {
      const d = parseFloat(el.getAttribute('data-depth') || '0');
      el.style.translate = `${(rx * 18 * d).toFixed(2)}px ${(ry * 16 * d).toFixed(2)}px`;
    });
  }, { passive: true });
}

const parallaxItems = $$('[data-parallax]');
if (parallaxItems.length && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  addEventListener('pointermove', e => {
    const rx = (e.clientX / innerWidth - .5) * 2;
    const ry = (e.clientY / innerHeight - .5) * 2;
    parallaxItems.forEach(el => {
      el.style.setProperty('--px', `${rx * 12}px`);
      el.style.setProperty('--py', `${ry * 10}px`);
    });
  }, { passive:true });
}

const glowCanvas = $('#hero-glow-canvas');
if (glowCanvas && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const ctx = glowCanvas.getContext('2d');
  let w = innerWidth, h = innerHeight, t = 0;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const pointer = { x: innerWidth * .5, y: innerHeight * .58, tx: innerWidth * .5, ty: innerHeight * .58 };
  const resize = () => {
    w = innerWidth; h = innerHeight;
    glowCanvas.width = w * dpr; glowCanvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  const draw = () => {
    t += .0055;
    pointer.x += (pointer.tx - pointer.x) * .05;
    pointer.y += (pointer.ty - pointer.y) * .05;
    ctx.clearRect(0, 0, w, h);
    for (let b = 0; b < 4; b++) {
      const base = h * (.52 + b * .11);
      const amp = 40 + b * 9;
      const freq = .0024 + b * .0007;
      const phase = t * (1.5 + b * .4) + b * 2.2;
      ctx.lineWidth = 24 - b * 5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      for (let x = -16; x <= w + 16; x += 12) {
        const x2 = x + 12;
        const y1 = base + Math.sin(x * freq + phase) * amp - Math.exp(-Math.pow((x - pointer.x) / 240, 2)) * 84;
        const y2 = base + Math.sin(x2 * freq + phase) * amp - Math.exp(-Math.pow((x2 - pointer.x) / 240, 2)) * 84;
        const dist = Math.hypot(x - pointer.x, y1 - pointer.y);
        const glow = Math.max(0, 1 - dist / 560);
        const alpha = .05 + glow * .42;
        ctx.strokeStyle = `rgba(150,255,165,${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.moveTo(x, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    }
    const g = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, 320);
    g.addColorStop(0, 'rgba(170,255,180,.26)');
    g.addColorStop(.42, 'rgba(120,255,150,.1)');
    g.addColorStop(1, 'rgba(90,255,140,0)');
    ctx.fillStyle = g;
    ctx.fillRect(pointer.x - 320, pointer.y - 320, 640, 640);
    requestAnimationFrame(draw);
  };
  addEventListener('pointermove', e => { pointer.tx = e.clientX; pointer.ty = e.clientY; }, { passive: true });
  addEventListener('resize', resize);
  resize(); draw();
}

const lightbox = $('.lightbox');
if (lightbox) {
  const lightboxImage = $('img', lightbox);
  $$('.case-figure img, .masonry-item img, .system-board img, .storyboard-grid img, .photo-wall img').forEach(img => img.addEventListener('click', () => {
    lightboxImage.src = img.src;
    lightboxImage.alt = img.alt;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }));
  lightbox.addEventListener('click', () => {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  });
  addEventListener('keydown', e => { if (e.key === 'Escape') lightbox.click(); });
}
