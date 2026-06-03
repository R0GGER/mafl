<h1 align="center">Mafl+</h1>
<p align="center">
  <i>A minimalistic and flexible homepage dashboard - forked from <a href="https://github.com/hywax/mafl">hywax/mafl</a> with extended layout options, search, tabs and more.</i><br><br>
  <img src="docs/screenshots/screenshot1.png"></img><br>  
  <a href="docs/screenshots/screenshot2.png">screenshot 2</a> | <a href="docs/screenshots/screenshot3.png">screenshot 3</a>
</p>

> **Note** — This is an independent fork. It is **not** affiliated with the upstream [hywax/mafl](https://github.com/hywax/mafl) project.


## Table of Contents
* [What's different?](#-whats-different)
* [Features](#-features)
* [Getting started](#-getting-started)
  * [Docker](#docker)
  * [maflpass](#maflpass)
* [Configuration](#%EF%B8%8F-configuration)
  * [Layout](#layout)
  * [Styles](#styles)
  * [Logo](#logo)
  * [Background](#background)
  * [Tabs](#tabs)
  * [Search](#search)
  * [Display modes](#display-modes)
  * [Favicon API](#favicon-api)
  * [Status indicator](#status-indicator)
  * [Footer](#footer)
* [Admin Panel](#-admin-panel)
* [Services](#-services)
* [Icons](#-icons)
* [Themes](#-themes)
* [Languages](#-multi-language)
* [Config Builder](#-config-builder)
* [Wiki](https://wiki.maflplus.eu/)
* [License](#-license)

## 🆕 What's different?

This fork adds several features on top of the original [Mafl](https://github.com/hywax/mafl):

| Area | What changed |
|------|-------------|
| **Layout: Grid** | Responsive grid with up to 6 columns (`small` / `medium` / `large` / `xlarge`). |
| **Layout: List** | Compact list display mode per group, with its own column configuration. |
| **Layout: Spacing** | Configurable spacing between groups and between items. |
| **Styles** | Per-element styling for category headers, titles and descriptions (color, fontSize, fontWeight, fontStyle, etc.). |
| **Logo** | Fixed responsive logo in the top-left corner — image file or text/letter with full typographic control. |
| **Background image** | Full-screen background image served from the data volume. |
| **Background overlay** | Color overlay with configurable opacity for better text readability. |
| **Tabs** | Organise services into switchable tabs, each with its own icon. Tabs can be locked to prevent deletion and hidden from the frontpage. |
| **Search bar** | Filters bookmarks across all tabs; falls back to Google or DuckDuckGo web search. Keyboard shortcuts: `/`, `Ctrl+K`. |
| **Favicon API** | Retrieve service icons automatically via a configurable favicon API with server-side proxy cache. |
| **Status position** | Align the status indicator to the `left` or `right` (default) of a service. |
| **Admin Panel** | Built-in visual config editor at `/admin` with instant save & apply. |
| **Modules** | Time, DateTime Weather, Greeting, Custom HTML widgets. |
| **Grid span** | Any service item can span multiple grid columns. |
| **Footer** | Global footer with text and/or HTML content. |

## 🎯 Features

* 🔐 **Privacy** — All requests to third-party services happen server-side.
* ⚡ **Real-time** — Interactive service cards with live status information.
* 🔍 **Search** — Filter bookmarks instantly; fall back to Google or DuckDuckGo.
* 📑 **Tabs** — Organise services into switchable tabs with lock protection and visibility toggle.
* 🛡️ **Admin Panel** — Built-in config editor at `/admin` with secure login.
* 🖼️ **Backgrounds** — Full-screen background images with color overlay.
* 🎨 **Themes** — Six built-in themes or full custom styling.
* 🗂️ **Grouping** — Grid and list display modes per group.
* 📦 **Modules** — Time, DateTime Weather, Greeting, Custom HTML, IP API, OpenWeatherMap.
* 🏷️ **Tags** — Add tags to your services.
* 🌎 **Multi-language** — Automatic language detection with 10 locales.
* 👌 **Easy setup** — A few lines of YAML and your homepage is ready.
* 🚀 **Fast** — Powered by Nuxt 3 — everything is snappy.
* 🐳 **Docker** — Optimised container images with example config on first run.
* ✨ **Free & open source** — MIT licensed.
* 📲 **PWA** — Installable as a progressive web app.
* 🛠️ **[Config Builder](https://config.maflplus.eu/)** — Visual editor for creating and editing your `config.yml` — no server required.

## 🚀 Getting started

### Docker

The image is published to the **GitHub Container Registry**.

```yaml
services:
  mafl:
    image: ghcr.io/r0gger/maflplus
    restart: unless-stopped
    ports:
      - '3000:3000'
    volumes:
      - ./mafl/:/app/data/
    environment:
      # Admin panel: generate hash with: 
      # docker run --rm -e generate=password_hash --pull=always ghcr.io/r0gger/maflpass <your_password>
      - NUXT_ADMIN_PASSWORD_HASH=
      # Session encryption key (min 32 chars, random string)
      # docker run --rm -e generate=session_password --pull=always ghcr.io/r0gger/maflpass
      - NUXT_SESSION_PASSWORD=
```

Place your [config.yml](.example/config.yml) (and optional background images) inside the `./mafl/` directory. On first run, if no `config.yml` exists, an example configuration is automatically created for you.

### maflpass

[**maflpass**](https://github.com/R0GGER/maflpass) is a lightweight Docker utility for generating the secrets needed by the admin panel — no local Node.js or OpenSSL required.

**Generate the admin password hash:**

```bash
docker run --rm -e generate=password_hash --pull=always ghcr.io/r0gger/maflpass <your_password>
```

**Generate the session password:**

```bash
docker run --rm -e generate=session_password --pull=always ghcr.io/r0gger/maflpass
```

Paste the output into the corresponding environment variables in your `docker-compose.yml`.

## ⚙️ Configuration

All settings live in a single `config.yml` file inside the data volume.

### Layout

Control the responsive grid columns and spacing.

```yaml
layout:
  grid:
    small: 2      # ≥640px
    medium: 2     # ≥768px
    large: 3      # ≥1024px
    xlarge: 5     # ≥1280px
  list:
    small: 2
    medium: 3
    large: 4
    xlarge: 5
  spacing:
    group: 1.5rem
    item: 0.25rem
```

Column values range from `1` to `6`. The `list` key provides separate column settings for groups displayed as lists.

### Styles

Customise the appearance of category headers, service titles and descriptions.

```yaml
styles:
  category:
    color: '#ffffff'
    fontSize: 1.5rem
    fontWeight: 600
  title:
    color: '#ffffff'
    fontSize: 0.875rem
  description:
    color: '#cccccc'
    fontStyle: italic
```

Supported properties: `fontFamily`, `fontSize`, `fontWeight`, `fontStyle`, `textDecoration`, `color`.

### Logo

Display a logo in the top-left corner of the homepage. You can use an **image file** or a **text/letter logo**.

**Image logo** — place the file in your data volume (next to `config.yml`):

```yaml
logo: logo.png
```

**Text logo** — display a text string with full typographic control:

```yaml
logo:
  type: text
  text: "M+"
  fontSize: 1.5rem
  fontWeight: 700
  color: "#ffffff"
  backgroundColor: "#3b82f6"
  borderRadius: 0.5rem
  padding: 0.25rem 0.5rem
```

Supported image formats: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.svg`, `.avif`

### Background

Set a full-screen background image. Place the image file in your data volume (next to `config.yml`).

```yaml
background: background.jpg
```

Supported formats: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.svg`, `.avif`

#### Background overlay

Add a semi-transparent color layer over the background to improve readability.

```yaml
backgroundOverlay:
  color: '#000000'
  opacity: 0.5
```

| Property  | Description | Default |
|-----------|-------------|---------|
| `color`   | Any valid CSS color | `#000000` |
| `opacity` | `0` (transparent) – `1` (opaque) | `0.5` |

### Tabs

Split your services across multiple tabs. Each tab has a name, an optional icon and its own set of service groups.

```yaml
tabs:
  - name: Personal
    icon: mdi:home
    services:
      Favorites:
        display: grid
        items:
          - title: GitHub
            link: https://github.com
            icon:
              name: simple-icons:github
              wrap: true
      News:
        display: list
        items:
          - title: Hacker News
            link: https://news.ycombinator.com
            icon:
              favicon: news.ycombinator.com
  - name: Work
    icon: mdi:briefcase
    locked: true
    services:
      Tools:
        display: list
        items:
          - title: Grafana
            link: https://grafana.local
            icon:
              name: simple-icons:grafana
              color: '#f46800'
```

When `tabs` is defined the top-level `services` key is ignored. Add `locked: true` to protect a tab from accidental deletion. Add `hidden: true` to hide a tab from the frontpage while keeping it in the config (editable in admin).

### Search

A search bar is displayed at the top of every page. It filters bookmarks across all tabs as you type and offers web search when no match is found.

```yaml
searchProvider: google
```

Values: `google`, `duckduckgo` — Default: `google`

**Keyboard shortcuts:**
| Key | Action |
|-----|--------|
| `/` | Focus the search bar |
| `Ctrl+K` / `Cmd+K` | Focus the search bar |
| `↑` / `↓` | Navigate results |
| `Enter` | Open selected result |
| `Escape` | Clear / close |

### Display modes

Each service group can be rendered as a **grid** (cards with icon, title and description) or a **list** (compact rows).

```yaml
services:
  Favorites:
    display: grid
    items:
      - title: Home Assistant
        description: Home automation
        link: https://ha.local
        icon:
          name: simple-icons:homeassistant
          wrap: true
          color: '#3dbcf3'
  Monitoring:
    display: list
    items:
      - title: Grafana
        link: https://grafana.local
        icon:
          name: simple-icons:grafana
          color: '#f46800'
```

### Favicon API

Automatically fetch service icons by domain name using a favicon API. Set the base URL globally:

```yaml
faviconApi: https://favicon.vemetric.com/
```

Then reference a domain in any service icon:

```yaml
icon:
  favicon: github.com
```

Favicons are cached server-side (7 days per domain) for performance and privacy.

### Status indicator

Enable a live ping indicator per service. The position can be set to `left` or `right` (default).

```yaml
- title: Home Assistant
  link: https://ha.local
  status:
    enabled: true
    position: left
    animation: true
```

### Footer

Display content at the bottom of every page.

```yaml
footer:
  text: "© 2026 My Dashboard"
  html: '<p>Powered by <a href="https://github.com/R0GGER/maflplus">MAFL+</a></p>'
```

## 🛡️ Admin Panel

A built-in visual config editor at `/admin` for editing your `config.yml` directly from the browser. Changes are saved and applied instantly.

**Features:**
* Global settings, layout, styles, tabs, tags and per-item editing
* Tab lock — protect tabs from accidental deletion
* Collapsible tabs for easier navigation
* Reorder groups and items with ▲/▼ buttons
* Auto-fill favicon domain from link URL
* Browse icons links (Iconify, emoji, selfh.st, dashboardicons)
* Module configuration (Time, DateTime Weather, Greeting, Custom HTML, IP API, OpenWeatherMap)
* Secure login with scrypt password hashing and encrypted sessions

**Setup:** generate secrets with [maflpass](#maflpass) and set the `NUXT_ADMIN_PASSWORD_HASH` and `NUXT_SESSION_PASSWORD` environment variables. See the [full documentation](docs/admin.md).

## 📊 Services

Services are the building blocks of your homepage. Each service can have a title, description, link, icon, status indicator, tags and an optional `span` for multi-column width.

Built-in service types:
* **Base** — Standard card with icon, title, description and optional status ping.
* **IP API** — Displays your public IP address information.
* **OpenWeatherMap** — Shows current weather for a given location.
* **Time** — Live clock with date for any IANA timezone.
* **DateTime Weather** — Combined clock and weather widget.
* **Greeting** — Custom greeting message with optional subtitle.
* **Custom HTML** — Render arbitrary HTML content (including scripts).

## 🖼 Icons

Services support multiple icon sources:

| Type | Description |
|------|-------------|
| [Iconify](https://icon-sets.iconify.design/) | 200,000+ open-source vector icons (e.g. `simple-icons:github`, `mdi:home`) |
| Emoji | Any valid emoji character |
| URL | Direct URL to an image |
| Local | Image file stored in the data volume |
| Favicon | Auto-fetched via the configured [favicon API](#favicon-api) by domain name |

## 🎨 Themes

Six built-in themes: `system`, `light`, `dark`, `deep`, `sepia`, `bluer`.

```yaml
theme: dark
```

## 🌎 Multi-language

The app detects your browser language automatically. Override it in `config.yml`:

```yaml
lang: en
```

Supported languages: `en`, `ru`, `zh`, `hi`, `es`, `ar`, `pl`, `fr`, `de`, `gr`

## 🛠 Config Builder

A standalone visual tool for creating and editing your `config.yml` - no server or dependencies required.

**Open** the [Config Builder](https://config.maflplus.eu/) in your browser.

Features:
* Edit all global settings (title, language, theme, background, search, footer, etc.)
* Add and reorder tabs, groups and bookmarks
* Configure icons (favicon, URL or Iconify name with color)
* Configure modules (Time, DateTime Weather, Greeting, Custom HTML, IP API, OpenWeatherMap)
* Grid span setting per service item
* Import an existing `config.yml` to modify it
* Live YAML preview with one-click copy to clipboard
* Light and dark theme

## 📒 Wiki
A step-by-step guide covering installation, configuration (layout, styles, backgrounds, tabs, search), icon types, and service tags: [wiki.maflplus.eu](https://wiki.maflplus.eu)

## 📄 License

This project is open-source software licensed under the [MIT license](LICENSE).

Based on [hywax/mafl](https://github.com/hywax/mafl) — thank you to the original author and all contributors.
