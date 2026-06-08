export function parseM3U(content, playlistId) {
  const lines = content.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
  const channels = []

  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].startsWith('#EXTINF')) continue

    const infoLine = lines[i]
    const url = lines[i + 1]
    if (!url || url.startsWith('#')) continue

    const nameMatch = infoLine.match(/,(.+)$/)
    const logoMatch = infoLine.match(/tvg-logo="([^"]*)"/)
    const groupMatch = infoLine.match(/group-title="([^"]*)"/)

    channels.push({
      name: nameMatch ? nameMatch[1].trim() : 'Unknown',
      url: url.trim(),
      logo: logoMatch?.[1] || undefined,
      group: groupMatch?.[1]?.trim() || 'Umum',
      playlistId,
    })
  }

  return channels
}
