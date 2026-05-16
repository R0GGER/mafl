# Modules

MAFL+ includes several built-in service modules that can be added to your dashboard via `config.yml`. Each module is configured using `type` and optional `options`.

## Timezone

Displays a live clock with the current time and date for a specific timezone.

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `timezone` | `string` | *required* | IANA timezone identifier (e.g. `Europe/Amsterdam`, `America/New_York`) |
| `locationName` | `string` | value of `timezone` | Display name shown in the widget |
| `country` | `string` | — | Two-letter country code for a flag icon (e.g. `nl`, `us`). If omitted, a clock icon is shown. |
| `timeFormat` | `string` | `24h` | Time format: `24h` or `12h` |
| `dateFormat` | `string` | `medium` | Date format (see [Date formats](#date-formats)) |

### Examples

#### Basic usage

```yaml
services:
  - type: timezone
    options:
      timezone: Europe/Amsterdam
```

#### With flag icon and EU date format

```yaml
services:
  - type: timezone
    options:
      timezone: Europe/Amsterdam
      locationName: Amsterdam
      country: nl
      dateFormat: eu
      timeFormat: 24h
```

#### Multiple timezones

```yaml
services:
  - type: timezone
    options:
      timezone: Europe/Amsterdam
      country: nl
  - type: timezone
    options:
      timezone: America/New_York
      country: us
      timeFormat: 12h
  - type: timezone
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
| `dateFormat` | `string` | `medium` | Date format (see [Date formats](#date-formats)) |

### Date Formats

The `timezone` and `datetime-weather` modules support a `dateFormat` option. Available formats:

| Format     | Example (EN)           | Example (NL)         |
| ---------- | ---------------------- | -------------------- |
| `short`    | 5/16/2026              | 16-5-2026            |
| `medium`   | May 16, 2026           | 16 mei 2026          |
| `long`     | Saturday, May 16, 2026 | zaterdag 16 mei 2026 |
| `eu`       | Sat 16 May 2026        | za 16 mei 2026       |
| `compact`  | Sat 16 May             | za 16 mei            |
| `short-eu` | 16-05-2026             | 16-05-2026           |
| `iso`      | 2026-05-16             | 2026-05-16           |

The date language is determined by the `lang` setting in your `config.yml`.

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

#### With Medium date format and Metric units

```yaml
services:
  - type: datetime-weather
    options:
      lat: 52.370216
      lon: 4.895168
      timezone: Europe/Amsterdam
      units: metric
      dateFormat: medium
      timeFormat: 24h
    secrets:
      apiKey: your-api-key
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

Renders custom HTML content inside a service card. Useful for embedding widgets, links, or tracking pixels.

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `html` | `string` | *required* | HTML content to render |
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

#### Hidden (e.g. for tracking pixels)

```yaml
services:
  - type: custom-html
    options:
      hidden: true
      html: '<img src="https://analytics.example.com/pixel.gif" />'
```

---

## IP API

Shows information about your IP address, including a country flag icon based on your location.

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `flagIcon` | `boolean` | `true` | Show the country flag icon. When `false`, the configured icon is used instead. |

### Examples

#### Basic usage

```yaml
services:
  - type: ip-api
```

#### With custom icon

```yaml
services:
  - type: ip-api
    options:
      flagIcon: false
    icon:
      name: oui:token-ip
```

---

## Grid Span

Any service item can span multiple grid columns using the `span` property:

```yaml
services:
  - type: timezone
    span: 2
    options:
      timezone: Europe/Amsterdam
```

This works for all service types, not just modules.

---

## Footer

The footer is a global configuration option (not a service module). It displays content at the bottom of the page.

```yaml
footer:
  text: "© 2026 MAFL+"
  html: '<p>Powered by <a href="https://github.com/R0GGER/mafl" style="color:white;">MAFL+</a></p>'
```

| Option | Type | Description |
|--------|------|-------------|
| `text` | `string` | Plain text displayed in the footer |
| `html` | `string` | Custom HTML content rendered in the footer |

Both fields are optional. The footer is only shown when at least one is configured.
