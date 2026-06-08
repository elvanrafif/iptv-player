import { useState, useEffect } from 'react'
import { storage } from '../storage'
import AddPlaylistModal from './AddPlaylistModal'

export default function Sidebar({ activeView, onSelectView, channelCache, loadingPlaylists, onPlaylistAdded }) {
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

  function handleAdded(playlistId, channels, sourceUrl) {
    refresh()
    onPlaylistAdded(playlistId, channels, sourceUrl)
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
          const channels = channelCache[pl.id] || []
          const groups = [...new Set(channels.map(c => c.group))]
          const isLoading = loadingPlaylists[pl.id]
          return (
            <div key={pl.id} className="playlist-section">
              <div className="playlist-header" onClick={() => toggleExpand(pl.id)}>
                <span>{expanded[pl.id] ? '▾' : '▸'} 📋 {pl.name}</span>
                <button className="remove-btn" onClick={e => removePlaylist(e, pl.id)}>✕</button>
              </div>
              {expanded[pl.id] && (
                <div className="group-list">
                  {isLoading && <div className="sidebar-loading">Memuat...</div>}
                  {!isLoading && groups.length === 0 && (
                    <div className="sidebar-loading">Tidak ada channel.</div>
                  )}
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
        <AddPlaylistModal
          onClose={() => setShowModal(false)}
          onPlaylistAdded={handleAdded}
        />
      )}
    </>
  )
}
