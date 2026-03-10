/* ============================================================
   APEX Website Engine — engine.js
   Core Rendering Engine
   ============================================================ */

'use strict';

/* ----------------------------------------------------------
   CONFIGURATION
---------------------------------------------------------- */

const ENGINE_VERSION = '1.0.0';

const PAGE_MAP = {
  'index.html'    : 'home',
  'index'         : 'home',
  ''              : 'home',
  'about.html'    : 'about',
  'about'         : 'about',
  'rooms.html'    : 'rooms',
  'rooms'         : 'rooms',
  'amenities.html': 'amenities',
  'amenities'     : 'amenities',
  'services.html' : 'services',
  'services'      : 'services',
  'contact.html'  : 'contact',
  'contact'       : 'contact',
  'products.html' : 'products',
  'products'      : 'products',
  'gallery.html'  : 'gallery',
  'gallery'       : 'gallery',
};

/* ----------------------------------------------------------
   COMPONENT CACHE
---------------------------------------------------------- */

const componentCache = Object.create(null);

/* ----------------------------------------------------------
   PATH RESOLUTION
   Anchors to the HTML page's own directory so paths work
   identically on localhost AND GitHub Pages subdirectories
   (e.g. /Apex-Web-Engine/).
---------------------------------------------------------- */

const resolvePath = (() => {
  // Use the page URL as the anchor — the HTML files sit at
  // the same level as engine/ and sites/, so all relative
  // paths resolve correctly from window.location.href.
  const pageUrl = window.location.href.split('?')[0].split('#')[0];
  const pageDir = pageUrl.substring(0, pageUrl.lastIndexOf('/') + 1);

  return (relativePath) => new URL(relativePath, pageDir).href;
})();

/* ----------------------------------------------------------
   UTILITIES
---------------------------------------------------------- */

const log   = (msg, ...args) => console.log(`[APEX Engine] ${msg}`, ...args);
const warn  = (msg, ...args) => console.warn(`[APEX Engine] ${msg}`, ...args);
const error = (msg, ...args) => console.error(`[APEX Engine] ${msg}`, ...args);

const resolveContentPath = (obj, dotPath) => {
  if (!obj || !dotPath) return undefined;
  return dotPath.split('.').reduce((acc, key) => {
    if (acc == null) return undefined;
    return acc[key];
  }, obj);
};

/* ----------------------------------------------------------
   STEP 2 — DETECT ACTIVE SITE
---------------------------------------------------------- */

const detectSite = () => {
  return new URLSearchParams(window.location.search).get('site') || 'serenity-sands';
};

/* ----------------------------------------------------------
   STEP 3 — LOAD CONFIGURATION FILES
---------------------------------------------------------- */

const loadJSON = async (path) => {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path} — HTTP ${res.status}`);
  return res.json();
};

const loadSiteConfig = async (site) => {
  const siteJsonPath    = resolvePath(`sites/${site}/site.json`);
  const contentJsonPath = resolvePath(`sites/${site}/content.json`);

  const [siteConfig, content] = await Promise.all([
    loadJSON(siteJsonPath),
    loadJSON(contentJsonPath),
  ]);

  return { siteConfig, content };
};

/* ----------------------------------------------------------
   STEP 4 — DETERMINE CURRENT PAGE
---------------------------------------------------------- */

const detectCurrentPage = () => {
  const pathname = window.location.pathname;
  const filename = pathname.split('/').pop();
  const base     = filename.replace(/\.html$/i, '').toLowerCase() || '';

  return PAGE_MAP[filename] || PAGE_MAP[base] || base || 'home';
};

/* ----------------------------------------------------------
   STEP 6 — COMPONENT CACHE
   STEP 7 — COMPONENT LOADER
---------------------------------------------------------- */

const loadComponent = async (name) => {
  if (componentCache[name]) {
    return componentCache[name];
  }

  const path = resolvePath(`engine/components/${name}.html`);
  const res  = await fetch(path);

  if (!res.ok) {
    warn(`Component "${name}" not found at ${path}`);
    return null;
  }

  const html = await res.text();
  componentCache[name] = html.trim();
  return componentCache[name];
};

/* ----------------------------------------------------------
   STEP 8 — PARALLEL COMPONENT LOADING
---------------------------------------------------------- */

const loadComponents = async (names) => {
  const results = await Promise.all(names.map(name => loadComponent(name)));
  return names.reduce((acc, name, i) => {
    acc[name] = results[i];
    return acc;
  }, {});
};

/* ----------------------------------------------------------
   STEP 9 — SAFE DOM RENDERING
---------------------------------------------------------- */

const renderComponentToDOM = (app, html) => {
  if (!html) return;
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  app.appendChild(template.content.cloneNode(true));
};

/* ----------------------------------------------------------
   STEP 10 — CONTENT INJECTION
   Handles:
     data-content="key.path"                — sets textContent
     data-content-attr-<attrname>="key.path" — sets named attribute
     data-content-attr="src" + data-content — sets attribute (legacy)
---------------------------------------------------------- */

const injectContent = (root, content) => {
  if (!root || !content) return;

  // 1. Inject text content
  root.querySelectorAll('[data-content]').forEach(el => {
    const key   = el.getAttribute('data-content');
    const value = resolveContentPath(content, key);

    if (value == null) return;

    // Check if there is a paired data-content-attr (e.g. src, alt)
    const targetAttr = el.getAttribute('data-content-attr');
    if (targetAttr) {
      el.setAttribute(targetAttr, value);
    } else {
      el.textContent = value;
    }
  });

  // 2. Inject arbitrary attributes via data-content-attr-<name>="key.path"
  root.querySelectorAll('*').forEach(el => {
    Array.from(el.attributes).forEach(attr => {
      if (!attr.name.startsWith('data-content-attr-')) return;

      const attrName = attr.name.replace('data-content-attr-', '');
      const key      = attr.value;
      const value    = resolveContentPath(content, key);

      if (value == null) return;

      if (attrName === 'href' || attrName === 'src') {
        el.setAttribute(attrName, value);
      } else if (attrName === 'aria-label') {
        el.setAttribute('aria-label', value);
      } else if (attrName === 'alt') {
        el.setAttribute('alt', value);
      } else if (attrName.startsWith('data-')) {
        el.setAttribute(attrName, value);
      } else {
        el.setAttribute(attrName, value);
      }
    });
  });

  // 3. Build navigation from site config (data-component="nav-links")
  const navContent = resolveContentPath(content, '__navigation');
  if (navContent && Array.isArray(navContent)) {
    root.querySelectorAll('[data-component="nav-links"], [data-component="nav-links-mobile"]').forEach(navList => {
      navList.innerHTML = '';
      navContent.forEach(item => {
        const li   = document.createElement('li');
        const link = document.createElement('a');
        link.className   = 'navbar__nav-link';
        link.textContent = item.label;
        link.href        = item.href || `${item.page}.html`;
        li.appendChild(link);
        navList.appendChild(li);
      });
    });
  }
};

/* ----------------------------------------------------------
   NAVIGATION BUILDER
   Populates nav links from site.json navigation array
---------------------------------------------------------- */

const buildNavigation = (app, siteConfig, content) => {
  const navItems = siteConfig?.navigation;
  if (!navItems || !Array.isArray(navItems)) return;

  content.__navigation = navItems.map(item => ({
    label : item.label,
    href  : item.href || `${item.page}.html`,
    page  : item.page,
  }));
};

/* ----------------------------------------------------------
   STEP 11 — PAGE RENDERER
---------------------------------------------------------- */

const renderPage = async (app, pageComponents, loadedComponents, content) => {
  app.innerHTML = '';

  for (const name of pageComponents) {
    const html = loadedComponents[name];
    if (!html) {
      warn(`Skipping missing component: "${name}"`);
      continue;
    }
    renderComponentToDOM(app, html);
  }

  injectContent(app, content);
};

/* ----------------------------------------------------------
   META & DOCUMENT SETUP
---------------------------------------------------------- */

const setupDocumentMeta = (siteConfig, content, page) => {
  const siteName = siteConfig?.site?.name || 'APEX Site';
  const pageTitle = resolveContentPath(content, `meta.${page}.title`)
    || resolveContentPath(content, 'meta.title')
    || siteName;

  const pageDesc = resolveContentPath(content, `meta.${page}.description`)
    || resolveContentPath(content, 'meta.description')
    || '';

  document.title = pageTitle !== siteName ? `${pageTitle} — ${siteName}` : siteName;

  let descMeta = document.querySelector('meta[name="description"]');
  if (!descMeta) {
    descMeta = document.createElement('meta');
    descMeta.name = 'description';
    document.head.appendChild(descMeta);
  }
  if (pageDesc) descMeta.content = pageDesc;

  // Canonical
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }
  canonical.href = window.location.href.split('?')[0];
};

/* ----------------------------------------------------------
   LOADING STATE
---------------------------------------------------------- */

const showLoader = (app) => {
  app.innerHTML = '';
  app.setAttribute('aria-busy', 'true');
  app.setAttribute('aria-live', 'polite');

  const loader = document.createElement('div');
  loader.id = 'apex-loader';

  const style = document.createElement('style');
  style.textContent = `
    #apex-loader {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      gap: 1.5rem;
      background: var(--color-primary, #0A0F1E);
    }
    #apex-loader__spinner {
      width: 2.5rem;
      height: 2.5rem;
      border: 3px solid rgba(56, 189, 248, 0.15);
      border-top-color: #38BDF8;
      border-radius: 50%;
      animation: apex-spin 0.75s linear infinite;
    }
    #apex-loader__text {
      font-family: system-ui, sans-serif;
      font-size: 0.875rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: rgba(248, 250, 252, 0.4);
    }
    @keyframes apex-spin { to { transform: rotate(360deg); } }
  `;
  document.head.appendChild(style);

  const spinner = document.createElement('div');
  spinner.id = 'apex-loader__spinner';
  const text = document.createElement('p');
  text.id = 'apex-loader__text';
  text.textContent = 'Loading…';

  loader.appendChild(spinner);
  loader.appendChild(text);
  app.appendChild(loader);
};

const hideLoader = (app) => {
  app.removeAttribute('aria-busy');
  const loader = document.getElementById('apex-loader');
  if (loader) loader.remove();
};

/* ----------------------------------------------------------
   ERROR STATE
---------------------------------------------------------- */

const showError = (app, message) => {
  app.innerHTML = '';
  const el = document.createElement('div');
  el.style.cssText = `
    display:flex; flex-direction:column; align-items:center;
    justify-content:center; min-height:100vh; padding:2rem;
    font-family:system-ui,sans-serif; text-align:center;
    background:var(--color-primary,#0A0F1E); color:rgba(248,250,252,0.6);
  `;
  el.innerHTML = `
    <p style="font-size:3rem; margin-bottom:1rem;" aria-hidden="true">⚠</p>
    <h1 style="font-size:1.25rem; color:#F8FAFC; margin-bottom:0.75rem;">Engine Error</h1>
    <p style="font-size:0.875rem; max-width:40ch; line-height:1.6;">${message}</p>
  `;
  app.appendChild(el);
};

/* ----------------------------------------------------------
   STEP 12 — POST-RENDER INIT
---------------------------------------------------------- */

const initRuntime = () => {
  if (window.UI?.init)   UI.init();
  if (window.Aura?.init) Aura.init();
};

/* ----------------------------------------------------------
   MAIN ENGINE INIT
---------------------------------------------------------- */

const initEngine = async () => {
  const app = document.getElementById('app');

  if (!app) {
    error('Mount point <div id="app"> not found. Aborting.');
    return;
  }

  showLoader(app);

  try {
    // STEP 2 — Site detection
    const site = detectSite();
    log(`Initializing site: "${site}" — Engine v${ENGINE_VERSION}`);

    // STEP 3 — Load config
    const { siteConfig, content } = await loadSiteConfig(site);
    log('Configuration loaded.', { siteConfig, content });

    // STEP 4 — Detect page
    const page = detectCurrentPage();
    log(`Current page: "${page}"`);

    // STEP 5 — Resolve page layout
    const pages = siteConfig?.pages || {};
    const pageComponents = pages[page];

    if (!pageComponents || !pageComponents.length) {
      hideLoader(app);
      showError(app, `No layout defined for page "${page}" in site.json.`);
      return;
    }

    log(`Page layout: [${pageComponents.join(', ')}]`);

    // Navigation injection prep
    buildNavigation(app, siteConfig, content);

    // STEP 6 + 8 — Load all components in parallel (with caching)
    const loadedComponents = await loadComponents(pageComponents);
    log('Components loaded:', Object.keys(loadedComponents));

    // STEP 9 + 11 — Render to DOM
    hideLoader(app);
    await renderPage(app, pageComponents, loadedComponents, content);
    log('Page rendered.');

    // Meta setup
    setupDocumentMeta(siteConfig, content, page);

    // STEP 12 — Init UI and animations
    initRuntime();
    log('Runtime initialized. Ready.');

  } catch (err) {
    error('Engine failed:', err);
    hideLoader(app);
    showError(app, err.message || 'An unexpected error occurred.');
  }
};

/* ----------------------------------------------------------
   STEP 1 — WAIT FOR DOM
---------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', initEngine);

/* ----------------------------------------------------------
   PUBLIC ENGINE API
---------------------------------------------------------- */

window.ApexEngine = {
  version       : ENGINE_VERSION,
  componentCache,
  resolvePath,
  loadComponent,
  loadComponents,
  injectContent,
  detectCurrentPage,
  detectSite,
  reloadPage     : () => initEngine(),
};
