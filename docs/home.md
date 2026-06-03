# MAFL+ Wiki

**Mafl+** is a minimalistic and flexible homepage dashboard, forked from [hywax/mafl](https://github.com/hywax/mafl) with extended layout options, search, tabs and more.

**Demo: https://maflplus.eu**

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
    environment:
      # Admin panel: generate hash with: 
      # docker run --rm -e generate=password_hash --pull=always ghcr.io/r0gger/maflpass <your_password>
      - NUXT_ADMIN_PASSWORD_HASH=
      # Session encryption key (min 32 chars, random string)
      # docker run --rm -e generate=session_password --pull=always ghcr.io/r0gger/maflpass
      - NUXT_SESSION_PASSWORD=
```

Place your `config.yml` (and optional background images) inside the `./mafl/` directory.
On first run, if no `config.yml` exists, an example configuration is automatically created for you.

## maflpass

[**maflpass**](https://github.com/R0GGER/maflpass) is a lightweight Docker utility for generating the secrets needed by the Mafl+ admin panel. It removes the need for local Node.js or OpenSSL installations.

### Generate the admin password hash

```bash
docker run --rm -e generate=password_hash --pull=always ghcr.io/r0gger/maflpass <your_password>
```

This outputs a scrypt hash in the format `salt:derivedKey` (hex-encoded) that you paste into the `NUXT_ADMIN_PASSWORD_HASH` environment variable.

### Generate the session password

```bash
docker run --rm -e generate=session_password --pull=always ghcr.io/r0gger/maflpass
```

This outputs a random 64-character hex string (≥32 chars) that you paste into the `NUXT_SESSION_PASSWORD` environment variable.

### Why maflpass?

| Before | After |
|--------|-------|
| Required Node.js or OpenSSL installed locally | Single Docker command — no dependencies |
| Multiple steps to generate and format the hash | One command per secret |
| Easy to make formatting mistakes | Output is ready to copy-paste |

See [Admin Panel](admin.md) for full setup instructions.

## Wiki Pages

| Page                                 | Description                                                                                      |
| ------------------------------------ | ------------------------------------------------------------------------------------------------ |
| [Home](https://wiki.maflplus.eu)                              |  |
| [Getting Started](https://wiki.maflplus.eu/1-getting-started) | Lets go! |
| [Configuration](https://wiki.maflplus.eu/2-configuration)     | Layout, styles, logo, background, tabs, search, display modes, favicon API and status indicators |
| [Favicons](https://wiki.maflplus.eu/3-favicons)               | Icon types: Iconify, emoji, URL, local images and favicon API                                    |
| [Modules](https://wiki.maflplus.eu/4-modules)                 | Built-in widgets: Time, DateTime Weather, Greeting, Custom HTML, IP API                          |
| [Tags](https://wiki.maflplus.eu/5-tags)                       | Categorise services with colored labels                                                          |
| [Admin Panel](https://wiki.maflplus.eu/6-admin)               | Built-in config editor with secure login                                                         |

## What's Different from Upstream?

| Area | What changed |
|------|-------------|
| **Grid layout** | Responsive grid with up to 6 columns (`small` / `medium` / `large` / `xlarge`) |
| **List layout** | Compact list display mode per group with its own column config |
| **Spacing** | Configurable spacing between groups and items |
| **Styles** | Per-element styling for category headers, titles and descriptions |
| **Logo** | Fixed responsive logo (image or text/letter) in the top-left corner |
| **Background** | Full-screen background image with optional color overlay |
| **Tabs** | Organise services into switchable tabs with icons, lock protection and deep linking via URL hash |
| **Search** | Filter bookmarks across tabs; web search fallback (`/`, `Ctrl+K`) |
| **Favicon API** | Auto-fetch service icons by domain name with server-side proxy cache |
| **Status position** | Align the status indicator to `left` or `right` |
| **Admin Panel** | Built-in visual config editor at `/admin` |
| **Modules** | Time, DateTime Weather, Greeting, Custom HTML widgets |
| **Footer** | Global footer with text and/or HTML content |
| **Grid span** | Any service item can span multiple grid columns |

## Links

* [GitHub Repository](https://github.com/R0GGER/maflplus)
* [Config Builder](https://config.maflplus.eu/)
* [Docker Image](https://github.com/R0GGER/maflplus/pkgs/container/maflplus)
* [maflpass Utility](https://github.com/R0GGER/maflpass)

## License

Open-source software licensed under the [MIT license](https://github.com/R0GGER/maflplus/blob/main/LICENSE).
Based on [hywax/mafl](https://github.com/hywax/mafl).
