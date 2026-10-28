/* ============================================
   Filip Kecman - Main JavaScript
   Progressive enhancement, no dependencies
   ============================================ */

document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointerQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
  const mobileQuery = window.matchMedia('(max-width: 1160px)');
  const brutalHome = document.body.classList.contains('brutal-home');

  // --- Ambient scene on every page except the dedicated brutalist homepage ---
  let atmosphere = document.querySelector('.site-atmosphere');
  if (!brutalHome && !atmosphere) {
    atmosphere = document.createElement('div');
    atmosphere.className = 'site-atmosphere';
    atmosphere.setAttribute('aria-hidden', 'true');
    atmosphere.innerHTML = '<canvas id="field-canvas"></canvas><div class="ambient-glow ambient-glow-one"></div><div class="ambient-glow ambient-glow-two"></div><div class="noise-layer"></div>';
    document.body.prepend(atmosphere);
  }

  // --- Mobile navigation with focus and keyboard handling ---
  const navbar = document.querySelector('.navbar');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  let menuOpen = false;

  const setMenu = (open, returnFocus = false) => {
    if (!navToggle || !navLinks) return;
    menuOpen = open && mobileQuery.matches;
    navToggle.classList.toggle('active', menuOpen);
    navLinks.classList.toggle('open', menuOpen);
    navToggle.setAttribute('aria-expanded', String(menuOpen));
    document.body.classList.toggle('nav-open', menuOpen);
    if (mobileQuery.matches) navLinks.inert = !menuOpen;
    else navLinks.inert = false;
    if (returnFocus) navToggle.focus({ preventScroll: true });
  };

  if (navToggle && navLinks) {
    navToggle.setAttribute('aria-controls', 'navLinks');
    setMenu(false);

    navToggle.addEventListener('click', () => {
      const willOpen = !menuOpen;
      setMenu(willOpen);
      if (willOpen) {
        const firstLink = navLinks.querySelector('a');
        if (firstLink) firstLink.focus({ preventScroll: true });
      }
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => setMenu(false));
    });

    document.addEventListener('click', event => {
      if (menuOpen && navbar && !navbar.contains(event.target)) setMenu(false);
    });

    document.addEventListener('keydown', event => {
      if (!menuOpen) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        setMenu(false, true);
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = [navToggle, ...navLinks.querySelectorAll('a')];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    const handleViewportChange = () => setMenu(false);
    if (mobileQuery.addEventListener) mobileQuery.addEventListener('change', handleViewportChange);
    else mobileQuery.addListener(handleViewportChange);
  }

  // --- Scroll progress, navigation state, and active section ---
  const progressBar = document.querySelector('.scroll-progress');
  if (!progressBar) {
    const progress = document.createElement('div');
    progress.className = 'scroll-progress';
    progress.setAttribute('aria-hidden', 'true');
    progress.innerHTML = '<span></span>';
    document.body.prepend(progress);
  }
  const progressFill = document.querySelector('.scroll-progress span');
  const sections = [...document.querySelectorAll('main section[id], body > section[id]')];
  const navAnchors = [...document.querySelectorAll('.nav-links a[href^="#"]')];
  let lastScroll = window.scrollY;
  let scrollTicking = false;

  const updateScrollUI = () => {
    const currentScroll = window.scrollY;
    const scrollable = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    if (progressFill) progressFill.style.transform = `scaleX(${Math.min(currentScroll / scrollable, 1)})`;

    if (navbar) {
      navbar.classList.toggle('scrolled', currentScroll > 30);
      const movingDown = currentScroll > lastScroll && currentScroll > 420;
      navbar.classList.toggle('hidden', movingDown && !menuOpen);
    }

    if (sections.length && navAnchors.length) {
      const marker = currentScroll + Math.min(window.innerHeight * .34, 280);
      let activeId = '';
      sections.forEach(section => {
        if (marker >= section.offsetTop && marker < section.offsetTop + section.offsetHeight) activeId = section.id;
      });
      navAnchors.forEach(anchor => {
        const active = activeId && anchor.getAttribute('href') === `#${activeId}`;
        anchor.classList.toggle('active', Boolean(active));
        if (active) anchor.setAttribute('aria-current', 'location');
        else anchor.removeAttribute('aria-current');
      });
    }

    lastScroll = currentScroll;
    scrollTicking = false;
  };

  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      requestAnimationFrame(updateScrollUI);
      scrollTicking = true;
    }
  }, { passive: true });
  window.addEventListener('resize', updateScrollUI, { passive: true });
  updateScrollUI();

  // --- Reveal on scroll; content stays visible without JS ---
  const revealElements = document.querySelectorAll('.reveal');
  if (motionQuery.matches || !('IntersectionObserver' in window)) {
    revealElements.forEach(element => element.classList.add('visible'));
  } else {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: .08, rootMargin: '0px 0px -35px 0px' });
    revealElements.forEach(element => revealObserver.observe(element));
  }

  // --- Animated stat counters, with correct static HTML values ---
  const animateCounter = (element, target) => {
    const duration = 1400;
    const start = performance.now();
    const tick = now => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = String(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
      else element.textContent = String(target);
    };
    requestAnimationFrame(tick);
  };

  const statNumbers = document.querySelectorAll('.stat-number[data-target]');
  if (!motionQuery.matches && 'IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const container = entry.target;
        const target = Number.parseInt(container.dataset.target, 10);
        const value = container.querySelector('span');
        if (target > 0 && value) animateCounter(value, target);
        counterObserver.unobserve(container);
      });
    }, { threshold: .5 });
    statNumbers.forEach(element => counterObserver.observe(element));
  }

  // --- Blog filters ---
  const filterButtons = document.querySelectorAll('.blog-filter-btn');
  const blogCards = document.querySelectorAll('.blog-grid .blog-card[data-tags]');
  filterButtons.forEach(button => {
    button.setAttribute('aria-pressed', String(button.classList.contains('active')));
    button.addEventListener('click', () => {
      filterButtons.forEach(other => {
        const selected = other === button;
        other.classList.toggle('active', selected);
        other.setAttribute('aria-pressed', String(selected));
      });
      const filter = button.dataset.filter;
      blogCards.forEach(card => {
        const tags = (card.dataset.tags || '').split(/\s+/);
        card.hidden = filter !== 'all' && !tags.includes(filter);
      });
    });
  });

  // --- Contact form submission state ---
  document.querySelectorAll('.contact-form').forEach(form => {
    form.addEventListener('submit', () => {
      const button = form.querySelector('.form-submit');
      if (!button) return;
      const original = button.innerHTML;
      button.textContent = 'Sending...';
      button.disabled = true;
      window.setTimeout(() => {
        button.innerHTML = original;
        button.disabled = false;
      }, 5000);
    });
  });

  // --- Restrained pointer interactions on precise pointing devices ---
  const canInteract = () => !motionQuery.matches && finePointerQuery.matches;

  document.querySelectorAll('[data-magnetic]').forEach(element => {
    element.addEventListener('pointermove', event => {
      if (!canInteract()) return;
      const rect = element.getBoundingClientRect();
      const x = (event.clientX - rect.left - rect.width / 2) * .13;
      const y = (event.clientY - rect.top - rect.height / 2) * .13;
      element.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });
    element.addEventListener('pointerleave', () => { element.style.transform = ''; });
  });

  const tiltElements = brutalHome ? [] : document.querySelectorAll('[data-tilt], .approach-card, .cert-badge-item');
  tiltElements.forEach(element => {
    element.addEventListener('pointermove', event => {
      if (!canInteract()) return;
      const rect = element.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - .5;
      const py = (event.clientY - rect.top) / rect.height - .5;
      const strength = element.classList.contains('hero-image') ? 2.5 : 3.5;
      element.style.transform = `perspective(1000px) rotateX(${-py * strength}deg) rotateY(${px * strength}deg) translateY(-3px)`;
    });
    element.addEventListener('pointerleave', () => { element.style.transform = ''; });
  });

  // --- Smooth anchors with safe fragment handling ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', event => {
      const href = anchor.getAttribute('href');
      if (!href || href.length < 2) return;
      let id;
      try { id = decodeURIComponent(href.slice(1)); }
      catch { return; }
      const target = document.getElementById(id);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: motionQuery.matches ? 'auto' : 'smooth', block: 'start' });
      history.replaceState(null, '', href);
    });
  });

  // --- LLM referral tracking via GA4 custom events ---
  (() => {
    try {
      if (typeof gtag !== 'function') return;
      const ref = document.referrer || '';
      const params = new URLSearchParams(window.location.search);
      const utmSource = params.get('utm_source') || '';
      const combined = `${ref} ${utmSource}`.toLowerCase();
      const llmPatterns = [
        { pattern: /chatgpt|chat\.openai|openai\.com/, source: 'chatgpt' },
        { pattern: /claude\.ai|anthropic/, source: 'claude' },
        { pattern: /gemini|bard|google\.com\/search.*ai/, source: 'gemini' },
        { pattern: /perplexity/, source: 'perplexity' },
        { pattern: /copilot|bing\.com\/chat/, source: 'copilot' },
        { pattern: /you\.com/, source: 'you' },
        { pattern: /phind/, source: 'phind' },
        { pattern: /kagi/, source: 'kagi' }
      ];
      let matchedSource = '';
      for (const { pattern, source } of llmPatterns) {
        if (pattern.test(combined)) {
          matchedSource = source;
          break;
        }
      }
      if (matchedSource || utmSource === 'llm' || params.get('utm_medium') === 'llm') {
        gtag('event', 'llm_referral', {
          llm_source: matchedSource || utmSource || 'unknown',
          referrer: ref || 'direct',
          landing_page: window.location.pathname
        });
      }
    } catch { /* Analytics must never affect the page. */ }
  })();

  // --- Animated signal field, capped DPR/FPS and motion-aware ---
  class SignalField {
    constructor(canvas) {
      this.canvas = canvas;
      this.context = canvas.getContext('2d', { alpha: true });
      this.width = 0;
      this.height = 0;
      this.pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
      this.lastFrame = 0;
      this.frame = 0;
      this.boundDraw = this.draw.bind(this);
      if (!this.context) return;
      this.resize();
      window.addEventListener('resize', () => this.resize(), { passive: true });
      window.addEventListener('pointermove', event => {
        this.pointer.targetX = event.clientX;
        this.pointer.targetY = event.clientY;
      }, { passive: true });
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden && !motionQuery.matches) {
          cancelAnimationFrame(this.frame);
          this.frame = requestAnimationFrame(this.boundDraw);
        }
      });
      const handleMotionChange = () => {
        cancelAnimationFrame(this.frame);
        this.draw(performance.now(), true);
        if (!motionQuery.matches) this.frame = requestAnimationFrame(this.boundDraw);
      };
      if (motionQuery.addEventListener) motionQuery.addEventListener('change', handleMotionChange);
      else motionQuery.addListener(handleMotionChange);
      this.draw(performance.now(), true);
      if (!motionQuery.matches) this.frame = requestAnimationFrame(this.boundDraw);
    }

    resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.canvas.width = Math.round(this.width * dpr);
      this.canvas.height = Math.round(this.height * dpr);
      this.context.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.pointer.x = this.pointer.targetX = this.width * .68;
      this.pointer.y = this.pointer.targetY = this.height * .32;
      this.draw(performance.now(), true);
    }

    draw(now, force = false) {
      if (!this.context || document.hidden) return;
      if (!force && now - this.lastFrame < 1000 / 30) {
        this.frame = requestAnimationFrame(this.boundDraw);
        return;
      }
      this.lastFrame = now;
      const ctx = this.context;
      const w = this.width;
      const h = this.height;
      const time = motionQuery.matches ? 0 : now * .00022;
      const scroll = motionQuery.matches ? 0 : window.scrollY * .012;
      this.pointer.x += (this.pointer.targetX - this.pointer.x) * .045;
      this.pointer.y += (this.pointer.targetY - this.pointer.y) * .045;
      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = .7;

      const rows = Math.max(10, Math.round(h / 80));
      for (let row = 0; row <= rows; row += 1) {
        const baseY = (row / rows) * (h + 100) - 50;
        const alpha = .018 + (row / rows) * .018;
        ctx.beginPath();
        for (let x = -40; x <= w + 40; x += 24) {
          let y = baseY
            + Math.sin(x * .0035 + row * .72 + time * 2.2) * 17
            + Math.cos(x * .0017 - time * 1.4 + row) * 10
            + Math.sin(scroll + row) * 3;
          const dx = x - this.pointer.x;
          const dy = baseY - this.pointer.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 210 && !motionQuery.matches) {
            const influence = Math.pow(1 - distance / 210, 2);
            y += (dy > 0 ? 1 : -1) * influence * 26;
          }
          if (x === -40) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(108, 99, 255, ${alpha})`;
        ctx.stroke();
      }

      if (!motionQuery.matches) {
        for (let i = 0; i < 3; i += 1) {
          const row = 2 + i * 3;
          if (row > rows) continue;
          const x = ((time * 85 * (1 + i * .16) + i * w * .31) % (w + 120)) - 60;
          const baseY = (row / rows) * (h + 100) - 50;
          const y = baseY + Math.sin(x * .0035 + row * .72 + time * 2.2) * 17 + Math.cos(x * .0017 - time * 1.4 + row) * 10;
          const gradient = ctx.createRadialGradient(x, y, 0, x, y, 18);
          gradient.addColorStop(0, 'rgba(108, 99, 255, .35)');
          gradient.addColorStop(1, 'rgba(108, 99, 255, 0)');
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(x, y, 18, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (!motionQuery.matches && !force) this.frame = requestAnimationFrame(this.boundDraw);
    }
  }

  const canvas = document.getElementById('field-canvas');
  if (!brutalHome && canvas) new SignalField(canvas);
});
