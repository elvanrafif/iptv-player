const KEYS = {
  playlists: 'iptv_playlists',
  favorites: 'iptv_favorites',
  history: 'iptv_history',
}

function read(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? []
  } catch {
    return []
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error('[storage] Write failed:', e)
    throw new Error('Storage penuh atau tidak tersedia. Data tidak tersimpan.')
  }
}

export const storage = {
  // Playlists
  getPlaylists() {
    return read(KEYS.playlists)
  },
  addPlaylist(name, sourceUrl, channels, id = crypto.randomUUID()) {
    const playlists = read(KEYS.playlists)
    playlists.push({ id, name, sourceUrl: sourceUrl ?? null, addedAt: Date.now(), channels })
    write(KEYS.playlists, playlists)
  },
  removePlaylist(id) {
    write(KEYS.playlists, read(KEYS.playlists).filter(p => p.id !== id))
  },

  // Favorites
  getFavorites() {
    return read(KEYS.favorites)
  },
  toggleFavorite(channel) {
    const favs = read(KEYS.favorites)
    const idx = favs.findIndex(c => c.url === channel.url)
    if (idx >= 0) {
      favs.splice(idx, 1)
    } else {
      favs.push(channel)
    }
    write(KEYS.favorites, favs)
  },
  isFavorite(url) {
    return read(KEYS.favorites).some(c => c.url === url)
  },

  // History
  getHistory() {
    return read(KEYS.history)
  },
  addToHistory(channel) {
    const history = read(KEYS.history)
    const entry = { channel, watchedAt: Date.now() }
    write(KEYS.history, [entry, ...history].slice(0, 50))
  },
  clearHistory() {
    write(KEYS.history, [])
  },
}
