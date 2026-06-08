import { useEffect, useState } from 'react'

export default function ChannelDetailModal({ channel, playlists, onPlay, onClose }) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const playlist = (playlists || []).find(p => p.id === channel.playlistId)

  async function copyUrl() {
    await navigator.clipboard.writeText(channel.url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const fields = [
    { label: 'Nama',     value: channel.name },
    { label: 'Grup',     value: channel.group },
    { label: 'Playlist', value: playlist?.name },
    { label: 'TVG ID',   value: channel.tvgId },
    { label: 'TVG Name', value: channel.tvgName },
    { label: 'Negara',   value: channel.country },
    { label: 'Bahasa',   value: channel.language },
  ].filter(f => f.value)

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="detail-modal" onClick={e => e.stopPropagation()}>
        <div className="detail-header">
          {channel.logo
            ? <img src={channel.logo} alt="" className="detail-logo" onError={e => { e.target.style.display = 'none' }} />
            : <div className="detail-logo-placeholder">📺</div>
          }
          <div className="detail-title-wrap">
            <h2 className="detail-title">{channel.name}</h2>
            <span className="detail-group">{channel.group}</span>
          </div>
        </div>
        <div className="detail-fields">
          {fields.map(f => (
            <div key={f.label} className="detail-row">
              <span className="detail-label">{f.label}</span>
              <span className="detail-value">{f.value}</span>
            </div>
          ))}
          <div className="detail-row detail-row--url">
            <span className="detail-label">Stream URL</span>
            <span className="detail-url">{channel.url}</span>
          </div>
        </div>
        <div className="detail-actions">
          <button className="detail-btn-play" onClick={() => { onPlay(channel); onClose() }}>▶ Putar</button>
          <button className="detail-btn-copy" onClick={copyUrl}>{copied ? '✓ Tersalin' : '⎘ Salin URL'}</button>
          <button className="detail-btn-close" onClick={onClose}>Tutup</button>
        </div>
      </div>
    </div>
  )
}
