export interface PlayableStation {
  stationuuid: string
  name: string
  urlResolved: string
  favicon?: string
}

let sharedAudio: HTMLAudioElement | null = null
let audioListenersBound = false

function getAudioErrorMessage(audio: HTMLAudioElement): string {
  if (!audio.error) {
    return 'Unable to play stream'
  }

  switch (audio.error.code) {
    case MediaError.MEDIA_ERR_NETWORK:
      return 'Network error — try again'
    case MediaError.MEDIA_ERR_DECODE:
      return 'Stream decode error'
    case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
      return 'Stream not supported'
    default:
      return 'Unable to play stream'
  }
}

async function resolveStreamUrl(station: PlayableStation): Promise<string> {
  if (!station.urlResolved) {
    throw new Error('Missing stream URL')
  }

  try {
    const fresh = await $fetch<{ urlResolved: string }>(`/api/radio-browser/stations/${station.stationuuid}`)
    if (fresh.urlResolved) {
      return fresh.urlResolved
    }
  }
  catch {
    // fall back to provided URL
  }

  return station.urlResolved
}

export function useWebRadioPlayer() {
  const current = useState<PlayableStation | null>('webRadioCurrent', () => null)
  const playing = useState('webRadioPlaying', () => false)
  const volume = useState('webRadioVolume', () => 1)
  const error = useState<string | null>('webRadioError', () => null)
  const loading = useState('webRadioLoading', () => false)

  function getAudioElement(): HTMLAudioElement | null {
    if (!import.meta.client) {
      return null
    }

    if (!sharedAudio) {
      sharedAudio = new Audio()
      sharedAudio.preload = 'none'
    }

    return sharedAudio
  }

  function bindSharedAudioListeners() {
    const audio = sharedAudio
    if (!audio || audioListenersBound) {
      return
    }

    audioListenersBound = true

    audio.addEventListener('playing', () => {
      playing.value = true
      loading.value = false
      error.value = null
    })

    audio.addEventListener('pause', () => {
      playing.value = false
    })

    audio.addEventListener('waiting', () => {
      loading.value = true
    })

    audio.addEventListener('error', () => {
      error.value = getAudioErrorMessage(audio)
      playing.value = false
      loading.value = false
    })
  }

  async function trackClick(uuid: string) {
    try {
      await $fetch(`/api/radio-browser/click/${uuid}`, { method: 'POST' })
    }
    catch {
      // non-critical
    }
  }

  function isActive(uuid: string) {
    return current.value?.stationuuid === uuid && playing.value
  }

  function pause() {
    sharedAudio?.pause()
    playing.value = false
  }

  function stop() {
    if (sharedAudio) {
      sharedAudio.pause()
      sharedAudio.removeAttribute('src')
      sharedAudio.load()
    }
    playing.value = false
    loading.value = false
    current.value = null
    error.value = null
  }

  async function startPlayback(audio: HTMLAudioElement, streamUrl: string, station: PlayableStation) {
    audio.pause()
    audio.volume = volume.value
    audio.src = streamUrl

    await audio.play()
    playing.value = true
    trackClick(station.stationuuid)
  }

  async function play(station: PlayableStation, retry = true) {
    error.value = null

    if (current.value?.stationuuid === station.stationuuid && playing.value) {
      pause()
      return
    }

    const audio = getAudioElement()
    if (!audio) {
      error.value = 'Audio player unavailable'
      return
    }

    bindSharedAudioListeners()

    if (current.value?.stationuuid === station.stationuuid && !playing.value && audio.src) {
      try {
        await audio.play()
        playing.value = true
        return
      }
      catch {
        // fall through to reload stream
      }
    }

    current.value = station
    loading.value = true

    try {
      const streamUrl = await resolveStreamUrl(station)
      await startPlayback(audio, streamUrl, station)
    }
    catch {
      if (retry) {
        try {
          const streamUrl = await $fetch<{ urlResolved: string }>(`/api/radio-browser/stations/${station.stationuuid}`)
            .then(s => s.urlResolved)
          await startPlayback(audio, streamUrl, station)
          return
        }
        catch {
          // handled below
        }
      }

      if (audio.error) {
        error.value = getAudioErrorMessage(audio)
      }
      else {
        error.value = 'Unable to play stream'
      }
      playing.value = false
    }
    finally {
      loading.value = false
    }
  }

  function setVolume(value: number) {
    volume.value = Math.min(1, Math.max(0, value))
    if (sharedAudio) {
      sharedAudio.volume = volume.value
    }
  }

  function togglePlay() {
    if (!current.value) {
      return
    }
    if (playing.value) {
      pause()
    }
    else {
      play(current.value, false)
    }
  }

  return {
    current,
    playing,
    volume,
    error,
    loading,
    play,
    pause,
    stop,
    togglePlay,
    setVolume,
    isActive,
  }
}
