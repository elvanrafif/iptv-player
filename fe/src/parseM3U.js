export function parseM3U(content, playlistId) {
  const lines = content.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
  const channels = []

  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].startsWith('#EXTINF')) continue

    const infoLine = lines[i]
    const url = lines[i + 1]
    if (!url || url.startsWith('#')) continue

    const nameMatch     = infoLine.match(/,(.+)$/)
    const logoMatch     = infoLine.match(/tvg-logo="([^"]*)"/)
    const groupMatch    = infoLine.match(/group-title="([^"]*)"/)
    const tvgIdMatch    = infoLine.match(/tvg-id="([^"]*)"/)
    const tvgNameMatch  = infoLine.match(/tvg-name="([^"]*)"/)
    const countryMatch  = infoLine.match(/tvg-country="([^"]*)"/)
    const langMatch     = infoLine.match(/tvg-language="([^"]*)"/)

    const channel = {
      name: nameMatch ? nameMatch[1].trim() : 'Unknown',
      url: url.trim(),
      logo: logoMatch?.[1] || undefined,
      group: groupMatch?.[1]?.trim() || 'Umum',
      playlistId,
    }

    if (tvgIdMatch?.[1])   channel.tvgId    = tvgIdMatch[1]
    if (tvgNameMatch?.[1]) channel.tvgName  = tvgNameMatch[1]
    if (countryMatch?.[1]) channel.country  = countryMatch[1]
    if (langMatch?.[1])    channel.language = langMatch[1]

    channels.push(channel)
  }

  return channels
}
