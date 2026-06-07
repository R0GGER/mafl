<template>
  <div class="flex" :style="cardStyle">
    <div class="flex-shrink-0 flex">
      <div class="self-center overflow-hidden rounded-2xl border border-black/5" :class="{ 'animate-pulse': props.animate }" :style="iconStyle">
        <div class="bg-fg/5 dark:bg-fg/10 h-full w-full" />
      </div>
    </div>
    <div>
      <h3 class="text-lg mt-1" :class="{ 'animate-pulse': props.animate }">
        <span class="inline-block min-h-[1em] w-[110px] flex-auto cursor-wait bg-fg/5 dark:bg-fg/10 align-middle opacity-50 rounded" />
      </h3>
      <p class="text-sm text-black/50" :class="{ 'animate-pulse': props.animate }">
        <span class="inline-block min-h-[1em] w-[160px] flex-auto cursor-wait bg-fg/5 dark:bg-fg/10 align-middle opacity-50 rounded" />
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{ animate?: boolean }>(), {
  animate: true,
})

const { cardStyle, iconStyle } = useGridItemStyle()
</script>
