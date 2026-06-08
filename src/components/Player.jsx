import { useEffect, useRef, useState } from 'react'
import Hls from 'hls.js'
import { storage } from '../storage'

export default function Player({ channel }) {
  const videoRef = useRef(null)
  const hlsRef = useRef(null)
  const [streamError, setStreamError] = useState(null)

  useEffect(() => {
    if (!channel || !videoRef.current) return

    storage.addToHistory(channel)
    setStreamError(null)

    const video = videoRef.current
    if (hlsRef.current) {
      hlsRef.current.destroy()
      hlsRef.current = null
    }

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
      // Safari native HLS
      video.src = channel.url
      video.play().catch(() => {})
    }

    return () => {
      hlsRef.current?.destroy()
      hlsRef.current = null
    }
  }, [channel?.url])

  return (
    <div className="player">
      <div className="player-title">
        {channel.logo && <img src={channel.logo} alt="" className="player-logo" onError={e => { e.target.style.display = 'none' }} />}
        <span>{channel.name}</span>
      </div>
      {streamError
        ? <div className="player-error">{streamError}</div>
        : <video ref={videoRef} className="player-video" controls playsInline />
      }
    </div>
  )
}
