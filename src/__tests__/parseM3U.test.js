import { parseM3U } from '../parseM3U'

const SAMPLE_M3U = `#EXTM3U
#EXTINF:-1 tvg-logo="https://example.com/logo.png" group-title="Sport",beIN Sports 1
http://stream.example.com/bein1
#EXTINF:-1 group-title="Sport",beIN Sports 2
http://stream.example.com/bein2
#EXTINF:-1 group-title="News",CNN
http://stream.example.com/cnn
#EXTINF:-1,No Group Channel
http://stream.example.com/nogroup
`

describe('parseM3U', () => {
  let channels

  beforeEach(() => {
    channels = parseM3U(SAMPLE_M3U, 'playlist-1')
  })

  it('returns correct number of channels', () => {
    expect(channels).toHaveLength(4)
  })

  it('parses channel name', () => {
    expect(channels[0].name).toBe('beIN Sports 1')
  })

  it('parses stream URL', () => {
    expect(channels[0].url).toBe('http://stream.example.com/bein1')
  })

  it('parses tvg-logo', () => {
    expect(channels[0].logo).toBe('https://example.com/logo.png')
  })

  it('parses group-title', () => {
    expect(channels[0].group).toBe('Sport')
  })

  it('assigns playlistId', () => {
    expect(channels[0].playlistId).toBe('playlist-1')
  })

  it('defaults missing logo to undefined', () => {
    expect(channels[1].logo).toBeUndefined()
  })

  it('defaults missing group to "Umum"', () => {
    expect(channels[3].group).toBe('Umum')
  })

  it('handles Windows line endings (CRLF)', () => {
    const m3uCRLF = '#EXTM3U\r\n#EXTINF:-1,Test Channel\r\nhttp://example.com\r\n'
    const result = parseM3U(m3uCRLF, 'test-id')
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Test Channel')
  })
})
