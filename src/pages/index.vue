<template>
  <template v-for="(section, sIdx) in sections" :key="sIdx">
    <div v-if="section.type === 'list-row'" :class="listRowClasses" :style="{ padding: `${$settings.layout.spacing?.group ?? '2.5rem'} 0` }">
      <Group
        v-for="(group, gIdx) in section.groups"
        :key="gIdx"
        v-bind="{ ...group, grid: $settings.layout.grid, spacing: $settings.layout.spacing }"
        inline
      />
    </div>
    <Group
      v-else
      v-bind="{ ...section.groups[0], grid: $settings.layout.grid, spacing: $settings.layout.spacing }"
    />
  </template>
  <!-- <Update v-if="$settings.checkUpdates" /> -->
</template>

<script setup lang="ts">
import type { ServicesGroup } from '~/types'

const { $settings, $activeServices } = useNuxtApp()

if ($settings.error) {
  throw createError({
    message: $settings.error,
  })
}

interface Section {
  type: 'grid' | 'list-row'
  groups: ServicesGroup[]
}

const currentServices = $activeServices as ComputedRef<ServicesGroup[]>

const listGrid = computed(() => $settings.layout.list ?? { small: 2, medium: 3, large: 4, xlarge: 5 })

const listRowClasses = computed(() => [
  'grid',
  'grid-cols-1',
  'gap-6 lg:gap-8 xl:gap-12',
  `sm:grid-cols-${listGrid.value.small}`,
  `md:grid-cols-${listGrid.value.medium}`,
  `lg:grid-cols-${listGrid.value.large}`,
  `xl:grid-cols-${listGrid.value.xlarge}`,
])

const sections = computed<Section[]>(() => {
  const result: Section[] = []

  for (const group of currentServices.value) {
    if (group.display === 'list') {
      const last = result[result.length - 1]
      if (last && last.type === 'list-row') {
        last.groups.push(group)
      } else {
        result.push({ type: 'list-row', groups: [group] })
      }
    } else {
      result.push({ type: 'grid', groups: [group] })
    }
  }

  return result
})
</script>
