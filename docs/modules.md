# Modules

MAFL+ includes several built-in service modules that can be added to your dashboard via `config.yml`. Each module is configured using `type` and optional `options`.

## Table of Contents

* [Overview](#overview)
* [Time](#time)
* [Datetime Weather](#datetime-weather)
* [OpenWeatherMap](#openweathermap)
* [IP API](#ip-api)
* [Greeting](#greeting)
* [Custom HTML](#custom-html)
* [Grid Span](#grid-span)
* [Date Formats](#date-formats)

---

## Overview

| Module | Type | Description |
|--------|------|-------------|
| [Time](#time) | `time` | Live clock with date for any IANA timezone |
| [Datetime Weather](#datetime-weather) | `datetime-weather` | Combined clock and weather widget (OpenWeatherMap) |
| [OpenWeatherMap](#openweathermap) | `openweathermap` | Current weather for a given location |
| [IP API](#ip-api) | `ip-api` | Public IP address information with country flag |
| [Greeting](#greeting) | `greeting` | Custom greeting message with optional subtitle |
| [Custom HTML](#custom-html) | `custom-html` | Render arbitrary HTML content (including scripts) |

All modules support common service properties like `span`, `icon` and `tags`. See [Configuration](configuration.md#service-item-properties) for the full list.

---

## Time

Displays a live clock with the current time and date for a specific timezone.

> **Backward compatibility:** `type: timezone` is accepted as an alias for `type: time`.

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `timezone` | `string` | *required* | IANA timezone identifier (e.g. `Europe/Amsterdam`, `America/New_York`) |
| `locationName` | `string` | value of `timezone` | Display name shown in the widget |
| `country` | `string` | — | Two-letter country code for a flag icon (e.g. `nl`, `us`). If omitted, a clock icon is shown. |
| `timeFormat` | `string` | `24h` | Time format: `24h` or `12h` |
| `dateFormat` | `string` | `medium` | Date format (see [Date Formats](#date-formats)) |

### Examples

#### Basic usage

```yaml
services:
  - type: time
    options:
      timezone: Europe/Amsterdam
```

#### With flag icon and EU date format

```yaml
services:
  - type: time
    options:
      timezone: Europe/Amsterdam
      locationName: Amsterdam
      country: nl
      dateFormat: eu
      timeFormat: 24h
```

#### Multiple time widgets

```yaml
services:
  - type: time
    options:
      timezone: Europe/Amsterdam
      country: nl
  - type: time
    options:
      timezone: America/New_York
      country: us
      timeFormat: 12h
  - type: time
    options:
      timezone: Asia/Tokyo
      country: jp
```

---

## Datetime Weather

Combines a live clock with weather data from [OpenWeatherMap](https://openweathermap.org/). Requires an API key.

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `lat` | `number` | *required* | Latitude of the location |
| `lon` | `number` | *required* | Longitude of the location |
| `timezone` | `string` | *required* | IANA timezone identifier |
| `units` | `string` | `metric` | Temperature units: `metric`, `imperial`, or `standard` |
| `timeFormat` | `string` | `24h` | Time format: `24h` or `12h` |
| `dateFormat` | `string` | `medium` | Date format (see [Date Formats](#date-formats)) |

### Secrets

| Secret | Type | Description |
|--------|------|-------------|
| `apiKey` | `string` | OpenWeatherMap API key ([get one here](https://home.openweathermap.org/api_keys)) |

### Examples

#### Basic usage

```yaml
services:
  - type: datetime-weather
    options:
      lat: 52.370216
      lon: 4.895168
      timezone: Europe/Amsterdam
    secrets:
      apiKey: your-api-key
```

#### With EU date format and metric units

```yaml
services:
  - type: datetime-weather
    options:
      lat: 52.370216
      lon: 4.895168
      timezone: Europe/Amsterdam
      units: metric
      dateFormat: eu
      timeFormat: 24h
    secrets:
      apiKey: your-api-key
```

---

## OpenWeatherMap

Displays the current weather for a given location using [OpenWeatherMap](https://openweathermap.org/). Shows temperature and weather condition. Requires an API key.

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `lat` | `number` | *required* | Latitude of the location |
| `lon` | `number` | *required* | Longitude of the location |
| `units` | `string` | `metric` | Temperature units: `metric` (°C), `imperial` (°F), or `standard` (K) |

### Secrets

| Secret | Type | Description |
|--------|------|-------------|
| `apiKey` | `string` | OpenWeatherMap API key ([get one here](https://home.openweathermap.org/api_keys)) |

### Examples

#### Basic usage

```yaml
services:
  - type: openweathermap
    options:
      lat: 52.370216
      lon: 4.895168
      units: metric
    secrets:
      apiKey: your-api-key
```

#### Imperial units

```yaml
services:
  - type: openweathermap
    options:
      lat: 40.712776
      lon: -74.005974
      units: imperial
    secrets:
      apiKey: your-api-key
```

---

## IP API

Shows information about your public IP address, including a country flag icon based on your location.

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `locationName` | `string` | — | Custom location name to display. When omitted, the location is auto-detected from the IP address. |
| `flagIcon` | `boolean` | `true` | Show the country flag icon. When `false`, the configured icon is used instead. |

### Examples

#### Basic usage

```yaml
services:
  - type: ip-api
```

#### With custom location name

```yaml
services:
  - type: ip-api
    options:
      locationName: Home Office
```

#### With custom icon instead of flag

```yaml
services:
  - type: ip-api
    options:
      flagIcon: false
    icon:
      name: oui:token-ip
```

---

## Greeting

Displays a custom greeting message on your dashboard.

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `text` | `string` | *required* | Main greeting text |
| `subtitle` | `string` | — | Secondary text shown below the greeting |

### Examples

#### Basic usage

```yaml
services:
  - type: greeting
    options:
      text: Hello R0GGER!
      subtitle: Welcome to your dashboard!
```

#### With custom icon

```yaml
services:
  - type: greeting
    icon:
      name: mdi:home
    options:
      text: Welcome Home
      subtitle: Have a great day
```

---

## Custom HTML

Renders custom HTML content inside a service card. Useful for embedding widgets, links, analytics snippets or tracking pixels.

`<script>` tags are fully supported and will execute correctly.

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `html` | `string` | *required* | HTML content to render (including `<script>` tags) |
| `hidden` | `boolean` | `false` | When `true`, the card is invisible (HTML is still rendered) |

### Examples

#### Visible card with custom content

```yaml
services:
  - type: custom-html
    title: Links
    options:
      html: '<a href="https://example.com" style="color:white;">Visit Example</a>'
```

#### Hidden (e.g. for tracking pixels or analytics)

```yaml
services:
  - type: custom-html
    options:
      hidden: true
      html: '<img src="https://analytics.example.com/pixel.gif" />'
```

#### Embedded script

```yaml
services:
  - type: custom-html
    options:
      hidden: true
      html: '<script src="https://example.com/widget.js"></script>'
```

---

## Grid Span

By default every module occupies a single column in the grid. With the `span` property you can make a module stretch across multiple columns, giving wider widgets like clocks or weather more room to breathe.

```yaml
services:
  Widgets:
    display: grid
    items:
      - type: datetime-weather
        span: 2
        options:
          lat: 52.370216
          lon: 4.895168
          timezone: Europe/Amsterdam
        secrets:
          apiKey: your-api-key
      - type: time
        span: 1
        options:
          timezone: America/New_York
          country: us
```

| Value | Behaviour |
|-------|-----------|
| `1` | Default — occupies one grid column |
| `2` | Spans two columns — useful for datetime-weather, greeting or custom-html widgets that benefit from extra width |
| `3` | Spans three columns — useful for wide custom-html embeds or a prominent greeting |

The maximum useful value depends on how many columns your [layout](configuration.md#layout) defines at the current breakpoint. A span larger than the column count will simply fill the entire row.

`span` is not limited to modules — it works on any service item (bookmarks, links, etc.).

---

## Date Formats

The `time` and `datetime-weather` modules support a `dateFormat` option. The date language is determined by the `lang` setting in your `config.yml`.

| Format | Example (EN) | Example (NL) |
|--------|--------------|--------------|
| `short` | 5/16/2026 | 16-5-2026 |
| `medium` | May 16, 2026 | 16 mei 2026 |
| `long` | Saturday, May 16, 2026 | zaterdag 16 mei 2026 |
| `eu` | Sat 16 May 2026 | za 16 mei 2026 |
| `compact` | Sat 16 May | za 16 mei |
| `short-eu` | 16-05-2026 | 16-05-2026 |
| `iso` | 2026-05-16 | 2026-05-16 |
