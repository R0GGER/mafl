import { reactive, computed } from 'vue'
import yaml from 'yaml'

// --- Types ---

export type ServiceType = 'bookmark' | 'openweathermap' | 'ip-api' | 'time' | 'datetime-weather' | 'greeting' | 'custom-html'
export type IconType = 'favicon' | 'url' | 'name'

export interface BuilderItem {
  serviceType: ServiceType
  title: string
  description: string
  link: string
  target: string
  span: string
  iconType: IconType
  iconFavicon: string
  iconUrl: string
  iconName: string
  iconColor: string
  iconWrap: boolean
  statusEnabled: boolean
  tags: string[]
  // openweathermap
  owmLat: string
  owmLon: string
  owmUnits: string
  owmApiKey: string
  // ip-api
  ipapiLocationName: string
  ipapiFlagIcon: string
  // time
  tzTimezone: string
  tzLocationName: string
  tzCountry: string
  tzTimeFormat: string
  tzDateFormat: string
  // datetime-weather
  dtwLat: string
  dtwLon: string
  dtwUnits: string
  dtwApiKey: string
  dtwTimezone: string
  dtwTimeFormat: string
  dtwDateFormat: string
  // greeting
  greetText: string
  greetSubtitle: string
  // custom-html
  customHtml: string
  customHidden: boolean
}

export interface BuilderGroup {
  name: string
  display: 'grid' | 'list'
  items: BuilderItem[]
}

export interface BuilderTab {
  name: string
  icon: string
  locked: boolean
  groups: BuilderGroup[]
}

export interface BuilderTag {
  name: string
  color: string
}

export interface TextStyle {
  fontFamily: string
  fontSize: string
  fontWeight: string
  fontStyle: string
  textDecoration: string
  color: string
}

export type LogoType = 'none' | 'image' | 'text'

export interface BuilderState {
  title: string
  lang: string
  theme: string
  logoType: LogoType
  logoImage: string
  logoText: string
  logoFontSize: string
  logoFontWeight: string
  logoFontFamily: string
  logoColor: string
  logoBackgroundColor: string
  logoBorderRadius: string
  logoPadding: string
  background: string
  faviconApi: string
  overlayColor: string
  overlayOpacity: number
  target: string
  searchProvider: string
  gridSmall: number | null
  gridMedium: number | null
  gridLarge: number | null
  gridXlarge: number | null
  listSmall: number | null
  listMedium: number | null
  listLarge: number | null
  listXlarge: number | null
  spacingGroup: string
  spacingItem: string
  styles: {
    category: TextStyle
    title: TextStyle
    description: TextStyle
  }
  tags: BuilderTag[]
  tabs: BuilderTab[]
  footerText: string
  footerHtml: string
}

export const TAG_COLORS = [
  'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal',
  'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose',
]

function emptyTextStyle(): TextStyle {
  return { fontFamily: '', fontSize: '', fontWeight: '', fontStyle: '', textDecoration: '', color: '' }
}

function defaultState(): BuilderState {
  return {
    title: 'MAFL+',
    lang: 'en',
    theme: 'dark',
    logoType: 'none',
    logoImage: '',
    logoText: '',
    logoFontSize: '1.5rem',
    logoFontWeight: '700',
    logoFontFamily: '',
    logoColor: '#ffffff',
    logoBackgroundColor: '',
    logoBorderRadius: '',
    logoPadding: '',
    background: '',
    faviconApi: '',
    overlayColor: '#000000',
    overlayOpacity: 0.5,
    target: '_blank',
    searchProvider: 'google',
    gridSmall: 2,
    gridMedium: 2,
    gridLarge: 3,
    gridXlarge: 5,
    listSmall: 2,
    listMedium: 3,
    listLarge: 4,
    listXlarge: 5,
    spacingGroup: '1.5rem',
    spacingItem: '0.25rem',
    styles: {
      category: emptyTextStyle(),
      title: emptyTextStyle(),
      description: emptyTextStyle(),
    },
    tags: [],
    tabs: [],
    footerText: '',
    footerHtml: '',
  }
}

export function newItem(serviceType: ServiceType = 'bookmark'): BuilderItem {
  return {
    serviceType,
    title: '', description: '', link: '', target: '', span: '',
    iconType: 'favicon', iconFavicon: '', iconUrl: '', iconName: '', iconColor: '', iconWrap: false,
    statusEnabled: false, tags: [],
    owmLat: '', owmLon: '', owmUnits: 'metric', owmApiKey: '',
    ipapiLocationName: '',
    ipapiFlagIcon: 'true',
    tzTimezone: '', tzLocationName: '', tzCountry: '', tzTimeFormat: '24h', tzDateFormat: 'medium',
    dtwLat: '', dtwLon: '', dtwUnits: 'metric', dtwApiKey: '', dtwTimezone: '', dtwTimeFormat: '24h', dtwDateFormat: 'medium',
    greetText: '', greetSubtitle: '',
    customHtml: '', customHidden: false,
  }
}

// --- YAML -> State (import) ---

function parseRawItem(raw: any): BuilderItem {
  const sType: ServiceType = raw.type === 'timezone' ? 'time' : (raw.type || 'bookmark')
  const item = newItem(sType)

  if (raw.icon) {
    if (raw.icon.favicon) {
      item.iconType = 'favicon'
      item.iconFavicon = raw.icon.favicon
      item.iconColor = raw.icon.color || ''
    }
    else if (raw.icon.url) {
      item.iconType = 'url'
      item.iconUrl = raw.icon.url
    }
    else if (raw.icon.name) {
      item.iconType = 'name'
      item.iconName = raw.icon.name
      item.iconColor = raw.icon.color || ''
    }
    item.iconWrap = raw.icon.wrap || false
  }

  if (raw.span) item.span = String(raw.span)

  if (sType === 'openweathermap') {
    if (raw.options?.lat != null) item.owmLat = String(raw.options.lat)
    if (raw.options?.lon != null) item.owmLon = String(raw.options.lon)
    if (raw.options?.units) item.owmUnits = raw.options.units
    if (raw.secrets?.apiKey) item.owmApiKey = String(raw.secrets.apiKey)
  }
  else if (sType === 'ip-api') {
    if (raw.options?.locationName) item.ipapiLocationName = raw.options.locationName
    if (raw.options?.flagIcon === false) item.ipapiFlagIcon = 'false'
  }
  else if (sType === 'time') {
    if (raw.options?.timezone) item.tzTimezone = raw.options.timezone
    if (raw.options?.locationName) item.tzLocationName = raw.options.locationName
    if (raw.options?.country) item.tzCountry = raw.options.country
    if (raw.options?.timeFormat) item.tzTimeFormat = raw.options.timeFormat
    if (raw.options?.dateFormat) item.tzDateFormat = raw.options.dateFormat
  }
  else if (sType === 'datetime-weather') {
    if (raw.options?.lat != null) item.dtwLat = String(raw.options.lat)
    if (raw.options?.lon != null) item.dtwLon = String(raw.options.lon)
    if (raw.options?.timezone) item.dtwTimezone = raw.options.timezone
    if (raw.options?.units) item.dtwUnits = raw.options.units
    if (raw.options?.timeFormat) item.dtwTimeFormat = raw.options.timeFormat
    if (raw.options?.dateFormat) item.dtwDateFormat = raw.options.dateFormat
    if (raw.secrets?.apiKey) item.dtwApiKey = String(raw.secrets.apiKey)
  }
  else if (sType === 'greeting') {
    if (raw.options?.text) item.greetText = raw.options.text
    if (raw.options?.subtitle) item.greetSubtitle = raw.options.subtitle
  }
  else if (sType === 'custom-html') {
    if (raw.options?.html) item.customHtml = raw.options.html
    if (raw.options?.hidden) item.customHidden = true
  }
  else {
    item.title = raw.title || ''
    item.description = raw.description || ''
    item.link = raw.link || ''
    item.target = raw.target || ''
    if (raw.status?.enabled) item.statusEnabled = true
    if (raw.tags && Array.isArray(raw.tags)) {
      item.tags = raw.tags.map((t: any) => typeof t === 'string' ? t : t.name || '')
    }
  }

  return item
}

function parseServiceGroups(services: any): BuilderGroup[] {
  const groups: BuilderGroup[] = []
  if (typeof services === 'object' && !Array.isArray(services)) {
    for (const [groupName, groupData] of Object.entries(services)) {
      const group: BuilderGroup = { name: groupName, display: 'list', items: [] }
      let items: any[] = []
      if (groupData && typeof groupData === 'object' && !Array.isArray(groupData)) {
        group.display = (groupData as any).display || 'list'
        items = (groupData as any).items || []
      }
      else if (Array.isArray(groupData)) {
        items = groupData
      }
      group.items = items.map(parseRawItem)
      groups.push(group)
    }
  }
  else if (Array.isArray(services)) {
    const group: BuilderGroup = { name: 'Services', display: 'list', items: [] }
    group.items = services.map(parseRawItem)
    groups.push(group)
  }
  return groups
}

export function loadConfigFromYaml(state: BuilderState, yamlStr: string) {
  const config = yaml.parse(yamlStr)
  if (!config || typeof config !== 'object') return

  if (config.title) state.title = config.title
  if (config.lang) state.lang = config.lang
  if (config.theme) state.theme = config.theme
  if (config.logo) {
    if (typeof config.logo === 'string') {
      state.logoType = 'image'
      state.logoImage = config.logo
    } else if (config.logo.type === 'image') {
      state.logoType = 'image'
      state.logoImage = config.logo.image || ''
    } else if (config.logo.type === 'text') {
      state.logoType = 'text'
      state.logoText = config.logo.text || ''
      if (config.logo.fontSize) state.logoFontSize = config.logo.fontSize
      if (config.logo.fontWeight != null) state.logoFontWeight = String(config.logo.fontWeight)
      if (config.logo.fontFamily) state.logoFontFamily = config.logo.fontFamily
      if (config.logo.color) state.logoColor = config.logo.color
      if (config.logo.backgroundColor) state.logoBackgroundColor = config.logo.backgroundColor
      if (config.logo.borderRadius) state.logoBorderRadius = config.logo.borderRadius
      if (config.logo.padding) state.logoPadding = config.logo.padding
    }
  }
  if (config.background) state.background = config.background
  if (config.faviconApi) state.faviconApi = config.faviconApi
  if (config.searchProvider) state.searchProvider = config.searchProvider
  if (config.behaviour?.target) state.target = config.behaviour.target

  if (config.backgroundOverlay) {
    if (config.backgroundOverlay.color) state.overlayColor = config.backgroundOverlay.color
    if (config.backgroundOverlay.opacity != null) state.overlayOpacity = config.backgroundOverlay.opacity
  }

  if (config.layout?.grid) {
    if (config.layout.grid.small != null) state.gridSmall = config.layout.grid.small
    if (config.layout.grid.medium != null) state.gridMedium = config.layout.grid.medium
    if (config.layout.grid.large != null) state.gridLarge = config.layout.grid.large
    if (config.layout.grid.xlarge != null) state.gridXlarge = config.layout.grid.xlarge
  }
  if (config.layout?.list) {
    if (config.layout.list.small != null) state.listSmall = config.layout.list.small
    if (config.layout.list.medium != null) state.listMedium = config.layout.list.medium
    if (config.layout.list.large != null) state.listLarge = config.layout.list.large
    if (config.layout.list.xlarge != null) state.listXlarge = config.layout.list.xlarge
  }
  if (config.layout?.spacing) {
    if (config.layout.spacing.group) state.spacingGroup = config.layout.spacing.group
    if (config.layout.spacing.item) state.spacingItem = config.layout.spacing.item
  }

  if (config.styles) {
    for (const el of ['category', 'title', 'description'] as const) {
      const s = config.styles[el]
      if (!s) continue
      const target = state.styles[el]
      if (s.fontFamily) target.fontFamily = s.fontFamily
      if (s.fontSize) target.fontSize = s.fontSize
      if (s.fontWeight != null) target.fontWeight = String(s.fontWeight)
      if (s.fontStyle) target.fontStyle = s.fontStyle
      if (s.textDecoration) target.textDecoration = s.textDecoration
      if (s.color) target.color = s.color
    }
  }

  if (config.footer) {
    if (config.footer.text) state.footerText = config.footer.text
    if (config.footer.html) state.footerHtml = config.footer.html
  }

  state.tags = []
  if (config.tags && Array.isArray(config.tags)) {
    for (const t of config.tags) {
      state.tags.push({ name: t.name || '', color: t.color || 'blue' })
    }
  }

  state.tabs = []
  if (config.tabs && Array.isArray(config.tabs)) {
    for (const tab of config.tabs) {
      state.tabs.push({
        name: tab.name || '',
        icon: tab.icon || '',
        locked: tab.locked || false,
        groups: parseServiceGroups(tab.services),
      })
    }
  }
  else if (config.services) {
    state.tabs.push({
      name: '',
      icon: '',
      locked: false,
      groups: parseServiceGroups(config.services),
    })
  }
}

// --- State -> YAML (export) ---

function serializeItem(item: BuilderItem): Record<string, any> | null {
  const sType = item.serviceType || 'bookmark'
  if (sType === 'bookmark' && !item.title && !item.link) return null
  if (sType === 'time' && !item.tzTimezone) return null
  if (sType === 'datetime-weather' && !item.dtwTimezone && !item.dtwLat) return null
  if (sType === 'greeting' && !item.greetText) return null
  if (sType === 'custom-html' && !item.customHtml) return null

  const it: Record<string, any> = {}

  if (item.span && parseInt(item.span) > 1) it.span = parseInt(item.span)

  if (sType === 'openweathermap') {
    it.type = 'openweathermap'
    const opts: any = {}
    if (item.owmLat) opts.lat = parseFloat(item.owmLat) || item.owmLat
    if (item.owmLon) opts.lon = parseFloat(item.owmLon) || item.owmLon
    if (item.owmUnits && item.owmUnits !== 'metric') opts.units = item.owmUnits
    if (Object.keys(opts).length) it.options = opts
    if (item.owmApiKey) it.secrets = { apiKey: item.owmApiKey }
  }
  else if (sType === 'ip-api') {
    it.type = 'ip-api'
    const opts: any = {}
    if (item.ipapiLocationName) opts.locationName = item.ipapiLocationName
    if (item.ipapiFlagIcon === 'false') opts.flagIcon = false
    if (Object.keys(opts).length) it.options = opts
  }
  else if (sType === 'time') {
    it.type = 'time'
    const opts: any = {}
    if (item.tzTimezone) opts.timezone = item.tzTimezone
    if (item.tzLocationName) opts.locationName = item.tzLocationName
    if (item.tzCountry) opts.country = item.tzCountry
    if (item.tzTimeFormat && item.tzTimeFormat !== '24h') opts.timeFormat = item.tzTimeFormat
    if (item.tzDateFormat && item.tzDateFormat !== 'medium') opts.dateFormat = item.tzDateFormat
    if (Object.keys(opts).length) it.options = opts
  }
  else if (sType === 'datetime-weather') {
    it.type = 'datetime-weather'
    const opts: any = {}
    if (item.dtwLat) opts.lat = parseFloat(item.dtwLat) || item.dtwLat
    if (item.dtwLon) opts.lon = parseFloat(item.dtwLon) || item.dtwLon
    if (item.dtwTimezone) opts.timezone = item.dtwTimezone
    if (item.dtwUnits && item.dtwUnits !== 'metric') opts.units = item.dtwUnits
    if (item.dtwTimeFormat && item.dtwTimeFormat !== '24h') opts.timeFormat = item.dtwTimeFormat
    if (item.dtwDateFormat && item.dtwDateFormat !== 'medium') opts.dateFormat = item.dtwDateFormat
    if (Object.keys(opts).length) it.options = opts
    if (item.dtwApiKey) it.secrets = { apiKey: item.dtwApiKey }
  }
  else if (sType === 'greeting') {
    it.type = 'greeting'
    const opts: any = {}
    if (item.greetText) opts.text = item.greetText
    if (item.greetSubtitle) opts.subtitle = item.greetSubtitle
    if (Object.keys(opts).length) it.options = opts
  }
  else if (sType === 'custom-html') {
    it.type = 'custom-html'
    const opts: any = {}
    if (item.customHtml) opts.html = item.customHtml
    if (item.customHidden) opts.hidden = true
    if (Object.keys(opts).length) it.options = opts
  }
  else {
    if (item.title) it.title = item.title
    if (item.description) it.description = item.description
    if (item.link) it.link = item.link
    if (item.target) it.target = item.target
  }

  // Icon (shared across all types)
  const icon: any = {}
  if (item.iconType === 'favicon' && item.iconFavicon) {
    icon.favicon = item.iconFavicon
    if (item.iconColor) icon.color = item.iconColor
    if (item.iconWrap) icon.wrap = true
  }
  else if (item.iconType === 'url' && item.iconUrl) {
    icon.url = item.iconUrl
    if (item.iconWrap) icon.wrap = true
  }
  else if (item.iconType === 'name' && item.iconName) {
    icon.name = item.iconName
    if (item.iconColor) icon.color = item.iconColor
    if (item.iconWrap) icon.wrap = true
  }
  if (Object.keys(icon).length) it.icon = icon

  if (sType === 'bookmark') {
    if (item.statusEnabled) it.status = { enabled: true }
    if (item.tags && item.tags.length) it.tags = item.tags
  }

  return it
}

export function stateToYaml(state: BuilderState): string {
  const config: Record<string, any> = {}

  if (state.title) config.title = state.title
  if (state.lang) config.lang = state.lang
  if (state.theme) config.theme = state.theme
  if (state.logoType === 'image' && state.logoImage) {
    config.logo = state.logoImage
  } else if (state.logoType === 'text' && state.logoText) {
    const logoObj: Record<string, any> = { type: 'text', text: state.logoText }
    if (state.logoFontSize) logoObj.fontSize = state.logoFontSize
    if (state.logoFontWeight) logoObj.fontWeight = isNaN(Number(state.logoFontWeight)) ? state.logoFontWeight : parseInt(state.logoFontWeight)
    if (state.logoFontFamily) logoObj.fontFamily = state.logoFontFamily
    if (state.logoColor) logoObj.color = state.logoColor
    if (state.logoBackgroundColor) logoObj.backgroundColor = state.logoBackgroundColor
    if (state.logoBorderRadius) logoObj.borderRadius = state.logoBorderRadius
    if (state.logoPadding) logoObj.padding = state.logoPadding
    config.logo = logoObj
  }
  if (state.background) config.background = state.background
  if (state.faviconApi) config.faviconApi = state.faviconApi

  if (state.background) {
    config.backgroundOverlay = { color: state.overlayColor, opacity: state.overlayOpacity }
  }

  if (state.target) config.behaviour = { target: state.target }
  if (state.searchProvider) config.searchProvider = state.searchProvider

  // Layout
  const layout: any = {}
  const grid: any = {}
  if (state.gridSmall) grid.small = state.gridSmall
  if (state.gridMedium) grid.medium = state.gridMedium
  if (state.gridLarge) grid.large = state.gridLarge
  if (state.gridXlarge) grid.xlarge = state.gridXlarge
  if (Object.keys(grid).length) layout.grid = grid

  const list: any = {}
  if (state.listSmall) list.small = state.listSmall
  if (state.listMedium) list.medium = state.listMedium
  if (state.listLarge) list.large = state.listLarge
  if (state.listXlarge) list.xlarge = state.listXlarge
  if (Object.keys(list).length) layout.list = list

  const spacing: any = {}
  if (state.spacingGroup) spacing.group = state.spacingGroup
  if (state.spacingItem) spacing.item = state.spacingItem
  if (Object.keys(spacing).length) layout.spacing = spacing
  if (Object.keys(layout).length) config.layout = layout

  // Styles
  const styles: any = {}
  for (const el of ['category', 'title', 'description'] as const) {
    const src = state.styles[el]
    const s: any = {}
    if (src.fontFamily) s.fontFamily = src.fontFamily
    if (src.fontSize) s.fontSize = src.fontSize
    if (src.fontWeight) s.fontWeight = isNaN(Number(src.fontWeight)) ? src.fontWeight : parseInt(src.fontWeight)
    if (src.fontStyle) s.fontStyle = src.fontStyle
    if (src.textDecoration) s.textDecoration = src.textDecoration
    if (src.color) s.color = src.color
    if (Object.keys(s).length) styles[el] = s
  }
  if (Object.keys(styles).length) config.styles = styles

  // Tags
  const validTags = state.tags.filter(t => t.name)
  if (validTags.length) config.tags = validTags.map(t => ({ name: t.name, color: t.color }))

  // Tabs
  if (state.tabs.length) {
    config.tabs = state.tabs.map((tab) => {
      const tabObj: any = {}
      if (tab.name) tabObj.name = tab.name
      if (tab.icon) tabObj.icon = tab.icon
      if (tab.locked) tabObj.locked = true
      const services: any = {}
      for (const group of tab.groups) {
        if (!group.name) continue
        const groupObj: any = { display: group.display, items: [] }
        for (const item of group.items) {
          const serialized = serializeItem(item)
          if (serialized) groupObj.items.push(serialized)
        }
        services[group.name] = groupObj
      }
      if (Object.keys(services).length) tabObj.services = services
      return tabObj
    })
  }

  // Footer
  if (state.footerText || state.footerHtml) {
    const footer: any = {}
    if (state.footerText) footer.text = state.footerText
    if (state.footerHtml) footer.html = state.footerHtml
    config.footer = footer
  }

  return yaml.stringify(config, {
    indent: 2,
    lineWidth: 0,
    defaultKeyType: 'PLAIN',
    defaultStringType: 'PLAIN',
  })
}

// --- Composable ---

export function useConfigBuilder() {
  const state = reactive<BuilderState>(defaultState())

  const yamlOutput = computed(() => stateToYaml(state))

  function resetState() {
    Object.assign(state, defaultState())
  }

  function loadFromYaml(yamlStr: string) {
    resetState()
    loadConfigFromYaml(state, yamlStr)
  }

  function addTag(name = '', color = 'blue') {
    state.tags.push({ name, color })
  }

  function removeTag(index: number) {
    state.tags.splice(index, 1)
  }

  function addTab(name = '', icon = '') {
    state.tabs.push({ name, icon, locked: false, groups: [] })
  }

  function removeTab(index: number) {
    if (state.tabs[index]?.locked) return
    state.tabs.splice(index, 1)
  }

  function toggleTabLock(index: number) {
    state.tabs[index].locked = !state.tabs[index].locked
  }

  function addGroup(tabIndex: number, name = '', display: 'grid' | 'list' = 'list') {
    state.tabs[tabIndex].groups.push({ name, display, items: [] })
  }

  function removeGroup(tabIndex: number, groupIndex: number) {
    state.tabs[tabIndex].groups.splice(groupIndex, 1)
  }

  function addItem(tabIndex: number, groupIndex: number, serviceType: ServiceType = 'bookmark') {
    state.tabs[tabIndex].groups[groupIndex].items.push(newItem(serviceType))
  }

  function removeItem(tabIndex: number, groupIndex: number, itemIndex: number) {
    state.tabs[tabIndex].groups[groupIndex].items.splice(itemIndex, 1)
  }

  function moveItem(tabIndex: number, groupIndex: number, itemIndex: number, direction: -1 | 1) {
    const items = state.tabs[tabIndex].groups[groupIndex].items
    const newIndex = itemIndex + direction
    if (newIndex < 0 || newIndex >= items.length) return
    const temp = items[itemIndex]
    items[itemIndex] = items[newIndex]
    items[newIndex] = temp
  }

  function moveGroup(tabIndex: number, groupIndex: number, direction: -1 | 1) {
    const groups = state.tabs[tabIndex].groups
    const newIndex = groupIndex + direction
    if (newIndex < 0 || newIndex >= groups.length) return
    const temp = groups[groupIndex]
    groups[groupIndex] = groups[newIndex]
    groups[newIndex] = temp
  }

  return {
    state,
    yamlOutput,
    resetState,
    loadFromYaml,
    addTag,
    removeTag,
    addTab,
    removeTab,
    toggleTabLock,
    addGroup,
    removeGroup,
    addItem,
    removeItem,
    moveItem,
    moveGroup,
  }
}
