<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-4"
    >
      <div
        v-if="current"
        class="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-2xl rounded-xl border border-white/15 bg-black/85 backdrop-blur-xl shadow-xl shadow-black/30 px-4 py-3"
      >
        <div class="flex items-center gap-3">
          <div class="flex-shrink-0 w-10 h-10 overflow-hidden rounded-lg bg-white/10">
            <img
              v-if="current.favicon"
              :src="current.favicon"
              alt=""
              class="w-full h-full object-cover"
            >
            <Icon v-else name="mdi:radio" class="w-full h-full p-2 text-white/60" />
          </div>

          <div class="min-w-0 flex-1">
            <div class="text-sm font-medium text-white truncate">{{ current.name }}</div>
            <div v-if="error" class="text-xs text-red-400 truncate">{{ error }}</div>
            <div v-else-if="loading" class="text-xs text-white/40">Connecting...</div>
            <div v-else class="text-xs text-white/40">Now playing</div>
          </div>

          <div class="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              class="p-2 rounded-lg text-white/80 hover:bg-white/10 transition-colors"
              :aria-label="playing ? 'Pause' : 'Play'"
              @click="togglePlay"
            >
              <Icon :name="playing ? 'mdi:pause' : 'mdi:play'" class="w-5 h-5" />
            </button>

            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              :value="volume"
              class="w-20 accent-white/80 hidden sm:block"
              aria-label="Volume"
              @input="onVolumeInput"
            >

            <button
              type="button"
              class="p-2 rounded-lg text-white/50 hover:text-white/80 hover:bg-white/10 transition-colors"
              aria-label="Stop"
              @click="stop"
            >
              <Icon name="mdi:close" class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const {
  current,
  playing,
  volume,
  error,
  loading,
  togglePlay,
  stop,
  setVolume,
} = useWebRadioPlayer()

function onVolumeInput(e: Event) {
  const target = e.target as HTMLInputElement
  setVolume(Number.parseFloat(target.value))
}
</script>
