import pb from './lib/pb'

// ── Playlists ──────────────────────────────────────────────────────────────

export function getPlaylists() {
  return pb.collection('playlists').getFullList({ sort: 'created' })
}

export function addPlaylist(name, sourceUrl) {
  return pb.collection('playlists').create({
    name,
    source_url: sourceUrl || null,
  })
}

export function removePlaylist(id) {
  return pb.collection('playlists').delete(id)
}

// ── Favorites ──────────────────────────────────────────────────────────────

export async function getFavoriteMap() {
  const records = await pb.collection('favorites').getFullList()
  return Object.fromEntries(records.map(r => [r.channel_url, r.id]))
}

export async function getFavoriteChannels() {
  const records = await pb.collection('favorites').getFullList({ sort: '-created' })
  return records.map(toChannel)
}

export function addFavorite(channel) {
  return pb.collection('favorites').create({
    playlist: channel.playlistId,
    channel_url: channel.url,
    channel_name: channel.name,
    channel_logo: channel.logo || null,
    channel_group: channel.group || null,
  })
}

export function removeFavorite(recordId) {
  return pb.collection('favorites').delete(recordId)
}

// ── History ────────────────────────────────────────────────────────────────

export async function getHistoryChannels() {
  const records = await pb.collection('history').getFullList({ sort: '-watched_at' })
  return records.map(toChannel)
}

export function addToHistory(channel) {
  return pb.collection('history').create({
    playlist: channel.playlistId,
    channel_url: channel.url,
    channel_name: channel.name,
    channel_logo: channel.logo || null,
    channel_group: channel.group || null,
    watched_at: new Date().toISOString(),
  })
}

// ── Helpers ────────────────────────────────────────────────────────────────

function toChannel(r) {
  return {
    url: r.channel_url,
    name: r.channel_name,
    logo: r.channel_logo || undefined,
    group: r.channel_group || 'Umum',
    playlistId: r.playlist,
  }
}
