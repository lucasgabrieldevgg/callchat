[🇺🇸 English](README.md)

# 📞 CallChat

[![testes](https://github.com/lucasgabrieldevgg/callchat/actions/workflows/ci.yml/badge.svg)](https://github.com/lucasgabrieldevgg/callchat/actions/workflows/ci.yml)

Chamadas de **voz e vídeo direto no navegador** — sem login, sem instalar nada.

- 🔗 Cria a sala e compartilha o link (`?sala=CODIGO`)
- 🎙️ Voz + vídeo P2P (WebRTC) — a conversa vai direto de navegador pra navegador
- 📺 Compartilhar tela · 💬 chat da chamada (canal P2P, nunca gravado) com **badge de não lidas**
- 📝 **Legendas ao vivo com IA LOCAL** — Whisper (transformers.js) roda 100% no teu navegador depois de um download único; nada vai pra servidor nenhum. Fallback: voz do navegador (Chrome/Edge). O anfitrião liga/desliga a **transcrição coletiva** (tudo que for falado, com o nome de quem disse) pra todos no ⚙️
- ✋ Mão levantada (botão próprio) · badges de **mute 🔇/📷 off** em todo tile · ⚙️ configurações da chamada
- 👥 Até ~6 pessoas por sala (mesh)
- ✅ "Login" opcional: só o nome salvo no seu navegador — nada vai pra servidor
- 🆓 Grátis: sinalização pelo cloud público do PeerJS, mídia 100% P2P

## 🌐 Usar
Abra **https://lucasgabrieldevgg.github.io/callchat**, toque em *Criar chamada* e manda o link.

> ⚠️ Redes que bloqueiam P2P (alguns wi-fis de empresa/escola e 4G restrito) podem impedir a conexão — troque de rede nesse caso.

## Como funciona
Sinalização WebRTC via [PeerJS Cloud](https://peerjs.com) (só apresenta os navegadores); áudio/vídeo/chat viajam direto entre os participantes (STUN do Google). Nada é gravado: sala some quando a chamada acaba.

Feito por [lucasgabrieldevgg](https://github.com/lucasgabrieldevgg) 💜
## Testar de verdade
A suíte estática roda no CI (badge acima). O **e2e de 2 navegadores** valida conexão, mídia bidirecional e chat nos dois sentidos:

```bash
npm ci
npx playwright install chromium
python3 -m http.server 8091 &   # na pasta do repo
npm run e2e
```

## Licença
MIT — vê o arquivo [LICENSE](LICENSE).
