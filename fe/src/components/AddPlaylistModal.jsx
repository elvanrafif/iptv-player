import { useState } from 'react'
import { parseM3U } from '../parseM3U'
import * as api from '../api'

export default function AddPlaylistModal({ onClose, onPlaylistAdded }) {
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleUrlSubmit(e) {
    e.preventDefault()
    if (!name.trim() || !url.trim()) return setError('Nama dan URL wajib diisi.')
    setLoading(true)
    setError('')
    try {
      const res = await fetch(url.trim())
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const text = await res.text()
      const playlist = await api.addPlaylist(name.trim(), url.trim())
      const channels = parseM3U(text, playlist.id)
      if (channels.length === 0) throw new Error('Tidak ada channel ditemukan.')
      onPlaylistAdded(playlist, null)
    } catch (err) {
      setError(`Gagal: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  function handleFileUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!name.trim()) return setError('Isi nama playlist dulu.')
    const reader = new FileReader()
    reader.onload = async (ev) => {
      try {
        const playlist = await api.addPlaylist(name.trim(), null)
        const channels = parseM3U(ev.target.result, playlist.id)
        if (channels.length === 0) return setError('Tidak ada channel ditemukan.')
        onPlaylistAdded(playlist, channels)
      } catch {
        setError('Gagal menyimpan playlist.')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>Tambah Playlist M3U</h3>
        <form onSubmit={handleUrlSubmit}>
          <label>Nama Playlist</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="contoh: My IPTV" />
          <label>URL Playlist</label>
          <input value={url} onChange={e => setUrl(e.target.value)} placeholder="http://..." />
          <button type="submit" disabled={loading}>{loading ? 'Loading...' : 'Import dari URL'}</button>
        </form>
        <div className="modal-divider">atau</div>
        <label className="file-upload-label">
          Upload File .m3u
          <input type="file" accept=".m3u,.m3u8" onChange={handleFileUpload} hidden />
        </label>
        {error && <p className="modal-error">{error}</p>}
        <button className="modal-close" onClick={onClose}>Batal</button>
      </div>
    </div>
  )
}
