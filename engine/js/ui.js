/* ============================================================
APEX Engine - ui.js  v2
UI Interaction Layer
============================================================ */
‘use strict’;

var UI = (function () {

var A = window.Aura;
var qs = A.qs, qsa = A.qsa, on = A.on, addClass = A.addClass,
removeClass = A.removeClass, toggleClass = A.toggleClass,
attr = A.attr, removeAttr = A.removeAttr, throttle = A.throttle,
getScrollY = A.getScrollY;

var state = { navOpen: false, lastY: 0 };

/* – SCROLL PROGRESS + STICKY NAV + SCROLL-TO-TOP – */
function initScroll() {
var nav  = qs(’.navbar’);
var prog = qs(’#apex-progress’);
var stt  = qs(’#apex-stt’);

```
on(window, 'scroll', throttle(function () {
  var y = getScrollY();
  var doc = document.documentElement;
  var scrollable = doc.scrollHeight - doc.clientHeight;

  if (prog) prog.style.width = (scrollable > 0 ? (y / scrollable * 100) : 0) + '%';
  if (nav)  toggleClass(nav, 'is-scrolled', y > 50);
  if (stt)  toggleClass(stt, 'is-visible',  y > 400);

  state.lastY = y;
}, 80), { passive: true });

if (stt) {
  on(stt, 'click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
```

}

/* – MOBILE NAV – */
function initNav() {
var nav    = qs(’.navbar’);
var toggle = qs(’[data-action=“toggle-nav”]’);
var drawer = qs(’.navbar__drawer’);
if (!nav || !toggle || !drawer) return;

```
function openNav() {
  state.navOpen = true;
  addClass(drawer, 'is-open');
  removeAttr(drawer, 'hidden');
  attr(toggle, 'aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}

function closeNav() {
  state.navOpen = false;
  removeClass(drawer, 'is-open');
  attr(toggle, 'aria-expanded', 'false');
  document.body.style.overflow = '';
  setTimeout(function () {
    if (!state.navOpen) attr(drawer, 'hidden', '');
  }, 300);
}

on(toggle, 'click', function () {
  state.navOpen ? closeNav() : openNav();
});

on(document, 'click', function (e) {
  if (state.navOpen && !nav.contains(e.target)) closeNav();
});

on(document, 'keydown', function (e) {
  if (e.key === 'Escape' && state.navOpen) closeNav();
});

on(window, 'resize', A.debounce(function () {
  if (window.innerWidth >= 768 && state.navOpen) closeNav();
}, 150));

qsa('.navbar__drawer-nav .navbar__nav-link').forEach(function (link) {
  on(link, 'click', closeNav);
});
```

}

/* – ACTIVE NAV LINKS – */
function initActiveLinks() {
var page = window.location.pathname.split(’/’).pop() || ‘index.html’;
var base = page.replace(/.html$/i, ‘’) || ‘index’;

```
qsa('.navbar__nav-link, .navbar__drawer-nav .navbar__nav-link').forEach(function (link) {
  var href = attr(link, 'href') || '';
  var linkPage = href.split('/').pop();
  var linkBase = linkPage.replace(/\.html$/i, '') || 'index';
  var match = (linkPage === page) || (linkBase === base) ||
              ((base === 'index' || base === '') && (linkBase === 'index' || linkBase === ''));
  if (match) {
    addClass(link, 'is-active');
    attr(link, 'aria-current', 'page');
  }
});
```

}

/* – GALLERY LIGHTBOX – */
function initGallery() {
var lightbox = qs(’#gallery-lightbox’);
var lbImg    = qs(’#gallery-lightbox-img’);
var lbClose  = qs(’#gallery-lightbox-close’);
if (!lightbox || !lbImg) return;

```
function open(src, alt) {
  lbImg.src = src;
  lbImg.alt = alt || '';
  addClass(lightbox, 'is-open');
  document.body.style.overflow = 'hidden';
  if (lbClose) setTimeout(function () { lbClose.focus(); }, 100);
}

function close() {
  removeClass(lightbox, 'is-open');
  document.body.style.overflow = '';
}

qsa('[data-action="open-lightbox"]').forEach(function (item) {
  on(item, 'click', function () {
    var img = item.querySelector('img');
    if (img) open(img.src, img.alt);
  });
  on(item, 'keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      var img = item.querySelector('img');
      if (img) open(img.src, img.alt);
    }
  });
});

if (lbClose) on(lbClose, 'click', close);
on(lightbox, 'click', function (e) { if (e.target === lightbox) close(); });
on(document, 'keydown', function (e) {
  if (e.key === 'Escape' && A.hasClass(lightbox, 'is-open')) close();
});
```

}

/* – BUTTON RIPPLE – */
function initRipple() {
on(document, ‘click’, function (e) {
var btn = e.target.closest(’.btn’);
if (!btn) return;
var prev = btn.querySelector(’.btn-ripple’);
if (prev) prev.remove();
var circle = document.createElement(‘span’);
var d = Math.max(btn.clientWidth, btn.clientHeight);
var r = btn.getBoundingClientRect();
circle.className = ‘btn-ripple’;
circle.style.cssText = [
‘position:absolute’,
‘border-radius:50%’,
‘pointer-events:none’,
‘transform:scale(0)’,
‘animation:btn-ripple-anim 0.55s linear’,
‘background:rgba(255,255,255,0.2)’,
‘width:’ + d + ‘px’,
‘height:’ + d + ‘px’,
‘left:’ + (e.clientX - r.left - d / 2) + ‘px’,
‘top:’ + (e.clientY - r.top - d / 2) + ‘px’
].join(’;’);
if (!qs(’#ripple-style’)) {
var s = document.createElement(‘style’);
s.id = ‘ripple-style’;
s.textContent = ‘@keyframes btn-ripple-anim{to{transform:scale(4);opacity:0}}’;
document.head.appendChild(s);
}
btn.appendChild(circle);
on(circle, ‘animationend’, function () { circle.remove(); }, { once: true });
});
}

/* – CONTACT FORM VALIDATION – */
function initContactForm() {
var form        = qs(’#contact-form’);
var submitBtn   = qs(’#contact-submit’);
var formContent = qs(’#contact-form-content’);
var formSuccess = qs(’#contact-form-success’);
if (!form || !submitBtn) return;

```
function showErr(fieldId, msg) {
  var wrap = qs('#field-' + fieldId);
  var errEl = qs('#err-' + fieldId);
  if (wrap) addClass(wrap, 'has-error');
  if (errEl) errEl.textContent = msg;
}

function clearErr(fieldId) {
  var wrap = qs('#field-' + fieldId);
  var errEl = qs('#err-' + fieldId);
  if (wrap) removeClass(wrap, 'has-error');
  if (errEl) errEl.textContent = '';
}

function validateField(id) {
  var el = qs('#' + id);
  if (!el) return true;
  clearErr(id);
  if (el.required && !el.value.trim()) {
    showErr(id, el.dataset.error || 'This field is required.');
    return false;
  }
  if (el.type === 'email' && el.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value)) {
    showErr(id, 'Please enter a valid email address.');
    return false;
  }
  return true;
}

['cf-fname','cf-lname','cf-email','cf-message'].forEach(function (id) {
  var el = qs('#' + id);
  if (!el) return;
  on(el, 'blur', function () { validateField(id); });
  on(el, 'input', function () {
    var wrap = qs('#field-' + id);
    if (wrap && A.hasClass(wrap, 'has-error')) validateField(id);
  });
});

on(submitBtn, 'click', function () {
  var valid = ['cf-fname','cf-lname','cf-email','cf-message']
    .map(validateField).every(Boolean);
  if (!valid) {
    var firstErr = qs('.has-error input, .has-error textarea');
    if (firstErr) firstErr.focus();
    return;
  }
  submitBtn.textContent = 'Sending...';
  submitBtn.disabled = true;
  setTimeout(function () {
    if (formContent) formContent.style.display = 'none';
    if (formSuccess) formSuccess.style.display = 'block';
  }, 1200);
});
```

}

/* – INIT ALL – */
function init() {
initScroll();
initNav();
initActiveLinks();
initGallery();
initRipple();
initContactForm();
}

return {
init: init,
initScroll: initScroll,
initNav: initNav,
initActiveLinks: initActiveLinks,
initGallery: initGallery,
initContactForm: initContactForm
};

}());

window.UI = UI;
