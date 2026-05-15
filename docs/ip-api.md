# IP API 

Shows information about your IP address.

## Flag icon

Icon of the country flag where your IP address is located. If you set `false`, the choosen icon (type) will be used.

```yaml
options:
  flagIcon: true
```

Values: `true`, `false`

Default: `true`

## Examples

### Base service

::: code-group
```yaml [config.yml]
services:
  - type: ip-api
```
:::

### Custom icon

::: code-group
```yaml [config.yml]
services:
  - type: ip-api
    options:
      flagIcon: false
    icon:
      name: oui:token-ip
```
:::
