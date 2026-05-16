# Mafl+ Wiki

**Mafl+** is a minimalistic and flexible homepage dashboard, forked from [hywax/mafl](https://github.com/hywax/mafl) with extended layout options, search, tabs and more.

> **Note** — This is an independent fork. It is **not** affiliated with the upstream [hywax/mafl](https://github.com/hywax/mafl) project.

![screenshot](screenshots/screenshot1.png)

## Key Features

* **Privacy** — All requests to third-party services happen server-side.
* **Real-time** — Interactive service cards with live status information.
* **Search** — Filter bookmarks instantly; fall back to Google or DuckDuckGo.
* **Tabs** — Organise services into switchable tabs.
* **Backgrounds** — Full-screen background images with color overlay.
* **Themes** — Six built-in themes or full custom styling.
* **Grid & List** — Two display modes per group with responsive columns.
* **Tags** — Add tags to your services.
* **Multi-language** — Automatic language detection with 10 locales.
* **Docker** — Optimised container images.
* **PWA** — Installable as a progressive web app.
* **Config Builder** — [Visual editor](https://config.maflplus.eu/) for creating and editing your `config.yml`.

## Quick Start

```yaml
services:
  mafl:
    image: ghcr.io/r0gger/maflplus
    restart: unless-stopped
    ports:
      - '3000:3000'
    volumes:
      - ./mafl/:/app/data/
```

Place your `config.yml` (and optional background images) inside the `./mafl/` directory.

## Wiki Pages

| Page | Description |
|------|-------------|
| [Configuration](configuration) | Layout, styles, logo, background, tabs, search, display modes, favicon API and status indicators |
| [Icons & Favicons](favicons) | Icon types: Iconify, emoji, URL, local images and favicon API |
| [Tags](tags) | Adding tags to services |
| [IP API](ip-api) | Built-in IP address information service |
| [OpenWeatherMap](openweathermap) | Built-in weather service |
| [Modules](modules) | Additional service modules |

## What's Different from Upstream?

| Area | What changed |
|------|-------------|
| **Grid layout** | Responsive grid with up to 6 columns (`small` / `medium` / `large` / `xlarge`) |
| **List layout** | Compact list display mode per group with its own column config |
| **Spacing** | Configurable spacing between groups and items |
| **Styles** | Per-element styling for category headers, titles and descriptions |
| **Logo** | Fixed responsive logo in the top-left corner |
| **Background** | Full-screen background image with optional color overlay |
| **Tabs** | Organise services into switchable tabs with icons |
| **Search** | Filter bookmarks across tabs; web search fallback (`/`, `Ctrl+K`) |
| **Favicon API** | Auto-fetch service icons by domain name |
| **Status position** | Align the status indicator to `left` or `right` |

## Links

* [GitHub Repository](https://github.com/R0GGER/mafl)
* [Config Builder](https://config.maflplus.eu/)
* [Docker Image](https://github.com/R0GGER/mafl/pkgs/container/maflplus)

## License

Open-source software licensed under the [MIT license](https://github.com/R0GGER/mafl/blob/main/LICENSE).
Based on [hywax/mafl](https://github.com/hywax/mafl).
