<template>
  <div class="html-editor">
    <div class="html-editor__toolbar">
      <button
        v-for="action in actions"
        :key="action.cmd + (action.arg ?? '')"
        type="button"
        class="html-editor__btn"
        :title="action.title"
        :class="{ 'is-active': activeStates[action.cmd + (action.arg ?? '')] }"
        @mousedown.prevent
        @click="runAction(action)"
      >
        <Icon v-if="action.icon" :name="action.icon" class="w-3.5 h-3.5" />
        <span v-else class="text-[11px] font-semibold" :style="action.style">{{ action.label }}</span>
      </button>

      <span class="html-editor__divider" />

      <label class="html-editor__btn html-editor__color" title="Text color">
        <Icon name="mdi:palette-outline" class="w-3.5 h-3.5" />
        <input
          type="color"
          class="html-editor__color-input"
          :value="currentColor"
          @input="applyColor(($event.target as HTMLInputElement).value)"
          @mousedown.stop
        >
      </label>

      <button
        type="button"
        class="html-editor__btn"
        title="Insert line break (Shift+Enter)"
        @mousedown.prevent
        @click="insertLineBreak"
      >
        <Icon name="mdi:keyboard-return" class="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        class="html-editor__btn"
        title="Clear formatting"
        @mousedown.prevent
        @click="clearFormatting"
      >
        <Icon name="mdi:format-clear" class="w-3.5 h-3.5" />
      </button>

      <span class="flex-1" />

      <button
        type="button"
        class="html-editor__btn"
        :class="{ 'is-active': sourceMode }"
        title="Toggle HTML source"
        @mousedown.prevent
        @click="toggleSource"
      >
        <Icon name="mdi:code-tags" class="w-3.5 h-3.5" />
      </button>
    </div>

    <div
      v-if="!sourceMode"
      ref="editorRef"
      class="html-editor__content admin-input"
      contenteditable="true"
      :data-placeholder="placeholder"
      :style="{ minHeight: `${minHeight}px` }"
      @input="onInput"
      @blur="syncSelection"
      @keyup="syncSelection"
      @mouseup="syncSelection"
      @keydown="onKeyDown"
      @paste="onPaste"
    />

    <textarea
      v-else
      :value="modelValue"
      class="admin-input w-full font-mono text-[11px] rounded-t-none"
      :style="{ minHeight: `${minHeight}px` }"
      :placeholder="placeholder"
      @input="onSourceInput"
    />
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue: string
  placeholder?: string
  minHeight?: number
}>(), {
  placeholder: '',
  minHeight: 72,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

interface ToolbarAction {
  cmd: string
  arg?: string
  title: string
  label?: string
  icon?: string
  style?: Record<string, string>
}

const actions: ToolbarAction[] = [
  { cmd: 'bold', title: 'Bold (Ctrl+B)', icon: 'mdi:format-bold' },
  { cmd: 'italic', title: 'Italic (Ctrl+I)', icon: 'mdi:format-italic' },
  { cmd: 'underline', title: 'Underline (Ctrl+U)', icon: 'mdi:format-underline' },
  { cmd: 'strikeThrough', title: 'Strikethrough', icon: 'mdi:format-strikethrough' },
  { cmd: 'createLink', title: 'Insert link', icon: 'mdi:link-variant' },
  { cmd: 'unlink', title: 'Remove link', icon: 'mdi:link-variant-off' },
]

const editorRef = ref<HTMLElement | null>(null)
const sourceMode = ref(false)
const activeStates = ref<Record<string, boolean>>({})
const currentColor = ref('#ffffff')
const savedRange = ref<Range | null>(null)

function syncDom() {
  if (!editorRef.value) return
  if (editorRef.value.innerHTML !== (props.modelValue || '')) {
    editorRef.value.innerHTML = props.modelValue || ''
  }
}

onMounted(() => {
  syncDom()
})

watch(() => props.modelValue, () => {
  if (document.activeElement !== editorRef.value) {
    syncDom()
  }
})

function emitChange() {
  if (!editorRef.value) return
  const html = editorRef.value.innerHTML
  if (html !== props.modelValue) {
    emit('update:modelValue', html)
  }
}

function onInput() {
  emitChange()
  syncSelection()
}

function onSourceInput(e: Event) {
  const target = e.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
}

function toggleSource() {
  sourceMode.value = !sourceMode.value
  if (!sourceMode.value) {
    nextTick(() => syncDom())
  }
}

function saveSelection() {
  const sel = window.getSelection()
  if (sel && sel.rangeCount > 0 && editorRef.value && editorRef.value.contains(sel.anchorNode)) {
    savedRange.value = sel.getRangeAt(0).cloneRange()
  }
}

function restoreSelection() {
  if (savedRange.value) {
    const sel = window.getSelection()
    sel?.removeAllRanges()
    sel?.addRange(savedRange.value)
  }
}

function syncSelection() {
  saveSelection()
  const cmds = ['bold', 'italic', 'underline', 'strikeThrough']
  const next: Record<string, boolean> = {}
  for (const cmd of cmds) {
    try { next[cmd] = document.queryCommandState(cmd) }
    catch { /* ignore */ }
  }
  activeStates.value = next

  try {
    const c = document.queryCommandValue('foreColor')
    if (c) currentColor.value = rgbToHex(c) || currentColor.value
  }
  catch { /* ignore */ }
}

function runAction(action: ToolbarAction) {
  if (!editorRef.value) return
  editorRef.value.focus()
  restoreSelection()

  if (action.cmd === 'createLink') {
    const url = window.prompt('Enter URL', 'https://')
    if (!url) return
    document.execCommand('createLink', false, url)
  }
  else {
    document.execCommand(action.cmd, false, action.arg)
  }
  emitChange()
  syncSelection()
}

function applyColor(color: string) {
  if (!editorRef.value) return
  editorRef.value.focus()
  restoreSelection()
  document.execCommand('foreColor', false, color)
  currentColor.value = color
  emitChange()
  syncSelection()
}

function insertLineBreak() {
  if (!editorRef.value) return
  editorRef.value.focus()
  restoreSelection()
  document.execCommand('insertHTML', false, '<br>')
  emitChange()
}

function clearFormatting() {
  if (!editorRef.value) return
  editorRef.value.focus()
  restoreSelection()
  document.execCommand('removeFormat')
  document.execCommand('unlink')
  emitChange()
  syncSelection()
}

function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    document.execCommand('insertHTML', false, '<br>')
    emitChange()
  }
}

function onPaste(e: ClipboardEvent) {
  e.preventDefault()
  const text = e.clipboardData?.getData('text/plain') || ''
  document.execCommand('insertText', false, text)
}

function rgbToHex(value: string): string | null {
  if (value.startsWith('#')) return value
  const m = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
  if (!m) return null
  const toHex = (n: string) => Number(n).toString(16).padStart(2, '0')
  return `#${toHex(m[1])}${toHex(m[2])}${toHex(m[3])}`
}
</script>

<style scoped>
.html-editor {
  @apply space-y-1;
}
.html-editor__toolbar {
  @apply flex items-center gap-0.5 flex-wrap rounded-t-md border border-fg/10 border-b-0 bg-fg/5 px-1 py-1;
}
.html-editor__btn {
  @apply inline-flex items-center justify-center rounded px-1.5 py-1 text-fg-dimmed hover:bg-fg/10 hover:text-fg transition-colors cursor-pointer;
}
.html-editor__btn.is-active {
  @apply bg-fg/15 text-fg;
}
.html-editor__color {
  @apply relative overflow-hidden;
}
.html-editor__color-input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
  padding: 0;
  border: 0;
}
.html-editor__divider {
  @apply mx-0.5 inline-block h-4 w-px bg-fg/15;
}
.html-editor__content {
  @apply w-full rounded-t-none text-sm leading-snug whitespace-pre-wrap break-words;
  outline: none;
}
.html-editor__content:empty::before {
  content: attr(data-placeholder);
  color: rgb(var(--fg-dimmed));
  opacity: 0.6;
  pointer-events: none;
}
.html-editor__content :deep(a) {
  color: rgb(var(--fg));
  text-decoration: underline;
}
</style>
