[🇧🇷 Português](README.pt-BR.md)

# 📞 CallChat

[![tests](https://github.com/lucasgabrieldevgg/callchat/actions/workflows/ci.yml/badge.svg)](https://github.com/lucasgabrieldevgg/callchat/actions/workflows/ci.yml)

**Voice and video calls right in the browser** — no login, nothing to install.

- 🔗 Create the room and share the link (`?room=CODE`)
- 🎙️ P2P voice + video (WebRTC) — the conversation goes straight from browser to browser
- 📺 Screen sharing · 💬 in-call chat (P2P channel, never recorded) with an **unread badge**
- 📝 **Live captions with LOCAL AI** — Whisper (transformers.js) runs entirely in your browser after a one-time download; nothing is sent anywhere. Fallback: browser speech (Chrome/Edge). The host can turn **collective transcription** (everything said, with each speaker's name) on/off for everyone in ⚙️
- ✋ Raise hand (own button) · 🔇/📷 **muted-state badges** on every tile · ⚙️ in-call settings
- 👥 Up to ~6 people per room (mesh)
- ✅ Optional "login": just a name saved in your browser — nothing goes to a server
- 🆓 Free: signaling via PeerJS public cloud, media 100% P2P

## 🌐 Try it
Open **https://lucasgabrieldevgg.github.io/callchat**, hit *Create call* and share the link.

> ⚠️ Networks that block P2P (some corporate/school wi-fi and restricted 4G) may prevent the connection — switch networks in that case.

## How it works
WebRTC signaling via [PeerJS Cloud](https://peerjs.com) (it only introduces the browsers); audio/video/chat travel directly between participants (Google STUN). Nothing is recorded: the room vanishes when the call ends.

Made by [lucasgabrieldevgg](https://github.com/lucasgabrieldevgg) 💜

## Real testing
The static suite runs on CI (badge above). The **2-browser e2e** validates connection, two-way media and chat in both directions:

```bash
npm ci
npx playwright install chromium
python3 -m http.server 8091 &   # from the repo folder
npm run e2e
```

## License

MIT — see [LICENSE](LICENSE).
