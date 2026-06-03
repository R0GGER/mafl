# Changelog


## Tab lock & collapsible tabs

### 🚀 Enhancements

- **admin:** Tabs can now be locked to prevent accidental deletion — a locked tab hides the delete button and ignores `removeTab` calls
- **admin:** Locking a tab also protects its categories and bookmarks — delete buttons for groups and items are hidden and `removeGroup`/`removeItem` are guarded
- **admin:** Tabs are now collapsible in the Config Builder — click the ▸/▾ arrow to expand or collapse a tab's content
- **config:** `locked: true` property is persisted in the YAML config and restored on load

### Changed files

| File | Change |
|------|--------|
| `src/composables/useConfigBuilder.ts` | Added `locked` to `BuilderTab` interface; `removeTab` guards against locked tabs; added `toggleTabLock` function; YAML import/export handles `locked` |
| `src/components/admin/TabsEditor.vue` | Added collapsible tab body with ▸/▾ toggle; added minimal SVG lock icon button; hide delete button when locked; accepts `toggleTabLock` prop |
| `src/pages/admin/index.vue` | Destructured and passed `toggleTabLock` to `AdminTabsEditor` |

---

## Auto-fill favicon domain from link

### 💅 Improvements

- **admin:** When the icon type is set to "favicon", the domain field is now automatically populated from the link URL — strips `http://` / `https://` and extracts the hostname (e.g. `https://netflix.com/browse` → `netflix.com`)
- **admin:** Switching icon type to "favicon" also auto-fills the domain if a link is already present and the favicon field is empty

### Changed files

| File | Change |
|------|--------|
| `src/components/admin/ItemFields.vue` | Added `extractDomain()` helper and watchers on `item.link` and `item.iconType` to auto-populate `item.iconFavicon` |

---

## Browse icons links for name icon type

### 💅 Improvements

- **admin:** Added "Browse icons" links below the Name icon field — links to [iconify.design](https://icon-sets.iconify.design/) for Iconify icon names and [getemoji.com](https://getemoji.com/) for emoji, matching the existing link style used under the URL icon field

### Changed files

| File | Change |
|------|--------|
| `src/components/admin/ItemFields.vue` | Added browse links (iconify.design, getemoji.com) below the Name/Color/wrap row in the `name` icon type section |

---

## Reorder groups (categories)

### 🚀 Enhancements

- **admin:** Groups (categories) can now be moved up or down within a tab using ▲ / ▼ buttons, matching the existing item reorder controls
- **config-builder:** Same move up/down functionality added to the standalone Config Builder

### Changed files

| File | Change |
|------|--------|
| `src/composables/useConfigBuilder.ts` | Added `moveGroup()` function that swaps adjacent groups in the array |
| `src/pages/admin/index.vue` | Destructured `moveGroup` from composable and passed it as prop to `AdminTabsEditor` |
| `src/components/admin/TabsEditor.vue` | Added `moveGroup` prop definition and ▲ ▼ buttons to the group header row |
| `config-builder/index.html` | Added `moveGroup()` function and ▲ ▼ buttons in the standalone builder |

---

## Example config on first run

### 🚀 Enhancements

- **docker:** On first container start, if no `config.yml` exists in the data volume, the example config (`.example/config.yml`) is automatically copied as the initial config
- **docker:** Existing `config.yml` is never overwritten — only new installations receive the example

### 🐛 Bug Fixes

- **docker:** Fixed `entrypoint.sh` failing with `no such file or directory` on Alpine — the script had Windows CRLF line endings which corrupted the shebang; rewritten with LF endings and added `sed -i 's/\r$//'` in the Dockerfile as a safeguard

### New files

| File | Purpose |
|------|---------|
| `extra/entrypoint.sh` | Entrypoint script that copies the example config when `/app/data/config.yml` is missing, then starts the app |

### Changed files

| File | Change |
|------|--------|
| `Dockerfile` | Copies entrypoint script and example config into the image; uses `ENTRYPOINT` instead of `CMD` |

---

## Fix category title color opacity

### 🐛 Bug Fixes

- **styles:** Category titles in inline/list view appeared faded instead of using the exact configured color — removed hardcoded `opacity-80` Tailwind class from the `<h2>` element so the `color` from `styles.category` is rendered at full opacity

### Changed files

| File | Change |
|------|--------|
| `src/components/Group.vue` | Removed `opacity-80` class from the inline category `<h2>` element |

---

## Fix admin logout button

### 🐛 Bug Fixes

- **admin:** Fixed logout button not working — replaced client-side `navigateTo` with a hard navigation (`window.location.href`) to ensure the session cookie is properly cleared and no async context issues prevent the redirect

### Changed files

| File | Change |
|------|--------|
| `src/pages/admin/index.vue` | Changed `navigateTo('/admin/login')` to `window.location.href = '/admin/login'` in the logout function |

---

## Fix tab/content width shift

### 🐛 Bug Fixes

- **layout:** Fixed container width jumping when switching between tabs with different amounts of content
- **layout:** Added `w-full` to main container so it always takes full available width regardless of tab content
- **style:** Added `scrollbar-gutter: stable` to prevent layout shift from scrollbar appearing/disappearing

### Changed files

| File | Change |
|------|--------|
| `src/layouts/default.vue` | Added `w-full` class to container div |
| `src/assets/style/tailwind.css` | Added `scrollbar-gutter: stable` on `html` |

---

## Browse icons link styling

### 💅 Improvements

- **admin:** "Browse icons" links (`selfh.st/icons`, `dashboardicons.com`) now use a green color (`rgb(124 180 132)`) so they are clearly recognisable as clickable links

### Changed files

| File | Change |
|------|--------|
| `src/components/admin/ItemFields.vue` | Green link color for icon reference links |

---

## Timezone → Time rename

### 💅 Refactors

- **module:** Renamed service type from `timezone` to `time` — `type: timezone` still works for backward compatibility via alias in `useServiceData`
- **types:** Renamed `TimezoneService` interface to `TimeService`
- **docs:** Updated all documentation and examples to use `type: time`
- **config-builder:** Updated module type labels and serialization to use `time`

### Changed files

| File | Change |
|------|--------|
| `src/types/services.d.ts` | `TimezoneService` → `TimeService` |
| `src/components/service/Timezone.vue` | Uses `TimeService` type |
| `src/server/api/services/timezone.ts` | Uses `TimeService` type |
| `src/components/Item.vue` | Accepts both `time` and `timezone` type |
| `src/composables/useServiceData.ts` | Added `time → timezone` alias so the API route stays unchanged |
| `config-builder/index.html` | Module type updated to `time` |
| `docs/modules.md` | All `timezone` references replaced with `time` |

---

## Admin Panel

### 🚀 Enhancements

- **admin:** Built-in admin panel at `/admin` for editing `config.yml` directly from the browser — changes are saved and applied instantly
- **admin:** Secure login with scrypt password hashing and encrypted sessions via `NUXT_ADMIN_PASSWORD_HASH` and `NUXT_SESSION_PASSWORD` environment variables
- **admin:** Collapsible sections for Global Settings, Layout, Styles, Tabs, Tags and per-item editing
- **admin:** Live preview of text logo in the Global Settings section
- **admin:** Route guard middleware redirects unauthenticated users to `/admin/login`
- **admin:** PWA `navigateFallbackDenylist` updated to exclude `/admin` routes from service worker caching

### New files

| File | Purpose |
|------|---------|
| `src/pages/admin/index.vue` | Admin dashboard page with config editor |
| `src/pages/admin/login.vue` | Admin login page |
| `src/middleware/admin.ts` | Auth route guard for admin pages |
| `src/components/admin/GlobalSettings.vue` | Global settings editor (title, theme, logo, background, etc.) |
| `src/components/admin/ItemFields.vue` | Per-item editor (link, icon, status, tags, module options) |
| `src/components/admin/LayoutSettings.vue` | Grid/list layout and spacing editor |
| `src/components/admin/StylesSettings.vue` | Typography styles editor (category, title, description) |
| `src/components/admin/TabsEditor.vue` | Tabs and service groups editor |
| `src/components/admin/TagsEditor.vue` | Tags editor |
| `src/composables/useConfigBuilder.ts` | Shared composable for config state, YAML import/export |
| `src/server/api/admin/config.get.ts` | GET endpoint — reads current config |
| `src/server/api/admin/config.post.ts` | POST endpoint — validates and saves config |
| `src/server/api/admin/login.post.ts` | POST endpoint — authenticates and creates session |
| `src/server/api/admin/logout.post.ts` | POST endpoint — destroys session |
| `src/server/api/admin/session.get.ts` | GET endpoint — checks session validity |
| `src/server/utils/auth.ts` | Scrypt password verification and session helpers |
| `scripts/hash-password.mjs` | CLI script to generate password hashes |

### Changed files

| File | Change |
|------|--------|
| `nuxt.config.ts` | Added `runtimeConfig` for `adminPasswordHash` and `sessionPassword`; added `/admin` to PWA `navigateFallbackDenylist` |
| `src/assets/style/tailwind.css` | Added admin builder shared styles (`.admin-section`, `.admin-label`, `.admin-input`, `.chevron`) |
| `docker-compose.yml` | Added `NUXT_ADMIN_PASSWORD_HASH` and `NUXT_SESSION_PASSWORD` environment variables |
| `.example/docker-compose.yml` | Added environment variables with generation instructions |
| `README.md` | Added admin environment variables to the quick-start docker-compose example |
| `docs/configuration.md` | Added Admin Panel reference with link to `admin.md` |
| `docs/admin.md` | New documentation page with setup instructions |

---

## IP API: optional locationName & deduplicate place

### ✨ Features

- **ip-api:** Added optional `locationName` option — when omitted, location is auto-detected from the IP address; when set, the custom name is displayed instead

### 🐛 Bug Fixes

- **ip-api:** Fixed duplicate location display (e.g. "Utrecht, Utrecht") when city and region name are identical

### Changed files

| File | Change |
|------|--------|
| `src/types/services.d.ts` | Added `locationName?: string` to `IpApiService.options` |
| `src/server/api/services/ip-api.ts` | Use `locationName` when provided, fallback to IP-based place; deduplicate city/region |
| `src/components/admin/ItemFields.vue` | Added Location Name input field for IP API |
| `src/composables/useConfigBuilder.ts` | Added `ipapiLocationName` to builder state, import/export |
| `config-builder/index.html` | Added Location Name field + serialization logic |
| `docs/modules.md` | Documented `locationName` option with example |

---

## Favicon proxy cache

### 🚀 Enhancements

- **favicon:** Added server-side favicon proxy with disk caching — external favicon API is now called only once per domain per 7 days
- **favicon:** The `faviconApi` setting is read dynamically from the config (no more hardcoded URL in the frontend)
- **favicon:** Browser receives `Cache-Control: public, max-age=604800` headers for local caching
- **favicon:** Added Workbox `CacheFirst` runtime caching for `/api/favicon/*` so favicons also work offline via the Service Worker

### Changed files

| File | Change |
|------|--------|
| `src/server/api/favicon/[...domain].get.ts` | New server-side proxy endpoint with disk cache in `./data/.favicon-cache/` |
| `src/components/service/base/Icon.vue` | Points to `/api/favicon/{domain}` instead of the external API directly |
| `nuxt.config.ts` | Added Workbox `runtimeCaching` rule for favicon endpoint |

---

## UI improvements: Uptime monitoring, Tags & Wrap checkbox

### 🚀 Enhancements

- **admin + config-builder:** Renamed "Status enabled" to "Uptime monitoring ☐ enabled" for clarity
- **admin + config-builder:** Moved Tags input to its own row below the Uptime monitoring checkbox
- **admin + config-builder:** Wrap checkbox now matches the height of adjacent input fields (styled with border and padding)
- **admin + config-builder:** All checkboxes (Wrap, Uptime monitoring) now use the brand green accent color (`#69a870`)

### Changed files

| File | Change |
|------|--------|
| `src/components/admin/ItemFields.vue` | Renamed status checkbox, moved Tags to separate row, styled Wrap and Uptime checkboxes |
| `config-builder/index.html` | Same layout and styling changes in the standalone config builder |
| `src/assets/style/tailwind.css` | Added `accent-color` to `.admin-input` |

---

## Admin setup documentation

### 📖 Documentation

- **admin.md:** Rewrote the setup section with a summary table of required environment variables, step-by-step generation instructions, and multiple methods per step (Docker one-liner, local Node.js script, OpenSSL)
- **admin.md:** Added example output so users know what to expect from each command
- **docker-compose.yml:** Updated inline comments with copy-pasteable Docker commands for generating the password hash and session key

### Changed files

| File | Change |
|------|--------|
| `docs/admin.md` | Rewritten setup section with detailed generation instructions |
| `.example/docker-compose.yml` | Inline comments now include Docker one-liner commands |

---

## Text / letter logo support

### 🚀 Enhancements

- **logo:** Added text/letter logo as alternative to image logo — display any text string (e.g. "M+") with full typographic control
- **logo:** Text logo supports `fontSize`, `fontWeight`, `fontFamily`, `color`, `backgroundColor`, `borderRadius` and `padding`
- **logo:** Backward compatible — existing `logo: logo.png` string format continues to work as an image logo
- **config-builder:** Logo Type selector (None / Image / Text) with conditional fields in the standalone config builder (`config-builder/index.html`)
- **config-builder:** Live preview of text logo in both standalone and onsite (`/admin`) config builders
- **admin:** Logo Type dropdown with conditional image or text logo settings in the onsite admin panel

### 💅 Refactors

- **types:** Added `LogoText`, `LogoImage` interfaces and `LogoConfig` union type (`string | LogoImage | LogoText`) to `config.d.ts`
- **validation:** `logo` schema now accepts a string (backward compat), `{ type: 'image', image }` or `{ type: 'text', text, ... }` object
- **default.vue:** Logo rendering split into `logoImage` and `logoText` computed refs with conditional `<img>` or `<span>` element
- **useConfigBuilder:** `BuilderState` replaced single `logo` field with `logoType`, `logoImage`, `logoText` and font/style fields; YAML import/export handles both formats
- **config-builder:** Standalone HTML builder updated with `toggleLogoFields()` / `updateLogoPreview()` helpers and logo-aware `generateYaml()`, `loadConfig()`, `resetAll()`

### 📖 Documentation

- **configuration.md:** Logo section rewritten with separate "Image logo" and "Text / letter logo" subsections, including YAML example and property table

### Config format

```yaml
# Image logo (unchanged)
logo: logo.png

# Text logo (new)
logo:
  type: text
  text: "M+"
  fontSize: 1.5rem
  fontWeight: 700
  fontFamily: "Inter, sans-serif"
  color: "#ffffff"
  backgroundColor: "#3b82f6"
  borderRadius: 0.5rem
  padding: 0.25rem 0.5rem
```

### Changed files

| File | Change |
|------|--------|
| `src/types/config.d.ts` | Added `LogoText`, `LogoImage`, `LogoConfig` types |
| `src/server/validations/config.ts` | Logo schema accepts string or object |
| `src/server/utils/config.ts` | Default config unchanged (empty string = no logo) |
| `src/layouts/default.vue` | Conditional image/text logo rendering |
| `src/composables/useConfigBuilder.ts` | Logo state split into typed fields |
| `src/components/admin/GlobalSettings.vue` | Logo type selector + conditional fields + preview |
| `config-builder/index.html` | Logo type selector + fields + preview + YAML generation |
| `docs/configuration.md` | Rewritten logo documentation |

---

## Logo viewport threshold

### 🚀 Enhancements

- **logo:** Logo in the top-left corner is now only visible on screens wider than 1640px (hidden on 1640px or smaller)
- **logo:** Visibility is reactive to window resize via `window.innerWidth` listener, so the logo appears/disappears live when the browser is resized across the threshold

### 💅 Refactors

- **default.vue:** Replaced Tailwind responsive classes (`hidden sm:block`) with a JS-driven `showLogo` computed ref to ensure exact 1640px breakpoint and avoid relying on Tailwind's arbitrary breakpoint quirks
- **default.vue:** Removed responsive size utilities (`h-6 sm:h-7 md:h-8`, `top-5 left-5 sm:top-6 sm:left-6`) since the logo only renders above 1640px — uses a single `h-8`, `top-6 left-6` instead

---

## New modules, footer and config builder updates

### 🚀 Enhancements

- **module: time** — Live clock widget showing current time and date for any IANA timezone, with optional country flag icon and configurable time/date formats
- **module: datetime-weather** — Combined live clock and weather widget using OpenWeatherMap, with configurable timezone, time format and date format
- **module: greeting** — Simple widget displaying a custom greeting message with optional subtitle
- **module: custom-html** — Renders arbitrary HTML content inside a service card, with a `hidden` option for invisible elements (e.g. tracking pixels)
- **module: openweathermap** — Updated layout: title now shows `Place: Temp °C`, description shows weather only
- **layout: span** — Any service item can now span multiple grid columns via the `span` property
- **layout: footer** — Global footer section with configurable `text` and `html` content, rendered at the bottom of the page
- **composable: useDateFormat** — Shared date formatting composable with seven formats: `short`, `medium`, `long`, `eu`, `compact`, `short-eu`, `iso`
- **config-builder** — Added form fields for Time, DateTime Weather, Greeting, Custom HTML modules
- **config-builder** — Added span field to all grid service items
- **config-builder** — Added Footer section for text and HTML content
- **config-builder** — Added Wiki button linking to wiki.maflplus.eu
- **config-builder** — Updated Load Example with new module examples

### 🩹 Fixes

- **custom-html** — `<script>` tags now execute correctly; Vue's `v-html` uses `innerHTML` which browsers block from running scripts, so the component now dynamically creates script elements via `document.createElement` to ensure execution (e.g. analytics snippets)
- **time/datetime-weather** — Date and time now respect the `lang` setting from config.yml instead of using the browser locale
- **datetime-weather** — Date and time fit on a single line by defaulting to 24-hour format
- **date format: eu** — Manually constructed to ensure European day-month order (`Sat 16 May 2026`) instead of US-style (`Sat, May 16, 2026`)

### 💅 Refactors

- **types** — Added `TimeService`, `DatetimeWeatherService`, `GreetingService`, `CustomHtmlService` interfaces to `services.d.ts`
- **types** — Added `span` to the base `Service` interface
- **types** — Added `Footer` interface to `config.d.ts`
- **validation** — Extended `serviceSchema` with `span` field and `configSchema` with `footer`
- **Item.vue** — Added type-to-component mappings for `time`, `datetime-weather`, `greeting`, and `custom-html`
- **Group.vue** — Grid items with `span > 1` are wrapped in a div with `grid-column: span N`
- **default.vue** — Layout uses `flex flex-col` and renders the `Footer` component

### 📖 Documentation

- **modules.md** — New documentation page covering all modules (Time, DateTime Weather, Greeting, Custom HTML), date formats, grid span, and footer

### New files

| File | Purpose |
|------|---------|
| `src/components/service/Timezone.vue` | Time widget component |
| `src/components/service/DatetimeWeather.vue` | DateTime Weather widget component |
| `src/components/service/Greeting.vue` | Greeting widget component |
| `src/components/service/CustomHtml.vue` | Custom HTML widget component |
| `src/components/Footer.vue` | Footer component |
| `src/composables/useDateFormat.ts` | Shared date formatting composable |
| `src/server/api/services/timezone.ts` | Time API handler |
| `src/server/api/services/datetime-weather.ts` | DateTime Weather API handler (OWM) |
| `src/server/api/services/greeting.ts` | Greeting API handler |
| `src/server/api/services/custom-html.ts` | Custom HTML API handler |
| `docs/modules.md` | Module documentation |

---

## Fork and modifications

> Independent fork by [@R0GGER](https://github.com/R0GGER) — not affiliated with upstream [hywax/mafl](https://github.com/hywax/mafl).

### 🏡 Chore

- **repo:** Renamed repository from `mafl` to `maflplus` and updated references across all relevant files
- **demo:** Published live demo at [maflplus.eu](https://maflplus.eu)
- **config-builder:** Published Config Builder at [config.maflplus.eu](https://config.maflplus.eu)

### 🚀 Enhancements

- **logo:** Fixed responsive logo in the top-left corner, served from the data volume; hidden on mobile
- **layout:** Responsive grid with up to 12 columns (`small` / `medium` / `large` / `xlarge`)
- **layout:** List display mode per group with separate column configuration
- **layout:** Dynamic container width based on configured column count
- **layout:** Responsive gap scaling for grid and list views (`gap-2 lg:gap-4 xl:gap-6`)
- **layout:** Configurable spacing between groups (`group`) and items (`item`)
- **styles:** Per-element styling for category headers, titles and descriptions (`color`, `fontSize`, `fontWeight`, `fontStyle`, `fontFamily`, `textDecoration`)
- **background:** Full-screen background image served from the data volume
- **background:** Color overlay with configurable color and opacity (`backgroundOverlay`)
- **tabs:** Organise services into switchable tabs, each with its own name and icon
- **search:** Search bar that filters bookmarks across all tabs with keyboard shortcuts (`/`, `Ctrl+K`)
- **search:** Web search fallback to Google or DuckDuckGo (`searchProvider`)
- **icons:** Retrieve service icons automatically via a configurable favicon API (`faviconApi`)
- **icons:** Favicon icon type — reference a domain to auto-fetch its icon (`icon.favicon`)
- **status:** Align status indicator to `left` or `right` (default) per service (`status.position`)
- **display:** Grid and list display modes per service group (`display: grid | list`)
- **config-builder:** Logo field in General settings
- **config-builder:** List column configuration alongside grid columns
- **config-builder:** OpenWeatherMap widget support (lat, lon, units, API key)
- **config-builder:** IP API widget support (with flag icon toggle)
- **config-builder:** Load example configuration with one click
- **config-builder:** Remember open/collapsed item panels across re-renders

### 🩹 Fixes

- **assets:** Serve background images and local assets from the data volume via `/api/assets/`
- **layout:** Center content with dynamic `maxWidth` instead of fixed `max-w-screen-2xl`
- **docker:** Removed stray slash in volume mount path (`favicons://` → `favicons:/`)
- **docker:** Simplified volume mapping to mount full data directory (`./mafl:/app/data`)

### 📖 Documentation

- **logo:** Added Logo section to README and configuration docs
- **openweathermap:** Dedicated documentation page for the OpenWeatherMap widget
- **ip-api:** Dedicated documentation page for the IP API widget
- **configuration:** Improved formatting of the demo config section

### 💅 Refactors

- **config:** Extended config schema with `logo`, `background`, `backgroundOverlay`, `faviconApi`, `styles`, `layout.list`, `layout.spacing`, `searchProvider` and `tabs`
- **config:** Default layout now includes separate grid and list column defaults
- **config-builder:** Extracted `newItem()` and `parseRawItem()` helpers to reduce duplication
- **settings:** Plugin provides `$tabs`, `$activeTabIndex` and `$activeServices` for tab switching
- **layout:** Default layout renders search bar, tab navigation and section-based grid/list grouping
- **services:** `ListItem` component for compact list rows with icon, title and status

### 🏡 Chore

- **docker:** Image published to `ghcr.io/r0gger/maflplus` via GitHub Actions
- **docker:** Added local `build` block to `docker-compose.yml` for development
- **updates:** Check updates temporarily disabled

## v0.15.4

[compare changes](https://github.com/hywax/mafl/compare/v0.15.3...v0.15.4)

### 🚀 Enhancements

- Gr-GR locale ([#122](https://github.com/hywax/mafl/pull/122))
- De-DE locale ([#124](https://github.com/hywax/mafl/pull/124))

### 📖 Documentation

- **showcase:** By @crueber ([#116](https://github.com/hywax/mafl/pull/116))
- **showcase:** Crueber image ([a55b9d7](https://github.com/hywax/mafl/commit/a55b9d7))
- German and greek locale ([a2a761d](https://github.com/hywax/mafl/commit/a2a761d))

### 🏡 Chore

- Update CONTRIBUTORS ([2fc0498](https://github.com/hywax/mafl/commit/2fc0498))

### ❤️ Contributors

- Hywax ([@hywax](http://github.com/hywax))
- Gehno ([@gehno](http://github.com/gehno))
- Stratos ([@sthivaios](http://github.com/sthivaios))
- Bot ([@hywax-assistant](http://github.com/hywax-assistant))

## v0.15.3

[compare changes](https://github.com/hywax/mafl/compare/v0.15.2...v0.15.3)

### 🩹 Fixes

- Home page translation key was missing ([981e02c](https://github.com/hywax/mafl/commit/981e02c))

### 📖 Documentation

- **showcase:** By @AemonCao ([#113](https://github.com/hywax/mafl/pull/113))
- Fix image path ([4dbe8a2](https://github.com/hywax/mafl/commit/4dbe8a2))

### 🏡 Chore

- **i18n:** Update zh-CN ([#109](https://github.com/hywax/mafl/pull/109))
- Update CONTRIBUTORS ([42a3e9a](https://github.com/hywax/mafl/commit/42a3e9a))

### ❤️ Contributors

- Hywax ([@hywax](http://github.com/hywax))
- Bot ([@hywax-assistant](http://github.com/hywax-assistant))
- Aemon Cao <bot960528@gmail.com>

## v0.15.2

[compare changes](https://github.com/hywax/mafl/compare/v0.15.1...v0.15.2)

### 🚀 Enhancements

- **themes:** New theme bluer ([ca4b6c3](https://github.com/hywax/mafl/commit/ca4b6c3))
- **templates:** Unraid ([#102](https://github.com/hywax/mafl/pull/102))
- **templates:** Portainer ([4dbe901](https://github.com/hywax/mafl/commit/4dbe901))
- **templates:** Docker-compose ([dc98917](https://github.com/hywax/mafl/commit/dc98917))

### 💅 Refactors

- Rename templates folder ([89f0ded](https://github.com/hywax/mafl/commit/89f0ded))

### 📖 Documentation

- **showcase:** By @UberDudePL ([6601f4d](https://github.com/hywax/mafl/commit/6601f4d))
- Apply script style ([ac38775](https://github.com/hywax/mafl/commit/ac38775))
- **themes:** Add value bluer ([d36df53](https://github.com/hywax/mafl/commit/d36df53))

### 🏡 Chore

- Provide all lang to config ([c1ed2ce](https://github.com/hywax/mafl/commit/c1ed2ce))

### ❤️ Contributors

- Hywax ([@hywax](http://github.com/hywax))

## v0.15.1

[compare changes](https://github.com/hywax/mafl/compare/v0.15.0...v0.15.1)

### 🩹 Fixes

- Healthcheck exec failed ([410ccf8](https://github.com/hywax/mafl/commit/410ccf8))

### 📖 Documentation

- Fix showcases ([49fc44d](https://github.com/hywax/mafl/commit/49fc44d))

### 📦 Build

- Change opencontainers labels ([d6c32d5](https://github.com/hywax/mafl/commit/d6c32d5))

### ❤️ Contributors

- Hywax ([@hywax](http://github.com/hywax))

## v0.15.0

[compare changes](https://github.com/hywax/mafl/compare/v0.14.0...v0.15.0)

### 🚀 Enhancements

- ⚠️  Docker health check (#92, #93) ([#92](https://github.com/hywax/mafl/issues/92), [#93](https://github.com/hywax/mafl/issues/93))

### 📖 Documentation

- Proxmox file volumes ([#96](https://github.com/hywax/mafl/pull/96))
- Fix proxmox file volumes ([0891abd](https://github.com/hywax/mafl/commit/0891abd))

#### ⚠️ Breaking Changes

- ⚠️  Docker health check (#92, #93) ([#92](https://github.com/hywax/mafl/issues/92), [#93](https://github.com/hywax/mafl/issues/93))

### ❤️ Contributors

- Hywax ([@hywax](http://github.com/hywax))
- Alexander ([@hywax](http://github.com/hywax))

## v0.14.0

[compare changes](https://github.com/hywax/mafl/compare/v0.13.0...v0.14.0)

### 🚀 Enhancements

- ⚠️  Ability to change the application grid ([#49](https://github.com/hywax/mafl/pull/49), [#91](https://github.com/hywax/mafl/pull/91))

### 💅 Refactors

- Contributors format ([53dee14](https://github.com/hywax/mafl/commit/53dee14))

### 🏡 Chore

- Websocket log ([e0398c0](https://github.com/hywax/mafl/commit/e0398c0))

#### ⚠️ Breaking Changes

- ⚠️  Ability to change the application grid ([#49](https://github.com/hywax/mafl/pull/49), [#91](https://github.com/hywax/mafl/pull/91))

### ❤️ Contributors

- Hywax ([@hywax](http://github.com/hywax))
- Alexander ([@hywax](http://github.com/hywax))

## v0.13.0

[compare changes](https://github.com/hywax/mafl/compare/v0.12.0...v0.13.0)

### 🚀 Enhancements

- ⚠️  Status indicator operation for all url types ([#87](https://github.com/hywax/mafl/pull/87))

### 💅 Refactors

- Contributors format ([0b7426d](https://github.com/hywax/mafl/commit/0b7426d))

### 📖 Documentation

- Proxmox memory error ([#89](https://github.com/hywax/mafl/pull/89))

### 🏡 Chore

- Feature pull request template ([eb50f0e](https://github.com/hywax/mafl/commit/eb50f0e))

#### ⚠️ Breaking Changes

- ⚠️  Status indicator operation for all url types ([#87](https://github.com/hywax/mafl/pull/87))

### ❤️ Contributors

- Hywax ([@hywax](http://github.com/hywax))

## v0.12.0

[compare changes](https://github.com/hywax/mafl/compare/v0.11.1...v0.12.0)

### 🚀 Enhancements

- ⚠️  Automatic reloading of application when config is updated ([#86](https://github.com/hywax/mafl/pull/86))

### 💅 Refactors

- Rename useServiceData composable ([d44e4cc](https://github.com/hywax/mafl/commit/d44e4cc))
- Contributors format ([fc8fdde](https://github.com/hywax/mafl/commit/fc8fdde))

### 📖 Documentation

- **showcase:** By @hywax ([a09eb18](https://github.com/hywax/mafl/commit/a09eb18))

### 📦 Build

- Change author email ([aad7406](https://github.com/hywax/mafl/commit/aad7406))

#### ⚠️ Breaking Changes

- ⚠️  Automatic reloading of application when config is updated ([#86](https://github.com/hywax/mafl/pull/86))

### ❤️ Contributors

- Hywax ([@hywax](http://github.com/hywax))

## v0.11.1

[compare changes](https://github.com/hywax/mafl/compare/v0.11.0...v0.11.1)

### 🩹 Fixes

- Types releases latest ([bce1c92](https://github.com/hywax/mafl/commit/bce1c92))

### 📖 Documentation

- Update cover image ([8d9aeac](https://github.com/hywax/mafl/commit/8d9aeac))
- Status animation property ([440a296](https://github.com/hywax/mafl/commit/440a296))
- Remove duplicate contributors ([3ba24ec](https://github.com/hywax/mafl/commit/3ba24ec))
- **showcase:** By @splnut ([816e65a](https://github.com/hywax/mafl/commit/816e65a))

### 🏡 Chore

- Latest releases change check method ([9762d64](https://github.com/hywax/mafl/commit/9762d64))
- Remove margin top in title service ([d2a59b8](https://github.com/hywax/mafl/commit/d2a59b8))
- Add animation status toggle ([349e8d9](https://github.com/hywax/mafl/commit/349e8d9))
- Pwa theme color ([#72](https://github.com/hywax/mafl/pull/72))

### ❤️ Contributors

- Hywax ([@hywax](http://github.com/hywax))

## v0.11.0

[compare changes](https://github.com/hywax/mafl/compare/v0.10.0...v0.11.0)

### 🩹 Fixes

- Hide gray status icon on status false ([b45aa3b](https://github.com/hywax/mafl/commit/b45aa3b))

### 💅 Refactors

- Validators are moved to a separate files ([6455c29](https://github.com/hywax/mafl/commit/6455c29))
- ⚠️  Move files to src ([#63](https://github.com/hywax/mafl/pull/63))

### 🏡 Chore

- Transform border color icon component ([28ee84d](https://github.com/hywax/mafl/commit/28ee84d))

#### ⚠️ Breaking Changes

- ⚠️  Move files to src ([#63](https://github.com/hywax/mafl/pull/63))

### ❤️ Contributors

- Hywax ([@hywax](http://github.com/hywax))

## v0.10.0

[compare changes](https://github.com/hywax/mafl/compare/v0.9.5...v0.10.0)

### 🚀 Enhancements

- Service tags ([2051cee](https://github.com/hywax/mafl/commit/2051cee))

### 📖 Documentation

- Service tags ([4520240](https://github.com/hywax/mafl/commit/4520240))
- Preview docs image ([1f5a27b](https://github.com/hywax/mafl/commit/1f5a27b))
- Icons preview ([9504e9a](https://github.com/hywax/mafl/commit/9504e9a))

### 🏡 Chore

- Update CONTRIBUTORS ([f6717aa](https://github.com/hywax/mafl/commit/f6717aa))

### ❤️ Contributors

- Hywax ([@hywax](http://github.com/hywax))
- Bot ([@hywax-assistant](http://github.com/hywax-assistant))

## v0.9.5

[compare changes](https://github.com/hywax/mafl/compare/v0.9.4...v0.9.5)

### 🚀 Enhancements

- Fr-CA locale ([#59](https://github.com/hywax/mafl/pull/59))

### 🩹 Fixes

- Unnecessary spaces ([388928c](https://github.com/hywax/mafl/commit/388928c))

### 📖 Documentation

- Proxmox script create ([61fbc0f](https://github.com/hywax/mafl/commit/61fbc0f))
- France locale ([40629f7](https://github.com/hywax/mafl/commit/40629f7))

### 🏡 Chore

- Add FR locales ([ba894d0](https://github.com/hywax/mafl/commit/ba894d0))

### ❤️ Contributors

- Hywax ([@hywax](http://github.com/hywax))
- Maxim31cote ([@maxim31cote](http://github.com/maxim31cote))

## v0.9.4

[compare changes](https://github.com/hywax/mafl/compare/v0.9.3...v0.9.4)

### 🩹 Fixes

- Configuring theme ([#58](https://github.com/hywax/mafl/pull/58))

### 🏡 Chore

- Update CONTRIBUTORS ([dc5efb0](https://github.com/hywax/mafl/commit/dc5efb0))

### ❤️ Contributors

- Hywax ([@hywax](http://github.com/hywax))
- Bot ([@hywax-assistant](http://github.com/hywax-assistant))

## v0.9.3

[compare changes](https://github.com/hywax/mafl/compare/v0.9.2...v0.9.3)

### 🚀 Enhancements

- Pl-PL locale ([#57](https://github.com/hywax/mafl/pull/57))

### 🩹 Fixes

- Syntax error ([4ea2b5a](https://github.com/hywax/mafl/commit/4ea2b5a))
- Locales file import ([19ef606](https://github.com/hywax/mafl/commit/19ef606))

### 📖 Documentation

- Github link @UberDudePL ([c7d93b4](https://github.com/hywax/mafl/commit/c7d93b4))
- Rename bubble to wrap ([607f41b](https://github.com/hywax/mafl/commit/607f41b))

### ❤️ Contributors

- Hywax ([@hywax](http://github.com/hywax))
- UberDudePL

## v0.9.2

[compare changes](https://github.com/hywax/mafl/compare/v0.9.1...v0.9.2)

### 🩹 Fixes

- Remove theme static white color ([541cf32](https://github.com/hywax/mafl/commit/541cf32))

### 🏡 Chore

- The entire card is a reference ([12e3086](https://github.com/hywax/mafl/commit/12e3086))

### ❤️ Contributors

- Hywax ([@hywax](http://github.com/hywax))

## v0.9.1

[compare changes](https://github.com/hywax/mafl/compare/v0.9.0...v0.9.1)

### 🩹 Fixes

- The shadow from the point animation doesn't fit ([fec99c5](https://github.com/hywax/mafl/commit/fec99c5))
- Error on optional service fields ([8aba88b](https://github.com/hywax/mafl/commit/8aba88b))

### 📖 Documentation

- Credits section ([d7e20ac](https://github.com/hywax/mafl/commit/d7e20ac))

### 🏡 Chore

- Update AUTHORS ([74d4d09](https://github.com/hywax/mafl/commit/74d4d09))
- Update contributors [skip ci] ([d020452](https://github.com/hywax/mafl/commit/d020452))

### 🤖 CI

- Contributor credits plan ([ae680fa](https://github.com/hywax/mafl/commit/ae680fa))
- Welcome plan ([bcb9850](https://github.com/hywax/mafl/commit/bcb9850))
- Change commit message on credits plan ([953ec1b](https://github.com/hywax/mafl/commit/953ec1b))
- Remove authors step on credits plan ([416e888](https://github.com/hywax/mafl/commit/416e888))

### ❤️ Contributors

- Hywax ([@hywax](http://github.com/hywax))
- Bot ([@hywax-assistant](http://github.com/hywax-assistant))

## v0.9.0

[compare changes](https://github.com/hywax/mafl/compare/v0.8.0...v0.9.0)

### 🚀 Enhancements

- Openweathermap service ([9363ae4](https://github.com/hywax/mafl/commit/9363ae4))

### 📖 Documentation

- **en:** Remove section title ([cd7e998](https://github.com/hywax/mafl/commit/cd7e998))
- **en:** Docs parts ([742588d](https://github.com/hywax/mafl/commit/742588d))
- **ru:** Docs parts ([72d22d7](https://github.com/hywax/mafl/commit/72d22d7))
- **ru:** Replace to part extends base service ([af36595](https://github.com/hywax/mafl/commit/af36595))
- **en:** Replace to part extends base service ([2e98fdf](https://github.com/hywax/mafl/commit/2e98fdf))
- Openweathermap service ([1b42cb2](https://github.com/hywax/mafl/commit/1b42cb2))
- Ignore parts files ([2c73d5b](https://github.com/hywax/mafl/commit/2c73d5b))
- Fix weather link ([62e213a](https://github.com/hywax/mafl/commit/62e213a))

### 📦 Build

- ⚠️  Remove docker arm/v7 ([224c486](https://github.com/hywax/mafl/commit/224c486))
- Bump node image ([a15b4f1](https://github.com/hywax/mafl/commit/a15b4f1))

### 🏡 Chore

- **ip-api:** Add getKey on cache ([ed06d93](https://github.com/hywax/mafl/commit/ed06d93))
- Remove vitejs plugin vue patch ([cc04d6e](https://github.com/hywax/mafl/commit/cc04d6e))

### 🤖 CI

- Refactor docs plan ([540e0a6](https://github.com/hywax/mafl/commit/540e0a6))
- Refactor ci plan ([12bf943](https://github.com/hywax/mafl/commit/12bf943))

#### ⚠️ Breaking Changes

- ⚠️  Remove docker arm/v7 ([224c486](https://github.com/hywax/mafl/commit/224c486))

### ❤️ Contributors

- Hywax ([@hywax](http://github.com/hywax))

## v0.8.0

[compare changes](https://github.com/hywax/mafl/compare/v0.7.6...v0.8.0)

### 🚀 Enhancements

- Ip api service ([fe4a219](https://github.com/hywax/mafl/commit/fe4a219))

### 💅 Refactors

- Change @hywax link profile ([fb93b86](https://github.com/hywax/mafl/commit/fb93b86))
- Remove duplicate contributors ([7dd4694](https://github.com/hywax/mafl/commit/7dd4694))

### 📖 Documentation

- Change color brand-soft ([d7d2274](https://github.com/hywax/mafl/commit/d7d2274))
- Badge in version ([4a7599c](https://github.com/hywax/mafl/commit/4a7599c))
- **en:** Fix behaviour target description ([12a9dc8](https://github.com/hywax/mafl/commit/12a9dc8))
- Ip api service ([c5e70a3](https://github.com/hywax/mafl/commit/c5e70a3))

### 🏡 Chore

- Change placeholder background color ([05cb0ea](https://github.com/hywax/mafl/commit/05cb0ea))
- Provide safely config ([e38a7a5](https://github.com/hywax/mafl/commit/e38a7a5))
- ⚠️  Redesigned loading of dynamic services ([d4edb9a](https://github.com/hywax/mafl/commit/d4edb9a))
- Placeholder animate props ([c812e2a](https://github.com/hywax/mafl/commit/c812e2a))
- Create helper check valid url ([d8b9aca](https://github.com/hywax/mafl/commit/d8b9aca))
- Set option title, link ([7b849bd](https://github.com/hywax/mafl/commit/7b849bd))

### 🤖 CI

- Migrate renovate config ([34d9378](https://github.com/hywax/mafl/commit/34d9378))
- Update deploy documentation site ([4a1056e](https://github.com/hywax/mafl/commit/4a1056e))

#### ⚠️ Breaking Changes

- ⚠️  Redesigned loading of dynamic services ([d4edb9a](https://github.com/hywax/mafl/commit/d4edb9a))

### ❤️ Contributors

- Hywax ([@hywax](http://github.com/hywax))

## v0.7.6

[compare changes](https://github.com/hywax/mafl/compare/v0.7.5...v0.7.6)

### 🚀 Enhancements

- New prop `target` for service ([feea7fe](https://github.com/hywax/mafl/commit/feea7fe))
- New prop `target` for config behaviour ([7a81999](https://github.com/hywax/mafl/commit/7a81999))

### 📖 Documentation

- **en:** Service target ([8cdeb6a](https://github.com/hywax/mafl/commit/8cdeb6a))
- **ru:** Service target ([a2b0b8a](https://github.com/hywax/mafl/commit/a2b0b8a))
- **en:** Config behaviour target ([e8f20f2](https://github.com/hywax/mafl/commit/e8f20f2))
- **ru:** Config behaviour target ([3ae0592](https://github.com/hywax/mafl/commit/3ae0592))

### 📦 Build

- **deps-dev:** Bump @commitlint/cli from 18.4.4 to 18.5.0 ([#21](https://github.com/hywax/mafl/pull/21))
- **deps-dev:** Bump @commitlint/config-conventional ([#22](https://github.com/hywax/mafl/pull/22))

### ❤️ Contributors

- Hywax ([@hywax](http://github.com/hywax))

## v0.7.5

[compare changes](https://github.com/hywax/mafl/compare/v0.7.4...v0.7.5)

### 🚀 Enhancements

- Arabic file locale ([e64c0dd](https://github.com/hywax/mafl/commit/e64c0dd))
- Arabic language ([#20](https://github.com/hywax/mafl/pull/20))
- Dir and lang to html attrs ([35c88c1](https://github.com/hywax/mafl/commit/35c88c1))

### 📖 Documentation

- Github link @mohmadhabib ([fc9ac0a](https://github.com/hywax/mafl/commit/fc9ac0a))

### ❤️ Contributors

- Hywax ([@hywax](http://github.com/hywax))
- Mohammad Habib ([@mohmadhabib](http://github.com/mohmadhabib))

## v0.7.4

[compare changes](https://github.com/hywax/mafl/compare/v0.7.3...v0.7.4)

### 🚀 Enhancements

- Chinese language ([4557a16](https://github.com/hywax/mafl/commit/4557a16))
- Hindi language ([09b2154](https://github.com/hywax/mafl/commit/09b2154))
- Spanish language ([7d4b090](https://github.com/hywax/mafl/commit/7d4b090))

### ❤️ Contributors

- Hywax ([@hywax](http://github.com/hywax))

## v0.7.3

[compare changes](https://github.com/hywax/mafl/compare/v0.7.2...v0.7.3)

### 📖 Documentation

- **getting-started:** Refactor runs ([6538a61](https://github.com/hywax/mafl/commit/6538a61))
- Themes assets ([9669e51](https://github.com/hywax/mafl/commit/9669e51))
- Basic information update ([1427b6f](https://github.com/hywax/mafl/commit/1427b6f))
- Moved themes asset ([bfa7793](https://github.com/hywax/mafl/commit/bfa7793))
- Add emoji ([98f5633](https://github.com/hywax/mafl/commit/98f5633))
- Added Yandex.Metrika for documentation ([4ec6059](https://github.com/hywax/mafl/commit/4ec6059))
- **en:** What is page ([575e0c5](https://github.com/hywax/mafl/commit/575e0c5))
- **en:** Getting started page ([093962c](https://github.com/hywax/mafl/commit/093962c))
- **en:** Configuration page ([ceba903](https://github.com/hywax/mafl/commit/ceba903))
- **en:** Icons page ([9452b99](https://github.com/hywax/mafl/commit/9452b99))
- **en:** Favicons page ([15fbe0b](https://github.com/hywax/mafl/commit/15fbe0b))
- **en:** Base service page ([b7b18e1](https://github.com/hywax/mafl/commit/b7b18e1))
- **en:** Showcase page ([923d713](https://github.com/hywax/mafl/commit/923d713))
- **en:** Development page ([478d616](https://github.com/hywax/mafl/commit/478d616))
- **en:** Contributing page ([7fda3a6](https://github.com/hywax/mafl/commit/7fda3a6))
- **ru:** Contributing page fix char ([53c830f](https://github.com/hywax/mafl/commit/53c830f))
- Change hero text on home page ([7cfdf33](https://github.com/hywax/mafl/commit/7cfdf33))
- Fix cover image url ([5674009](https://github.com/hywax/mafl/commit/5674009))

### 📦 Build

- **deps-dev:** Bump @types/node from 20.10.6 to 20.10.7 ([#12](https://github.com/hywax/mafl/pull/12))
- **deps:** Bump defu from 6.1.3 to 6.1.4 ([#11](https://github.com/hywax/mafl/pull/11))
- **deps-dev:** Bump vitepress from 1.0.0-rc.34 to 1.0.0-rc.36 ([#9](https://github.com/hywax/mafl/pull/9))
- **deps-dev:** Bump @antfu/eslint-config from 2.6.1 to 2.6.2 ([#8](https://github.com/hywax/mafl/pull/8))
- **deps:** Bump h3-zod from 0.5.2 to 0.5.3 ([#10](https://github.com/hywax/mafl/pull/10))
- **deps-dev:** @hywax/vitepress-yandex-metrika from 0.2.0 to 0.3.0 ([49ac3d9](https://github.com/hywax/mafl/commit/49ac3d9))
- **deps:** Bump @vueuse/nuxt from 10.7.1 to 10.7.2 ([#14](https://github.com/hywax/mafl/pull/14))
- **deps-dev:** Bump @types/node from 20.10.7 to 20.11.1 ([#13](https://github.com/hywax/mafl/pull/13))
- **deps-dev:** Bump @commitlint/cli from 18.4.3 to 18.4.4 ([#17](https://github.com/hywax/mafl/pull/17))
- **deps-dev:** Bump @nuxt/devtools from 1.0.6 to 1.0.8 ([#15](https://github.com/hywax/mafl/pull/15))
- **deps-dev:** Bump nuxt from 3.9.0 to 3.9.1 ([#16](https://github.com/hywax/mafl/pull/16))
- **deps:** Upgrade dependencies ([d04f20b](https://github.com/hywax/mafl/commit/d04f20b))

### 🎨 Styles

- **eslint:** Run ([64a80ae](https://github.com/hywax/mafl/commit/64a80ae))

### ❤️ Contributors

- Hywax ([@hywax](http://github.com/hywax))

## v0.7.2

[compare changes](https://github.com/hywax/mafl/compare/v0.7.1...v0.7.2)

### 🚀 Enhancements

- Custom error page ([9578305](https://github.com/hywax/mafl/commit/9578305))
- Validation config ([349b546](https://github.com/hywax/mafl/commit/349b546))
- Sepia theme ([a6c38b9](https://github.com/hywax/mafl/commit/a6c38b9))

### 🩹 Fixes

- Color message ([371b778](https://github.com/hywax/mafl/commit/371b778))

### 🏡 Chore

- Immediate status service ([1d43994](https://github.com/hywax/mafl/commit/1d43994))
- Set default page title ([8009c8f](https://github.com/hywax/mafl/commit/8009c8f))
- Remove unused translations ([53f3288](https://github.com/hywax/mafl/commit/53f3288))
- Zod validation ([0089cf9](https://github.com/hywax/mafl/commit/0089cf9))
- Update locales ([a1fa9ba](https://github.com/hywax/mafl/commit/a1fa9ba))
- Immediate default false ([f41d0e1](https://github.com/hywax/mafl/commit/f41d0e1))
- Redirect to error page ([6094ba0](https://github.com/hywax/mafl/commit/6094ba0))
- Change dark background ([8d359d2](https://github.com/hywax/mafl/commit/8d359d2))

### ❤️ Contributors

- Hywax ([@hywax](http://github.com/hywax))

## v0.7.1

[compare changes](https://github.com/hywax/mafl/compare/v0.7.0...v0.7.1)

### 🚀 Enhancements

- Transform services to client side render ([2a564bf](https://github.com/hywax/mafl/commit/2a564bf))

### 📖 Documentation

- Excluding pages from search ([0030ed7](https://github.com/hywax/mafl/commit/0030ed7))
- Add favicon.ico ([db884da](https://github.com/hywax/mafl/commit/db884da))

### 📦 Build

- Apply patch ([24565df](https://github.com/hywax/mafl/commit/24565df))

### 🏡 Chore

- Service placeholder ([f396116](https://github.com/hywax/mafl/commit/f396116))

### ❤️ Contributors

- Hywax ([@hywax](http://github.com/hywax))

## v0.7.0

[compare changes](https://github.com/hywax/mafl/compare/v0.6.0...v0.7.0)

### 🚀 Enhancements

- ⚠️  Combine base services with ping ([e07a92e](https://github.com/hywax/mafl/commit/e07a92e))

### 📖 Documentation

- Remove base from url ([4ab2606](https://github.com/hywax/mafl/commit/4ab2606))
- **preview:** Add new links ([008b12b](https://github.com/hywax/mafl/commit/008b12b))
- Implements changelog page ([09e8176](https://github.com/hywax/mafl/commit/09e8176))
- Implements license page ([a10d9d2](https://github.com/hywax/mafl/commit/a10d9d2))
- Changelog page ru header ([39e82df](https://github.com/hywax/mafl/commit/39e82df))
- License page ru ([0fa5a03](https://github.com/hywax/mafl/commit/0fa5a03))
- Configuration page ru ([ee2f31f](https://github.com/hywax/mafl/commit/ee2f31f))
- Base service page ru ([1c77879](https://github.com/hywax/mafl/commit/1c77879))
- Create icons page ([2667041](https://github.com/hywax/mafl/commit/2667041))
- Icons page ru ([36acc2e](https://github.com/hywax/mafl/commit/36acc2e))
- What is page ru ([00c626a](https://github.com/hywax/mafl/commit/00c626a))
- Getting started page ru ([68964a6](https://github.com/hywax/mafl/commit/68964a6))
- Favicons page ru ([5ed955b](https://github.com/hywax/mafl/commit/5ed955b))
- Hidden deployment ([85752dc](https://github.com/hywax/mafl/commit/85752dc))
- Development page ru ([4db28f4](https://github.com/hywax/mafl/commit/4db28f4))
- Translate all links ru ([fccc596](https://github.com/hywax/mafl/commit/fccc596))
- Showcase page ru ([f16b4e5](https://github.com/hywax/mafl/commit/f16b4e5))
- Contributing page ru ([b94dc39](https://github.com/hywax/mafl/commit/b94dc39))
- Index page ru ([97d4c0d](https://github.com/hywax/mafl/commit/97d4c0d))
- Translate site ru ([848d58e](https://github.com/hywax/mafl/commit/848d58e))
- EditLink && lastUpdated en ([64da8c6](https://github.com/hywax/mafl/commit/64da8c6))
- Create preview service ([8913533](https://github.com/hywax/mafl/commit/8913533))
- Base service add preview ([9b8e1b8](https://github.com/hywax/mafl/commit/9b8e1b8))
- Favicons add struct files ru ([78fd48f](https://github.com/hywax/mafl/commit/78fd48f))
- **issue-template:** Bug ([3c93762](https://github.com/hywax/mafl/commit/3c93762))
- **issue-template:** Feature request ([2c61da5](https://github.com/hywax/mafl/commit/2c61da5))
- **issue-template:** Question ([1eb28a7](https://github.com/hywax/mafl/commit/1eb28a7))
- **issue-template:** Showcase ([52128d6](https://github.com/hywax/mafl/commit/52128d6))
- **issue-template:** Showcase fix options ([7839849](https://github.com/hywax/mafl/commit/7839849))
- Contributing issues links ru ([3daa235](https://github.com/hywax/mafl/commit/3daa235))
- Showcase issue link ru ([3d1e44c](https://github.com/hywax/mafl/commit/3d1e44c))

### 🏡 Chore

- Ignores into second block ([55d3bb8](https://github.com/hywax/mafl/commit/55d3bb8))
- Add example config ([3515ae5](https://github.com/hywax/mafl/commit/3515ae5))

### 🎨 Styles

- **eslint:** Run ([c478fea](https://github.com/hywax/mafl/commit/c478fea))

### 🤖 CI

- **docs:** Deploy Documentation site to GitHub Pages ([3f95640](https://github.com/hywax/mafl/commit/3f95640))

#### ⚠️ Breaking Changes

- ⚠️  Combine base services with ping ([e07a92e](https://github.com/hywax/mafl/commit/e07a92e))

### ❤️ Contributors

- Hywax ([@hywax](http://github.com/hywax))

## v0.6.0

[compare changes](https://github.com/hywax/mafl/compare/v0.5.1...v0.6.0)

### 🚀 Enhancements

- ⚠️  Vitepress engine ([#7](https://github.com/hywax/mafl/pull/7))

### 🏡 Chore

- Pull no-rebase ([62f9aae](https://github.com/hywax/mafl/commit/62f9aae))

#### ⚠️ Breaking Changes

- ⚠️  Vitepress engine ([#7](https://github.com/hywax/mafl/pull/7))

### ❤️ Contributors

- Hywax ([@hywax](http://github.com/hywax))

## v0.5.1

[compare changes](https://github.com/hywax/mafl/compare/v0.5.0...v0.5.1)

## v0.5.0

[compare changes](https://github.com/hywax/mafl/compare/v0.4.0...v0.5.0)

### 🚀 Enhancements

- ⚠️  Advanced customization of the service icon ([8df3d47](https://github.com/hywax/mafl/commit/8df3d47))

### 📖 Documentation

- Images for readme ([0123b36](https://github.com/hywax/mafl/commit/0123b36))
- **preview:** Content presentation ([22ec2a3](https://github.com/hywax/mafl/commit/22ec2a3))
- **preview:** Fix html ([994a7fd](https://github.com/hywax/mafl/commit/994a7fd))
- **preview:** Fix spaces ([5a8730c](https://github.com/hywax/mafl/commit/5a8730c))
- **features:** Update list ([52f1859](https://github.com/hywax/mafl/commit/52f1859))

### 🏡 Chore

- **ping-service:** Replace console to logger ([ade76a3](https://github.com/hywax/mafl/commit/ade76a3))
- **ping-service:** Change default interval from 10 to 60 sec ([58236f9](https://github.com/hywax/mafl/commit/58236f9))
- **dev-server:** Add watch from folder ([70b76b0](https://github.com/hywax/mafl/commit/70b76b0))

#### ⚠️ Breaking Changes

- ⚠️  Advanced customization of the service icon ([8df3d47](https://github.com/hywax/mafl/commit/8df3d47))

### ❤️ Contributors

- Hywax ([@hywax](http://github.com/hywax))

## v0.4.0

[compare changes](https://github.com/hywax/mafl/compare/v0.3.0...v0.4.0)

### 🚀 Enhancements

- ⚠️  Added PWA support ([554efa7](https://github.com/hywax/mafl/commit/554efa7))

### 🏡 Chore

- Translations for the update block ([69fecaf](https://github.com/hywax/mafl/commit/69fecaf))
- Create favicons ([b6cc318](https://github.com/hywax/mafl/commit/b6cc318))
- Create robots.txt ([a3867d3](https://github.com/hywax/mafl/commit/a3867d3))

### 🎨 Styles

- Nested translation writing style ([2dbcb5f](https://github.com/hywax/mafl/commit/2dbcb5f))

#### ⚠️ Breaking Changes

- ⚠️  Added PWA support ([554efa7](https://github.com/hywax/mafl/commit/554efa7))

### ❤️ Contributors

- Hywax ([@hywax](http://github.com/hywax))

## v0.3.0

[compare changes](https://github.com/hywax/mafl/compare/v0.2.1...v0.3.0)

### 🚀 Enhancements

- ⚠️  Automatic update check ([a25785d](https://github.com/hywax/mafl/commit/a25785d))

### 💅 Refactors

- Getting config from server ([cf53bd8](https://github.com/hywax/mafl/commit/cf53bd8))

### 🏡 Chore

- Config provide lang ([9bbfb8b](https://github.com/hywax/mafl/commit/9bbfb8b))
- Add defu ([2b64480](https://github.com/hywax/mafl/commit/2b64480))
- Brand colors ([4ad843f](https://github.com/hywax/mafl/commit/4ad843f))
- Remove nuxt-site-config module ([2fd2dc0](https://github.com/hywax/mafl/commit/2fd2dc0))
- **nuxt:** Enable ssr ([5e365a4](https://github.com/hywax/mafl/commit/5e365a4))

#### ⚠️ Breaking Changes

- ⚠️  Automatic update check ([a25785d](https://github.com/hywax/mafl/commit/a25785d))

### ❤️ Contributors

- Hywax ([@hywax](http://github.com/hywax))

## v0.2.1

[compare changes](https://github.com/hywax/mafl/compare/v0.2.0...v0.2.1)

### 🚀 Enhancements

- **update-checker:** Check new versions ([d301ff6](https://github.com/hywax/mafl/commit/d301ff6))
- **update-checker:** Disabled on prerender, development ([7e29b0c](https://github.com/hywax/mafl/commit/7e29b0c))
- Use wrapper consola ([d4f5792](https://github.com/hywax/mafl/commit/d4f5792))

### 📖 Documentation

- **getting-started:** Update list ([db69de8](https://github.com/hywax/mafl/commit/db69de8))
- **getting-started:** Update list ([13979db](https://github.com/hywax/mafl/commit/13979db))

### 📦 Build

- Remove .output folder ([2865104](https://github.com/hywax/mafl/commit/2865104))

### 🏡 Chore

- Config file to storage ([cc092bd](https://github.com/hywax/mafl/commit/cc092bd))

### 🎨 Styles

- **eslint:** Run ([3e96765](https://github.com/hywax/mafl/commit/3e96765))

### ❤️ Contributors

- Hywax ([@hywax](http://github.com/hywax))

## v0.2.0

[compare changes](https://github.com/hywax/mafl/compare/v0.1.7...v0.2.0)

### 🩹 Fixes

- Build step on release script ([8ab29b4](https://github.com/hywax/mafl/commit/8ab29b4))

### 📦 Build

- Test new pipe ([c985e94](https://github.com/hywax/mafl/commit/c985e94))
- Npm install ([d6088ff](https://github.com/hywax/mafl/commit/d6088ff))
- Add overrides ([b94c36d](https://github.com/hywax/mafl/commit/b94c36d))
- ⚠️  Migrate npm to yarn ([db3e428](https://github.com/hywax/mafl/commit/db3e428))
- Copy yarn.lock ([d868f91](https://github.com/hywax/mafl/commit/d868f91))

### 🤖 CI

- Rollback Extract Docker tags ([961de5b](https://github.com/hywax/mafl/commit/961de5b))
- Fix install dependencies ([bfbbaac](https://github.com/hywax/mafl/commit/bfbbaac))
- Fixed docker build for all platforms ([#6](https://github.com/hywax/mafl/pull/6))

#### ⚠️ Breaking Changes

- ⚠️  Migrate npm to yarn ([db3e428](https://github.com/hywax/mafl/commit/db3e428))

### ❤️ Contributors

- Hywax ([@hywax](http://github.com/hywax))

## v0.1.7

[compare changes](https://github.com/hywax/mafl/compare/v0.1.6...v0.1.7)

### 📦 Build

- Add package lock file ([9ef811b](https://github.com/hywax/mafl/commit/9ef811b))

### ❤️ Contributors

- Hywax ([@hywax](http://github.com/hywax))

## v0.1.6

[compare changes](https://github.com/hywax/mafl/compare/v0.1.5...v0.1.6)

### 📦 Build

- Remove flag production ([7e78fea](https://github.com/hywax/mafl/commit/7e78fea))
- Change platforms ([9e3c600](https://github.com/hywax/mafl/commit/9e3c600))

### ❤️ Contributors

- Hywax ([@hywax](http://github.com/hywax))

## v0.1.5

[compare changes](https://github.com/hywax/mafl/compare/v0.1.4...v0.1.5)

### 📦 Build

- Npm build replace npm ci ([c60ca3b](https://github.com/hywax/mafl/commit/c60ca3b))
- Change platforms ([5cd29b0](https://github.com/hywax/mafl/commit/5cd29b0))

### ❤️ Contributors

- Hywax ([@hywax](http://github.com/hywax))

## v0.1.4

[compare changes](https://github.com/hywax/mafl/compare/v0.1.3...v0.1.4)

### 📦 Build

- Bump docker/build-push-action from 4 to 5 ([de4da30](https://github.com/hywax/mafl/commit/de4da30))
- Node 18 ([3ec0e7d](https://github.com/hywax/mafl/commit/3ec0e7d))

### ❤️ Contributors

- Hywax ([@hywax](http://github.com/hywax))

## v0.1.3

[compare changes](https://github.com/hywax/mafl/compare/v0.1.2...v0.1.3)

### 📦 Build

- Node 19 ([2003371](https://github.com/hywax/mafl/commit/2003371))

### ❤️ Contributors

- Hywax ([@hywax](http://github.com/hywax))

## v0.1.2

[compare changes](https://github.com/hywax/mafl/compare/v0.1.1...v0.1.2)

### 📦 Build

- Final build from initial image ([a71add0](https://github.com/hywax/mafl/commit/a71add0))

### ❤️ Contributors

- Hywax ([@hywax](http://github.com/hywax))

## v0.1.1

[compare changes](https://github.com/hywax/mafl/compare/v0.1.0...v0.1.1)

### 📦 Build

- Remove linux/arm/v8 ([882bedd](https://github.com/hywax/mafl/commit/882bedd))

### ❤️ Contributors

- Hywax ([@hywax](http://github.com/hywax))

## v0.1.0

[compare changes](https://github.com/hywax/mafl/compare/v0.0.3...v0.1.0)

### 📖 Documentation

- **features:** Update list ([8ac3184](https://github.com/hywax/mafl/commit/8ac3184))

### 📦 Build

- Add new platform linux/arm/v8 ([48addec](https://github.com/hywax/mafl/commit/48addec))
- Change static name to env ([112c842](https://github.com/hywax/mafl/commit/112c842))
- Add opencontainers labels ([1e3e0aa](https://github.com/hywax/mafl/commit/1e3e0aa))
- ⚠️  Migrate pnpm to npm ([7cc2a1a](https://github.com/hywax/mafl/commit/7cc2a1a))

### 🤖 CI

- Add step install dependencies ([88d8aa9](https://github.com/hywax/mafl/commit/88d8aa9))

#### ⚠️ Breaking Changes

- ⚠️  Migrate pnpm to npm ([7cc2a1a](https://github.com/hywax/mafl/commit/7cc2a1a))

### ❤️ Contributors

- Hywax ([@hywax](http://github.com/hywax))

## v0.0.3

[compare changes](https://github.com/hywax/mafl/compare/v0.0.2...v0.0.3)

### 🩹 Fixes

- Trigger tag signature ([a14ea3f](https://github.com/hywax/mafl/commit/a14ea3f))

### ❤️ Contributors

- Hywax ([@hywax](http://github.com/hywax))

## v0.0.2

[compare changes](https://github.com/hywax/mafl/compare/v0.0.1...v0.0.2)

### 🩹 Fixes

- **typecheck:** Data.time is possibly undefined ([4ab1529](https://github.com/hywax/mafl/commit/4ab1529))

### 🎨 Styles

- **eslint:** Run ([fdf3b10](https://github.com/hywax/mafl/commit/fdf3b10))

### 🤖 CI

- Create release on push tag ([20879eb](https://github.com/hywax/mafl/commit/20879eb))
- Run linters ([7d28c01](https://github.com/hywax/mafl/commit/7d28c01))

### ❤️ Contributors

- Hywax ([@hywax](http://github.com/hywax))

## v0.0.1


### 🚀 Enhancements

- **eslint:** Antfu config for eslint ([b14b95d](https://github.com/hywax/mafl/commit/b14b95d))
- **tailwindcss:** Add tailwindcss module ([bbb34e9](https://github.com/hywax/mafl/commit/bbb34e9))
- **service:** Ping ([4d38c00](https://github.com/hywax/mafl/commit/4d38c00))
- **config:** Ungrouped services ([4b2bab0](https://github.com/hywax/mafl/commit/4b2bab0))
- **lang:** Add module i18n ([23e0380](https://github.com/hywax/mafl/commit/23e0380))
- **lang:** Implements base translations ([49031e2](https://github.com/hywax/mafl/commit/49031e2))
- **lang:** Use translations ([df418e5](https://github.com/hywax/mafl/commit/df418e5))
- **lang:** Load from config ([6a07688](https://github.com/hywax/mafl/commit/6a07688))
- Husky and lint staged ([4dcee7e](https://github.com/hywax/mafl/commit/4dcee7e))
- Commit conventional ([bdef406](https://github.com/hywax/mafl/commit/bdef406))
- Add changelogen ([b7c89fa](https://github.com/hywax/mafl/commit/b7c89fa))

### 🩹 Fixes

- **patch:** Check equals objects. PR https://github.com/vitejs/vite-plugin-vue/pull/320 ([55508d6](https://github.com/hywax/mafl/commit/55508d6))
- Random jump icon ([4424647](https://github.com/hywax/mafl/commit/4424647))

### 💅 Refactors

- **deps:** Plugging some dependencies directly ([9d35bba](https://github.com/hywax/mafl/commit/9d35bba))
- **skeleton:** Service card item ([24b61b3](https://github.com/hywax/mafl/commit/24b61b3))
- **skeleton:** Service group ([c8c3ef9](https://github.com/hywax/mafl/commit/c8c3ef9))
- **skeleton:** Change screen to single ([7da6ad2](https://github.com/hywax/mafl/commit/7da6ad2))
- Transfer set title to app ([7be44a1](https://github.com/hywax/mafl/commit/7be44a1))

### 📖 Documentation

- MIT license ([2fef13e](https://github.com/hywax/mafl/commit/2fef13e))
- Base struct readme ([368c36b](https://github.com/hywax/mafl/commit/368c36b))
- **features:** Update list ([ecdf4fb](https://github.com/hywax/mafl/commit/ecdf4fb))
- **features:** Update list ([d9e67c1](https://github.com/hywax/mafl/commit/d9e67c1))
- **features:** Update list ([8244dc7](https://github.com/hywax/mafl/commit/8244dc7))
- **features:** Update list ([0635508](https://github.com/hywax/mafl/commit/0635508))

### 📦 Build

- Docker file ([3ea3e45](https://github.com/hywax/mafl/commit/3ea3e45))
- **deps-dev:** Bump @types/node from 20.10.5 to 20.10.6 ([#2](https://github.com/hywax/mafl/pull/2))
- **deps-dev:** Bump nuxt-site-config from 2.1.2 to 2.1.3 ([#5](https://github.com/hywax/mafl/pull/5))
- **deps-dev:** Bump nuxt-site-config-kit from 2.1.2 to 2.1.3 ([#3](https://github.com/hywax/mafl/pull/3))
- **deps-dev:** Bump @antfu/eslint-config from 1.2.1 to 2.6.1 ([#4](https://github.com/hywax/mafl/pull/4))

### 🏡 Chore

- Initial commit ([3e97906](https://github.com/hywax/mafl/commit/3e97906))
- Add editor config ([65a17ef](https://github.com/hywax/mafl/commit/65a17ef))
- **eslint:** Overrides vue/block-order ([cf1ca86](https://github.com/hywax/mafl/commit/cf1ca86))
- **skeleton:** Base icon component ([e8c7b7f](https://github.com/hywax/mafl/commit/e8c7b7f))
- **skeleton:** Base item component ([69aa75a](https://github.com/hywax/mafl/commit/69aa75a))
- **skeleton:** Base group component ([4dc6321](https://github.com/hywax/mafl/commit/4dc6321))
- **skeleton:** Base screen component ([366fdce](https://github.com/hywax/mafl/commit/366fdce))
- **skeleton:** Add vueuse module ([9ac8829](https://github.com/hywax/mafl/commit/9ac8829))
- **skeleton:** Add yaml parser ([d042dfd](https://github.com/hywax/mafl/commit/d042dfd))
- **nuxt:** Update nuxt ([393e082](https://github.com/hywax/mafl/commit/393e082))
- **nuxt:** Disable ssr ([ff9b0d6](https://github.com/hywax/mafl/commit/ff9b0d6))
- **eslint:** Enable Vue support ([e175f71](https://github.com/hywax/mafl/commit/e175f71))
- **skeleton:** View with layout component ([1fd6218](https://github.com/hywax/mafl/commit/1fd6218))
- **skeleton:** Add nuxt-site-config module ([1d93dab](https://github.com/hywax/mafl/commit/1d93dab))
- **skeleton:** Define site config ([2686917](https://github.com/hywax/mafl/commit/2686917))
- **skeleton:** Define base project types ([d4f6a98](https://github.com/hywax/mafl/commit/d4f6a98))
- **skeleton:** Obtaining and customizing application config ([644f690](https://github.com/hywax/mafl/commit/644f690))
- **skeleton:** Load config and provide to front&back ([c06aa53](https://github.com/hywax/mafl/commit/c06aa53))
- **skeleton:** Define global message component ([a5ceff7](https://github.com/hywax/mafl/commit/a5ceff7))
- Add padding axis X ([44da7ba](https://github.com/hywax/mafl/commit/44da7ba))
- Service base set size icon ([c3ab75b](https://github.com/hywax/mafl/commit/c3ab75b))
- Move overrides https://github.com/hywax/mafl/pull/4 ([65e33a7](https://github.com/hywax/mafl/commit/65e33a7))

### 🎨 Styles

- **eslint:** Run ([7d814db](https://github.com/hywax/mafl/commit/7d814db))
- **eslint:** Run ([5286a7b](https://github.com/hywax/mafl/commit/5286a7b))
- **eslint:** Run ([2604de7](https://github.com/hywax/mafl/commit/2604de7))
- Add rule for .vue ([03d2e36](https://github.com/hywax/mafl/commit/03d2e36))

### 🤖 CI

- Dependabot config ([001c3c1](https://github.com/hywax/mafl/commit/001c3c1))

### ❤️ Contributors

- Hywax ([@hywax](http://github.com/hywax))

