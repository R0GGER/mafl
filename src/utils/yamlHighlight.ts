function esc(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function highlightValue(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return esc(value)

  if (/^["'].*["']$/.test(trimmed))
    return `<span class="yl-str">${esc(value)}</span>`
  if (/^(true|false)$/i.test(trimmed))
    return `<span class="yl-bool">${esc(value)}</span>`
  if (/^(null|~)$/i.test(trimmed))
    return `<span class="yl-null">${esc(value)}</span>`
  if (/^-?(\d+\.?\d*|\.\d+)$/.test(trimmed))
    return `<span class="yl-num">${esc(value)}</span>`

  return `<span class="yl-str">${esc(value)}</span>`
}

export function highlightYaml(yaml: string): string {
  return yaml.split('\n').map((line) => {
    if (!line.trim()) return ''

    if (/^\s*#/.test(line)) {
      const m = line.match(/^(\s*)(#.*)$/)!
      return `${m[1]}<span class="yl-comment">${esc(m[2])}</span>`
    }

    const kv = line.match(/^(\s*)(- )?(\S[^:]*?)(:)(?: (.*))?$/)
    if (kv) {
      const [, indent, dash, key, colon, value] = kv
      let out = esc(indent)
      if (dash) out += `<span class="yl-punct">${esc(dash)}</span>`
      out += `<span class="yl-key">${esc(key)}</span><span class="yl-punct">${colon}</span>`
      if (value !== undefined) out += ` ${highlightValue(value)}`
      return out
    }

    const list = line.match(/^(\s*)(- )(.+)$/)
    if (list)
      return `${esc(list[1])}<span class="yl-punct">${esc(list[2])}</span>${highlightValue(list[3])}`

    const dashOnly = line.match(/^(\s*)(-)(\s*)$/)
    if (dashOnly)
      return `${esc(dashOnly[1])}<span class="yl-punct">-</span>${dashOnly[3]}`

    return esc(line)
  }).join('\n')
}
