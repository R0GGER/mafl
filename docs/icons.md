# Icons



## Link

Link to the image. You can specify both external and internal links.

```yaml
url: icons/example.svg
```

## Name

Icon name from [iconify](https://icon-sets.iconify.design/) or [emoji](https://getemoji.com/).

```yaml
name: simple-icons:homeassistant
```

## Wrap

Wraps the icon in a bubble, necessary if the icon has no background or indentation on the sides.

```yaml
wrap: true
```

## Color

Icon color. You can specify any value from [css](https://developer.mozilla.org/ru/docs/Web/CSS/color_value).

```yaml
color: '#3dbcf3'
```

## Favicon

Using [Favicon API](https://github.com/vemetric/favicon-api/tree/main/) to grap and embed icons. Add the public url or selfhosted url to config.yml

```yaml
faviconApi: https://favicon.vemetric.com/
```

Icon:

```yaml
favicon: youtube.com
```

## Background

Icon background. You can specify any value from [css](https://developer.mozilla.org/ru/docs/Web/CSS/background).

```yaml
background: '#eee'
```

## Examples

### Emoji

```yaml
services:
  - title: Home Assistant
    description: Home automation
    link: https://home-assistant.home.local/
    icon:
      name: 👋
```

### Iconify

```yaml
services:
  - title: Home Assistant
    description: Home automation
    link: https://home-assistant.home.local/
    icon:
      name: simple-icons:homeassistant
```

### Favicon API

```yaml
services:
  - title: Home Assistant
    description: Home automation
    link: https://home-assistant.home.local/
    icon:
      favicon: home-assistant.io
```

### Local icons

```yaml
services:
  - title: Home Assistant
    description: Home automation
    link: https://home-assistant.home.local/
    icon:
      url: icons/example.svg
```

### External link

```yaml
services:
  - title: Home Assistant
    description: Home automation
    link: https://home-assistant.home.local/
    icon:
      url: https://cdn.jsdelivr.net/gh/selfhst/icons@main/svg/home-assistant.svg
```
