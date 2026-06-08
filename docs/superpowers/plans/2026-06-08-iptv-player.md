# IPTV Player Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a lightweight personal web-based IPTV player with M3U playlist import, channel favorites, watch history, and HLS video playback.

**Architecture:** React + Vite SPA with a sidebar (playlists/groups/favorites/history) and a main area (channel list + video player). All persistence through an abstracted `storage.js` layer backed by localStorage so it can be swapped to PocketBase later.

**Tech Stack:** React 18, Vite, HLS.js, Vitest (unit tests for logic), plain CSS

---

## File Structure

```
iptv-player/
├── index.html
├── vite.config.js
├── package.json
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── App.css
│   ├── parseM3U.js              # pure M3U parser, no side effects
│   ├── storage.js               # localStorage abstraction
│   ├── components/
│   │   ├── Sidebar.jsx          # playlist tree, favorites, history links
│   │   ├── ChannelList.jsx      # grid of channels for selected group
│   │   ├── Player.jsx           # HLS.js video player
│   │   └── AddPlaylistModal.jsx # URL paste + file upload form
│   └── __tests__/
│       ├── parseM3U.test.js
│       └── storage.test.js
└── docs/
```

---

## Task 1: Scaffold Vite + React Project

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `index.html`
- Create: `src/main.jsx`
- Create: `src/App.jsx`
- Create: `src/App.css`

- [ ] **Step 1: Initialize project**

```bash
cd /Users/fadhel/Documents/projects/iptv-player
npm create vite@latest . -- --template react
```

When prompted "Current directory is not empty. Remove existing files and continue?" — choose **Yes** (only docs/ exists, git history is safe).

- [ ] **Step 2: Install dependencies**

```bash
npm install
npm install hls.js
npm install -D vitest @vitest/ui
```

- [ ] **Step 3: Configure Vitest in vite.config.js**

Replace the contents of `vite.config.js` with:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
```

- [ ] **Step 4: Add test script to package.json**

In `package.json`, add to `"scripts"`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 5: Verify dev server starts**

```bash
npm run dev
```

Expected: Vite prints a localhost URL, browser shows default React page. Press Ctrl+C to stop.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: scaffold Vite + React project with HLS.js and Vitest"
```

---

## Task 2: M3U Parser

**Files:**
- Create: `src/parseM3U.js`
- Create: `src/__tests__/parseM3U.test.js`

- [ ] **Step 1: Write the failing tests**

Create `src/__tests__/parseM3U.test.js`:

```js
import { parseM3U } from '../parseM3U'

const SAMPLE_M3U = `#EXTM3U
#EXTINF:-1 tvg-logo="https://example.com/logo.png" group-title="Sport",beIN Sports 1
http://stream.example.com/bein1
#EXTINF:-1 group-title="Sport",beIN Sports 2
http://stream.example.com/bein2
#EXTINF:-1 group-title="News",CNN
http://stream.example.com/cnn
#EXTINF:-1,No Group Channel
http://stream.example.com/nogroup
`

describe('parseM3U', () => {
  let channels

  beforeEach(() => {
    channels = parseM3U(SAMPLE_M3U, 'playlist-1')
  })

  it('returns correct number of channels', () => {
    expect(channels).toHaveLength(4)
  })

  it('parses channel name', () => {
    expect(channels[0].name).toBe('beIN Sports 1')
  })

  it('parses stream URL', () => {
    expect(channels[0].url).toBe('http://stream.example.com/bein1')
  })

  it('parses tvg-logo', () => {
    expect(channels[0].logo).toBe('https://example.com/logo.png')
  })

  it('parses group-title', () => {
    expect(channels[0].group).toBe('Sport')
  })

  it('assigns playlistId', () => {
    expect(channels[0].playlistId).toBe('playlist-1')
  })

  it('defaults missing logo to undefined', () => {
    expect(channels[1].logo).toBeUndefined()
  })

  it('defaults missing group to "Umum"', () => {
    expect(channels[3].group).toBe('Umum')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm run test
```

Expected: FAIL — "Cannot find module '../parseM3U'"

- [ ] **Step 3: Implement the parser**

Create `src/parseM3U.js`:

```js
export function parseM3U(content, playlistId) {
  const lines = content.split('\n').map(l => l.trim()).filter(Boolean)
  const channels = []

  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].startsWith('#EXTINF')) continue

    const infoLine = lines[i]
    const url = lines[i + 1]
    if (!url || url.startsWith('#')) continue

    const nameMatch = infoLine.match(/,(.+)$/)
    const logoMatch = infoLine.match(/tvg-logo="([^"]*)"/)
    const groupMatch = infoLine.match(/group-title="([^"]*)"/)

    channels.push({
      name: nameMatch ? nameMatch[1].trim() : 'Unknown',
      url: url.trim(),
      logo: logoMatch?.[1] || undefined,
      group: groupMatch?.[1]?.trim() || 'Umum',
      playlistId,
    })
  }

  return channels
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm run test
```

Expected: PASS — 8 tests

- [ ] **Step 5: Commit**

```bash
git add src/parseM3U.js src/__tests__/parseM3U.test.js
git commit -m "feat: add M3U parser with tests"
```

---

## Task 3: Storage Layer

**Files:**
- Create: `src/storage.js`
- Create: `src/__tests__/storage.test.js`

- [ ] **Step 1: Write the failing tests**

Create `src/__tests__/storage.test.js`:

```js
import { storage } from '../storage'

const mockChannel = {
  name: 'beIN Sports 1',
  url: 'http://stream.example.com/bein1',
  logo: 'https://example.com/logo.png',
  group: 'Sport',
  playlistId: 'playlist-1',
}

const mockPlaylist = {
  id: 'playlist-1',
  name: 'My Playlist',
  sourceUrl: 'http://example.com/playlist.m3u',
  addedAt: 1000,
  channels: [mockChannel],
}

beforeEach(() => {
  localStorage.clear()
})

describe('playlists', () => {
  it('starts empty', () => {
    expect(storage.getPlaylists()).toEqual([])
  })

  it('adds and retrieves a playlist', () => {
    storage.addPlaylist('My Playlist', 'http://example.com/playlist.m3u', [mockChannel])
    const playlists = storage.getPlaylists()
    expect(playlists).toHaveLength(1)
    expect(playlists[0].name).toBe('My Playlist')
    expect(playlists[0].channels).toHaveLength(1)
  })

  it('removes a playlist by id', () => {
    storage.addPlaylist('My Playlist', null, [mockChannel])
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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm run test
```

Expected: FAIL — "Cannot find module '../storage'"

- [ ] **Step 3: Implement storage layer**

Create `src/storage.js`:

```js
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
  localStorage.setItem(key, JSON.stringify(value))
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
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm run test
```

Expected: PASS — all tests green

- [ ] **Step 5: Commit**

```bash
git add src/storage.js src/__tests__/storage.test.js
git commit -m "feat: add localStorage storage layer with tests"
```

---

## Task 4: App Shell Layout

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/App.css`

- [ ] **Step 1: Replace App.jsx with shell layout**

```jsx
import { useState } from 'react'
import Sidebar from './components/Sidebar'
import ChannelList from './components/ChannelList'
import Player from './components/Player'
import './App.css'

export default function App() {
  const [activeView, setActiveView] = useState(null)
  // activeView shape: { type: 'group'|'favorites'|'history', playlistId?, group? }

  const [activeChannel, setActiveChannel] = useState(null)

  return (
    <div className="app">
      <aside className="sidebar">
        <Sidebar activeView={activeView} onSelectView={setActiveView} />
      </aside>
      <main className="main">
        <ChannelList view={activeView} activeChannel={activeChannel} onSelectChannel={setActiveChannel} />
        {activeChannel && <Player channel={activeChannel} />}
      </main>
    </div>
  )
}
```

- [ ] **Step 2: Replace App.css with base styles**

```css
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg: #0f0f0f;
  --surface: #1a1a2e;
  --surface2: #16213e;
  --accent: #e94560;
  --text: #e0e0e0;
  --text-muted: #888;
  --sidebar-width: 240px;
}

body { background: var(--bg); color: var(--text); font-family: system-ui, sans-serif; }

.app {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.sidebar {
  width: var(--sidebar-width);
  min-width: var(--sidebar-width);
  background: var(--surface);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  border-right: 1px solid #222;
}

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
```

- [ ] **Step 3: Create stub components so the app compiles**

Create `src/components/Sidebar.jsx`:

```jsx
export default function Sidebar({ activeView, onSelectView }) {
  return <div style={{ padding: '1rem', color: '#888' }}>Sidebar</div>
}
```

Create `src/components/ChannelList.jsx`:

```jsx
export default function ChannelList({ view, activeChannel, onSelectChannel }) {
  return <div style={{ padding: '1rem', color: '#888' }}>Channel List</div>
}
```

Create `src/components/Player.jsx`:

```jsx
export default function Player({ channel }) {
  return <div style={{ padding: '1rem', color: '#888' }}>Player: {channel?.name}</div>
}
```

- [ ] **Step 4: Verify app compiles and renders layout**

```bash
npm run dev
```

Open browser. Expected: dark page with "Sidebar" text on the left, "Channel List" on the right. No errors in console.

- [ ] **Step 5: Commit**

```bash
git add src/App.jsx src/App.css src/components/
git commit -m "feat: add app shell layout with stub components"
```

---

## Task 5: AddPlaylist Modal

**Files:**
- Create: `src/components/AddPlaylistModal.jsx`

- [ ] **Step 1: Create the modal component**

Create `src/components/AddPlaylistModal.jsx`:

```jsx
import { useState } from 'react'
import { parseM3U } from '../parseM3U'
import { storage } from '../storage'

export default function AddPlaylistModal({ onClose, onAdded }) {
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleUrlSubmit(e) {
    e.preventDefault()
    if (!name.trim() || !url.trim()) return setError('Nama dan URL wajib diisi.')
    setLoading(true)
    setError('')
    try {
      const res = await fetch(url.trim())
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const text = await res.text()
      const id = crypto.randomUUID()
      const channels = parseM3U(text, id)
      if (channels.length === 0) throw new Error('Tidak ada channel ditemukan.')
      storage.addPlaylist(name.trim(), url.trim(), channels, id)
      onAdded()
      onClose()
    } catch (err) {
      setError(`Gagal: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  function handleFileUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!name.trim()) return setError('Isi nama playlist dulu.')
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const id = crypto.randomUUID()
        const channels = parseM3U(ev.target.result, id)
        if (channels.length === 0) return setError('Tidak ada channel ditemukan.')
        storage.addPlaylist(name.trim(), null, channels, id)
        onAdded()
        onClose()
      } catch {
        setError('Gagal parse file M3U.')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>Tambah Playlist M3U</h3>
        <form onSubmit={handleUrlSubmit}>
          <label>Nama Playlist</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="contoh: My IPTV" />

          <label>URL Playlist</label>
          <input value={url} onChange={e => setUrl(e.target.value)} placeholder="http://..." />
          <button type="submit" disabled={loading}>{loading ? 'Loading...' : 'Import dari URL'}</button>
        </form>

        <div className="modal-divider">atau</div>

        <label className="file-upload-label">
          Upload File .m3u
          <input type="file" accept=".m3u,.m3u8" onChange={handleFileUpload} hidden />
        </label>

        {error && <p className="modal-error">{error}</p>}
        <button className="modal-close" onClick={onClose}>Batal</button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Add modal styles to App.css**

Append to `src/App.css`:

```css
.modal-backdrop {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.7);
  display: flex; align-items: center; justify-content: center;
  z-index: 100;
}
.modal {
  background: var(--surface);
  border: 1px solid #333;
  border-radius: 8px;
  padding: 1.5rem;
  width: 360px;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.modal h3 { color: var(--text); font-size: 1rem; }
.modal label { font-size: 0.8rem; color: var(--text-muted); }
.modal input {
  width: 100%; background: var(--bg); border: 1px solid #333;
  border-radius: 4px; padding: 0.5rem 0.75rem; color: var(--text); font-size: 0.9rem;
}
.modal button {
  background: var(--accent); color: #fff; border: none;
  border-radius: 4px; padding: 0.5rem 1rem; cursor: pointer; font-size: 0.9rem;
}
.modal button:disabled { opacity: 0.5; cursor: not-allowed; }
.modal-divider { text-align: center; color: var(--text-muted); font-size: 0.8rem; }
.file-upload-label {
  display: block; text-align: center; padding: 0.5rem;
  border: 1px dashed #444; border-radius: 4px; cursor: pointer;
  color: var(--text-muted); font-size: 0.85rem;
}
.file-upload-label:hover { border-color: var(--accent); color: var(--accent); }
.modal-error { color: var(--accent); font-size: 0.8rem; }
.modal-close { background: #333; }
```

- [ ] **Step 3: Commit**

```bash
git add src/components/AddPlaylistModal.jsx src/App.css
git commit -m "feat: add AddPlaylistModal with URL fetch and file upload"
```

---

## Task 6: Sidebar Component

**Files:**
- Modify: `src/components/Sidebar.jsx`

- [ ] **Step 1: Implement Sidebar**

Replace `src/components/Sidebar.jsx`:

```jsx
import { useState, useEffect } from 'react'
import { storage } from '../storage'
import AddPlaylistModal from './AddPlaylistModal'

export default function Sidebar({ activeView, onSelectView }) {
  const [playlists, setPlaylists] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [expanded, setExpanded] = useState({})

  function refresh() {
    setPlaylists(storage.getPlaylists())
  }

  useEffect(() => { refresh() }, [])

  function toggleExpand(id) {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }))
  }

  function removePlaylist(e, id) {
    e.stopPropagation()
    if (confirm('Hapus playlist ini?')) {
      storage.removePlaylist(id)
      refresh()
    }
  }

  function isActive(view) {
    return JSON.stringify(activeView) === JSON.stringify(view)
  }

  return (
    <>
      <div className="sidebar-header">📺 IPTV Player</div>

      <nav className="sidebar-nav">
        <button
          className={`sidebar-item ${isActive({ type: 'favorites' }) ? 'active' : ''}`}
          onClick={() => onSelectView({ type: 'favorites' })}
        >
          ⭐ Favorit
        </button>
        <button
          className={`sidebar-item ${isActive({ type: 'history' }) ? 'active' : ''}`}
          onClick={() => onSelectView({ type: 'history' })}
        >
          🕐 History
        </button>
      </nav>

      <div className="sidebar-divider" />

      <div className="sidebar-playlists">
        {playlists.map(pl => {
          const groups = [...new Set(pl.channels.map(c => c.group))]
          return (
            <div key={pl.id} className="playlist-section">
              <div className="playlist-header" onClick={() => toggleExpand(pl.id)}>
                <span>{expanded[pl.id] ? '▾' : '▸'} 📋 {pl.name}</span>
                <button className="remove-btn" onClick={e => removePlaylist(e, pl.id)}>✕</button>
              </div>
              {expanded[pl.id] && (
                <div className="group-list">
                  {groups.map(group => (
                    <button
                      key={group}
                      className={`sidebar-item indent ${isActive({ type: 'group', playlistId: pl.id, group }) ? 'active' : ''}`}
                      onClick={() => onSelectView({ type: 'group', playlistId: pl.id, group })}
                    >
                      {group}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="sidebar-footer">
        <button className="add-playlist-btn" onClick={() => setShowModal(true)}>
          + Add M3U
        </button>
      </div>

      {showModal && (
        <AddPlaylistModal onClose={() => setShowModal(false)} onAdded={refresh} />
      )}
    </>
  )
}
```

- [ ] **Step 2: Add sidebar styles to App.css**

Append to `src/App.css`:

```css
.sidebar-header {
  padding: 1rem;
  font-weight: bold;
  color: var(--accent);
  border-bottom: 1px solid #222;
  font-size: 0.95rem;
}
.sidebar-nav { padding: 0.5rem 0; }
.sidebar-item {
  display: block; width: 100%;
  background: none; border: none; text-align: left;
  padding: 0.5rem 1rem; color: var(--text); cursor: pointer;
  font-size: 0.85rem; border-radius: 0;
}
.sidebar-item:hover { background: var(--surface2); }
.sidebar-item.active { background: var(--surface2); color: var(--accent); }
.sidebar-item.indent { padding-left: 2rem; color: var(--text-muted); font-size: 0.82rem; }
.sidebar-divider { border-top: 1px solid #222; margin: 0.25rem 0; }
.sidebar-playlists { flex: 1; overflow-y: auto; }
.playlist-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 0.5rem 1rem; cursor: pointer; font-size: 0.85rem;
  color: var(--text-muted);
}
.playlist-header:hover { background: var(--surface2); }
.remove-btn {
  background: none; border: none; color: #555; cursor: pointer;
  font-size: 0.75rem; padding: 0 0.25rem;
}
.remove-btn:hover { color: var(--accent); }
.sidebar-footer { padding: 0.75rem; border-top: 1px solid #222; }
.add-playlist-btn {
  width: 100%; background: var(--surface2); border: 1px dashed #444;
  border-radius: 4px; color: var(--text-muted); padding: 0.5rem;
  cursor: pointer; font-size: 0.85rem;
}
.add-playlist-btn:hover { border-color: var(--accent); color: var(--accent); }
```

- [ ] **Step 3: Verify in browser**

```bash
npm run dev
```

Expected: Sidebar shows "⭐ Favorit", "🕐 History", and "+ Add M3U" button. Clicking "+ Add M3U" opens the modal. No console errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/Sidebar.jsx src/App.css
git commit -m "feat: implement Sidebar with playlist tree and AddPlaylist modal"
```

---

## Task 7: Channel List Component

**Files:**
- Modify: `src/components/ChannelList.jsx`

- [ ] **Step 1: Implement ChannelList**

Replace `src/components/ChannelList.jsx`:

```jsx
import { useEffect, useState } from 'react'
import { storage } from '../storage'

export default function ChannelList({ view, activeChannel, onSelectChannel }) {
  const [channels, setChannels] = useState([])
  const [favorites, setFavorites] = useState([])

  function refreshFavorites() {
    setFavorites(storage.getFavorites().map(c => c.url))
  }

  useEffect(() => {
    refreshFavorites()
    if (!view) return setChannels([])

    if (view.type === 'favorites') {
      setChannels(storage.getFavorites())
    } else if (view.type === 'history') {
      setChannels(storage.getHistory().map(h => h.channel))
    } else if (view.type === 'group') {
      const playlist = storage.getPlaylists().find(p => p.id === view.playlistId)
      setChannels(playlist ? playlist.channels.filter(c => c.group === view.group) : [])
    }
  }, [view])

  function toggleFav(e, channel) {
    e.stopPropagation()
    storage.toggleFavorite(channel)
    refreshFavorites()
    if (view?.type === 'favorites') {
      setChannels(storage.getFavorites())
    }
  }

  if (!view) {
    return (
      <div className="channel-list-empty">
        <p>Pilih playlist atau kategori di sidebar</p>
      </div>
    )
  }

  return (
    <div className="channel-list">
      <div className="channel-list-header">
        {view.type === 'favorites' && '⭐ Favorit'}
        {view.type === 'history' && '🕐 History'}
        {view.type === 'group' && view.group}
        <span className="channel-count">{channels.length} channel</span>
      </div>
      <div className="channel-grid">
        {channels.map((ch, i) => (
          <div
            key={`${ch.url}-${i}`}
            className={`channel-card ${activeChannel?.url === ch.url ? 'active' : ''}`}
            onClick={() => onSelectChannel(ch)}
          >
            {ch.logo
              ? <img src={ch.logo} alt="" className="channel-logo" onError={e => { e.target.style.display = 'none' }} />
              : <div className="channel-logo-placeholder">📺</div>
            }
            <span className="channel-name">{ch.name}</span>
            <button
              className={`fav-btn ${favorites.includes(ch.url) ? 'faved' : ''}`}
              onClick={e => toggleFav(e, ch)}
              title="Toggle favorit"
            >
              ⭐
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Add channel list styles to App.css**

Append to `src/App.css`:

```css
.channel-list-empty {
  flex: 1; display: flex; align-items: center; justify-content: center;
  color: var(--text-muted); font-size: 0.9rem;
}
.channel-list { display: flex; flex-direction: column; flex: 1; overflow: hidden; }
.channel-list-header {
  padding: 0.75rem 1rem; font-size: 0.9rem; font-weight: bold;
  border-bottom: 1px solid #222; display: flex; align-items: center; gap: 0.5rem;
}
.channel-count { color: var(--text-muted); font-size: 0.75rem; font-weight: normal; }
.channel-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 0.5rem; padding: 0.75rem; overflow-y: auto; flex: 1;
}
.channel-card {
  background: var(--surface); border-radius: 6px; padding: 0.75rem 0.5rem;
  cursor: pointer; display: flex; flex-direction: column; align-items: center;
  gap: 0.5rem; position: relative; border: 1px solid transparent;
  transition: border-color 0.15s;
}
.channel-card:hover { border-color: #444; }
.channel-card.active { border-color: var(--accent); }
.channel-logo { width: 48px; height: 48px; object-fit: contain; border-radius: 4px; }
.channel-logo-placeholder { width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; }
.channel-name { font-size: 0.78rem; text-align: center; color: var(--text); line-height: 1.3; word-break: break-word; }
.fav-btn {
  position: absolute; top: 4px; right: 4px; background: none; border: none;
  cursor: pointer; font-size: 0.75rem; opacity: 0.3; padding: 2px;
}
.fav-btn:hover, .fav-btn.faved { opacity: 1; }
```

- [ ] **Step 3: Verify in browser**

Import a playlist via "+ Add M3U". Click a group in the sidebar.
Expected: Channels appear in a grid with logo (or emoji placeholder). Clicking ⭐ toggles favorite. Active channel card gets accent border.

- [ ] **Step 4: Commit**

```bash
git add src/components/ChannelList.jsx src/App.css
git commit -m "feat: implement ChannelList with favorites toggle"
```

---

## Task 8: Video Player Component

**Files:**
- Modify: `src/components/Player.jsx`

- [ ] **Step 1: Implement Player with HLS.js**

Replace `src/components/Player.jsx`:

```jsx
import { useEffect, useRef } from 'react'
import Hls from 'hls.js'
import { storage } from '../storage'

export default function Player({ channel }) {
  const videoRef = useRef(null)
  const hlsRef = useRef(null)

  useEffect(() => {
    if (!channel || !videoRef.current) return

    storage.addToHistory(channel)

    const video = videoRef.current
    if (hlsRef.current) {
      hlsRef.current.destroy()
      hlsRef.current = null
    }

    if (Hls.isSupported()) {
      const hls = new Hls()
      hlsRef.current = hls
      hls.loadSource(channel.url)
      hls.attachMedia(video)
      hls.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(() => {}))
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari native HLS
      video.src = channel.url
      video.play().catch(() => {})
    }

    return () => {
      hlsRef.current?.destroy()
      hlsRef.current = null
    }
  }, [channel?.url])

  return (
    <div className="player">
      <div className="player-title">
        {channel.logo && <img src={channel.logo} alt="" className="player-logo" onError={e => { e.target.style.display = 'none' }} />}
        <span>{channel.name}</span>
      </div>
      <video
        ref={videoRef}
        className="player-video"
        controls
        playsInline
      />
    </div>
  )
}
```

- [ ] **Step 2: Add player styles to App.css**

Append to `src/App.css`:

```css
.player {
  border-top: 1px solid #222;
  background: #000;
  display: flex;
  flex-direction: column;
}
.player-title {
  display: flex; align-items: center; gap: 0.5rem;
  padding: 0.5rem 1rem; font-size: 0.85rem; background: var(--surface);
  border-bottom: 1px solid #222;
}
.player-logo { width: 24px; height: 24px; object-fit: contain; }
.player-video {
  width: 100%;
  max-height: 45vh;
  background: #000;
  display: block;
}
```

- [ ] **Step 3: Verify player works end-to-end**

```bash
npm run dev
```

1. Import a playlist (paste URL of a working .m3u file).
2. Click a channel group in sidebar.
3. Click a channel card.

Expected: Video player appears below channel list, stream starts playing. Channel name shows above the video. Check "🕐 History" in sidebar — should show the channel just played.

- [ ] **Step 4: Commit**

```bash
git add src/components/Player.jsx src/App.css
git commit -m "feat: implement HLS.js video player with history tracking"
```

---

## Task 9: Run All Tests + Final Check

- [ ] **Step 1: Run full test suite**

```bash
npm run test
```

Expected: All tests pass (parseM3U + storage).

- [ ] **Step 2: Manual smoke test**

```bash
npm run dev
```

Test checklist:
1. Open app → sidebar shows Favorit, History, "+ Add M3U"
2. Click "+ Add M3U" → modal opens with URL field and file upload
3. Import a playlist → playlist appears in sidebar, groups visible on expand
4. Click a group → channels appear in grid
5. Click a channel → player appears, stream plays, history updates
6. Click ⭐ on a channel → it appears in Favorit section
7. Open Favorit → shows favorited channels from any playlist
8. Click ⭐ again → channel removed from Favorit
9. Open History → shows recently played channels newest first
10. Refresh page → all data persists (localStorage)

- [ ] **Step 3: Build for production**

```bash
npm run build
```

Expected: `dist/` folder created with static files. No build errors.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete IPTV player — all features working"
```
