import type { Service } from '~/types/services'

export interface ServicesGroup {
  title?: string
  display?: 'grid' | 'list'
  items: Service[]
}

export interface Tag {
  name: string
  color: 'red' | 'orange' | 'amber' | 'yellow' | 'lime' | 'green' | 'emerald' | 'teal' | 'cyan' | 'sky' | 'blue' | 'indigo' | 'violet' | 'purple' | 'fuchsia' | 'pink' | 'rose'
}

export interface Behaviour {
  target?: '_blank' | '_self' | '_parent' | '_top'
}

export interface LayoutSpacing {
  group?: string
  item?: string
}

export interface LayoutGrid {
  small: number
  medium: number
  large: number
  xlarge: number
}

export interface Layout {
  grid: LayoutGrid
  list?: LayoutGrid
  spacing?: LayoutSpacing
}

export interface TextStyle {
  fontFamily?: string
  fontSize?: string
  fontWeight?: string | number
  fontStyle?: string
  textDecoration?: string
  color?: string
}

export interface Styles {
  category?: TextStyle
  title?: TextStyle
  description?: TextStyle
}

export interface BackgroundOverlay {
  color?: string
  opacity?: number
}

export interface Tab {
  name: string
  icon?: string
  services: ServicesGroup[]
}

export interface Config {
  title?: string
  lang?: 'en' | 'ru' | 'zh' | 'hi' | 'es' | 'ar' | 'pl' | 'fr' | 'de' | 'gr'
  theme?: 'system' | 'light' | 'dark' | 'deep' | 'sepia' | 'bluer'
  logo?: string
  background?: string
  backgroundOverlay?: BackgroundOverlay
  faviconApi?: string
  styles?: Styles
  layout?: Layout
  behaviour?: Behaviour
  searchProvider?: 'google' | 'duckduckgo'
  tags: Tag[]
  services: ServicesGroup[]
  tabs?: Tab[]
  checkUpdates: boolean
}

export type CompleteConfig = Required<Config> & {
  error?: string
}
