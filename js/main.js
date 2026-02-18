/* ============================================
   Filip Kecman - Main JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // --- Mobile Nav Toggle ---
  const navToggle = document.getElementById('navToggle');
  const navLinks  = document.getElementById('navLinks');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('active');
      navLinks.classList.toggle('open');
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', !expanded);
    });

    // Close menu on link click
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // --- Navbar hide/show on scroll ---
  const navbar = document.querySelector('.navbar');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    if (currentScroll > 100) {
      if (currentScroll > lastScroll && currentScroll > 300) {
        navbar.classList.add('hidden');
      } else {
        navbar.classList.remove('hidden');
      }
    } else {
      navbar.classList.remove('hidden');
    }
    lastScroll = currentScroll;
  }, { passive: true });

  // --- Active nav link on scroll ---
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

  const activateNav = () => {
    const scrollPos = window.scrollY + 200;
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      if (scrollPos >= top && scrollPos < top + height) {
        navAnchors.forEach(a => {
          a.classList.remove('active');
          if (a.getAttribute('href') === `#${id}`) {
            a.classList.add('active');
          }
        });
      }
    });
  };
  window.addEventListener('scroll', activateNav, { passive: true });

  // --- Animated Stat Counters ---
  const animateCounter = (el, target) => {
    const duration = 1800;
    const start = performance.now();

    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(ease * target);
      el.textContent = current;
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target;
    };
    requestAnimationFrame(tick);
  };

  const statNumbers = document.querySelectorAll('.stat-number[data-target]');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.target, 10);
        if (target > 0) {
          const span = el.querySelector('span');
          if (span) animateCounter(span, target);
        }
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  statNumbers.forEach(el => counterObserver.observe(el));

  // --- Reveal on Scroll (Intersection Observer) ---
  const revealElements = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  revealElements.forEach(el => revealObserver.observe(el));

  // --- Blog Filters (blog page) ---
  const filterBtns = document.querySelectorAll('.blog-filter-btn');
  const blogCards = document.querySelectorAll('.blog-grid .blog-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;

      blogCards.forEach(card => {
        if (filter === 'all') {
          card.style.display = '';
        } else {
          const tags = card.dataset.tags || '';
          card.style.display = tags.includes(filter) ? '' : 'none';
        }
      });
    });
  });

  // --- Contact Form Success ---
  const form = document.querySelector('.contact-form');
  if (form) {
    form.addEventListener('submit', function(e) {
      const btn = form.querySelector('.form-submit');
      btn.textContent = 'Sending...';
      btn.disabled = true;

      // Web3Forms handles the submission, just reset after redirect
      setTimeout(() => {
        btn.textContent = 'Send Message';
        btn.disabled = false;
      }, 5000);
    });
  }

  // --- LLM referral tracking via GA4 custom events ---
  (function() {
    try {
      if (typeof gtag !== 'function') return;

      const ref = document.referrer || '';
      const params = new URLSearchParams(window.location.search);
      const utm_source = params.get('utm_source') || '';
      const combined = (ref + ' ' + utm_source).toLowerCase();

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

      if (matchedSource || utm_source === 'llm' || params.get('utm_medium') === 'llm') {
        gtag('event', 'llm_referral', {
          llm_source: matchedSource || utm_source || 'unknown',
          referrer: ref || 'direct',
          landing_page: window.location.pathname
        });
      }
    } catch(e) { /* silent */ }
  })();

  // --- Smooth scroll for anchor links (fallback for older browsers) ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

});
