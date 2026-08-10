# Changelog

All notable changes to this project will be documented in this file.

## 2026-08-10
- Fixed a bug on the Digest page where long book excerpts/reading notes exceeded the fixed-height canvas container and resulted in cut-off or incomplete text at the bottom.
- Dynamically calculate the required height to fit all lines of text and padding, and auto-expand the canvas height if the content exceeds the selected ratio's preset height.

## 2026-07-12
- Rebranded the platform to **墨韵飞鸢🪁** (MoYun FeiYuan / Ink Charm Flying Kite), reflecting the new paper-plane logo asset.
- Replaced the branding across the entire site including index.html, routing, Header, FooterNav, and meta tags.
- Configured secondary developer links to the user's custom URLs (`https://md2view.buxiantang.top/`, `https://markdown.buxiantang.top/`, `https://blog.buxiantang.top/`).
- Introduced highly-demanded customizable watermark prefixes, allowing custom brand prefix strings combined with the locked attribution "via tiengming".
- Solved setting-toggle performance lag and canvas re-draw jitter inside Home.vue by completely decoupling preview generation from settings toggle handlers (snapshotting now runs exclusively on-demand during downloading or copying).
- Redesigned the About Us descriptions to outline correct nicejade attribution and showcase the robust secondary features.

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
