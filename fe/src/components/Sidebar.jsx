import { useState } from 'react'
import * as api from '../api'
import AddPlaylistModal from './AddPlaylistModal'

export default function Sidebar({
  playlists, activeView, onSelectView, channelCache,
  loadingPlaylists, isAdmin, onPlaylistAdded, onPlaylistRemoved,
  onSearchOpen, onLogout,
}) {
  const [showModal, setShowModal] = useState(false)
  const [expanded, setExpanded] = useState({})

  function toggleExpand(id) {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }))
  }

  async function removePlaylist(e, id) {
    e.stopPropagation()
    if (!confirm('Hapus playlist ini?')) return
    await api.removePlaylist(id)
    onPlaylistRemoved(id)
  }

  function isActive(view) {
    return JSON.stringify(activeView) === JSON.stringify(view)
  }

  return (
    <>
      <div className="sidebar-header">
        <span className="brand">IPTV</span>
        <span className="brand-sub">Player</span>
      </div>

      <nav className="sidebar-nav">
        <button className="sidebar-item" onClick={onSearchOpen}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="4.25" stroke="currentColor" strokeWidth="1.5"/><path d="M9.5 9.5L12.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          Cari Channel
        </button>
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
                <span>{expanded[pl.id] ? '▾' : '▸'} {pl.name}</span>
                {isAdmin && (
                  <button className="remove-btn" onClick={e => removePlaylist(e, pl.id)}>✕</button>
                )}
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
        {isAdmin && (
          <button className="add-playlist-btn" onClick={() => setShowModal(true)}>
            + Add M3U
          </button>
        )}
        <button className="logout-btn" onClick={onLogout}>Keluar</button>
      </div>

      {showModal && (
        <AddPlaylistModal
          onClose={() => setShowModal(false)}
          onPlaylistAdded={(playlist, channels) => {
            setShowModal(false)
            onPlaylistAdded(playlist, channels)
          }}
        />
      )}
    </>
  )
}
