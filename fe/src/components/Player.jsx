import { useEffect, useRef, useState } from 'react'
import Hls from 'hls.js'
import * as api from '../api'

export default function Player({ channel, isFavorited, onToggleFavorite, isAdmin }) {
  const videoRef = useRef(null)
  const hlsRef = useRef(null)
  const [streamError, setStreamError] = useState(null)

  useEffect(() => {
    if (!channel || !videoRef.current) return

    api.addToHistory(channel)
    setStreamError(null)

    const video = videoRef.current
    if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null }

    if (Hls.isSupported()) {
      const hls = new Hls()
      hlsRef.current = hls
      hls.loadSource(channel.url)
      hls.attachMedia(video)
      hls.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(() => {}))
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) setStreamError('Stream tidak tersedia atau error.')
      })
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = channel.url
      video.play().catch(() => {})
    }

    return () => { hlsRef.current?.destroy(); hlsRef.current = null }
  }, [channel?.url])

  return (
    <div className="player">
      <div className="player-title">
        <div className="player-title-left">
          {channel.logo && <img src={channel.logo} alt="" className="player-logo" onError={e => { e.target.style.display = 'none' }} />}
          <span>{channel.name}</span>
        </div>
        {isAdmin && (
          <button
            className={`player-fav-btn ${isFavorited ? 'faved' : ''}`}
            onClick={onToggleFavorite}
            title={isFavorited ? 'Hapus dari favorit' : 'Tambah ke favorit'}
          >
            <svg width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M8 1.5l1.545 3.13 3.455.502-2.5 2.437.59 3.44L8 9.345l-3.09 1.664.59-3.44L3 5.132l3.455-.502L8 1.5z"
                stroke={isFavorited ? '#facc15' : 'white'}
                strokeWidth="1.4"
                strokeLinejoin="round"
                fill={isFavorited ? '#facc15' : 'none'}
              />
            </svg>
          </button>
        )}
      </div>
      {streamError && <div className="player-error">{streamError}</div>}
      <video ref={videoRef} className="player-video" controls playsInline style={{ display: streamError ? 'none' : 'block' }} />
    </div>
  )
}
