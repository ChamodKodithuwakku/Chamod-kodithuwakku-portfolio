/* ============================================================
   Chamod Kodithuwakku — interactions
   3D tilt · magnetic buttons · custom cursor · particle field
   · parallax · scroll reveal · scroll progress
   ============================================================ */
(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;

  /* ---------- Tabs (global for inline onclick) ---------- */
  const tablinks = document.getElementsByClassName('tab-links');
  const tabcontents = document.getElementsByClassName('tab-contents');
  window.opentab = function (tabname) {
    for (const t of tablinks) t.classList.remove('active-link');
    for (const c of tabcontents) c.classList.remove('active-tab');
    event.currentTarget.classList.add('active-link');
    document.getElementById(tabname).classList.add('active-tab');
  };

  /* ---------- Year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Scroll reveal ---------- */
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in-view');
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  document.querySelectorAll('.reveal').forEach((el, i) => {
    el.style.transitionDelay = (i % 4) * 80 + 'ms';
    io.observe(el);
  });

  /* ---------- Navbar elevate + scroll progress ---------- */
  const navbar = document.querySelector('.navbar');
  const progress = document.querySelector('.scroll-progress');
  function onScroll() {
    const y = window.scrollY;
    if (navbar) navbar.classList.toggle('scrolled', y > 30);
    if (progress) {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = 'scaleX(' + (h > 0 ? y / h : 0) + ')';
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  const navToggle = document.getElementById('nav-toggle');
  const navBackdrop = document.getElementById('nav-backdrop');
  const primaryNav = document.getElementById('primary-nav');
  if (navToggle && navbar) {
    function setMenu(open) {
      navbar.classList.toggle('menu-open', open);
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    }
    navToggle.addEventListener('click', () =>
      setMenu(!navbar.classList.contains('menu-open'))
    );
    if (navBackdrop) navBackdrop.addEventListener('click', () => setMenu(false));
    if (primaryNav) {
      primaryNav.querySelectorAll('a').forEach((a) =>
        a.addEventListener('click', () => setMenu(false))
      );
    }
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') setMenu(false);
    });
  }

  if (reduceMotion) return; // skip heavy motion/3D for reduced-motion users

  /* ---------- 3D tilt cards ---------- */
  const MAX_TILT = 10; // degrees
  document.querySelectorAll('.tilt').forEach((card) => {
    const glare = document.createElement('span');
    glare.className = 'tilt-glare';
    card.appendChild(glare);

    let raf = null;
    function move(e) {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      const rx = (0.5 - py) * MAX_TILT * 2;
      const ry = (px - 0.5) * MAX_TILT * 2;
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        card.style.transform =
          'perspective(900px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) translateY(-6px)';
        glare.style.opacity = '1';
        glare.style.background =
          'radial-gradient(circle at ' + px * 100 + '% ' + py * 100 +
          '%, rgba(255,255,255,0.22), transparent 55%)';
      });
    }
    function leave() {
      if (raf) cancelAnimationFrame(raf);
      card.style.transform = '';
      glare.style.opacity = '0';
    }
    card.addEventListener('mousemove', move);
    card.addEventListener('mouseleave', leave);
  });

  /* ---------- Magnetic buttons ---------- */
  if (finePointer) {
    document.querySelectorAll('.btn').forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const mx = e.clientX - r.left - r.width / 2;
        const my = e.clientY - r.top - r.height / 2;
        btn.style.transform = 'translate(' + mx * 0.25 + 'px,' + my * 0.35 + 'px)';
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }

  /* ---------- Mouse parallax (hero + aurora orbs) ---------- */
  const parallaxEls = document.querySelectorAll('.parallax');
  const orbs = document.querySelectorAll('.orb');
  if (finePointer) {
    window.addEventListener('mousemove', (e) => {
      if (window.innerWidth <= 920) return; // no parallax on small screens
      const cx = (e.clientX / window.innerWidth - 0.5) * 2;
      const cy = (e.clientY / window.innerHeight - 0.5) * 2;
      parallaxEls.forEach((el) => {
        const d = parseFloat(el.dataset.depth || '0.1');
        el.style.transform = 'translate(' + cx * d * -30 + 'px,' + cy * d * -30 + 'px)';
      });
      orbs.forEach((orb, i) => {
        const d = (i + 1) * 12;
        orb.style.translate = cx * d + 'px ' + cy * d + 'px';
      });
    });
  }

  /* ---------- Custom cursor ---------- */
  if (finePointer) {
    const dot = document.querySelector('.cursor-dot');
    const ring = document.querySelector('.cursor-ring');
    if (dot && ring) {
      document.body.classList.add('has-custom-cursor');
      let mx = innerWidth / 2, my = innerHeight / 2;
      let rx = mx, ry = my;
      window.addEventListener('mousemove', (e) => {
        mx = e.clientX; my = e.clientY;
        dot.style.transform = 'translate(' + mx + 'px,' + my + 'px)';
      });
      (function loop() {
        rx += (mx - rx) * 0.18;
        ry += (my - ry) * 0.18;
        ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px)';
        requestAnimationFrame(loop);
      })();
      document
        .querySelectorAll('a, button, .btn, .tilt, .tab-links')
        .forEach((el) => {
          el.addEventListener('mouseenter', () => ring.classList.add('cursor-hover'));
          el.addEventListener('mouseleave', () => ring.classList.remove('cursor-hover'));
        });
    }
  }

  /* ---------- Hero particle field (canvas) ---------- */
  const canvas = document.getElementById('hero-canvas');
  if (canvas && canvas.getContext) {
    const ctx = canvas.getContext('2d');
    let w, h, dpr, particles, mouse = { x: -9999, y: -9999 };

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(110, Math.floor((w * h) / 14000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.6 + 0.6,
      }));
    }

    function tick() {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        // mouse repulsion
        const dx = p.x - mouse.x, dy = p.y - mouse.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 130) {
          p.x += (dx / dist) * 1.4;
          p.y += (dy / dist) * 1.4;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(160, 180, 255, 0.7)';
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const d = Math.hypot(p.x - q.x, p.y - q.y);
          if (d < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = 'rgba(120, 140, 240,' + (1 - d / 120) * 0.18 + ')';
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(tick);
    }

    const hero = document.getElementById('header');
    hero.addEventListener('mousemove', (e) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    });
    hero.addEventListener('mouseleave', () => { mouse.x = mouse.y = -9999; });

    window.addEventListener('resize', resize);
    resize();
    tick();
  }
})();
