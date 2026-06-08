import { storage } from '../storage'

const mockChannel = {
  name: 'beIN Sports 1',
  url: 'http://stream.example.com/bein1',
  logo: 'https://example.com/logo.png',
  group: 'Sport',
  playlistId: 'playlist-1',
}

beforeEach(() => {
  localStorage.clear()
})

describe('playlists', () => {
  it('starts empty', () => {
    expect(storage.getPlaylists()).toEqual([])
  })

  it('adds and retrieves a playlist', () => {
    storage.addPlaylist('My Playlist', 'http://example.com/playlist.m3u')
    const playlists = storage.getPlaylists()
    expect(playlists).toHaveLength(1)
    expect(playlists[0].name).toBe('My Playlist')
    expect(playlists[0].sourceUrl).toBe('http://example.com/playlist.m3u')
  })

  it('removes a playlist by id', () => {
    storage.addPlaylist('My Playlist', null)
    const id = storage.getPlaylists()[0].id
    storage.removePlaylist(id)
    expect(storage.getPlaylists()).toHaveLength(0)
  })
})

describe('favorites', () => {
  it('starts empty', () => {
    expect(storage.getFavorites()).toEqual([])
  })

  it('adds a favorite via toggleFavorite', () => {
    storage.toggleFavorite(mockChannel)
    expect(storage.getFavorites()).toHaveLength(1)
  })

  it('removes a favorite on second toggle', () => {
    storage.toggleFavorite(mockChannel)
    storage.toggleFavorite(mockChannel)
    expect(storage.getFavorites()).toHaveLength(0)
  })

  it('isFavorite returns true for favorited channel', () => {
    storage.toggleFavorite(mockChannel)
    expect(storage.isFavorite(mockChannel.url)).toBe(true)
  })

  it('isFavorite returns false for non-favorited channel', () => {
    expect(storage.isFavorite(mockChannel.url)).toBe(false)
  })
})

describe('history', () => {
  it('starts empty', () => {
    expect(storage.getHistory()).toEqual([])
  })

  it('adds a history entry', () => {
    storage.addToHistory(mockChannel)
    const history = storage.getHistory()
    expect(history).toHaveLength(1)
    expect(history[0].channel.url).toBe(mockChannel.url)
    expect(history[0].watchedAt).toBeGreaterThan(0)
  })

  it('prepends new entries (newest first)', () => {
    storage.addToHistory({ ...mockChannel, name: 'First' })
    storage.addToHistory({ ...mockChannel, name: 'Second' })
    expect(storage.getHistory()[0].channel.name).toBe('Second')
  })

  it('caps history at 50 entries', () => {
    for (let i = 0; i < 55; i++) {
      storage.addToHistory({ ...mockChannel, url: `http://stream/${i}` })
    }
    expect(storage.getHistory()).toHaveLength(50)
  })

  it('clearHistory empties the list', () => {
    storage.addToHistory(mockChannel)
    storage.clearHistory()
    expect(storage.getHistory()).toHaveLength(0)
  })
})
