/* =========================================================
   Rita Bind — Portfolio interactions
   ========================================================= */
(() => {
  'use strict';

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Year ---------- */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Particle network background ---------- */
  const canvas = $('#bg-canvas');
  if (canvas && !prefersReduced) {
    const ctx = canvas.getContext('2d');
    let w, h, dpr;
    let particles = [];
    const mouse = { x: -9999, y: -9999 };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.width  = window.innerWidth  * dpr;
      h = canvas.height = window.innerHeight * dpr;
      canvas.style.width  = window.innerWidth  + 'px';
      canvas.style.height = window.innerHeight + 'px';

      const density = Math.min(window.innerWidth * window.innerHeight / 14000, 110);
      particles = Array.from({ length: density | 0 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35 * dpr,
        vy: (Math.random() - 0.5) * 0.35 * dpr,
        r: (Math.random() * 1.2 + 0.4) * dpr,
      }));
    };

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX * dpr;
      mouse.y = e.clientY * dpr;
    });
    window.addEventListener('mouseleave', () => {
      mouse.x = -9999; mouse.y = -9999;
    });

    const LINK_DIST = 140;
    const MOUSE_DIST = 180;

    const tick = () => {
      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        // mouse attraction
        const dxm = mouse.x - p.x;
        const dym = mouse.y - p.y;
        const dm  = Math.hypot(dxm, dym);
        if (dm < MOUSE_DIST * dpr) {
          p.x += dxm * 0.004;
          p.y += dym * 0.004;
        }

        // draw dot
        ctx.beginPath();
        ctx.fillStyle = 'rgba(0, 229, 255, 0.55)';
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();

        // draw links
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const d  = Math.hypot(dx, dy);
          if (d < LINK_DIST * dpr) {
            const a = 1 - d / (LINK_DIST * dpr);
            ctx.strokeStyle = `rgba(139, 92, 246, ${a * 0.22})`;
            ctx.lineWidth = 0.6 * dpr;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }

        // link to mouse
        if (dm < MOUSE_DIST * dpr) {
          const a = 1 - dm / (MOUSE_DIST * dpr);
          ctx.strokeStyle = `rgba(0, 229, 255, ${a * 0.35})`;
          ctx.lineWidth = 0.8 * dpr;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }

      requestAnimationFrame(tick);
    };

    resize();
    window.addEventListener('resize', resize);
    tick();
  }

  /* ---------- Custom cursor ---------- */
  const dot  = $('.cursor-dot');
  const ring = $('.cursor-ring');
  const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (dot && ring && hasFinePointer) {
    let mx = -100, my = -100;
    let rx = -100, ry = -100;

    window.addEventListener('mousemove', (e) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.transform = `translate3d(${mx - 3}px, ${my - 3}px, 0)`;
    });

    const follow = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = `translate3d(${rx - 19}px, ${ry - 19}px, 0)`;
      requestAnimationFrame(follow);
    };
    follow();

    const hoverables = 'a, button, .btn, .skill-card, .project-card, .contact-link, .tech-chips span, .mini-card, .timeline-card, .about-card';
    $$(hoverables).forEach((el) => {
      el.addEventListener('mouseenter', () => ring.classList.add('hover'));
      el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
    });
  }

  /* ---------- Nav: scroll state, active link, mobile toggle ---------- */
  const nav = $('.nav');
  const navLinks = $('.nav-links');
  const menuBtn = $('.menu-btn');

  window.addEventListener('scroll', () => {
    if (!nav) return;
    nav.classList.toggle('scrolled', window.scrollY > 24);
  }, { passive: true });

  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', () => {
      menuBtn.classList.toggle('open');
      navLinks.classList.toggle('open');
    });
    navLinks.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        menuBtn.classList.remove('open');
        navLinks.classList.remove('open');
      });
    });
  }

  // active link on scroll
  const sectionIds = ['home', 'about', 'skills', 'experience', 'projects', 'contact'];
  const sections = sectionIds.map((id) => document.getElementById(id)).filter(Boolean);

  const onScrollActive = () => {
    const y = window.scrollY + window.innerHeight * 0.35;
    let current = sectionIds[0];
    sections.forEach((sec) => {
      if (y >= sec.offsetTop) current = sec.id;
    });
    navLinks?.querySelectorAll('a').forEach((a) => {
      a.classList.toggle('active', a.getAttribute('href') === `#${current}`);
    });
  };
  window.addEventListener('scroll', onScrollActive, { passive: true });
  onScrollActive();

  /* ---------- Typewriter ---------- */
  const typed = $('#typed');
  if (typed) {
    const phrases = [
      'Android Developer.',
      'Kotlin · MVVM · Jetpack.',
      'Firebase enthusiast.',
      'Building mobile experiences.',
      'AI-powered with Claude AI.',
    ];
    let pi = 0, ci = 0, deleting = false;

    const step = () => {
      const phrase = phrases[pi];
      if (!deleting) {
        typed.textContent = phrase.slice(0, ++ci);
        if (ci === phrase.length) {
          deleting = true;
          return setTimeout(step, 1600);
        }
      } else {
        typed.textContent = phrase.slice(0, --ci);
        if (ci === 0) {
          deleting = false;
          pi = (pi + 1) % phrases.length;
          return setTimeout(step, 300);
        }
      }
      setTimeout(step, deleting ? 40 : 75);
    };
    step();
  }

  /* ---------- Counters ---------- */
  const countEls = $$('.meta-num[data-count]');
  const runCount = (el) => {
    const target = parseFloat(el.dataset.count);
    const isFloat = target % 1 !== 0;
    const duration = 1400;
    const start = performance.now();
    const frame = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const val = target * eased;
      el.textContent = isFloat ? val.toFixed(1) : Math.round(val);
      if (t < 1) requestAnimationFrame(frame);
      else el.textContent = isFloat ? target.toFixed(1) : target;
    };
    requestAnimationFrame(frame);
  };

  /* ---------- Skill bar fill ---------- */
  const fillBar = (bar) => {
    const level = bar.dataset.level || 80;
    const inner = bar.querySelector('i');
    if (inner) inner.style.width = level + '%';
  };

  /* ---------- IntersectionObserver: reveal, counters, bars ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.classList.add('in');

      if (el.classList.contains('hero')) {
        countEls.forEach(runCount);
      }
      if (el.matches('.skill-card')) {
        el.querySelectorAll('.bar').forEach(fillBar);
      }
      io.unobserve(el);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });

  $$('.reveal').forEach((el) => io.observe(el));
  const hero = $('.hero');
  if (hero) io.observe(hero);

  /* ---------- 3D tilt ---------- */
  if (hasFinePointer && !prefersReduced) {
    $$('.tilt').forEach((el) => {
      const MAX = 6;
      let rect;

      const onEnter = () => { rect = el.getBoundingClientRect(); };
      const onMove = (e) => {
        if (!rect) rect = el.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width  - 0.5;
        const y = (e.clientY - rect.top)  / rect.height - 0.5;
        el.style.transform = `perspective(900px) rotateY(${x * MAX}deg) rotateX(${-y * MAX}deg) translateZ(0)`;
      };
      const onLeave = () => {
        el.style.transform = '';
        rect = null;
      };

      el.addEventListener('mouseenter', onEnter);
      el.addEventListener('mousemove', onMove);
      el.addEventListener('mouseleave', onLeave);
    });
  }

  /* ---------- Smooth anchor offset ---------- */
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const y = target.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top: y, behavior: 'smooth' });
    });
  });
})();
