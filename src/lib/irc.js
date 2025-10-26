/**
 * Minimal Twitch IRC (WebSocket) client.
 * Anonymous read is possible, but we use OAuth for Helix anyway.
 * For IRC, we can use anonymous login (`NICK justinfan12345`) to avoid leaking OAuth as PASS.
 * That still lets us read public chat.
 */

const WS_URL = 'wss://irc-ws.chat.twitch.tv:443'

export class TwitchIRC {
  constructor({ nick, onMessage, onState }) {
    this.nick = nick || ('justinfan' + Math.floor(Math.random()*100000))
    this.ws = null
    this.onMessage = onMessage
    this.onState = onState || (()=>{})
    this.joined = new Set()
    this.pingIv = null
  }

  connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) return
    this.ws = new WebSocket(WS_URL)
    this.ws.onopen = () => {
      this.send('CAP REQ :twitch.tv/tags twitch.tv/commands twitch.tv/membership')
      this.send(`PASS SCHMOOPIIE`) // placeholder per Twitch spec for anon (ignored)
      this.send(`NICK ${this.nick}`)
      this.onState('connected')
      this.pingIv = setInterval(()=> this.send('PING :tmi.twitch.tv'), 60*1000)
    }
    this.ws.onclose = () => {
      this.onState('disconnected')
      if (this.pingIv) clearInterval(this.pingIv)
      this.pingIv = null
    }
    this.ws.onerror = () => {
      this.onState('error')
    }
    this.ws.onmessage = (e) => {
      const lines = e.data.split('\r\n').filter(Boolean)
      for (const line of lines) this.handle(line)
    }
  }

  send(s) { this.ws?.send(s + '\r\n') }

  handle(line) {
    if (line.startsWith('PING')) {
      this.send('PONG :tmi.twitch.tv')
      return
    }
    // Parse basic IRC with tags
    const msg = parseIrc(line)
    if (!msg) return
    if (msg.command === '001') {
      // connected welcome
    }
    if (msg.command === 'PRIVMSG') {
      const channel = msg.params[0].replace('#','')
      const text = msg.params[1]
      const user = (msg.prefix?.split('!')[0]) || 'user'
      const id = msg.tags?.['id']
      const ts = Number(msg.tags?.['tmi-sent-ts'] || Date.now())
      this.onMessage({ id, channel, user, text, ts, tags: msg.tags })
    }
  }

  join(channelLogin) {
    const ch = channelLogin.toLowerCase()
    if (this.joined.has(ch)) return
    this.connect()
    this.send(`JOIN #${ch}`)
    this.joined.add(ch)
  }

  part(channelLogin) {
    const ch = channelLogin.toLowerCase()
    if (!this.joined.has(ch)) return
    this.send(`PART #${ch}`)
    this.joined.delete(ch)
  }
}

function parseIrc(line) {
  // Very small IRC+tags parser for Twitch
  let rest = line
  let tags = null, prefix = null

  if (rest.startsWith('@')) {
    const i = rest.indexOf(' ')
    tags = Object.fromEntries(rest.slice(1, i).split(';').map(kv => {
      const [k,v] = kv.split('=')
      return [k, (v||'').replace(/\\s/g,' ')]
    }))
    rest = rest.slice(i+1)
  }
  if (rest.startsWith(':')) {
    const i = rest.indexOf(' ')
    prefix = rest.slice(1, i)
    rest = rest.slice(i+1)
  }
  const i = rest.indexOf(' ')
  const command = (i === -1) ? rest : rest.slice(0, i)
  rest = (i === -1) ? '' : rest.slice(i+1)
  const params = []
  while (rest) {
    if (rest.startsWith(':')) {
      params.push(rest.slice(1))
      break
    }
    const j = rest.indexOf(' ')
    if (j === -1) { params.push(rest); break }
    params.push(rest.slice(0, j))
    rest = rest.slice(j+1)
  }

  return { tags, prefix, command, params }
}
