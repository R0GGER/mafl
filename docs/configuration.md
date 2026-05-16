# Configuration (config.yml)

Services, icons, language and other settings are set in a single `config.yml` file.

### Config Builder
Prefer a visual editor? Open the [**Config Builder**](https://config.maflplus.eu/) in your browser to create or edit your `config.yml` without writing YAML by hand. It supports all settings documented below, imports existing config files and generates ready-to-paste YAML output.


## Title

You can customize the page header if you wish.

```yaml
title: MAFL+
```

Default: `MAFL+`

## Language

Set the desired language with:

```yaml
lang: en
```

Values: `en`, `ru`, `zh`, `hi`, `es`, `ar`, `pl`, `fr`, `de`, `gr`, `nl`

Default: `en`

## Theme

You can customize fixed themes by passing the `theme` option as shown below:

```yaml
theme: dark
```

Values: `system`, `light`, `dark`, `deep`, `sepia`, `bluer`

Default: `system`

## Logo

Display a logo in the top-left corner of the homepage. The image file must be placed in the data volume
(the same directory as `config.yml`). The logo is fixed-positioned and responsive — it scales automatically across mobile, tablet and desktop.

```yaml
logo: logo.png
```

Supported formats: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.svg`, `.avif`

Default: _none_

## Background

Display a background image on the homepage. The image file must be placed in the data volume
(the same directory as `config.yml`).

```yaml
background: background.jpg
```

Supported formats: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.svg`, `.avif`

Default: _none_

### Background overlay

Add a color overlay on top of the background image to improve text readability.
Only takes effect when `background` is set.

```yaml
background: background.jpg
backgroundOverlay:
  color: '#000000'
  opacity: 0.5
```

| Property  | Description                                | Default     |
|-----------|--------------------------------------------|-------------|
| `color`   | Any valid CSS color (hex, rgb, named, etc) | `#000000`   |
| `opacity` | Value between `0` (transparent) and `1` (opaque) | `0.5` |

## Styles

Customize the font family, size, weight, style, decoration and color for category headers,
service titles and service descriptions.

```yaml
styles:
  category:
    fontFamily: 'Arial, sans-serif'
    fontSize: 1.5rem
    fontWeight: bold
    fontStyle: normal
    textDecoration: none
    color: '#ffffff'
  title:
    fontSize: 1.1rem
    fontWeight: 600
    color: '#ffffff'
  description:
    fontSize: 0.8rem
    fontStyle: italic
    color: '#cccccc'
```

All three elements (`category`, `title`, `description`) support the same properties:

| Property         | Description          | Examples                                   |
|------------------|----------------------|--------------------------------------------|
| `fontFamily`     | Font family          | `'Arial, sans-serif'`, `'Georgia, serif'`  |
| `fontSize`       | Font size            | `1.5rem`, `18px`, `1.2em`                  |
| `fontWeight`     | Font weight          | `bold`, `normal`, `600`, `lighter`          |
| `fontStyle`      | Font style           | `italic`, `normal`                         |
| `textDecoration` | Text decoration      | `underline`, `line-through`, `none`         |
| `color`          | Text color           | `'#ffffff'`, `'rgb(255,255,255)'`           |

All properties are optional — only specify what you want to customize.

Default: _inherits from theme_

## Check updates (watchtower)

Run once: check, update, and when finished remove the Watchtower container.
```bash
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock --pull=always nickfedor/watchtower --run-once --cleanup
```

## Behaviour

A group of parameters responsible for the behavior of the application.

### Target

Browser behavior when the service is clicked.
With this property, you can make the service open in the current or a new window.

Values:

| Value     | Description                                                                                                                     |
|-----------|---------------------------------------------------------------------------------------------------------------------------------|
| `_blank`  | Usually a new tab, but users can configure browsers to open a new window instead                                                |
| `_self`   | The current browsing context                                                                                                    |
| `_parent` | The parent browsing context of the current one. If no parent, behaves as `_self`                                                |
| `_top`    | The topmost browsing context (the "highest" context that's an ancestor of the current one). If no ancestors, behaves as `_self` |

Default: `_blank`

## Search

A search bar is displayed at the top of the page. It filters your bookmarks as you type and offers web search as a fallback. You can choose the preferred search engine:

```yaml
searchProvider: google
```

Values: `google`, `duckduckgo`

Default: `google`

**Keyboard shortcuts:**
- Press `/` to focus the search bar
- Press `Ctrl+K` (or `Cmd+K` on macOS) to focus the search bar
- Press `Escape` to clear or close
- Use `Arrow Up` / `Arrow Down` to navigate results
- Press `Enter` to open the selected result

## Tags 

Tags allow you to differentiate between services.

```yaml
tags:
  - name: Home
    color: green
  - name: Work
    color: blue
```

More info in: Tags

## Layout

Controls the responsive column layout and spacing of the dashboard.

### Grid

Sets the number of columns for groups using `display: grid` at different screen widths.

```yaml
layout:
  grid:
    small: 2      # ≥640px
    medium: 2     # ≥768px
    large: 3      # ≥1024px
    xlarge: 5     # ≥1280px
```

Values: `1` – `6`

You can specify only the breakpoints you want to override; the rest will be set automatically.

### List

Sets the number of columns for groups using `display: list` at different screen widths.

```yaml
layout:
  list:
    small: 2      # ≥640px
    medium: 3     # ≥768px
    large: 4      # ≥1024px
    xlarge: 5     # ≥1280px
```

Values: `1` – `6`

Works exactly like `grid` above, but applies only to groups with `display: list`.

### Full example

```yaml
layout:
  grid:
    small: 2
    medium: 2
    large: 3
    xlarge: 5
  list:
    small: 2
    medium: 3
    large: 4
    xlarge: 5
  spacing:
    group: 1.5rem
    item: 0.25rem
```

### Spacing

Controls the vertical spacing between groups and the gap between items.

```yaml
layout:
  spacing:
    group: 1.5rem
    item: 0.25rem
```

| Property | Description                                      | Default   |
|----------|--------------------------------------------------|-----------|
| `group`  | Vertical padding around each category group      | `2.5rem`  |
| `item`   | Gap between items within a group                 | `0.5rem`  |

Any valid CSS unit works (`rem`, `px`, `em`, etc).

## Services

The `services` key is the main building block of your dashboard. It defines **groups** of **items** (bookmarks, links, modules) that are displayed on the homepage. Think of it as:

```
services
  └─ Group (e.g. "Favorites", "News", "Tools")
       └─ Item (a bookmark with title, link, icon, etc.)
```

There are three ways to structure your services, from simple to advanced.

### Flat (no groups)

A simple list without group headers — all items appear in a single unnamed section.

```yaml
services:
  - title: Home Assistant
    description: Home automation
    link: https://home-assistant.home.local/
  - title: Grafana
    link: https://grafana.home.local/
```

### Named groups

Organise items under named group headers. Each group name becomes a visible category title on the dashboard.

```yaml
services:
  Favorites:
    - title: Home Assistant
      description: Home automation
      link: https://home-assistant.home.local/
  Tools:
    - title: Grafana
      link: https://grafana.home.local/
```

### Groups with display mode

Each group can choose its own display mode: **grid** (larger cards) or **list** (compact rows). When using a `display` key, items must be nested under `items`:

```yaml
services:
  Favorites:
    display: grid
    items:
      - title: Home Assistant
        description: Home automation
        link: https://home-assistant.home.local/
        icon:
          name: simple-icons:homeassistant
          wrap: true
          color: '#3dbcf3'
  Tools:
    display: list
    items:
      - title: Portainer
        link: https://portainer.home.local/
        icon:
          name: simple-icons:portainer
      - title: Grafana
        link: https://grafana.home.local/
        icon:
          name: simple-icons:grafana
```

| Value  | Description                                              |
|--------|----------------------------------------------------------|
| `grid` | Cards with icon, title and description (default)         |
| `list` | Compact rows with small icon and title only              |

The column count for each mode is configured separately in the [Layout](#layout) section (`layout.grid` and `layout.list`).

> **Note** — The `services` key is required. Without it the homepage will not render.

## Demo: config.yml 

**Tab: Personal**
* 10 Favorites
* 10 Groups with each 5 listed items
* Weather

**Tab: Work**
* 5 Favorites
* 5 Groups with each 5 listed items

```yaml
title: bookmarks
lang: en
theme: dark
logo: logo.png
background: background1.jpg
faviconApi: https://favicon.vemetric.com/
backgroundOverlay:
  color: '#000000'
  opacity: 0.5

behaviour:
  target: _blank

searchProvider: google

layout:
  grid:
    small: 2
    medium: 2
    large: 3
    xlarge: 5
  spacing:
    group: 1.5rem
    item: 0.25rem

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

tabs:
  - name: Personal
    icon: mdi:home
    services:
      FAVORITES:
        display: grid
        items:
          - title: iperf3serverlist.net
            description: website
            link: https://iperf3serverlist.net
            icon:
              favicon: iperf3serverlist.net
              wrap: true
            status:
              enabled: true
          - title: Proton Mail
            description: mail.proton.me
            link: https://mail.proton.me
            icon:
              url: https://cdn.jsdelivr.net/gh/selfhst/icons@main/svg/proton.svg
              wrap: true
          - title: Proton Calendar
            description: calendar.proton.me
            link: https://calendar.proton.me
            icon:
              url: https://cdn.jsdelivr.net/gh/selfhst/icons@main/svg/proton-calendar.svg
              wrap: true
          - title: Google Drive
            description: drive.google.com
            link: https://drive.google.com
            icon:
              url: https://cdn.jsdelivr.net/gh/selfhst/icons@main/svg/google-drive.svg
              wrap: true
          - title: Gmail
            description: mail.google.com
            link: https://mail.google.com
            icon:
              url: https://cdn.jsdelivr.net/gh/selfhst/icons@main/svg/gmail.svg
              wrap: true
          - title: Bitwarden
            description: bitwarden.com
            link: https://vault.bitwarden.com
            icon:
              url: https://cdn.jsdelivr.net/gh/selfhst/icons@main/svg/bitwarden.svg
              wrap: true
          - title: YouTube
            description: youtube.com
            link: https://youtube.com
            icon:
              favicon: youtube.com
              wrap: true
          - title: Reddit
            description: reddit.com
            link: https://reddit.com
            icon:
              url: https://cdn.jsdelivr.net/gh/selfhst/icons@main/svg/reddit.svg
              wrap: true
          - title: GitHub
            description: github.com
            link: https://github.com
            icon:
              name: simple-icons:github
              wrap: true
          - title: Spotify
            description: open.spotify.com
            link: https://open.spotify.com
            icon:
              favicon: spotify.com
              wrap: true

      News:
        display: list
        items:
          - title: NOS
            link: https://nos.nl
            icon:
              favicon: nos.nl              
          - title: New York Times
            link: https://www.nytimes.com
            icon:
              favicon: nytimes.com              
          - title: Tweakers
            link: https://tweakers.net
            icon:
              url: https://favicon-3j1.pages.dev/favicon/tweakers.net?larger=true              
          - title: Ars Technica
            link: https://arstechnica.com
            icon:
              favicon: arstechnica.com
          - title: The Verge
            link: https://theverge.com
            icon:
              favicon: theverge.com

      Selfhost:
        display: list
        items:
          - title: selfh.st
            link: https://selfh.st
            icon:
              url: https://cdn.jsdelivr.net/gh/selfhst/icons@main/svg/selfh-st.svg
          - title: OS Alternatives
            link: https://osalt.com
            icon:
              favicon: osalt.com
          - title: Awesome Selfhosted
            link: https://awesome-selfhosted.net
            icon:
              favicon: awesome-selfhosted.net
          - title: NOTED
            link: https://noted.lol
            icon:
              favicon: noted.lol
          - title: Awesome Lists
            link: https://github.com/sindresorhus/awesome
            icon:
              name: mdi:format-list-bulleted
              color: '#ec4899'

      Financials:
        display: list
        items:
          - title: ABN AMRO
            link: https://abnamro.nl
            icon:
              favicon: abnamro.nl              
          - title: Rabo
            link: https://rabobank.nl
            icon:
              name: mdi:bank-outline
              color: '#f97316'
          - title: ONZV
            link: https://onzv.nl
            icon:
              url: https://www.onvz.nl/assets/favicons/apple-touch-icon.png
          - title: Kasboek
            link: https://kasboek.app
            icon:
              name: mdi:book-open-variant
              color: '#10b981'
          - title: Tikkie
            link: https://tikkie.me
            icon:
              favicon: tikkie.me

      Media:
        display: list
        items:
          - title: Plex
            link: https://plex.tv
            icon:
              favicon: plex.tv
          - title: Emby
            link: https://emby.media
            icon:
              favicon: emby.media
          - title: Jellyfin
            link: https://jellyfin.org
            icon:
              favicon: jellyfin.org
          - title: Calibre Web
            link: https://calibre-web.local
            icon:
              name: mdi:book-open-page-variant
              color: '#3b82f6'
          - title: Spotify
            link: https://open.spotify.com
            icon:
              favicon: spotify.com

      Search:
        display: list
        items:
          - title: SearXNG
            link: https://searx.local
            icon:
              name: mdi:magnify
              color: '#3b82f6'
          - title: Whoogle
            link: https://whoogle.local
            icon:
              name: mdi:google
              color: '#4285f4'
          - title: NZBHydra
            link: https://nzbhydra.local
            icon:
              name: mdi:cloud-search
              color: '#06b6d4'
          - title: Prowlarr
            link: https://prowlarr.local
            icon:
              name: mdi:radar
              color: '#f97316'
          - title: Jackett
            link: https://jackett.local
            icon:
              name: mdi:vpn
              color: '#000000'

      Download:
        display: list
        items:
          - title: Radarr
            link: https://radarr.local
            icon:
              name: mdi:movie-open
              color: '#ffc230'
          - title: Sonarr
            link: https://sonarr.local
            icon:
              name: mdi:television-classic
              color: '#3fc1f0'
          - title: Bazarr
            link: https://bazarr.local
            icon:
              name: mdi:subtitles
              color: '#a855f7'
          - title: SABnzbd
            link: https://sabnzbd.local
            icon:
              name: mdi:download-circle
              color: '#eab308'
          - title: qBittorrent
            link: https://qbit.local
            icon:
              name: simple-icons:qbittorrent
              color: '#2f67ba'

      Automation:
        display: list
        items:
          - title: Home Assistant
            link: https://ha.local
            icon:
              name: simple-icons:homeassistant
              color: '#18bcf2'
          - title: Node-RED
            link: https://nodered.local
            icon:
              name: simple-icons:nodered
              color: '#8f0000'
          - title: n8n
            link: https://n8n.local
            icon:
              name: simple-icons:n8n
              color: '#ea4b71'
          - title: Ansible
            link: https://ansible.local
            icon:
              name: simple-icons:ansible
              color: '#ee0000'
          - title: Cron Jobs
            link: https://cron.local
            icon:
              name: mdi:clock-outline
              color: '#64748b'

      Network:
        display: list
        items:
          - title: Proxy
            link: https://proxy.local
            icon:
              name: mdi:shield-half-full
              color: '#f97316'
          - title: Auth
            link: https://auth.local
            icon:
              name: mdi:lock
              color: '#6366f1'
          - title: UniFi
            link: https://unifi.local
            icon:
              name: mdi:access-point-network
              color: '#06b6d4'
          - title: pfSense
            link: https://pfsense.local
            icon:
              name: mdi:firewall
              color: '#212b6e'
          - title: NextDNS
            link: https://my.nextdns.io
            icon:
              name: mdi:dns
              color: '#5b7ff5'

      Security:
        display: list
        items:
          - title: Bitwarden
            link: https://bitwarden.local
            icon:
              name: simple-icons:bitwarden
              color: '#175ddc'
          - title: Authelia
            link: https://authelia.local
            icon:
              name: mdi:shield-key
              color: '#0f0f33'
          - title: CrowdSec
            link: https://crowdsec.local
            icon:
              name: mdi:shield-alert
              color: '#3b82f6'
          - title: Fail2ban
            link: https://fail2ban.local
            icon:
              name: mdi:shield-lock
              color: '#ef4444'
          - title: WireGuard
            link: https://wg.local
            icon:
              name: simple-icons:wireguard
              color: '#88171a'

      Productivity:
        display: list
        items:
          - title: Vikunja
            link: https://vikunja.local
            icon:
              name: mdi:check-all
              color: '#1db954'
          - title: Bookstack
            link: https://bookstack.local
            icon:
              name: mdi:bookshelf
              color: '#0288d1'
          - title: Wiki.js
            link: https://wiki.local
            icon:
              name: mdi:book-open-variant
              color: '#1976d2'
          - title: Outline
            link: https://outline.local
            icon:
              name: mdi:text-box-multiple
              color: '#6366f1'
          - title: Tandoor Recipes
            link: https://recipes.local
            icon:
              name: mdi:food-apple
              color: '#4caf50'

      WEATHER:
        display: grid
        items:
          - type: openweathermap
            options:
              lat: 52.370216
              lon: 4.895168
              units: metric
            secrets:
              apiKey: ****

  - name: Work
    icon: mdi:work
    services:
      FAVORITES:
        display: grid
        items:
          - title: Proton Mail
            description: mail.proton.me
            link: https://mail.proton.me
            icon:
              url: https://cdn.jsdelivr.net/gh/selfhst/icons@main/svg/proton.svg
              wrap: true
          - title: Proton Calendar
            description: calendar.proton.me
            link: https://calendar.proton.me
            icon:
              url: https://cdn.jsdelivr.net/gh/selfhst/icons@main/svg/proton-calendar.svg
              wrap: true
          - title: Google Drive
            description: drive.google.com
            link: https://drive.google.com
            icon:
              url: https://cdn.jsdelivr.net/gh/selfhst/icons@main/svg/google-drive.svg
              wrap: true
          - title: Gmail
            description: mail.google.com
            link: https://mail.google.com
            icon:
              url: https://cdn.jsdelivr.net/gh/selfhst/icons@main/svg/gmail.svg
              wrap: true
          - title: Bitwarden
            description: bitwarden.com
            link: https://vault.bitwarden.com
            icon:
              url: https://cdn.jsdelivr.net/gh/selfhst/icons@main/svg/bitwarden.svg
              wrap: true    
      Dev:
        display: list
        items:
          - title: Proxmox
            link: https://proxmox.local
            icon:
              name: simple-icons:proxmox
              color: '#e57000'
          - title: GitHub
            link: https://github.com
            icon:
              name: simple-icons:github
              color: '#ffffff'
          - title: Gitea
            link: https://gitea.local
            icon:
              name: simple-icons:gitea
              color: '#609926'
          - title: iperf3serverlist.net
            link: https://iperf3serverlist.net
            icon:
              favicon: iperf3serverlist.net
              color: '#13bee5'
          - title: Cloudflare
            link: https://dash.cloudflare.com
            icon:
              name: simple-icons:cloudflare
              color: '#f38020'

      Monitoring:
        display: list
        items:
          - title: Grafana
            link: https://grafana.local
            icon:
              name: simple-icons:grafana
              color: '#f46800'
          - title: Prometheus
            link: https://prometheus.local
            icon:
              name: simple-icons:prometheus
              color: '#e6522c'
          - title: Uptime Kuma
            link: https://uptime.local
            icon:
              name: simple-icons:uptimekuma
              color: '#5cdd8b'
          - title: Netdata
            link: https://netdata.local
            icon:
              name: mdi:chart-areaspline
              color: '#00c853'
          - title: Healthchecks
            link: https://healthchecks.local
            icon:
              name: mdi:heart-pulse
              color: '#ef4444'

      Storage:
        display: list
        items:
          - title: Nextcloud
            link: https://nextcloud.local
            icon:
              name: simple-icons:nextcloud
              color: '#0082c9'
          - title: MinIO
            link: https://minio.local
            icon:
              name: simple-icons:minio
              color: '#c72e49'
          - title: Synology
            link: https://nas.local
            icon:
              name: mdi:nas
              color: '#b5b5b6'
          - title: Paperless
            link: https://paperless.local
            icon:
              name: mdi:file-document-multiple
              color: '#17541f'
          - title: PhotoPrism
            link: https://photos.local
            icon:
              name: mdi:image-multiple
              color: '#9c27b0'

      DNS & Domains:
        display: list
        items:
          - title: Pi-hole
            link: https://pihole.local
            icon:
              name: simple-icons:pihole
              color: '#96060c'
          - title: AdGuard Home
            link: https://adguard.local
            icon:
              name: simple-icons:adguard
              color: '#68bc71'
          - title: Technitium
            link: https://dns.local
            icon:
              name: mdi:dns-outline
              color: '#0d47a1'
          - title: Traefik
            link: https://traefik.local
            icon:
              name: simple-icons:traefikproxy
              color: '#24a1c1'
          - title: Caddy
            link: https://caddy.local
            icon:
              name: mdi:server-security
              color: '#22d3ee'

      Communication:
        display: list
        items:
          - title: Matrix
            link: https://matrix.local
            icon:
              name: simple-icons:matrix
              color: '#0dbd8b'
          - title: Signal
            link: https://signal.org
            icon:
              name: simple-icons:signal
              color: '#3a76f0'
          - title: Slack
            link: https://slack.com
            icon:
              name: simple-icons:slack
              color: '#4a154b'
          - title: Discord
            link: https://discord.com
            icon:
              name: simple-icons:discord
              color: '#5865f2'
          - title: Mattermost
            link: https://mattermost.local
            icon:
              name: simple-icons:mattermost
              color: '#0058cc'


```



