# IPTV Player — Design Spec

**Date:** 2026-06-08  
**Goal:** Personal lightweight web-based IPTV player for watching World Cup and saving favorite channels from multiple M3U playlists.

---

## Stack

- **Framework:** React + Vite (static output, no backend)
- **Video:** HLS.js (handles HLS/M3U8 streams)
- **Storage:** localStorage via abstracted data layer (swappable to PocketBase later)
- **Styling:** Plain CSS or Tailwind (minimal)

---

## Layout

Sidebar (fixed left) + main area (right).

```
┌─────────────────┬────────────────────────────────┐
│  SIDEBAR        │  MAIN AREA                     │
│                 │                                │
│  ⭐ Favorit     │  [Channel List]                │
│  🕐 History     │                                │
│  ─────────────  │  ┌──────────────────────────┐  │
│  📋 Playlist 1  │  │                          │  │
│    🏆 Sport     │  │     Video Player         │  │
│    📰 News      │  │     (HLS.js)             │  │
│  📋 Playlist 2  │  │                          │  │
│    🎬 Movies    │  └──────────────────────────┘  │
│                 │                                │
│  [+ Add M3U]    │                                │
└─────────────────┴────────────────────────────────┘
```

---

## Features

### Import Playlist
- Paste URL ke file `.m3u` atau `.m3u8` (di-fetch langsung dari browser)
- Upload file `.m3u` dari komputer
- Playlist diberi nama saat import (bisa di-rename)
- Channel di-parse saat import, disimpan ke localStorage

### M3U Parsing
- Parse `#EXTINF` attributes: nama channel, `tvg-logo`, `group-title`
- Groups otomatis terbentuk dari nilai `group-title` tiap channel
- Channel tanpa group masuk ke group "Umum"

### Sidebar Navigation
- **Favorit** — tampil di paling atas, selalu accessible
- **History** — channel yang pernah diputar, urut terbaru
- Per playlist: collapsible list of groups → klik group → tampil channel list di main area
- Tombol "+ Add M3U" di bawah sidebar

### Channel List
- Grid atau list di main area, klik channel → langsung play
- Tampil logo channel (`tvg-logo`) kalau ada
- Tombol ⭐ di tiap channel untuk toggle favorit

### Video Player
- HLS.js untuk stream HLS/M3U8
- Native `<video>` element — fullscreen support bawaan browser
- Tampil nama channel yang sedang diputar

### Favorites
- Bisa favorit channel dari playlist manapun
- Disimpan by stream URL (unik identifier)
- Section Favorit di sidebar tampil semua favorit lintas playlist

### Watch History
- Setiap channel yang diputar masuk ke history
- Simpan: nama channel, URL, logo, timestamp, nama playlist asal
- Tampil di section History sidebar, urut terbaru
- Batas history: 50 entri terakhir

---

## Data Layer (localStorage)

Interface abstrak `storage.js` — semua read/write lewat sini, bukan langsung ke localStorage.

```js
// playlists
getPlaylists() → Playlist[]
addPlaylist(name, url, channels) → void
removePlaylist(id) → void

// favorites
getFavorites() → Channel[]
toggleFavorite(channel) → void
isFavorite(url) → boolean

// history
getHistory() → HistoryEntry[]
addToHistory(channel) → void
clearHistory() → void
```

Saat integrasi PocketBase nanti: buat `pocketbase-storage.js` dengan interface yang sama, swap di satu tempat.

---

## Data Shapes

```ts
type Channel = {
  name: string
  url: string
  logo?: string
  group: string
  playlistId: string
}

type Playlist = {
  id: string
  name: string
  sourceUrl?: string  // kalau dari URL
  addedAt: number
  channels: Channel[]
}

type HistoryEntry = {
  channel: Channel
  watchedAt: number
}
```

---

## Out of Scope

- EPG / jadwal acara
- Multi-audio track / subtitle management
- User authentication
- Sharing playlists
- PWA / offline support
