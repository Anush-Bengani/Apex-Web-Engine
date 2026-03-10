/* ============================================================
   APEX Website Engine - ui.js
   UI Interaction Handlers
   ============================================================ */

'use strict';

const UI = (() => {

  const qs           = (s, r) => (r || document).querySelector(s);
  const qsa          = (s, r) => Array.from((r || document).querySelectorAll(s));
  const on           = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts || false);
  const addClass     = (el, ...c) => el && el.classList.add(...c);
  const removeClass  = (el, ...c) => el && el.classList.remove(...c);
  const toggleClass  = (el, c, f) => el && el.classList.toggle(c, f);
  const hasClass     = (el, c)    => el ? el.classList.contains(c) : false;
  const attr         = (el, n, v) => v !== undefined ? el.setAttribute(n, v) : el && el.getAttribute(n);
  const removeAttr   = (el, n)    => el && el.removeAttribute(n);

  const throttle = (fn, wait) => {
    wait = wait || 100;
    let last = 0;
    return function() {
      const now = Date.now();
      if (now - last >= wait) { last = now; fn.apply(this, arguments); }
    };
  };

  const debounce = (fn, wait) => {
    wait = wait || 200;
    let timer;
    return function() {
      const args = arguments;
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), wait);
    };
  };

  const getScrollY = () => window.scrollY || document.documentElement.scrollTop;

  const scrollToTop = (behavior) => {
    window.scrollTo({ top: 0, behavior: behavior || 'smooth' });
  };

  /* ----------------------------------------------------------
     STATE
  ---------------------------------------------------------- */

  const state = {
    navOpen: false,
    lastScrollY: 0,
    scrollTopVisible: false
  };

  /* ----------------------------------------------------------
     1. MOBILE NAVIGATION TOGGLE
  ---------------------------------------------------------- */

  const initMobileNav = () => {
    const navbar = qs('.navbar');
    const toggle = qs('[data-action="toggle-nav"]');
    const drawer = qs('.navbar__drawer');

    if (!navbar || !toggle || !drawer) return;

    const open = () => {
      state.navOpen = true;
      addClass(drawer, 'open');
      removeAttr(drawer, 'hidden');
      attr(toggle, 'aria-expanded', 'true');
      attr(toggle, 'aria-label', 'Close navigation menu');
      addClass(document.body, 'nav-open');
      const bars = qsa('.navbar__toggle-bar', toggle);
      if (bars[0]) bars[0].style.transform = 'translateY(7px) rotate(45deg)';
      if (bars[1]) bars[1].style.opacity = '0';
      if (bars[2]) bars[2].style.transform = 'translateY(-7px) rotate(-45deg)';
    };

    const close = () => {
      state.navOpen = false;
      removeClass(drawer, 'open');
      attr(toggle, 'aria-expanded', 'false');
      attr(toggle, 'aria-label', 'Open navigation menu');
      removeClass(document.body, 'nav-open');
      const bars = qsa('.navbar__toggle-bar', toggle);
      if (bars[0]) bars[0].style.transform = '';
      if (bars[1]) bars[1].style.opacity = '';
      if (bars[2]) bars[2].style.transform = '';
      setTimeout(() => { if (!state.navOpen) attr(drawer, 'hidden', ''); }, 400);
    };

    on(toggle, 'click', () => state.navOpen ? close() : open());

    on(document, 'click', (e) => {
      if (!state.navOpen) return;
      if (!navbar.contains(e.target)) close();
    });

    on(document, 'keydown', (e) => {
      if (e.key === 'Escape' && state.navOpen) close();
    });

    qsa('.navbar__drawer-nav .navbar__nav-link').forEach(link => {
      on(link, 'click', close);
    });

    on(window, 'resize', debounce(() => {
      if (window.innerWidth >= 768 && state.navOpen) close();
    }, 150));
  };

  /* ----------------------------------------------------------
     2. STICKY HEADER
  ---------------------------------------------------------- */

  const initStickyNav = () => {
    const navbar = qs('.navbar');
    if (!navbar) return;

    const SCROLL_THRESHOLD = 50;
    const HIDE_THRESHOLD   = 120;

    const style = document.createElement('style');
    style.textContent = [
      '.navbar {',
      '  transition: transform 0.35s cubic-bezier(0,0,0.2,1),',
      '              background-color 0.3s ease,',
      '              box-shadow 0.3s ease;',
      '}',
      '.navbar--hidden { transform: translateY(-110%); }'
    ].join('\n');
    document.head.appendChild(style);

    const update = throttle(() => {
      const currentY = getScrollY();
      const scrolled = currentY > SCROLL_THRESHOLD;
      const scrollingDown = currentY > state.lastScrollY;
      const delta = Math.abs(currentY - state.lastScrollY);

      toggleClass(navbar, 'scrolled', scrolled);

      if (currentY > HIDE_THRESHOLD && scrollingDown && delta > 8 && !state.navOpen) {
        addClass(navbar, 'navbar--hidden');
      } else if (!scrollingDown && delta > 8) {
        removeClass(navbar, 'navbar--hidden');
      }

      state.lastScrollY = currentY;
    }, 80);

    on(window, 'scroll', update, { passive: true });
  };

  /* ----------------------------------------------------------
     3. ACTIVE NAV LINKS
  ---------------------------------------------------------- */

  const initActiveNavLinks = () => {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const links = qsa('.navbar__nav-link, .navbar__drawer-nav .navbar__nav-link');

    links.forEach(function(link) {
      const href = link.getAttribute('href') || '';
      const page = href.split('/').pop();
      const isHome = (currentPage === '' || currentPage === 'index.html');
      const linkIsHome = (page === '' || page === 'index.html');

      if (page === currentPage || (isHome && linkIsHome)) {
        addClass(link, 'active');
        attr(link, 'aria-current', 'page');
      }
    });
  };

  /* ----------------------------------------------------------
     4. SCROLL TO TOP BUTTON
  ---------------------------------------------------------- */

  const initScrollToTop = () => {
    const existing = qs('#scroll-top-btn');
    if (existing) existing.remove();

    const btn = document.createElement('button');
    btn.id = 'scroll-top-btn';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Scroll to top');
    btn.innerHTML = '<span aria-hidden="true">&#8593;</span>';

    const style = document.createElement('style');
    style.textContent = [
      '#scroll-top-btn {',
      '  position: fixed;',
      '  bottom: 2rem;',
      '  right: 2rem;',
      '  width: 3rem;',
      '  height: 3rem;',
      '  border-radius: 50%;',
      '  background: linear-gradient(135deg, #0EA5E9, #38BDF8);',
      '  color: #0A0F1E;',
      '  font-size: 1.25rem;',
      '  font-weight: 700;',
      '  border: none;',
      '  cursor: pointer;',
      '  z-index: 500;',
      '  box-shadow: 0 8px 30px -4px rgba(56,189,248,0.35);',
      '  opacity: 0;',
      '  transform: translateY(12px) scale(0.9);',
      '  transition: opacity 0.3s ease, transform 0.3s ease;',
      '  pointer-events: none;',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '}',
      '#scroll-top-btn.visible {',
      '  opacity: 1;',
      '  transform: translateY(0) scale(1);',
      '  pointer-events: auto;',
      '}',
      '#scroll-top-btn:hover {',
      '  transform: translateY(-3px) scale(1.08);',
      '}'
    ].join('\n');

    document.head.appendChild(style);
    document.body.appendChild(btn);

    const SHOW_THRESHOLD = 400;

    const toggle = throttle(() => {
      const show = getScrollY() > SHOW_THRESHOLD;
      if (show !== state.scrollTopVisible) {
        state.scrollTopVisible = show;
        toggleClass(btn, 'visible', show);
      }
    }, 100);

    on(window, 'scroll', toggle, { passive: true });
    on(btn, 'click', () => scrollToTop());
  };

  /* ----------------------------------------------------------
     5. GALLERY INTERACTIONS
  ---------------------------------------------------------- */

  const initGallery = () => {
    const lightbox    = qs('#gallery-lightbox');
    const lightboxImg = qs('[data-lightbox-target]');
    const closeBtn    = qs('[data-action="close-lightbox"]');

    if (!lightbox || !lightboxImg) return;

    const openLightbox = (src, alt) => {
      lightboxImg.src = src;
      lightboxImg.alt = alt || '';
      removeClass(lightbox, 'open');
      removeAttr(lightbox, 'hidden');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => addClass(lightbox, 'open'));
      });
      attr(lightbox, 'aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      if (closeBtn) setTimeout(() => closeBtn.focus(), 100);
    };

    const closeLightbox = () => {
      removeClass(lightbox, 'open');
      attr(lightbox, 'aria-hidden', 'true');
      document.body.style.overflow = '';
      setTimeout(() => attr(lightbox, 'hidden', ''), 300);
    };

    qsa('[data-action="open-lightbox"]').forEach(item => {
      const img = qs('img', item);
      if (!img) return;
      on(item, 'click', () => openLightbox(img.src, img.alt));
      on(item, 'keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(img.src, img.alt);
        }
      });
    });

    if (closeBtn) on(closeBtn, 'click', closeLightbox);

    on(lightbox, 'click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    on(document, 'keydown', (e) => {
      if (e.key === 'Escape' && hasClass(lightbox, 'open')) closeLightbox();
    });
  };

  /* ----------------------------------------------------------
     6. BUTTON RIPPLE
  ---------------------------------------------------------- */

  const initButtonEffects = () => {
    const style = document.createElement('style');
    style.textContent = [
      '.btn { position: relative; overflow: hidden; }',
      '.btn__ripple {',
      '  position: absolute;',
      '  border-radius: 50%;',
      '  transform: scale(0);',
      '  animation: btn-ripple 0.55s linear;',
      '  background: rgba(255,255,255,0.22);',
      '  pointer-events: none;',
      '}',
      '@keyframes btn-ripple { to { transform: scale(4); opacity: 0; } }'
    ].join('\n');
    document.head.appendChild(style);

    on(document, 'click', (e) => {
      const btn = e.target.closest('.btn');
      if (!btn) return;
      const circle   = document.createElement('span');
      const diameter = Math.max(btn.clientWidth, btn.clientHeight);
      const rect     = btn.getBoundingClientRect();
      circle.className    = 'btn__ripple';
      circle.style.width  = diameter + 'px';
      circle.style.height = diameter + 'px';
      circle.style.left   = (e.clientX - rect.left  - diameter / 2) + 'px';
      circle.style.top    = (e.clientY - rect.top   - diameter / 2) + 'px';
      const existing = btn.querySelector('.btn__ripple');
      if (existing) existing.remove();
      btn.appendChild(circle);
      circle.addEventListener('animationend', () => circle.remove(), { once: true });
    });
  };

  /* ----------------------------------------------------------
     7. CONTACT FORM VALIDATION
  ---------------------------------------------------------- */

  const initContactForm = () => {
    const form = qs('#contact-form');
    if (!form) return;

    const showError = (field, msg) => {
      const errorEl = qs('#' + field.id + '-error');
      const wrap = field.closest('.form__field');
      if (wrap) wrap.classList.add('has-error');
      if (errorEl) errorEl.textContent = msg;
      attr(field, 'aria-invalid', 'true');
    };

    const clearError = (field) => {
      const errorEl = qs('#' + field.id + '-error');
      const wrap = field.closest('.form__field');
      if (wrap) wrap.classList.remove('has-error');
      if (errorEl) errorEl.textContent = '';
      removeAttr(field, 'aria-invalid');
    };

    const validateField = (field) => {
      clearError(field);
      if (field.required && !field.value.trim()) {
        showError(field, 'This field is required.');
        return false;
      }
      if (field.type === 'email' && field.value) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!re.test(field.value)) {
          showError(field, 'Please enter a valid email address.');
          return false;
        }
      }
      return true;
    };

    qsa('input, textarea, select', form).forEach(field => {
      on(field, 'blur', () => validateField(field));
      on(field, 'input', () => {
        const wrap = field.closest('.form__field');
        if (wrap && wrap.classList.contains('has-error')) validateField(field);
      });
    });

    on(form, 'submit', (e) => {
      e.preventDefault();
      const fields = qsa('[required]', form);
      const valid  = fields.map(validateField).every(Boolean);
      if (!valid) {
        const firstErr = qs('.form__field.has-error input, .form__field.has-error textarea', form);
        if (firstErr) firstErr.focus();
        return;
      }
      const btn = qs('[type="submit"]', form);
      if (btn) {
        const original = btn.textContent;
        btn.textContent = 'Sending...';
        btn.disabled = true;
        setTimeout(() => {
          btn.textContent = 'Message Sent!';
          btn.style.background = '#10B981';
          setTimeout(() => {
            btn.textContent = original;
            btn.disabled = false;
            btn.style.background = '';
            form.reset();
          }, 3000);
        }, 1200);
      }
    });
  };

  /* ----------------------------------------------------------
     8. SCROLL PROGRESS BAR
  ---------------------------------------------------------- */

  const initScrollProgress = () => {
    const bar = document.createElement('div');
    bar.id = 'scroll-progress';

    const style = document.createElement('style');
    style.textContent = [
      '#scroll-progress {',
      '  position: fixed;',
      '  top: 0;',
      '  left: 0;',
      '  height: 3px;',
      '  width: 0%;',
      '  background: linear-gradient(90deg, #0EA5E9, #38BDF8);',
      '  z-index: 201;',
      '  transition: width 0.1s linear;',
      '  pointer-events: none;',
      '}'
    ].join('\n');

    document.head.appendChild(style);
    document.body.prepend(bar);

    on(window, 'scroll', throttle(() => {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - doc.clientHeight;
      const pct = scrollable > 0 ? (getScrollY() / scrollable) * 100 : 0;
      bar.style.width = pct + '%';
    }, 60), { passive: true });
  };

  /* ----------------------------------------------------------
     INIT
  ---------------------------------------------------------- */

  const init = () => {
    initMobileNav();
    initStickyNav();
    initActiveNavLinks();
    initScrollToTop();
    initGallery();
    initButtonEffects();
    initContactForm();
    initScrollProgress();
  };

  /* ----------------------------------------------------------
     PUBLIC API
  ---------------------------------------------------------- */

  return {
    init: init,
    initMobileNav: initMobileNav,
    initStickyNav: initStickyNav,
    initActiveNavLinks: initActiveNavLinks,
    initScrollToTop: initScrollToTop,
    initGallery: initGallery,
    initButtonEffects: initButtonEffects,
    initContactForm: initContactForm,
    initScrollProgress: initScrollProgress
  };

})();

window.UI = UI;
                        
