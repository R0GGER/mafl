<template>
  <div v-if="inline" class="flex flex-col">
    <h2 v-if="title" class="text-sm font-semibold uppercase tracking-wide py-2 px-2 opacity-80" :style="categoryStyle">
      {{ title }}
    </h2>
    <div class="flex flex-col">
      <template v-for="item in items" :key="item.id">
        <ListItem v-bind="item" />
      </template>
    </div>
  </div>
  <div v-else :style="{ padding: `${groupSpacing} 0` }">
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
</template>

<script setup lang="ts">
import type { Layout, Service, TextStyle } from '~/types'

export interface Props {
  title?: string
  display?: 'grid' | 'list'
  inline?: boolean
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

const gridClasses = computed(() => [
  'grid',
  'grid-cols-1',
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
