import { useEffect, useState } from 'react'
import { storage } from '../storage'
import ChannelDetailModal from './ChannelDetailModal'

export default function ChannelList({ view, activeChannel, onSelectChannel, channelCache }) {
  const [channels, setChannels] = useState([])
  const [favorites, setFavorites] = useState([])
  const [detailChannel, setDetailChannel] = useState(null)

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
      const all = channelCache[view.playlistId] || []
      setChannels(all.filter(c => c.group === view.group))
    }
  }, [view, channelCache])

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
      {channels.length === 0 && (
        <div className="channel-list-empty">
          <p>{view.type === 'favorites' ? 'Belum ada favorit.' : view.type === 'history' ? 'Belum ada history.' : 'Tidak ada channel.'}</p>
        </div>
      )}
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
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M8 1.5l1.545 3.13 3.455.502-2.5 2.437.59 3.44L8 9.345l-3.09 1.664.59-3.44L3 5.132l3.455-.502L8 1.5z"
                  stroke={favorites.includes(ch.url) ? '#facc15' : 'white'}
                  strokeWidth="1.4"
                  strokeLinejoin="round"
                  fill={favorites.includes(ch.url) ? '#facc15' : 'none'}
                />
              </svg>
            </button>
            <button
              className="info-btn"
              onClick={e => { e.stopPropagation(); setDetailChannel(ch) }}
              title="Detail channel"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="8" cy="8" r="7.25" stroke="white" strokeWidth="1.5"/>
                <rect x="7.25" y="6.5" width="1.5" height="5" rx="0.75" fill="white"/>
                <circle cx="8" cy="4.5" r="0.85" fill="white"/>
              </svg>
            </button>
          </div>
        ))}
      </div>
      {detailChannel && (
        <ChannelDetailModal
          channel={detailChannel}
          onPlay={onSelectChannel}
          onClose={() => setDetailChannel(null)}
        />
      )}
    </div>
  )
}
