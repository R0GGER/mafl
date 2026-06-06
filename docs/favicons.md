# Favicons

## Table of Contents

- [Service Icons](#service-icons)
  - [Icon configuration](#icon-configuration)
- [Favicon API](#favicon-api)
  - [Self-hosted Favicon API](#self-hosted-favicon-api)
  - [Server-side proxy cache](#server-side-proxy-cache)
- [Custom App Favicons (PWA)](#custom-app-favicons-pwa)
  - [Logo creation](#logo-creation)
  - [Mount the favicons volume](#mount-the-favicons-volume)


## Service Icons

MAFL+ supports multiple icon sources for services:

| Type | Description | Example |
|------|-------------|---------|
| [Iconify](https://icon-sets.iconify.design/) | 200,000+ open-source vector icons | `name: simple-icons:github` |
| Emoji | Any valid emoji character | `name: 🏠` |
| URL | Direct URL to an image | `url: https://cdn.example.com/icon.svg` |
| Local | Image file stored in the data volume | `url: /api/assets/icon.png` |
| Favicon | Auto-fetched by domain name via the configured favicon API | `favicon: github.com` |

### Icon configuration

```yaml
icon:
  name: simple-icons:github    # Iconify name or emoji
  color: '#ffffff'             # Icon color (Iconify only)
  wrap: true                   # Show background circle
```

```yaml
icon:
  url: https://cdn.jsdelivr.net/gh/selfhst/icons@main/svg/proton.svg
  wrap: true
```

```yaml
icon:
  favicon: github.com
```

## Favicon API

Set a global favicon API base URL in your `config.yml`. When a service uses `icon.favicon`, the domain is passed to this API to fetch the icon automatically.

```yaml
faviconApi: https://favicon.vemetric.com/
```

Then reference a domain in any service:

```yaml
icon:
  favicon: github.com
```

### Self-hosted Favicon API

Instead of using the default public API, you can run your own instance of the [Favicon API](https://github.com/vemetric/favicon-api) using Docker:

```yaml
services:
  favicon-api:
    image: vemetric/favicon-api
    restart: unless-stopped
    ports:
      - '3003:3000'
```

Once running, update `faviconApi` in your `config.yml` (or via the config-builder) to point to your own instance:

```yaml
faviconApi: http://favicon-api:3003
```

> If both containers share the same Docker network you can use the service name (`favicon-api`) as hostname. Otherwise use the host IP/domain and the mapped port (e.g. `http://192.168.1.100:3003/`).

You can also expose the API via a reverse proxy such as [Caddy](https://caddyserver.com/):

```text
favicon-api.your-domain.tld {
    reverse_proxy favicon-api:3003
}
```

Then set `faviconApi` to the public URL:

```yaml
faviconApi: https://favicon-api.your-domain.tld/
```

See the [Favicon API Quick Start](https://github.com/vemetric/favicon-api#quick-start) for all configuration options and deployment methods.

### Server-side proxy cache

Favicon requests are proxied through the MAFL+ server with disk caching. The external favicon API is called only once per domain per 7 days. Benefits:

- **Privacy** — The client never contacts the favicon API directly
- **Performance** — Cached favicons are served instantly from disk
- **Offline support** — Favicons are cached by the Service Worker for offline access
- **Reduced API calls** — Each domain is fetched only once per week

The cache is stored in `./data/.favicon-cache/` inside the container.

## Custom App Favicons (PWA)

If you want to personalize the app icon (shown in browser tabs and when installed as a PWA), you can mount a custom favicons folder.

### Logo creation

Create an SVG or PNG icon (at the highest possible resolution) and use [Favicon Generator](https://realfavicongenerator.net/) to create a favicon package.

Once generated, download the ZIP and use the `android-*` icons for `pwa-*`:
* `android-chrome-192x192.png` → `pwa-192x192.png`
* `android-chrome-512x512.png` → `pwa-512x512.png`
* `apple-touch-icon.png`
* `favicon.ico`

### Mount the favicons volume

Add the volume to your `docker-compose.yml`:

```yaml
services:
  mafl:
    image: ghcr.io/r0gger/maflplus
    restart: unless-stopped
    ports:
      - '3000:3000'
    volumes:
      - ./mafl/:/app/data/
      - ./mafl/favicons:/app/public/favicons
```

File structure:

```text
./mafl/favicons/
├── apple-touch-icon.png
├── favicon.ico
├── pwa-192x192.png
└── pwa-512x512.png
```
