/* ============================================================
APEX Engine - aura.js  v2
DOM Utilities and Animation Helpers
============================================================ */
‘use strict’;

var Aura = (function () {

function qs(sel, root) { return (root || document).querySelector(sel); }
function qsa(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }
function on(el, ev, fn, opts) { if (el) el.addEventListener(ev, fn, opts || false); }
function off(el, ev, fn) { if (el) el.removeEventListener(ev, fn); }
function addClass(el, c) { if (el) el.classList.add(c); }
function removeClass(el, c) { if (el) el.classList.remove(c); }
function toggleClass(el, c, force) { if (el) el.classList.toggle(c, force); }
function hasClass(el, c) { return el ? el.classList.contains(c) : false; }
function attr(el, n, v) { if (!el) return null; if (v !== undefined) { el.setAttribute(n, v); return; } return el.getAttribute(n); }
function removeAttr(el, n) { if (el) el.removeAttribute(n); }
function closest(el, sel) { return el ? el.closest(sel) : null; }

function throttle(fn, wait) {
wait = wait || 100;
var last = 0;
return function () {
var now = Date.now();
if (now - last >= wait) { last = now; fn.apply(this, arguments); }
};
}

function debounce(fn, wait) {
wait = wait || 200;
var timer;
return function () {
var a = arguments, ctx = this;
clearTimeout(timer);
timer = setTimeout(function () { fn.apply(ctx, a); }, wait);
};
}

function getScrollY() { return window.scrollY || document.documentElement.scrollTop; }

function initScrollReveal() {
var prefersReduced = window.matchMedia(’(prefers-reduced-motion: reduce)’).matches;
var classes = [‘animate-fade-up’, ‘animate-fade-in’, ‘animate-scale-in’];
var selector = classes.map(function (c) { return ‘.’ + c; }).join(’, ’);
var els = qsa(selector);

```
if (prefersReduced) {
  els.forEach(function (el) {
    addClass(el, 'is-visible');
  });
  return;
}

var observer = new IntersectionObserver(function (entries, obs) {
  entries.forEach(function (entry) {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      obs.unobserve(entry.target);
    }
  });
}, { threshold: 0.10, rootMargin: '0px 0px -40px 0px' });

els.forEach(function (el) { observer.observe(el); });
```

}

function initSmoothAnchors() {
on(document, ‘click’, function (e) {
var link = closest(e.target, ‘a[href^=”#”]’);
if (!link) return;
var hash = attr(link, ‘href’);
if (!hash || hash === ‘#’) { e.preventDefault(); window.scrollTo({ top: 0, behavior: ‘smooth’ }); return; }
var target = qs(hash);
if (target) {
e.preventDefault();
var navH = (qs(’.navbar’) || { offsetHeight: 0 }).offsetHeight;
var top = target.getBoundingClientRect().top + window.scrollY - navH - 16;
window.scrollTo({ top: top, behavior: ‘smooth’ });
}
});
}

function init() {
initScrollReveal();
initSmoothAnchors();
}

return {
qs: qs, qsa: qsa, on: on, off: off,
addClass: addClass, removeClass: removeClass,
toggleClass: toggleClass, hasClass: hasClass,
attr: attr, removeAttr: removeAttr, closest: closest,
throttle: throttle, debounce: debounce,
getScrollY: getScrollY,
initScrollReveal: initScrollReveal,
initSmoothAnchors: initSmoothAnchors,
init: init
};

}());

window.Aura = Aura;
