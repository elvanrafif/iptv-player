import { useState, useEffect, useCallback } from 'react'
import pb from './lib/pb'
import * as api from './api'
import Sidebar from './components/Sidebar'
import ChannelList from './components/ChannelList'
import Player from './components/Player'
import SearchModal from './components/SearchModal'
import LoginPage from './components/LoginPage'
import { parseM3U } from './parseM3U'
import './App.css'

export default function App() {
  const [user, setUser] = useState(pb.authStore.model)
  const [playlists, setPlaylists] = useState([])
  const [activeView, setActiveView] = useState(null)
  const [activeChannel, setActiveChannel] = useState(null)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [channelCache, setChannelCache] = useState({})
  const [loading, setLoading] = useState({})
  const [favoriteMap, setFavoriteMap] = useState({})

  const isAdmin = user?.role === 'admin'

  const refreshFavoriteMap = useCallback(async () => {
    const map = await api.getFavoriteMap()
    setFavoriteMap(map)
  }, [])

  const toggleFav = useCallback(async (channel) => {
    const favId = favoriteMap[channel.url]
    if (favId) {
      setFavoriteMap(prev => { const n = { ...prev }; delete n[channel.url]; return n })
      await api.removeFavorite(favId)
    } else {
      const record = await api.addFavorite(channel)
      setFavoriteMap(prev => ({ ...prev, [channel.url]: record.id }))
    }
  }, [favoriteMap])

  useEffect(() => {
    return pb.authStore.onChange((_, model) => setUser(model))
  }, [])

  const fetchPlaylistChannels = useCallback(async (playlist) => {
    if (!playlist.sourceUrl) return
    setLoading(prev => ({ ...prev, [playlist.id]: true }))
    try {
      const res = await fetch(playlist.sourceUrl)
      if (!res.ok) return
      const text = await res.text()
      setChannelCache(prev => ({ ...prev, [playlist.id]: parseM3U(text, playlist.id) }))
    } finally {
      setLoading(prev => ({ ...prev, [playlist.id]: false }))
    }
  }, [])

  useEffect(() => {
    if (!user) return
    api.getPlaylists().then(records => {
      setPlaylists(records)
      records.forEach(pl => {
        if (pl.source_url) fetchPlaylistChannels({ id: pl.id, sourceUrl: pl.source_url })
      })
    })
    refreshFavoriteMap()
  }, [user, fetchPlaylistChannels, refreshFavoriteMap])

  function handlePlaylistAdded(playlist, channels) {
    setPlaylists(prev => [...prev, playlist])
    if (channels) {
      setChannelCache(prev => ({ ...prev, [playlist.id]: channels }))
    } else if (playlist.source_url) {
      fetchPlaylistChannels({ id: playlist.id, sourceUrl: playlist.source_url })
    }
  }

  function handlePlaylistRemoved(id) {
    setPlaylists(prev => prev.filter(p => p.id !== id))
    setChannelCache(prev => { const n = { ...prev }; delete n[id]; return n })
    if (activeView?.playlistId === id) setActiveView(null)
  }

  if (!user) return <LoginPage />

  return (
    <div className="app">
      <aside className="sidebar">
        <Sidebar
          playlists={playlists}
          activeView={activeView}
          onSelectView={setActiveView}
          channelCache={channelCache}
          loadingPlaylists={loading}
          isAdmin={isAdmin}
          onPlaylistAdded={handlePlaylistAdded}
          onPlaylistRemoved={handlePlaylistRemoved}
          onSearchOpen={() => setShowSearch(true)}
          onLogout={() => pb.authStore.clear()}
        />
      </aside>
      <main className="main">
        {activeChannel && <Player channel={activeChannel} />}
        <ChannelList
          view={activeView}
          activeChannel={activeChannel}
          onSelectChannel={setActiveChannel}
          channelCache={channelCache}
          playlists={playlists}
          isAdmin={isAdmin}
          favoriteMap={favoriteMap}
          onToggleFav={toggleFav}
        />
      </main>
      {showSearch && (
        <SearchModal
          channelCache={channelCache}
          playlists={playlists}
          query={searchQuery}
          onQueryChange={setSearchQuery}
          onSelectChannel={setActiveChannel}
          onClose={() => setShowSearch(false)}
        />
      )}
    </div>
  )
}
