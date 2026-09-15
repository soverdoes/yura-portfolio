/* Nav toggle */
const navToggle = document.getElementById('navToggle');
const nav = document.getElementById('nav');

if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    nav.classList.toggle('open');
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => nav.classList.remove('open'));
  });
}

/* Lightbox — project image links open fit-to-width in-page instead
   of the browser's native fit-to-height image viewer */
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');

if (lightbox && lightboxImg && lightboxClose) {
  function openLightbox(src, alt) {
    lightboxImg.src = src;
    lightboxImg.alt = alt || '';
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    lightboxImg.src = '';
  }

  document.querySelectorAll('a[href*="/assets/projects/"], a[href^="assets/projects/"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const img = link.querySelector('img');
      openLightbox(link.getAttribute('href'), img ? img.alt : '');
    });
  });

  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });
}

/* Scroll reveal */
const revealEls = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

revealEls.forEach((el) => revealObserver.observe(el));

/* Manifesto — smooth scroll-linked line highlight */
const manifestoLines = document.querySelectorAll('.manifesto-text .line');
let manifestoTicking = false;

function updateManifestoLines() {
  const focusY = window.innerHeight * 0.55;
  manifestoLines.forEach((line) => {
    const rect = line.getBoundingClientRect();
    const centerY = rect.top + rect.height / 2;
    const dist = Math.abs(centerY - focusY);
    const progress = Math.max(0, 1 - dist / (window.innerHeight * 0.5));
    const opacity = 0.22 + progress * 0.78;
    line.style.opacity = opacity.toFixed(3);
  });
  manifestoTicking = false;
}

if (manifestoLines.length) {
  window.addEventListener(
    'scroll',
    () => {
      if (!manifestoTicking) {
        requestAnimationFrame(updateManifestoLines);
        manifestoTicking = true;
      }
    },
    { passive: true }
  );
  updateManifestoLines();
}

/* Scroll progress bar */
const scrollProgress = document.getElementById('scrollProgress');

function updateScrollProgress() {
  if (!scrollProgress) return;
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  scrollProgress.style.width = pct + '%';
}

window.addEventListener('scroll', updateScrollProgress, { passive: true });
updateScrollProgress();

/* Scroll to top button */
const toTop = document.getElementById('toTop');

function updateToTop() {
  if (!toTop) return;
  toTop.classList.toggle('visible', window.scrollY > 800);
}

window.addEventListener('scroll', updateToTop, { passive: true });
updateToTop();

/* Custom cursor */
const cursorDot = document.getElementById('cursorDot');
const cursorRing = document.getElementById('cursorRing');
const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

if (hasFinePointer && cursorDot && cursorRing) {
  let ringX = 0, ringY = 0, targetX = 0, targetY = 0;

  window.addEventListener('mousemove', (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
    cursorDot.style.left = targetX + 'px';
    cursorDot.style.top = targetY + 'px';
  });

  function animateRing() {
    ringX += (targetX - ringX) * 0.18;
    ringY += (targetY - ringY) * 0.18;
    cursorRing.style.left = ringX + 'px';
    cursorRing.style.top = ringY + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  document.querySelectorAll('a, button, .gcard, .project-card, .project-feature').forEach((el) => {
    el.addEventListener('mouseenter', () => cursorRing.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursorRing.classList.remove('hover'));
  });
}

/* Hero counter animation */
const counterNum = document.getElementById('counterNum');
const heroLine = document.querySelector('.hero-line');
let counterStarted = false;

function startCounter() {
  if (counterStarted || !counterNum) return;
  counterStarted = true;
  if (heroLine) heroLine.classList.add('filled');

  const target = 42;
  const duration = 1400;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const value = Math.floor(progress * target);
    counterNum.textContent = String(value).padStart(2, '0');
    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      counterNum.textContent = target + '+';
    }
  }
  requestAnimationFrame(tick);
}

if (counterNum) setTimeout(startCounter, 300);

/* Stat counters (count up on scroll into view) */
const statNums = document.querySelectorAll('.stat-num[data-count]');

if (statNums.length) {
  const statObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        const duration = 1200;
        const start = performance.now();

        function tick(now) {
          const progress = Math.min((now - start) / duration, 1);
          el.textContent = Math.floor(progress * target);
          if (progress < 1) requestAnimationFrame(tick);
          else el.textContent = target;
        }
        requestAnimationFrame(tick);
        statObserver.unobserve(el);
      });
    },
    { threshold: 0.4 }
  );
  statNums.forEach((el) => statObserver.observe(el));
}

/* Hero collage — cluster-at-center on load, scatters open on scroll, mouse parallax once open */
const heroCollage = document.getElementById('heroCollage');
const heroEl = document.querySelector('.hero');
const heroPinWrap = document.querySelector('.hero-pin-wrap');

if (heroCollage && heroEl) {
  const items = Array.from(heroCollage.querySelectorAll('.collage-item'));
  const depths = [18, 26, 14, 22, 30, 20, 16, 24, 12, 28, 20, 24];
  const itemState = [];
  let mouseDX = 0;
  let mouseDY = 0;

  function measureItems() {
    const heroRect = heroEl.getBoundingClientRect();
    const heroCenterX = heroRect.width / 2;
    const heroCenterY = heroRect.height / 2;

    items.forEach((item, i) => {
      item.style.transition = 'none';
      item.style.transform = 'translate(0,0) rotate(0deg) scale(1)';
      const rect = item.getBoundingClientRect();
      const itemCenterX = rect.left - heroRect.left + rect.width / 2;
      const itemCenterY = rect.top - heroRect.top + rect.height / 2;
      const rotation = getComputedStyle(item).getPropertyValue('--r').trim() || '0deg';

      itemState[i] = {
        dx: heroCenterX - itemCenterX,
        dy: heroCenterY - itemCenterY,
        rotation,
      };
      item.style.transition = '';
    });
  }

  function applyCollageFrame() {
    let scatterProgress = 0;
    if (heroPinWrap) {
      const rect = heroPinWrap.getBoundingClientRect();
      const totalScrollable = heroPinWrap.offsetHeight - window.innerHeight;
      const scrolled = Math.min(Math.max(-rect.top, 0), totalScrollable);
      scatterProgress = totalScrollable > 0 ? scrolled / totalScrollable : 0;
    } else {
      const heroHeight = heroEl.offsetHeight;
      scatterProgress = Math.max(0, Math.min(window.scrollY / (heroHeight * 0.45), 1));
    }
    const eased = 1 - Math.pow(1 - scatterProgress, 3);

    items.forEach((item, i) => {
      const state = itemState[i];
      if (!state) return;
      const depth = depths[i % depths.length];
      const px = mouseDX * depth * eased;
      const py = mouseDY * depth * eased;
      const tx = state.dx * (1 - eased) + px;
      const ty = state.dy * (1 - eased) + py;
      const scale = 0.45 + 0.55 * eased;
      const rotateAmount = `calc(${state.rotation} * ${eased})`;
      item.style.transform = `translate(${tx}px, ${ty}px) rotate(${rotateAmount}) scale(${scale})`;
    });

    const targetOpacity = window.scrollY > 2 ? '1' : '0';
    if (heroCollage.dataset.opacity !== targetOpacity) {
      heroCollage.dataset.opacity = targetOpacity;
      items.forEach((item) => {
        item.style.opacity = targetOpacity;
      });
    }
  }

  measureItems();
  applyCollageFrame();
  window.addEventListener('resize', () => {
    measureItems();
    applyCollageFrame();
  });

  let collageTicking = false;
  window.addEventListener(
    'scroll',
    () => {
      if (!collageTicking) {
        requestAnimationFrame(() => {
          applyCollageFrame();
          collageTicking = false;
        });
        collageTicking = true;
      }
    },
    { passive: true }
  );

  if (hasFinePointer) {
    heroEl.addEventListener('mousemove', (e) => {
      const { innerWidth, innerHeight } = window;
      mouseDX = (e.clientX / innerWidth - 0.5) * 2;
      mouseDY = (e.clientY / innerHeight - 0.5) * 2;
      applyCollageFrame();
    });
  }
}

/* Horizontal scroll-hijack gallery (desktop only) */
const hscroll = document.getElementById('hscroll');
const hscrollTrack = document.getElementById('hscrollTrack');

const hscrollCurrent = document.getElementById('hscrollCurrent');
const hscrollCardCount = hscrollTrack ? hscrollTrack.querySelectorAll('.gcard').length : 0;

function updateHscroll() {
  if (window.innerWidth <= 860 || !hscroll || !hscrollTrack) return;

  const rect = hscroll.getBoundingClientRect();
  const totalScrollable = hscroll.offsetHeight - window.innerHeight;
  const scrolled = Math.min(Math.max(-rect.top, 0), totalScrollable);
  const progress = totalScrollable > 0 ? scrolled / totalScrollable : 0;

  const maxTranslate = Math.max(hscrollTrack.scrollWidth - window.innerWidth + 48, 0);
  hscrollTrack.style.transform = `translateX(-${progress * maxTranslate}px)`;

  if (hscrollCurrent && hscrollCardCount) {
    const idx = 2 + Math.min(Math.floor(progress * hscrollCardCount), hscrollCardCount - 1);
    hscrollCurrent.textContent = String(idx).padStart(2, '0');
  }
}

if (hscroll) {
  window.addEventListener('scroll', updateHscroll, { passive: true });
  window.addEventListener('resize', updateHscroll);
  updateHscroll();
}
