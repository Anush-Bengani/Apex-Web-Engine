/* ============================================================
   APEX Website Engine — aura.js
   Animation Utilities & DOM Helpers
   ============================================================ */

'use strict';

const Aura = (() => {

  /* ----------------------------------------------------------
     DOM HELPERS
  ---------------------------------------------------------- */

  const qs  = (selector, root = document) => root.querySelector(selector);
  const qsa = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const on = (el, event, handler, options = false) => {
    if (!el) return;
    el.addEventListener(event, handler, options);
  };

  const off = (el, event, handler) => {
    if (!el) return;
    el.removeEventListener(event, handler);
  };

  const ready = (fn) => {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  };

  const create = (tag, attrs = {}, ...children) => {
    const el = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => {
      if (k === 'class') el.className = v;
      else if (k === 'text') el.textContent = v;
      else el.setAttribute(k, v);
    });
    children.forEach(child => {
      if (typeof child === 'string') el.appendChild(document.createTextNode(child));
      else if (child instanceof Node) el.appendChild(child);
    });
    return el;
  };

  const addClass    = (el, ...cls) => el && el.classList.add(...cls);
  const removeClass = (el, ...cls) => el && el.classList.remove(...cls);
  const toggleClass = (el, cls, force) => el && el.classList.toggle(cls, force);
  const hasClass    = (el, cls) => el ? el.classList.contains(cls) : false;

  const attr    = (el, name, val) => val !== undefined ? el.setAttribute(name, val) : el?.getAttribute(name);
  const removeAttr = (el, name) => el?.removeAttribute(name);

  const css = (el, props) => {
    if (!el) return;
    Object.entries(props).forEach(([k, v]) => (el.style[k] = v));
  };

  const closest = (el, selector) => el?.closest(selector);

  const index = (el) => {
    if (!el) return -1;
    return Array.from(el.parentNode?.children || []).indexOf(el);
  };

  /* ----------------------------------------------------------
     INTERSECTION OBSERVER FACTORY
  ---------------------------------------------------------- */

  const createObserver = (callback, options = {}) => {
    const defaults = {
      root: null,
      rootMargin: '0px 0px -60px 0px',
      threshold: 0.12,
    };
    return new IntersectionObserver(callback, { ...defaults, ...options });
  };

  const observeOnce = (elements, callback, options = {}) => {
    const observer = createObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          callback(entry.target, entry);
          obs.unobserve(entry.target);
        }
      });
    }, options);
    elements.forEach(el => observer.observe(el));
    return observer;
  };

  const observePersist = (elements, callback, options = {}) => {
    const observer = createObserver((entries) => {
      entries.forEach(entry => callback(entry.target, entry.isIntersecting, entry));
    }, options);
    elements.forEach(el => observer.observe(el));
    return observer;
  };

  /* ----------------------------------------------------------
     SCROLL REVEAL
  ---------------------------------------------------------- */

  const REVEAL_CLASSES = [
    'animate-fade-up',
    'animate-fade-in',
    'animate-scale-in',
  ];

  const initScrollReveal = () => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      REVEAL_CLASSES.forEach(cls => {
        qsa(`.${cls}`).forEach(el => {
          el.style.opacity = '1';
          el.style.transform = 'none';
          el.style.animation = 'none';
        });
      });
      return;
    }

    const revealEls = qsa(REVEAL_CLASSES.map(c => `.${c}`).join(', '));

    revealEls.forEach(el => {
      el.dataset.auraReady = 'false';
      el.style.opacity = '0';
      if (hasClass(el, 'animate-fade-up'))  el.style.transform = 'translateY(22px)';
      if (hasClass(el, 'animate-scale-in')) el.style.transform = 'scale(0.94)';
    });

    const getDelay = (el) => {
      const delayClass = Array.from(el.classList).find(c => /^delay-\d+$/.test(c));
      if (!delayClass) return 0;
      const n = parseInt(delayClass.replace('delay-', ''), 10);
      return n * 100;
    };

    observeOnce(revealEls, (el) => {
      const delay = getDelay(el);
      setTimeout(() => {
        el.style.transition = [
          `opacity 0.55s cubic-bezier(0, 0, 0.2, 1)`,
          `transform 0.55s cubic-bezier(0, 0, 0.2, 1)`,
        ].join(', ');
        el.style.opacity = '1';
        el.style.transform = 'none';
        el.dataset.auraReady = 'true';
      }, delay);
    }, { rootMargin: '0px 0px -50px 0px', threshold: 0.08 });
  };

  /* ----------------------------------------------------------
     SMOOTH SCROLL
  ---------------------------------------------------------- */

  const scrollTo = (target, options = {}) => {
    const defaults = { behavior: 'smooth', block: 'start', inline: 'nearest' };
    const opts = { ...defaults, ...options };

    if (typeof target === 'string') {
      const el = qs(target);
      if (el) el.scrollIntoView(opts);
    } else if (target instanceof Element) {
      target.scrollIntoView(opts);
    } else if (typeof target === 'number') {
      window.scrollTo({ top: target, behavior: opts.behavior });
    }
  };

  const scrollToTop = (behavior = 'smooth') => {
    window.scrollTo({ top: 0, behavior });
  };

  const initSmoothAnchorLinks = () => {
    on(document, 'click', (e) => {
      const link = closest(e.target, 'a[href^="#"]');
      if (!link) return;

      const hash = link.getAttribute('href');
      if (!hash || hash === '#') {
        e.preventDefault();
        scrollToTop();
        return;
      }

      const target = qs(hash);
      if (target) {
        e.preventDefault();
        const navHeight = qs('.navbar')?.offsetHeight || 0;
        const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 16;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  };

  /* ----------------------------------------------------------
     PARALLAX HELPER (lightweight, CSS-var based)
  ---------------------------------------------------------- */

  let parallaxActive = false;
  let parallaxRafId  = null;

  const initParallax = (selector = '[data-parallax]', intensity = 0.3) => {
    const els = qsa(selector);
    if (!els.length) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    parallaxActive = true;

    const update = () => {
      if (!parallaxActive) return;
      const scrollY = window.scrollY;
      els.forEach(el => {
        const factor = parseFloat(el.dataset.parallax || intensity);
        const offset = scrollY * factor;
        el.style.setProperty('--parallax-y', `${offset}px`);
        el.style.transform = `translateY(var(--parallax-y))`;
      });
      parallaxRafId = requestAnimationFrame(update);
    };

    parallaxRafId = requestAnimationFrame(update);
  };

  const destroyParallax = () => {
    parallaxActive = false;
    if (parallaxRafId) cancelAnimationFrame(parallaxRafId);
  };

  /* ----------------------------------------------------------
     STAGGER CHILDREN
  ---------------------------------------------------------- */

  const staggerChildren = (parent, delayIncrement = 80, baseDelay = 0) => {
    if (!parent) return;
    const children = Array.from(parent.children);
    children.forEach((child, i) => {
      const total = baseDelay + i * delayIncrement;
      child.style.transitionDelay = `${total}ms`;
      child.style.animationDelay  = `${total}ms`;
    });
  };

  /* ----------------------------------------------------------
     SCROLL POSITION UTILITIES
  ---------------------------------------------------------- */

  const getScrollY   = () => window.scrollY || document.documentElement.scrollTop;
  const getScrollPct = () => {
    const doc = document.documentElement;
    const scrollable = doc.scrollHeight - doc.clientHeight;
    return scrollable > 0 ? getScrollY() / scrollable : 0;
  };

  const isInViewport = (el, offset = 0) => {
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    return (
      rect.top    <= (window.innerHeight || document.documentElement.clientHeight) - offset &&
      rect.bottom >= offset &&
      rect.left   <= (window.innerWidth  || document.documentElement.clientWidth)  - offset &&
      rect.right  >= offset
    );
  };

  /* ----------------------------------------------------------
     THROTTLE / DEBOUNCE
  ---------------------------------------------------------- */

  const throttle = (fn, wait = 100) => {
    let last = 0;
    return (...args) => {
      const now = Date.now();
      if (now - last >= wait) {
        last = now;
        fn(...args);
      }
    };
  };

  const debounce = (fn, wait = 200) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), wait);
    };
  };

  /* ----------------------------------------------------------
     RAF LOOP UTILITY
  ---------------------------------------------------------- */

  const loop = (fn) => {
    let id;
    const tick = () => { fn(); id = requestAnimationFrame(tick); };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  };

  /* ----------------------------------------------------------
     INIT
  ---------------------------------------------------------- */

  const init = () => {
    initScrollReveal();
    initSmoothAnchorLinks();
  };

  /* ----------------------------------------------------------
     PUBLIC API
  ---------------------------------------------------------- */

  return {
    qs, qsa, on, off, ready, create,
    addClass, removeClass, toggleClass, hasClass,
    attr, removeAttr, css, closest, index,
    createObserver, observeOnce, observePersist,
    initScrollReveal,
    scrollTo, scrollToTop, initSmoothAnchorLinks,
    initParallax, destroyParallax,
    staggerChildren,
    getScrollY, getScrollPct, isInViewport,
    throttle, debounce, loop,
    init,
  };

})();

window.Aura = Aura;
