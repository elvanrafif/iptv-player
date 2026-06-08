import { useState } from 'react'
import Sidebar from './components/Sidebar'
import ChannelList from './components/ChannelList'
import Player from './components/Player'
import './App.css'

export default function App() {
  const [activeView, setActiveView] = useState(null)
  // activeView shape: { type: 'group'|'favorites'|'history', playlistId?, group? }

  const [activeChannel, setActiveChannel] = useState(null)

  return (
    <div className="app">
      <aside className="sidebar">
        <Sidebar activeView={activeView} onSelectView={setActiveView} />
      </aside>
      <main className="main">
        <ChannelList view={activeView} activeChannel={activeChannel} onSelectChannel={setActiveChannel} />
        {activeChannel && <Player channel={activeChannel} />}
      </main>
    </div>
  )
}
