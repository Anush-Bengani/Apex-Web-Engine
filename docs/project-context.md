# PROJECT CONTEXT — APEX WEBSITE ENGINE

This project is a modular website generation system designed to produce premium multi-page websites for businesses using reusable components, a design system, and a structured template architecture.

The goal of this project is to allow rapid creation of modern business websites by combining reusable UI components, configuration files, and content data instead of rebuilding every website from scratch.

This system must remain lightweight, framework-free, and compatible with static hosting platforms such as GitHub Pages.

---

# CORE PRINCIPLES

The architecture follows these principles:

• Modular design system  
• Reusable UI components  
• Configuration-driven content  
• Clean separation between engine and templates  
• GitHub Pages compatibility  
• No heavy frameworks or build tools  
• Performance-first design  

All generated code must follow these principles.

---

# PROJECT PURPOSE

The APEX Website Engine is used to build websites for different industries, including:

• Restaurants  
• Hotels and Resorts  
• Gyms and Fitness centers  
• Corporate businesses  
• Service-based businesses  
• E-commerce websites  

The system must support generating websites for these industries without breaking the engine architecture.

---

# REPOSITORY STRUCTURE

The repository follows a structured architecture.

```
apex-website-engine/
│
├─ engine/
│  ├─ css/
│  │  ├─ tokens.css
│  │  ├─ typography.css
│  │  └─ components.css
│  │
│  ├─ js/
│  │  └─ aura.js
│  │
│  └─ components/
│     ├─ navbar.html
│     ├─ hero.html
│     ├─ feature-cards.html
│     ├─ service-cards.html
│     ├─ product-cards.html
│     ├─ testimonials.html
│     ├─ gallery.html
│     ├─ contact-form.html
│     ├─ cta-banner.html
│     └─ footer.html
│
├─ templates/
│  ├─ restaurant/
│  ├─ hotel/
│  ├─ ecommerce/
│  └─ corporate/
│
├─ data/
│  ├─ config.json
│  └─ content.json
│
├─ demo/
│  └─ index.html
│
├─ docs/
│  └─ architecture.md
│
├─ README.md
└─ LICENSE
```

The folder structure must always remain consistent.

---

# ENGINE SYSTEM

The engine folder contains the reusable website system.

```
engine/
```

The engine is responsible for UI consistency, animations, and layout structure.

---

# CSS DESIGN SYSTEM

The CSS architecture is divided into three layers.

## tokens.css

This file defines design tokens.

Examples:

• colors  
• spacing  
• border radius  
• shadows  
• layout variables  

Example:

```
--primary-color
--secondary-color
--text-color
--background-color
--spacing-sm
--spacing-lg
```

These tokens must be reused across all components.

---

## typography.css

Controls font styling.

Includes:

• heading styles  
• paragraph styles  
• font sizes  
• responsive typography  

Typography must remain consistent across templates.

---

## components.css

Contains styling for reusable UI components.

Examples:

• navbar  
• hero section  
• card layouts  
• galleries  
• forms  
• buttons  
• footers  

---

# JAVASCRIPT ENGINE

```
engine/js/aura.js
```

This file controls interactive behavior.

Responsibilities include:

• scroll animations  
• smooth scrolling  
• UI transitions  
• mobile menu toggle  
• button interactions  
• UI effects  

The JavaScript must remain lightweight and framework-free.

---

# COMPONENT SYSTEM

Reusable UI components exist in:

```
engine/components/
```

Components include:

• navbar  
• hero section  
• feature cards  
• service cards  
• product cards  
• testimonials  
• gallery  
• contact form  
• CTA banner  
• footer  

These components must be reusable across all templates.

---

# TEMPLATE SYSTEM

Templates represent complete websites for specific industries.

Located in:

```
templates/
```

Examples:

```
templates/restaurant/
templates/hotel/
templates/ecommerce/
templates/corporate/
```

Each template contains a multi-page website.

Typical pages include:

• index.html  
• about.html  
• services.html  
• products.html  
• contact.html  

Templates must reuse engine components and styles.

---

# DATA SYSTEM

Dynamic content is stored in JSON files.

```
data/config.json
data/content.json
```

config.json controls:

• theme colors  
• website modules  
• layout options  

content.json stores:

• hero text  
• services  
• products  
• testimonials  
• contact details  

This allows the same template to power multiple websites.

---

# WEBSITE FEATURES

Generated websites should include:

• modern UI design  
• responsive layouts  
• smooth animations  
• clear typography  
• optimized performance  
• modular architecture  

Optional features include:

• product listings  
• booking forms  
• contact forms  
• service showcases  

---

# PERFORMANCE REQUIREMENTS

All websites generated must be optimized for performance.

Requirements:

• fast loading speed  
• minimal JavaScript  
• clean HTML structure  
• responsive layouts  
• optimized images  

Avoid unnecessary libraries.

---

# DESIGN STYLE

The UI should be:

• modern  
• minimal  
• professional  
• visually clean  

Animations should be smooth but not excessive.

---

# CODE GENERATION RULES

Whenever generating code for this project:

1. Follow the existing repository structure.
2. Do not rename core engine files.
3. Maintain modular architecture.
4. Generate code compatible with GitHub Pages.
5. Avoid frameworks like React or Angular.
6. Use semantic HTML.
7. Keep CSS modular.
8. Ensure responsive design.

---

# FILE OUTPUT RULE

Whenever code is generated, it must be output in separate file blocks.

Example format:

```
index.html
css/style.css
js/script.js
```

Each file must be complete.

Do not include placeholders.

---

# IMPORTANT RULE

Never regenerate the entire engine unless explicitly requested.

Only generate the requested module or template.

---

# FINAL GOAL

The APEX Website Engine should allow fast creation of high-quality websites by combining:

• reusable UI components  
• configuration files  
• modular architecture  

This system should function as a lightweight website generation framework.
