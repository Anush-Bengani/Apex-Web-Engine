/* ============================================================
APEX Engine - engine.js  v2
Core Rendering Engine — Single Page, Dynamic Routing
============================================================ */
‘use strict’;

/* –––––––––––––––––––––––––––––
CONFIG
––––––––––––––––––––––––––––– */
var ENGINE_VERSION = ‘2.0.0’;

var PAGE_MAP = {
‘index.html’ : ‘home’,
‘index’      : ‘home’,
‘’           : ‘home’,
‘rooms’      : ‘rooms’,
‘amenities’  : ‘amenities’,
‘gallery’    : ‘gallery’,
‘contact’    : ‘contact’,
‘about’      : ‘about’,
‘services’   : ‘services’,
‘products’   : ‘products’
};

var componentCache = Object.create(null);
var siteConfig     = null;
var siteContent    = null;

/* –––––––––––––––––––––––––––––
PATH RESOLUTION
Uses the page’s own URL as the anchor so ALL paths resolve
correctly whether hosted on GitHub Pages subdirectory or root.
––––––––––––––––––––––––––––– */
function resolvePath(rel) {
var pageUrl = window.location.href.split(’?’)[0].split(’#’)[0];
var pageDir = pageUrl.substring(0, pageUrl.lastIndexOf(’/’) + 1);
return new URL(rel, pageDir).href;
}

/* –––––––––––––––––––––––––––––
LOGGING
––––––––––––––––––––––––––––– */
function log(msg) { console.log(’[APEX v’ + ENGINE_VERSION + ‘] ’ + msg); }
function warn(msg) { console.warn(’[APEX v’ + ENGINE_VERSION + ‘] ’ + msg); }
function err(msg) { console.error(’[APEX v’ + ENGINE_VERSION + ’] ’ + msg); }

/* –––––––––––––––––––––––––––––
CONTENT PATH RESOLVER
Resolves “hero.title” -> content.hero.title
––––––––––––––––––––––––––––– */
function getVal(obj, path) {
if (!obj || !path) return undefined;
var keys = path.split(’.’);
var cur = obj;
for (var i = 0; i < keys.length; i++) {
if (cur == null) return undefined;
cur = cur[keys[i]];
}
return cur;
}

/* –––––––––––––––––––––––––––––
JSON LOADER
––––––––––––––––––––––––––––– */
function loadJSON(url) {
return fetch(url).then(function (res) {
if (!res.ok) throw new Error(‘Cannot load ’ + url + ’ (’ + res.status + ‘)’);
return res.json();
});
}

/* –––––––––––––––––––––––––––––
SITE DETECTION
Reads ?site= param, defaults to ‘demo’
––––––––––––––––––––––––––––– */
function detectSite() {
return new URLSearchParams(window.location.search).get(‘site’) || ‘demo’;
}

/* –––––––––––––––––––––––––––––
PAGE DETECTION
Reads ?page= param OR maps current filename to a page key.
This is the key to single-index-html routing:

- Direct visit: index.html → ‘home’
- Hash routing: index.html#rooms → ‘rooms’
- Query routing: index.html?page=rooms → ‘rooms’
  ––––––––––––––––––––––––––––– */
  function detectPage() {
  var params = new URLSearchParams(window.location.search);
  var qPage  = params.get(‘page’);
  if (qPage) return qPage.toLowerCase();

var hash = window.location.hash.replace(’#’, ‘’).toLowerCase();
if (hash && hash !== ‘’) return hash;

var filename = window.location.pathname.split(’/’).pop() || ‘’;
var base     = filename.replace(/.html$/i, ‘’).toLowerCase();
return PAGE_MAP[filename] || PAGE_MAP[base] || ‘home’;
}

/* –––––––––––––––––––––––––––––
COMPONENT LOADER — with caching
––––––––––––––––––––––––––––– */
function loadComponent(name) {
if (componentCache[name]) return Promise.resolve(componentCache[name]);
var url = resolvePath(‘engine/components/’ + name + ‘.html’);
return fetch(url).then(function (res) {
if (!res.ok) { warn(’Component not found: ’ + name); return ‘’; }
return res.text();
}).then(function (html) {
if (html) componentCache[name] = html.trim();
return componentCache[name] || ‘’;
});
}

function loadComponents(names) {
return Promise.all(names.map(loadComponent)).then(function (results) {
var map = {};
names.forEach(function (n, i) { map[n] = results[i]; });
return map;
});
}

/* –––––––––––––––––––––––––––––
DOM RENDERING
––––––––––––––––––––––––––––– */
function renderHTML(app, html) {
if (!html) return;
var tpl = document.createElement(‘template’);
tpl.innerHTML = html.trim();
app.appendChild(tpl.content.cloneNode(true));
}

/* –––––––––––––––––––––––––––––
CONTENT INJECTION
Walks all data-content-* attributes and fills them.
––––––––––––––––––––––––––––– */
function injectContent(root, content) {
if (!root || !content) return;

/* data-content=“key.path” — sets textContent */
root.querySelectorAll(’[data-content]’).forEach(function (el) {
var key   = el.getAttribute(‘data-content’);
var value = getVal(content, key);
if (value == null) return;
var targetAttr = el.getAttribute(‘data-content-attr’);
if (targetAttr) { el.setAttribute(targetAttr, value); }
else             { el.textContent = value; }
});

/* data-content-attr-<name>=“key.path” — sets named attribute */
root.querySelectorAll(’*’).forEach(function (el) {
Array.from(el.attributes).forEach(function (a) {
if (a.name.indexOf(‘data-content-attr-’) !== 0) return;
var attrName = a.name.replace(‘data-content-attr-’, ‘’);
var value    = getVal(content, a.value);
if (value != null) el.setAttribute(attrName, value);
});
});

/* Navigation links — data-component=“nav-links” */
var navContent = getVal(content, ‘__navigation’);
if (navContent && Array.isArray(navContent)) {
root.querySelectorAll(’[data-component=“nav-links”], [data-component=“nav-links-mobile”]’).forEach(function (list) {
list.innerHTML = ‘’;
navContent.forEach(function (item) {
var li   = document.createElement(‘li’);
var link = document.createElement(‘a’);
link.className   = ‘navbar__nav-link’;
link.textContent = item.label;
link.href        = item.href;
li.appendChild(link);
list.appendChild(li);
});
});
}
}

/* –––––––––––––––––––––––––––––
NAVIGATION BUILDER
Converts site.json navigation into content.__navigation
so nav links are injected via the normal content system.
All links point to index.html?page=X for SPA routing.
––––––––––––––––––––––––––––– */
function buildNav(config, content) {
var items = config && config.navigation;
if (!items || !Array.isArray(items)) return;
content.__navigation = items.map(function (item) {
return {
label: item.label,
href:  ‘index.html?page=’ + item.page
};
});
}

/* –––––––––––––––––––––––––––––
META SETUP
––––––––––––––––––––––––––––– */
function setupMeta(config, content, page) {
var siteName  = (config && config.site && config.site.name) || ‘APEX Site’;
var pageTitle = getVal(content, ‘meta.’ + page + ‘.title’) || siteName;
var pageDesc  = getVal(content, ‘meta.’ + page + ‘.description’) || ‘’;

document.title = (pageTitle !== siteName) ? pageTitle + ’ — ’ + siteName : siteName;

var dm = document.querySelector(‘meta[name=“description”]’);
if (!dm) { dm = document.createElement(‘meta’); dm.name = ‘description’; document.head.appendChild(dm); }
if (pageDesc) dm.content = pageDesc;
}

/* –––––––––––––––––––––––––––––
LOADER UI
––––––––––––––––––––––––––––– */
function showLoader() {
var el = document.getElementById(‘apex-loader’);
if (!el) {
el = document.createElement(‘div’);
el.id = ‘apex-loader’;
el.innerHTML = ‘<div class="apex-loader__spinner"></div><p class="apex-loader__text">Loading</p>’;
document.body.appendChild(el);
}
el.style.display = ‘flex’;
}

function hideLoader() {
var el = document.getElementById(‘apex-loader’);
if (el) el.style.display = ‘none’;
}

/* –––––––––––––––––––––––––––––
ERROR UI
––––––––––––––––––––––––––––– */
function showError(msg) {
var app = document.getElementById(‘app’);
if (!app) return;
app.innerHTML = ‘’;
var d = document.createElement(‘div’);
d.style.cssText = ‘display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:80vh;padding:2rem;text-align:center;font-family:system-ui,sans-serif;’;
var t = document.createElement(‘h2’);
t.textContent = ‘Engine Error’;
t.style.cssText = ‘color:#F1F5F9;font-size:1.5rem;margin-bottom:0.75rem;’;
var p = document.createElement(‘p’);
p.textContent = msg;
p.style.cssText = ‘color:rgba(241,245,249,0.55);font-size:0.9rem;max-width:40ch;line-height:1.6;’;
d.appendChild(t); d.appendChild(p);
app.appendChild(d);
}

/* –––––––––––––––––––––––––––––
MAIN RENDER PIPELINE
––––––––––––––––––––––––––––– */
function renderPage(page) {
var app = document.getElementById(‘app’);
if (!app) { err(’#app not found’); return Promise.resolve(); }

var pages      = (siteConfig && siteConfig.pages) || {};
var components = pages[page];

if (!components || !components.length) {
hideLoader();
showError(‘No layout defined for page “’ + page + ‘”.’);
return Promise.resolve();
}

log(‘Rendering page: ’ + page + ’ [’ + components.join(’, ’) + ‘]’);

return loadComponents(components).then(function (loaded) {
app.innerHTML = ‘’;
components.forEach(function (name) {
var html = loaded[name];
if (!html) { warn(’Skipping empty component: ’ + name); return; }
renderHTML(app, html);
});
injectContent(app, siteContent);
setupMeta(siteConfig, siteContent, page);
hideLoader();
if (window.UI)   UI.init();
if (window.Aura) Aura.init();
log(‘Page ready.’);
});
}

/* –––––––––––––––––––––––––––––
ROUTER
Handles ?page= query param changes without full reload.
––––––––––––––––––––––––––––– */
function handleRoute() {
var page = detectPage();
showLoader();
renderPage(page).catch(function (e) {
hideLoader();
showError(e.message || ‘Unexpected error.’);
err(e);
});
}

/* –––––––––––––––––––––––––––––
BOOT
––––––––––––––––––––––––––––– */
function boot() {
var site = detectSite();
log(’Booting — site: ’ + site + ‘, engine v’ + ENGINE_VERSION);

showLoader();

var siteJsonUrl    = resolvePath(‘sites/’ + site + ‘/site.json’);
var contentJsonUrl = resolvePath(‘sites/’ + site + ‘/content.json’);

Promise.all([loadJSON(siteJsonUrl), loadJSON(contentJsonUrl)]).then(function (results) {
siteConfig  = results[0];
siteContent = results[1];

```
buildNav(siteConfig, siteContent);
log('Config loaded.');

handleRoute();

/* Listen for navigation via ?page= link clicks — no full reload */
on(document, 'click', function (e) {
  var link = e.target.closest('a[href]');
  if (!link) return;
  var href = link.getAttribute('href') || '';
  if (href.indexOf('index.html?page=') === -1 && href.indexOf('?page=') === -1) return;
  e.preventDefault();
  window.history.pushState(null, '', href);
  handleRoute();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

window.addEventListener('popstate', handleRoute);
```

}).catch(function (e) {
hideLoader();
showError(’Failed to load site configuration: ’ + e.message);
err(e);
});
}

function on(el, ev, fn, opts) {
if (el) el.addEventListener(ev, fn, opts || false);
}

document.addEventListener(‘DOMContentLoaded’, boot);

/* –––––––––––––––––––––––––––––
PUBLIC API
––––––––––––––––––––––––––––– */
window.ApexEngine = {
version:       ENGINE_VERSION,
resolvePath:   resolvePath,
detectPage:    detectPage,
detectSite:    detectSite,
navigate:      function (page) {
window.history.pushState(null, ‘’, ‘index.html?page=’ + page);
handleRoute();
window.scrollTo({ top: 0, behavior: ‘smooth’ });
}
};
