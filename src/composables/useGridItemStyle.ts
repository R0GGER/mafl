export function useGridItemStyle() {
  const { $settings } = useNuxtApp()

  const iconSize = computed(() => $settings.layout?.grid?.iconSize ?? '4rem')
  const itemPadding = computed(() => $settings.layout?.grid?.itemPadding ?? '1rem')

  const cardStyle = computed(() => ({
    padding: itemPadding.value,
    gap: itemPadding.value,
  }))

  const iconStyle = computed(() => ({
    width: iconSize.value,
    height: iconSize.value,
  }))

  return { iconSize, itemPadding, cardStyle, iconStyle }
}
