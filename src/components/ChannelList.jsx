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
