# Changelog

All notable changes to this project will be documented in this file.

## 2026-07-11
- Redesigned the overall web layout to a responsive, collapsible Notion-style layout featuring a left sidebar on desktop and an off-canvas drawer on mobile.
- Added a beautiful Notion-inspired card-style theme (`notion`), featuring a white document on an off-white background with a Peach emoji header, and set it as the default theme.
- Redesigned control options on the homepage to follow Notion's aligned database page properties block format.
- Created a global configuration file `src/helper/config.ts` to manage all brand assets, visible texts, SEO tags, copyright, ICP licenses, and friendship links, and integrated it across Header, FooterNav, and Vue Router.
- Fixed TypeScript compiler and linting errors to achieve clean, robust type-checking.

## 2026-07-10
- Optimized homepage first-paint performance: removed ~960KB of render-blocking external font CSS (`fonts.css`) from the critical path; font stylesheets are now injected on demand only when the corresponding font is selected (`src/helper/fonts.ts`).
- Deferred `@zumer/snapdom` (~80KB chunk) via dynamic import with idle-time warmup, keeping it out of the initial bundle; split it into a dedicated chunk in `vite.config.ts`.
- Added `preconnect`/`dns-prefetch` hints for font origins, and `loading="lazy"` + explicit dimensions for below-the-fold images (recommendation card, footer badge).

## 2026-06-27
- Added homepage text alignment toggle (left / justify) with localStorage persistence.
- Added independent outer margin presets (compact / standard / relaxed / wide), decoupled from output size.
- Curated homepage font selection: 5 Chinese fonts (思源黑体/宋体, 寒蝉正楷, 汇文仿宋, 霞鹜文楷) and 5 bilingual fonts (Inter, Roboto, Montserrat, 更纱黑体, Playfair Display); removed handwriting option.
- Reorganized operate area with a dedicated typography card separate from theme and action controls.

## 2026-03-31
- Stabilized Digest canvas rendering by switching to offscreen drawing before painting the visible canvas.
- Added guarded background loading and font-wait coordination to reduce intermittent blank renders on the Digest page.

## 2026-01-16
- Improved SEO metadata coverage with richer Open Graph, Twitter, and JSON-LD data.
- Added canonical/OG/Twitter updates per route for consistent indexing.
- Aligned PWA manifest names and locale metadata for better discoverability.
