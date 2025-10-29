export function mapEmotesByCode(emotes = [], provider = 'twitch') {
  const map = {}
  emotes.forEach(emote => {
    if (!emote) return
    const normalized = normalizeEmoteData(emote, provider)
    if (!normalized) return
    const code = normalized.name || normalized.code || normalized.id
    if (!code) return
    map[code] = {
      provider,
      code,
      id: normalized.id || normalized._id || normalized.emote_id || normalized.code || normalized.name,
      images: normaliseImages(normalized, provider),
      raw: emote,
    }
  })
  return map
}

export function mergeEmoteMaps(...maps) {
  return maps.reduce((acc, map) => Object.assign(acc, map), {})
}

function normalizeEmoteData(emote, provider) {
  if (!emote) return null
  switch (provider) {
    case 'bttv':
      return {
        id: emote.id || emote._id,
        name: emote.code || emote.name,
        code: emote.code || emote.name,
      }
    case '7tv': {
      const base = emote.data || emote
      if (!base) return null
      return {
        ...base,
        id: base.id || emote.id,
        name: base.name || emote.name,
        code: base.name || emote.name,
        host: base.host || emote.host,
      }
    }
    default:
      return emote
  }
}

function normaliseImages(emote, provider) {
  switch (provider) {
    case 'bttv':
      return buildImageSet({
        url_1x: `https://cdn.betterttv.net/emote/${emote.id}/1x`,
        url_2x: `https://cdn.betterttv.net/emote/${emote.id}/2x`,
        url_3x: `https://cdn.betterttv.net/emote/${emote.id}/3x`,
      })
    case '7tv': {
      const host = emote.host
      if (!host) return buildImageSet({})
      const baseUrl = host.url?.startsWith('http') ? host.url : `https:${host.url}`
      const formats = {}
      ;[1, 2, 3, 4].forEach(scale => {
        const file = host.files?.find(f => f.scale === scale)
        if (file) {
          const full = file.url?.startsWith('http') ? file.url : `https:${file.url}`
          formats[`url_${scale}x`] = full
        }
      })
      if (!Object.keys(formats).length && baseUrl) {
        formats.url_1x = `${baseUrl}/1x.webp`
        formats.url_2x = `${baseUrl}/2x.webp`
        formats.url_3x = `${baseUrl}/3x.webp`
        formats.url_4x = `${baseUrl}/4x.webp`
      }
      return buildImageSet(formats)
    }
    default: {
      const images = emote.images || {}
      return buildImageSet({
        url_1x: images.url_1x || images['1x'] || '',
        url_2x: images.url_2x || images['2x'] || '',
        url_3x: images.url_3x || images['3x'] || '',
        url_4x: images.url_4x || images['4x'] || '',
      })
    }
  }
}

function buildImageSet(images) {
  return {
    url_1x: images.url_1x || '',
    url_2x: images.url_2x || '',
    url_3x: images.url_3x || '',
    url_4x: images.url_4x || '',
  }
}

