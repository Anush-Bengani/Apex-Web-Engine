/* ============================================================
APEX Website Engine — ui.js
UI Interaction Handlers
============================================================ */

‘use strict’;

const UI = (() => {

const { qs, qsa, on, addClass, removeClass, toggleClass, hasClass,
attr, removeAttr, throttle, debounce, scrollToTop, getScrollY } = Aura;

/* –––––––––––––––––––––––––––––
STATE
––––––––––––––––––––––––––––– */

const state = {
navOpen:         false,
lastScrollY:     0,
scrollTopVisible: false,
};

/* –––––––––––––––––––––––––––––
1. MOBILE NAVIGATION TOGGLE
––––––––––––––––––––––––––––– */

const initMobileNav = () => {
const navbar  = qs(’.navbar’);
const toggle  = qs(’[data-action=“toggle-nav”]’);
const drawer  = qs(’.navbar__drawer’);

```
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
  if (bars[1]) bars[1].style.opacity   = '0';
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
  if (bars[1]) bars[1].style.opacity   = '';
  if (bars[2]) bars[2].style.transform = '';

  setTimeout(() => {
    if (!state.navOpen) attr(drawer, 'hidden', '');
  }, 400);
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
```

};

/* –––––––––––––––––––––––––––––
2. STICKY HEADER / SCROLL BEHAVIOUR
––––––––––––––––––––––––––––– */

const initStickyNav = () => {
const navbar = qs(’.navbar’);
if (!navbar) return;

```
const SCROLL_THRESHOLD = 50;
const HIDE_THRESHOLD   = 120;

const update = throttle(() => {
  const currentY = getScrollY();
  const scrolled  = currentY > SCROLL_THRESHOLD;
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

const style = document.createElement('style');
style.textContent = `
  .navbar {
    transition: transform 0.35s cubic-bezier(0, 0, 0.2, 1),
                background-color 0.3s ease,
                box-shadow 0.3s ease;
  }
  .navbar--hidden {
    transform: translateY(-110%);
  }
`;
document.head.appendChild(style);
```

};

/* –––––––––––––––––––––––––––––
3. ACTIVE NAV LINK HIGHLIGHTING
––––––––––––––––––––––––––––– */

const initActiveNavLinks = () => {
const currentPage = window.location.pathname.split(’/’).pop() || ‘index.html’;
const links = qsa(’.navbar__nav-link, .navbar__drawer-nav .navbar__nav-link’);

```
links.forEach(link => {
  const href = link.getAttribute('href') || '';
  const page = href.split('/').pop();

  if (
    page === currentPage ||
    (currentPage === '' && (page === 'index.html' || page === '')) ||
    (currentPage === 'index.html' && (page === '' || page === 'index.html'))
  ) {
    addClass(link, 'active');
    attr(link, 'aria-current', 'page');
  }
});
```

};

/* –––––––––––––––––––––––––––––
4. SCROLL-TO-TOP BUTTON
––––––––––––––––––––––––––––– */

const initScrollToTop = () => {
const existing = qs(’#scroll-top-btn’);
if (existing) existing.remove();

```
const btn = document.createElement('button');
btn.id = 'scroll-top-btn';
btn.type = 'button';
btn.setAttribute('aria-label', 'Scroll to top');
btn.innerHTML = '<span aria-hidden="true">↑</span>';

const style = document.createElement('style');
style.textContent = `
  #scroll-top-btn {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    width: 3rem;
    height: 3rem;
    border-radius: 50%;
    background: var(--gradient-accent, linear-gradient(135deg, #0EA5E9, #38BDF8));
    color: var(--color-primary, #0A0F1E);
    font-size: 1.25rem;
    font-weight: 700;
    border: none;
    cursor: pointer;
    z-index: var(--z-toast, 500);
    box-shadow: var(--shadow-accent, 0 8px 30px -4px rgba(56,189,248,0.35));
    opacity: 0;
    transform: translateY(12px) scale(0.9);
    transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
    pointer-events: none;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  #scroll-top-btn.visible {
    opacity: 1;
    transform: translateY(0) scale(1);
    pointer-events: auto;
  }
  #scroll-top-btn:hover {
    transform: translateY(-3px) scale(1.08);
    box-shadow: 0 12px 36px -4px rgba(56,189,248,0.5);
  }
  #scroll-top-btn:active {
    transform: scale(0.96);
  }
`;
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
```

};

/* –––––––––––––––––––––––––––––
5. GALLERY INTERACTIONS
––––––––––––––––––––––––––––– */

const initGallery = () => {
const lightbox = qs(’#gallery-lightbox’);
const lightboxImg = qs(’[data-lightbox-target]’, lightbox);
const closeBtn = qs(’[data-action=“close-lightbox”]’, lightbox);

```
const galleryImages = qsa('.gallery__item img.gallery__image');

if (!lightbox || !lightboxImg || !galleryImages.length) return;

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

  setTimeout(() => closeBtn?.focus(), 100);
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
```

};

/* –––––––––––––––––––––––––––––
6. BUTTON RIPPLE EFFECT
––––––––––––––––––––––––––––– */

const initButtonEffects = () => {
const style = document.createElement(‘style’);
style.textContent = `.btn { position: relative; overflow: hidden; } .btn__ripple { position: absolute; border-radius: 50%; transform: scale(0); animation: btn-ripple 0.55s linear; background: rgba(255, 255, 255, 0.22); pointer-events: none; } @keyframes btn-ripple { to { transform: scale(4); opacity: 0; } }`;
document.head.appendChild(style);

```
on(document, 'click', (e) => {
  const btn = e.target.closest('.btn');
  if (!btn) return;

  const circle = document.createElement('span');
  const diameter = Math.max(btn.clientWidth, btn.clientHeight);
  const rect = btn.getBoundingClientRect();

  circle.className = 'btn__ripple';
  circle.style.width  = `${diameter}px`;
  circle.style.height = `${diameter}px`;
  circle.style.left   = `${e.clientX - rect.left  - diameter / 2}px`;
  circle.style.top    = `${e.clientY - rect.top   - diameter / 2}px`;

  const existing = btn.querySelector('.btn__ripple');
  if (existing) existing.remove();

  btn.appendChild(circle);
  circle.addEventListener('animationend', () => circle.remove(), { once: true });
});
```

};

/* –––––––––––––––––––––––––––––
7. CONTACT FORM VALIDATION
––––––––––––––––––––––––––––– */

const initContactForm = () => {
const form = qs(’#contact-form’);
if (!form) return;

```
const showError = (field, msg) => {
  const errorEl = qs(`#${field.id}-error`);
  field.closest('.form__field')?.classList.add('has-error');
  if (errorEl) errorEl.textContent = msg;
  attr(field, 'aria-invalid', 'true');
};

const clearError = (field) => {
  const errorEl = qs(`#${field.id}-error`);
  field.closest('.form__field')?.classList.remove('has-error');
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
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(field.value)) {
      showError(field, 'Please enter a valid email address.');
      return false;
    }
  }
  return true;
};

qsa('input, textarea, select', form).forEach(field => {
  on(field, 'blur', () => validateField(field));
  on(field, 'input', () => {
    if (hasClass(field.closest('.form__field'), 'has-error')) validateField(field);
  });
});

on(form, 'submit', (e) => {
  e.preventDefault();
  const fields = qsa('[required]', form);
  const valid  = fields.map(validateField).every(Boolean);

  if (!valid) {
    const firstErr = qs('.form__field.has-error input, .form__field.has-error textarea', form);
    firstErr?.focus();
    return;
  }

  const btn = qs('[type="submit"]', form);
  if (btn) {
    const original = btn.textContent;
    btn.textContent = 'Sending…';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = '✓ Message Sent';
      btn.style.background = 'var(--color-success, #10B981)';
      setTimeout(() => {
        btn.textContent = original;
        btn.disabled = false;
        btn.style.background = '';
        form.reset();
      }, 3000);
    }, 1200);
  }
});
```

};

/* –––––––––––––––––––––––––––––
8. SCROLL PROGRESS BAR
––––––––––––––––––––––––––––– */

const initScrollProgress = () => {
const bar = document.createElement(‘div’);
bar.id = ‘scroll-progress’;

```
const style = document.createElement('style');
style.textContent = `
  #scroll-progress {
    position: fixed;
    top: 0;
    left: 0;
    height: 3px;
    width: 0%;
    background: var(--gradient-accent, linear-gradient(90deg, #0EA5E9, #38BDF8));
    z-index: calc(var(--z-sticky, 200) + 1);
    transition: width 0.1s linear;
    pointer-events: none;
  }
`;
document.head.appendChild(style);
document.body.prepend(bar);

on(window, 'scroll', throttle(() => {
  const pct = Aura.getScrollPct() * 100;
  bar.style.width = `${pct}%`;
}, 60), { passive: true });
```

};

/* –––––––––––––––––––––––––––––
9. FOCUS TRAP UTILITY (for modals / drawers)
––––––––––––––––––––––––––––– */

const FOCUSABLE = [
‘a[href]’, ‘button:not([disabled])’, ‘input:not([disabled])’,
‘select:not([disabled])’, ‘textarea:not([disabled])’,
‘[tabindex]:not([tabindex=”-1”])’,
].join(’, ’);

const trapFocus = (container) => {
const focusable = qsa(FOCUSABLE, container);
if (!focusable.length) return () => {};

```
const first = focusable[0];
const last  = focusable[focusable.length - 1];

const handler = (e) => {
  if (e.key !== 'Tab') return;
  if (e.shiftKey) {
    if (document.activeElement === first) { e.preventDefault(); last.focus(); }
  } else {
    if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
  }
};

on(container, 'keydown', handler);
return () => container.removeEventListener('keydown', handler);
```

};

/* –––––––––––––––––––––––––––––
INIT — called after engine renders the page
––––––––––––––––––––––––––––– */

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

/* –––––––––––––––––––––––––––––
PUBLIC API
––––––––––––––––––––––––––––– */

return {
init,
initMobileNav,
initStickyNav,
initActiveNavLinks,
initScrollToTop,
initGallery,
initButtonEffects,
initContactForm,
initScrollProgress,
trapFocus,
};

})();

window.UI = UI;
