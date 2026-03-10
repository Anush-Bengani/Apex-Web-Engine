# 🚀 APEX Web Engine

A **configuration-driven modular website engine** designed to generate professional websites using a reusable frontend architecture.

Instead of rebuilding every website from scratch, APEX separates the system into **design system, components, rendering engine, configuration, and content layers**.

This architecture allows developers to launch **multiple high-quality websites rapidly** by modifying only configuration and content files.

---

# ⚡ Core Concept

APEX Web Engine dynamically assembles websites using reusable components.

Rendering pipeline:

```
HTML Page
   ↓
APEX Engine
   ↓
Load site.json (layout configuration)
   ↓
Load content.json (site content)
   ↓
Load required components
   ↓
Inject content into components
   ↓
Render final page
```

Because of this architecture, new websites can be created by editing only:

```
sites/<site-name>/site.json
sites/<site-name>/content.json
```

No modification to the core engine is required.

---

# ✨ Features

## Modular Component Architecture

Websites are built using reusable UI components.

Example components:

- Navbar  
- Hero Section  
- Feature Cards  
- Services Section  
- Product Cards  
- Testimonials  
- Gallery  
- Contact Form  
- Call-To-Action Section  
- Footer  

These components can be rearranged and reused to generate many layouts.

---

## Configuration-Driven Layout

Each page layout is defined inside `site.json`.

Example:

```json
{
  "pages": {
    "home": [
      "navbar",
      "hero",
      "feature-cards",
      "testimonials",
      "footer"
    ]
  }
}
```

The engine reads this configuration and dynamically assembles the page.

---

## Dynamic Content Injection

All website content is stored inside `content.json`.

Components use placeholders such as:

```
data-content="hero.title"
```

During rendering, the engine automatically injects content into the component placeholders.

This keeps **content separate from layout and logic**.

---

## Global Design System

Visual styling is controlled by a reusable design system.

Location:

```
engine/css/
```

Files:

```
tokens.css
typography.css
components.css
```

Purpose:

- `tokens.css` → design variables (colors, spacing, layout)
- `typography.css` → font hierarchy
- `components.css` → reusable UI styling

This ensures visual consistency across all generated websites.

---

## JavaScript Rendering Engine

Runtime behavior is handled by three JavaScript modules.

Location:

```
engine/js/
```

### engine.js

Core rendering system responsible for:

- loading site configuration
- loading content data
- determining page layout
- fetching components
- injecting content
- rendering the page

### ui.js

Handles UI behavior:

- mobile navigation
- menu interactions
- UI utilities

### aura.js

Handles animation and helper utilities:

- scroll animations
- DOM utilities
- visual effects

---

# ⚙ Performance Optimizations

APEX Web Engine includes several built-in optimizations.

### Component Caching

Components are loaded once and reused.

### Parallel Component Loading

Multiple components are loaded simultaneously for faster rendering.

### Safe DOM Rendering

Template cloning is used instead of unsafe HTML injection.

### Static Hosting Friendly

Relative paths ensure compatibility with static hosting platforms.

---

# 🌐 Multi-Site Architecture

The engine supports **multiple websites inside one repository**.

Example structure:

```
sites/
   restaurant-site/
   hotel-site/
   portfolio-site/
   business-site/
```

Each site contains:

```
site.json
content.json
```

The engine renders whichever configuration is loaded.

---

# 📁 Project Structure

```
apex-web-engine/

engine/
│
├── css/
│   ├── tokens.css
│   ├── typography.css
│   └── components.css
│
├── components/
│   ├── navbar.html
│   ├── hero.html
│   ├── feature-cards.html
│   ├── service-cards.html
│   ├── product-cards.html
│   ├── testimonials.html
│   ├── gallery.html
│   ├── contact-form.html
│   ├── cta-banner.html
│   └── footer.html
│
└── js/
    ├── engine.js
    ├── ui.js
    └── aura.js


sites/
└── example-site/
    ├── site.json
    └── content.json


demo/
├── index.html
├── about.html
└── contact.html
```

---

# 🛠 Creating a New Website

Step 1 — Create a new site folder

```
sites/my-new-site/
```

Step 2 — Add configuration files

```
site.json
content.json
```

Step 3 — Define page layouts in `site.json`.

Step 4 — Add website content in `content.json`.

The engine automatically generates the website.

---

# 🚀 Deployment

APEX Web Engine works with any static hosting platform.

Recommended platforms:

- GitHub Pages
- Netlify
- Vercel
- Static Web Servers

Because the engine uses only:

```
HTML
CSS
JavaScript
```

No backend server is required.

---

# 🔧 Development Workflow

Typical development process:

1. Create design system
2. Build reusable components
3. Initialize rendering engine
4. Define site configuration
5. Add content
6. Deploy website

---

# 🎯 Project Goal

APEX Web Engine aims to provide a **scalable frontend architecture** that allows developers to generate multiple websites quickly while maintaining clean and reusable code.

---

# 📄 License

Open for modification and extension.

Developers are encouraged to adapt and extend the architecture for building scalable web systems.
