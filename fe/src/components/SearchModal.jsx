import { useEffect, useRef } from 'react'

export default function SearchModal({ channelCache, playlists, query, onQueryChange, onSelectChannel, onClose, activeChannel, savedScrollTop, onScrollSave }) {
  const inputRef = useRef(null)
  const resultsRef = useRef(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  useEffect(() => {
    if (resultsRef.current && savedScrollTop) {
      resultsRef.current.scrollTop = savedScrollTop
    }
  }, [])

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const playlistName = Object.fromEntries((playlists || []).map(p => [p.id, p.name]))

  const allChannels = Object.entries(channelCache).flatMap(([pid, channels]) =>
    channels.map(ch => ({ ...ch, playlistName: playlistName[pid] || '' }))
  )

  const q = query.trim().toLowerCase()
  const results = q
    ? allChannels.filter(ch => ch.name.toLowerCase().includes(q)).slice(0, 60)
    : []

  function handleSelect(channel) {
    onSelectChannel(channel)
    onClose()
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="search-modal" onClick={e => e.stopPropagation()}>
        <div className="search-input-wrap">
          <span className="search-icon">🔍</span>
          <input
            ref={inputRef}
            className="search-input"
            placeholder="Cari nama channel..."
            value={query}
            onChange={e => onQueryChange(e.target.value)}
          />
          {query && (
            <button className="search-clear" onClick={() => onQueryChange('')}>✕</button>
          )}
        </div>
        <div className="search-results" ref={resultsRef} onScroll={e => onScrollSave(e.currentTarget.scrollTop)}>
          {!q && <div className="search-hint">Ketik nama channel dari semua playlist</div>}
          {q && results.length === 0 && <div className="search-hint">Tidak ada channel ditemukan untuk "{query}"</div>}
          {results.map((ch, i) => (
            <button key={`${ch.url}-${i}`} className={`search-result-item ${activeChannel?.url === ch.url ? 'active' : ''}`} onClick={() => handleSelect(ch)}>
              {ch.logo
                ? <img src={ch.logo} alt="" className="search-result-logo" onError={e => { e.target.style.display = 'none' }} />
                : <div className="search-result-logo-placeholder">📺</div>
              }
              <div className="search-result-info">
                <span className="search-result-name">{ch.name}</span>
                <span className="search-result-meta">{[ch.group, ch.playlistName].filter(Boolean).join(' · ')}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
