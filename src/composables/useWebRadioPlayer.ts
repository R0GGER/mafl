export interface PlayableStation {
  stationuuid: string
  name: string
  urlResolved: string
  favicon?: string
}

let sharedAudio: HTMLAudioElement | null = null
let audioListenersBound = false
let startingPlayback = false

function getAudioErrorMessage(audio: HTMLAudioElement): string {
  if (!audio.error) {
    return 'Unable to play stream'
  }

  switch (audio.error.code) {
    case MediaError.MEDIA_ERR_NETWORK:
      return 'Network error — try again'
    case MediaError.MEDIA_ERR_DECODE:
      return 'Stream decode error — try an MP3 station'
    case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
      return 'Stream not supported'
    default:
      return 'Unable to play stream'
  }
}

function getStreamProxyUrl(stationuuid: string): string {
  return `/api/radio-browser/stream/${encodeURIComponent(stationuuid)}`
}

function isFirefox(): boolean {
  if (!import.meta.client) {
    return false
  }
  return /firefox/i.test(navigator.userAgent)
}

const PROXY_CANPLAY_TIMEOUT_MS = 15_000

export function useWebRadioPlayer() {
  const current = useState<PlayableStation | null>('webRadioCurrent', () => null)
  const playing = useState('webRadioPlaying', () => false)
  const volume = useState('webRadioVolume', () => 0.65)
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
      if (startingPlayback || playing.value) {
        return
      }
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

  function waitForCanPlay(audio: HTMLAudioElement): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        cleanup()
        reject(new Error('Stream load timeout'))
      }, PROXY_CANPLAY_TIMEOUT_MS)

      function onCanPlay() { cleanup(); resolve() }
      function onError() { cleanup(); reject(audio.error ?? new Error('Stream error')) }
      function cleanup() {
        clearTimeout(timeout)
        audio.removeEventListener('canplay', onCanPlay)
        audio.removeEventListener('error', onError)
      }

      audio.addEventListener('canplay', onCanPlay, { once: true })
      audio.addEventListener('error', onError, { once: true })
    })
  }

  async function startPlayback(audio: HTMLAudioElement, station: PlayableStation, useProxy: boolean) {
    audio.pause()
    audio.volume = volume.value
    audio.src = useProxy
      ? getStreamProxyUrl(station.stationuuid)
      : station.urlResolved

    if (useProxy) {
      // Proxy needs time to connect upstream and buffer audio data.
      // Wait for the browser to confirm it has decodable data before
      // calling play() — required for Firefox which cannot fall back
      // to direct Icecast streams.
      audio.load()
      await waitForCanPlay(audio)
    }

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
    startingPlayback = true

    const firefox = isFirefox()

    try {
      // Firefox cannot decode raw Icecast streams reliably — go straight to
      // the server-side proxy which disables chunked encoding and buffers
      // initial audio data before responding. Other browsers can play the
      // direct stream URL instantly.
      await startPlayback(audio, station, firefox)
    }
    catch {
      if (retry && !firefox) {
        try {
          await startPlayback(audio, station, true)
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
      startingPlayback = false
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
