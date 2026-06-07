<template>
  <div v-if="inline" class="flex flex-col" :class="{ 'group-card': hasCardStyle }" :style="cardWrapperStyle">
    <div v-if="hasCardStyle" class="group-card-bg" :style="cardBgStyle" />
    <h2 v-if="title" class="text-sm font-semibold uppercase tracking-wide py-2 px-2" :style="categoryStyle">
      {{ title }}
    </h2>
    <div class="flex flex-col">
      <template v-for="item in items" :key="item.id">
        <ListItem v-bind="item" />
      </template>
    </div>
  </div>
  <div v-else :style="{ padding: `${groupSpacing} 0` }">
    <div :class="{ 'group-card': hasCardStyle }" :style="cardWrapperStyle">
      <div v-if="hasCardStyle" class="group-card-bg" :style="cardBgStyle" />
      <h2 v-if="title" class="text-2xl font-light py-2 px-4" :style="categoryStyle">
        {{ title }}
      </h2>
      <div v-if="display === 'list'" :class="listGridClasses">
        <template v-for="item in items" :key="item.id">
          <ListItem v-bind="item" />
        </template>
      </div>
      <div v-else :class="gridClasses">
        <template v-for="item in items" :key="item.id">
          <div v-if="item.span && item.span > 1" :style="{ gridColumn: `span ${item.span}` }">
            <Item v-bind="item" />
          </div>
          <Item v-else v-bind="item" />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CardStyle, Layout, Service, TextStyle } from '~/types'

export interface Props {
  title?: string
  display?: 'grid' | 'list'
  inline?: boolean
  card?: CardStyle
  items: Service[]
  grid: Layout['grid']
  spacing?: Layout['spacing']
}

const props = defineProps<Props>()
const { $settings } = useNuxtApp()

const groupSpacing = computed(() => props.spacing?.group ?? '2.5rem')

function toCSS(style?: TextStyle): Record<string, string | undefined> {
  if (!style) return {}
  return {
    fontFamily: style.fontFamily,
    fontSize: style.fontSize,
    fontWeight: style.fontWeight,
    fontStyle: style.fontStyle,
    textDecoration: style.textDecoration,
    color: style.color,
  }
}

const categoryStyle = computed(() => toCSS($settings.styles?.category))

const mergedCard = computed<CardStyle>(() => {
  if (props.card && Object.keys(props.card).length > 0) return props.card
  return $settings.styles?.card ?? {}
})

const hasCardStyle = computed(() => {
  const c = mergedCard.value
  return !!(c.backgroundColor || c.borderWidth || c.borderColor || c.borderStyle || c.blur)
})

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '')
  const r = parseInt(h.substring(0, 2), 16)
  const g = parseInt(h.substring(2, 4), 16)
  const b = parseInt(h.substring(4, 6), 16)
  if (isNaN(r) || isNaN(g) || isNaN(b)) return hex
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const cardWrapperStyle = computed(() => {
  if (!hasCardStyle.value) return {}
  const c = mergedCard.value
  return {
    position: 'relative' as const,
    overflow: 'hidden' as const,
    borderWidth: c.borderWidth,
    borderStyle: c.borderStyle ?? (c.borderWidth || c.borderColor ? 'solid' : undefined),
    borderColor: c.borderColor,
    borderRadius: c.borderRadius,
    padding: c.padding,
  }
})

const cardBgStyle = computed(() => {
  if (!hasCardStyle.value) return {}
  const c = mergedCard.value
  const opacity = c.opacity ?? 1
  let bg = c.backgroundColor
  let convertedToRgba = false
  if (bg && opacity < 1 && bg.startsWith('#') && (bg.length === 7 || bg.length === 4)) {
    bg = hexToRgba(bg, opacity)
    convertedToRgba = true
  }
  const style: Record<string, string | number | undefined> = {}
  if (bg) style.backgroundColor = bg
  if (opacity < 1 && !convertedToRgba) style.opacity = opacity
  if (c.blur) {
    style.backdropFilter = `blur(${c.blur})`
    style.webkitBackdropFilter = `blur(${c.blur})`
  }
  return style
})

const gridClasses = computed(() => [
  'grid',
  'grid-cols-1',
  'items-start',
  'gap-2 lg:gap-4 xl:gap-6',
  `sm:grid-cols-${props.grid.small}`,
  `md:grid-cols-${props.grid.medium}`,
  `lg:grid-cols-${props.grid.large}`,
  `xl:grid-cols-${props.grid.xlarge}`,
])

const listGridClasses = computed(() => [
  'grid',
  'grid-cols-1',
  'gap-2 lg:gap-4 xl:gap-6',
  `sm:grid-cols-${props.grid.small}`,
  `md:grid-cols-${props.grid.medium}`,
  `lg:grid-cols-${props.grid.large}`,
  `xl:grid-cols-${props.grid.xlarge}`,
])
</script>

<style scoped>
.group-card {
  position: relative;
}

.group-card-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  border-radius: inherit;
}

.group-card > :not(.group-card-bg) {
  position: relative;
  z-index: 1;
}
</style>
