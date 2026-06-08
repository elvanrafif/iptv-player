import { useState, useEffect, useCallback } from 'react'
import Sidebar from './components/Sidebar'
import ChannelList from './components/ChannelList'
import Player from './components/Player'
import SearchModal from './components/SearchModal'
import { storage } from './storage'
import { parseM3U } from './parseM3U'
import './App.css'

export default function App() {
  const [activeView, setActiveView] = useState(null)
  const [activeChannel, setActiveChannel] = useState(null)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  // channelCache: { [playlistId]: Channel[] } — kept in memory, never in localStorage
  const [channelCache, setChannelCache] = useState({})
  const [loading, setLoading] = useState({}) // { [playlistId]: true } while fetching

  const fetchPlaylistChannels = useCallback(async (playlist) => {
    if (!playlist.sourceUrl) return
    setLoading(prev => ({ ...prev, [playlist.id]: true }))
    try {
      const res = await fetch(playlist.sourceUrl)
      if (!res.ok) return
      const text = await res.text()
      const channels = parseM3U(text, playlist.id)
      setChannelCache(prev => ({ ...prev, [playlist.id]: channels }))
    } finally {
      setLoading(prev => ({ ...prev, [playlist.id]: false }))
    }
  }, [])

  // Re-fetch all URL-based playlists on startup
  useEffect(() => {
    storage.getPlaylists().forEach(pl => {
      if (pl.sourceUrl) fetchPlaylistChannels(pl)
    })
  }, [fetchPlaylistChannels])

  function handlePlaylistAdded(playlistId, channels, sourceUrl) {
    if (channels) {
      // File upload: channels already parsed
      setChannelCache(prev => ({ ...prev, [playlistId]: channels }))
    } else if (sourceUrl) {
      // URL: re-fetch (already saved in storage)
      fetchPlaylistChannels({ id: playlistId, sourceUrl })
    }
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <Sidebar
          activeView={activeView}
          onSelectView={setActiveView}
          channelCache={channelCache}
          loadingPlaylists={loading}
          onPlaylistAdded={handlePlaylistAdded}
          onSearchOpen={() => setShowSearch(true)}
        />
      </aside>
      <main className="main">
        {activeChannel && <Player channel={activeChannel} />}
        <ChannelList
          view={activeView}
          activeChannel={activeChannel}
          onSelectChannel={setActiveChannel}
          channelCache={channelCache}
        />
      </main>
      {showSearch && (
        <SearchModal
          channelCache={channelCache}
          query={searchQuery}
          onQueryChange={setSearchQuery}
          onSelectChannel={setActiveChannel}
          onClose={() => setShowSearch(false)}
        />
      )}
    </div>
  )
}
