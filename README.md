# 📞 CallChat

Chamadas de **voz e vídeo direto no navegador** — sem login, sem instalar nada.

- 🔗 Cria a sala e compartilha o link (`?sala=CODIGO`)
- 🎙️ Voz + vídeo P2P (WebRTC) — a conversa vai direto de navegador pra navegador
- 📺 Compartilhar tela · 💬 chat da chamada (canal P2P, nunca gravado)
- 👥 Até ~6 pessoas por sala (mesh)
- ✅ "Login" opcional: só o nome salvo no seu navegador — nada vai pra servidor
- 🆓 Grátis: sinalização pelo cloud público do PeerJS, mídia 100% P2P

## Usar
Abra **https://lucasgabrieldevgg.github.io/callchat**, toque em *Criar chamada* e manda o link.

> ⚠️ Redes que bloqueiam P2P (alguns wi-fis de empresa/escola e 4G restrito) podem impedir a conexão — troque de rede nesse caso.

## Como funciona
Sinalização WebRTC via [PeerJS Cloud](https://peerjs.com) (só apresenta os navegadores); áudio/vídeo/chat viajam direto entre os participantes (STUN do Google). Nada é gravado: sala some quando a chamada acaba.

Feito por [lucasgabrieldevgg](https://github.com/lucasgabrieldevgg) 💜
