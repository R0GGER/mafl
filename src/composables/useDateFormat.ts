type DateFormatType = 'short' | 'medium' | 'long' | 'short-eu' | 'compact' | 'iso' | 'eu'

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`
}

function getDatePartsInTimezone(date: Date, timezone?: string) {
  const parts = new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: timezone,
  }).formatToParts(date)

  const year = parts.find(p => p.type === 'year')?.value || ''
  const month = parts.find(p => p.type === 'month')?.value || ''
  const day = parts.find(p => p.type === 'day')?.value || ''

  return { year, month, day }
}

export function useDateFormat(
  dateFormat: Ref<DateFormatType | undefined>,
  lang: Ref<string>,
  timezone: Ref<string | undefined>,
) {
  const format = computed(() => dateFormat.value || 'medium')

  const formatter = computed(() => {
    const tz = timezone.value
    const l = lang.value

    switch (format.value) {
      case 'short':
        return new Intl.DateTimeFormat(l, {
          month: 'numeric', day: 'numeric', year: 'numeric', timeZone: tz,
        })
      case 'medium':
        return new Intl.DateTimeFormat(l, {
          month: 'short', day: 'numeric', year: 'numeric', timeZone: tz,
        })
      case 'long':
        return new Intl.DateTimeFormat(l, {
          weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: tz,
        })
      case 'compact':
        return new Intl.DateTimeFormat(l, {
          weekday: 'short', day: 'numeric', month: 'short', timeZone: tz,
        })
      case 'eu':
        return new Intl.DateTimeFormat(l, {
          weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: tz,
        })
      default:
        return null
    }
  })

  function getPartsInTimezone(date: Date, opts: Intl.DateTimeFormatOptions) {
    const parts = new Intl.DateTimeFormat(lang.value, { ...opts, timeZone: timezone.value }).formatToParts(date)
    return Object.fromEntries(parts.map(p => [p.type, p.value]))
  }

  function formatDate(date: Date): string {
    if (format.value === 'iso') {
      const { year, month, day } = getDatePartsInTimezone(date, timezone.value)
      return `${year}-${month}-${day}`
    }

    if (format.value === 'short-eu') {
      const { year, month, day } = getDatePartsInTimezone(date, timezone.value)
      return `${day}-${month}-${year}`
    }

    if (format.value === 'eu') {
      const p = getPartsInTimezone(date, {
        weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
      })
      return `${p.weekday} ${p.day} ${p.month} ${p.year}`
    }

    return formatter.value?.format(date) || ''
  }

  return { formatDate }
}
