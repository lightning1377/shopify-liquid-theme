# KAVRA — Premium Leather Fashion Storefront

[![Shopify OS 2.0](https://img.shields.io/badge/Shopify-Online%20Store%202.0-95BF47?logo=shopify&logoColor=white)](https://shopify.dev/docs/themes)
[![Theme Check](https://img.shields.io/badge/Theme%20Check-0%20Errors-success?logo=shopify&logoColor=white)](https://shopify.dev/docs/themes/tools/theme-check)
[![Code Style: Prettier](https://img.shields.io/badge/Code%20Style-Prettier-F7B93E?logo=prettier&logoColor=white)](https://prettier.io)
[![Locales](https://img.shields.io/badge/Locales-TR%20%7C%20EN-orange)](locales/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**KAVRA** is a luxury leather-fashion storefront built with modern **Shopify Online Store 2.0** architecture, inspired by the information hierarchy, visual proportions, and editorial shopping experience of **Derimod Türkiye** ([derimod.com.tr](https://derimod.com.tr)).

---

## 1. Key Features & Highlights

- **Shopify Online Store 2.0 Architecture**:
  - Full section-group support (`header-group.json`, `footer-group.json`).
  - Modular JSON templates (`index.json`, `collection.json`, `collection.erkek-anasayfa.json`, `collection.kadin-anasayfa.json`, `product.json`, `page.not-developed.json`, `404.json`).
  - Configurable schema settings for every section and block.
  - Native Shopify object rendering (`collection.products`, `product.variants`, `collection.filters`, `routes.*`).
  - Strict compliance with `shopify theme check` (0 errors).

- **Split Gateway Landing & Preference Engine**:
  - **50/50 Dual Gender Gateway (`landing-split-gate.liquid`)**: High-impact entrance experience (`KADIN` & `ERKEK`) inspired by Derimod.
  - **Responsive Split Behavior**:
    - **≥ 768px (Desktop & Tablet)**: 50/50 horizontal split with editorial imagery and luxury hover transitions (`scale(1.05)`).
    - **< 768px (Mobile)**: Transitions automatically into a clean vertical split with stacked touch targets.
  - **Minimalist Gateway Chrome**: When on `/`, header strips away secondary navigation leaving only the clean centered brand mark, and footer trust/newsletter blocks are hidden.
  - **Instant Client-Side Redirection Engine**:
    - Synchronous inline script in `<head>` checks `kavra_gender_preference` cookie.
    - Returning visitors are instantly redirected to `/collections/erkek-anasayfa` or `/collections/kadin-anasayfa` with zero layout flash (`window.location.replace`).
    - Query parameter bypass (`/?gateway=1`) allows users to return to the gateway at any time to switch preferences.
    - Top audience switcher tabs (`KADIN` / `ERKEK`) on inner pages automatically sync preference cookies as visitors browse.

- **Dual Dedicated Gender Homepages**:
  - `collection.erkek-anasayfa.json`: Tailored men's campaign hero, category tiles, and editorial promotions.
  - `collection.kadin-anasayfa.json`: Symmetrical women's campaign hero, category tiles (Çanta, Ayakkabı, Deri Ceket), and curated promotions.
  - `collection.json`: General template for catalog and category browsing.

- **Visual Language & Editorial Design**:
  - **Zero-CLS Local Typography**: Modern sans-serif (`Lexend`) paired with editorial serif accents (`Playfair Display`), bundled locally in `.woff2` with preload tags.
  - **Curated Color Tokens**: Ink (`#111111`), warm paper canvas (`#FBFBF9`), card canvas (`#F4F2EC`), promo badge green (`#2D7A4F`), terracotta accent (`#C84A2A`).
  - **Curated Proportions**: 3:4 portrait product cards, subtle image zoom transitions, and clean typography.
  - **Vector Brand Emblem**: Bespoke geometric leathercraft monogram in crisp inline SVG and retina PNG assets.

- **Storefront Chrome & Sections**:
  - **Two-Tier Header**:
    - Upper Tier: Audience selector (`KADIN` / `ERKEK` / `Sürdürülebilirlik`), brand wordmark (`KAVRA/`), utility actions (Account, Wishlist, Cart counter, Shopify language selector).
    - Lower Tier: Curated category navigation (`YENİ`, `AYAKKABI`, `DERİ GİYİM`, `ÇANTA`, `AKSESUAR`, `MARKALAR`, highlighted `OUTLET`) + integrated search input.
    - Mobile: Accessible slide-out navigation drawer with audience tabs, submenus, and search.
  - **Announcement Bar**: Configurable top banner with link support.
  - **Campaign Hero Banner**: Editorial fall/winter campaign with responsive typography and CTA.
  - **Quick Category Navigation ("Yeni Sezona İlk Bakış")**: Visual portrait cards (`AYAKKABI`, `ÇANTA`, `DERİ CEKET`).
  - **Editorial Storytelling Split**: Split promotion box (_"İlk Ürüne %20 + İkinci Ürüne %40"_) alongside curated product showcase cards.
  - **Product Grid & Facets**:
    - Sorting dropdown (`manual`, `best-selling`, `created-descending`, `price-ascending`, `price-descending`).
    - Shopify Collection Filters drawer.
    - Responsive 4-column (desktop) → 3-column (tablet) → 2-column (mobile) grid.
  - **Product Detail Page (PDP)**:
    - 2-column layout with high-resolution image gallery.
    - Sticky purchase panel with vendor eyebrow, title, formatted price with discount badge.
    - Size selection pills with stock states.
    - Native quantity selector and "Sepete Ekle" button with AJAX feedback.
    - Accordion tabs for specifications, leather care, and shipping/returns.
  - **Trust Badges Bar**: 5 service value cards (_Ücretsiz Kargo_, _İade Garantisi_, _Mağazadan Teslim Al_, _Müşteri Hizmetleri_, _WhatsApp Destek_).
  - **Newsletter Bar**: Subscription section with KVKK / GDPR consent.
  - **Enterprise Footer**: 4-column layout covering brand info, corporate links, customer service, popular collections, and legal notices.

---

## 2. Localization

- **Turkish (`locales/tr.default.json`)**: Default storefront language.
- **English (`locales/en.json`)**: Full English localization for global shoppers.
- **Native Language Switcher**: Uses Shopify's native localization form in the header and mobile drawer, switching seamlessly between locales.
- **Dynamic Defaults**: Built-in defaults render in the active locale without overriding merchant customizations.

---

## 3. Directory Structure

```text
├── layout/
│   └── theme.liquid                        # Base document shell, fonts, landmarks, skip link
├── templates/
│   ├── index.json                          # Homepage sections composition
│   ├── collection.json                     # Default catalog template
│   ├── collection.erkek-anasayfa.json      # Dedicated Men's homepage
│   ├── collection.kadin-anasayfa.json      # Dedicated Women's homepage
│   ├── product.json                        # PDP sections composition
│   ├── page.json                           # General content page
│   ├── page.not-developed.json             # Graceful under-construction placeholder
│   └── 404.json                            # 404 error page
├── sections/
│   ├── announcement-bar.liquid             # Top announcement message
│   ├── header.liquid                       # Two-tier header & mobile drawer
│   ├── header-group.json                   # OS 2.0 header group
│   ├── landing-split-gate.liquid           # 50/50 dual gender entrance
│   ├── main-collection-banner.liquid       # Collection header & campaign hero
│   ├── collection-quick-nav.liquid         # "Yeni Sezona İlk Bakış" category tiles
│   ├── editorial-storytelling.liquid       # Promo banner split with product showcase
│   ├── main-collection-product-grid.liquid # Facets, sorting, product grid, pagination
│   ├── main-product.liquid                 # 2-column PDP layout & native form
│   ├── featured-collection.liquid          # Curated collection showcase
│   ├── trust-badges.liquid                 # 5 service proposition badges
│   ├── newsletter.liquid                   # Newsletter signup with customer form
│   ├── footer.liquid                       # Multi-column footer & legal notices
│   └── footer-group.json                   # OS 2.0 footer group
├── snippets/
│   ├── audience-collection-url.liquid      # Dynamic audience URL resolver
│   ├── breadcrumbs.liquid                  # Semantic breadcrumb trail
│   ├── font-face.liquid                    # Local woff2 font preloading and declaration
│   ├── language-selector.liquid            # Shopify localization form
│   ├── localized-default.liquid            # Locale-aware rendering of built-in defaults
│   ├── price.liquid                        # Formatted price with discount logic
│   ├── product-card.liquid                 # 3:4 card with badges & wishlist button
│   └── icon-*.liquid                       # Accessible inline SVG icon set
├── assets/
│   ├── base.css                            # Modular CSS design system & responsive rules
│   ├── theme.js                            # Client-side drawer, facet, and form interactions
│   ├── logo.svg / logo.png                 # Brand monogram emblem
│   ├── favicon.svg / favicon.png           # Storefront favicons
│   └── *.woff2                             # Locally hosted Lexend & Playfair Display fonts
├── config/
│   ├── settings_schema.json                # Theme settings definition (colors, socials)
│   └── settings_data.json                  # Default theme settings values
├── locales/
│   ├── tr.default.json                     # Turkish translations
│   └── en.json                             # English translations
├── scripts/
│   ├── check-links.js                      # Automated internal link crawler (detects 404s)
│   └── import-products.js                  # Automated catalog importer from CSV
├── Makefile                                # Developer automation workflow
└── kavra_sample_products.csv               # Complete sample product catalog with imagery
```

---

## 4. Local Development & Workflow

### Prerequisites

- **Node.js** (v18+)
- **Shopify CLI**:
  ```bash
  npm install -g @shopify/cli
  ```

### Quick Start with Makefile

Create your local environment file:

```bash
cp .env.example .env
# Edit .env and set SHOPIFY_STORE=your-dev-store.myshopify.com
```

Available commands:

| Command            | Action                                                                            |
| :----------------- | :-------------------------------------------------------------------------------- |
| `make dev`         | Start Shopify theme dev server with live hot-reloading at `http://127.0.0.1:9292` |
| `make check`       | Run Prettier format check and `shopify theme check` (validates syntax & 0 errors) |
| `make check-links` | Crawl storefront links to ensure 0 broken paths or 404s                           |
| `make format`      | Automatically format all Liquid, CSS, JSON, and JS files with Prettier            |
| `make import`      | Import sample luxury catalog from `kavra_sample_products.csv` into Shopify        |
| `make push`        | Push theme changes directly to remote Shopify store                               |

---

## 5. Responsive QA Matrix

Layout and interaction have been verified across standard target breakpoints:

| Viewport Width | Target Device        | Verified Behavior                                                                                                                      |
| :------------- | :------------------- | :------------------------------------------------------------------------------------------------------------------------------------- |
| **375px**      | iPhone SE            | Header collapses into compact bar with hamburger; 2-column product grid with legible badges; full-width stacked PDP purchase controls. |
| **390px**      | iPhone 14/15         | Touch targets &ge; 44px; drawer navigation opens smoothly; no horizontal overflow.                                                     |
| **768px**      | iPad Mini (Portrait) | 3-column product grid; 3-column quick category cards; footer wraps into 2x2 grid.                                                      |
| **820px**      | iPad Air             | Sticky PDP layout engages gracefully; trust badges adapt to 3-column layout.                                                           |
| **1280px**     | Standard Laptop      | Full two-tier desktop header visible; 4-column product grid; side-by-side editorial campaign split.                                    |
| **1440px**     | Wide Monitor         | Container capped at max-width `1440px` with centered margins; razor-sharp typography.                                                  |

---

## 6. License

This project is licensed under the [MIT License](LICENSE).
