import { useEffect, useState } from 'react'
import * as api from '../api'
import ChannelDetailModal from './ChannelDetailModal'

export default function ChannelList({ view, activeChannel, onSelectChannel, channelCache, playlists, isAdmin, favoriteMap, onToggleFav }) {
  const [channels, setChannels] = useState([])
  const [detailChannel, setDetailChannel] = useState(null)

  useEffect(() => {
    if (!view) return setChannels([])

    async function load() {
      if (view.type === 'favorites') {
        setChannels(await api.getFavoriteChannels())
      } else if (view.type === 'history') {
        setChannels(await api.getHistoryChannels())
      } else if (view.type === 'group') {
        const all = channelCache[view.playlistId] || []
        setChannels(all.filter(c => c.group === view.group))
      }
    }
    load()
  }, [view, channelCache, favoriteMap])

  async function handleToggleFav(e, channel) {
    e.stopPropagation()
    const wasFavorited = !!favoriteMap[channel.url]
    await onToggleFav(channel)
    if (wasFavorited && view?.type === 'favorites') {
      setChannels(prev => prev.filter(c => c.url !== channel.url))
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
            {isAdmin && (
              <button
                className={`fav-btn ${favoriteMap[ch.url] ? 'faved' : ''}`}
                onClick={e => handleToggleFav(e, ch)}
                title="Toggle favorit"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M8 1.5l1.545 3.13 3.455.502-2.5 2.437.59 3.44L8 9.345l-3.09 1.664.59-3.44L3 5.132l3.455-.502L8 1.5z"
                    stroke={favoriteMap[ch.url] ? '#facc15' : 'white'}
                    strokeWidth="1.4"
                    strokeLinejoin="round"
                    fill={favoriteMap[ch.url] ? '#facc15' : 'none'}
                  />
                </svg>
              </button>
            )}
            <button
              className="info-btn"
              onClick={e => { e.stopPropagation(); setDetailChannel(ch) }}
              title="Detail channel"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
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
          playlists={playlists}
          onPlay={onSelectChannel}
          onClose={() => setDetailChannel(null)}
        />
      )}
    </div>
  )
}
