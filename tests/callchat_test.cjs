/* Suíte CallChat — carregamento + fluxos + FIXES críticos como regressão + segurança
   O e2e de 2 navegadores (npm run e2e) valida mídia/chat ao vivo; esta suíte protege o código. */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
let ok = 0, fail = 0;
const t = (n, c) => { if (c) { ok++; console.log('  ✓ ' + n); } else { fail++; console.log('  ✗ ' + n); } };

global.fetch = () => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({}), text: () => Promise.resolve('') });
global.matchMedia = global.matchMedia || (() => ({ matches: false, addListener(){}, removeListener(){}, addEventListener(){}, removeEventListener(){} }));
global.RTCPeerConnection = global.RTCPeerConnection || class { constructor(){ this.localDescription={}; } setRemoteDescription(){ return Promise.resolve(); } createOffer(){ return Promise.resolve({}); } createAnswer(){ return Promise.resolve({}); } setLocalDescription(){ return Promise.resolve(); } addEventListener(){} close(){} };
global.navigator = global.navigator || {}; global.navigator.mediaDevices = global.navigator.mediaDevices || { getUserMedia: () => Promise.resolve({ getTracks(){ return []; } }) };

let dom = null, doc = null;
try {
  dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://lucasgabrieldevgg.github.io/callchat/' });
  doc = dom.window.document;
} catch (e) { console.log('CRASH: ' + e.message); }

console.log('\n📞 suíte CallChat\n');

/* carregamento */
t('index.html carrega no jsdom sem crash', !!dom);
t('título "chamadas no navegador, sem login"', /sem login/.test(doc ? doc.title : ''));
t('PeerJS carregado do CDN', /peerjs@[\d.]+\/dist\/peerjs/.test(html));

/* estrutura */
t('home: criar chamada + entrar + nome', !!doc.querySelector('#b-criar') && !!doc.querySelector('#b-entrar') && !!doc.querySelector('#in-nome'));
t('URL com ?sala= entra direto (auto-join)', /parseSala\(location\.search\)/.test(html));
t('avatar prévia local (vídeo do eu)', /v-eu|caixaVideo\('eu'/.test(html));
t('aviso de rede bloqueada existe', !!doc.querySelector('#av-net'));

/* FIXES críticos (regressão — os bugs que deixavam a chamada "sozinha") */
t('FIX 1: convidado ESCUTA a conn que abre (conn.on data no connect)', /PEER\.connect\(porteiro[\s\S]{0,120}conn\.on\('data'/.test(html));
t('FIX 2: responde "ola" com o nome quando não sabia (anti ping-pong: jaSabia antes de registrar)', /const jaSabia=!!\(p&&p\.nome\)/.test(html) && /if\(!jaSabia\)\{ try\{ conn\.send\(\{t:'ola'/.test(html));
t('FIX 2b: convidado registra o host no PAR e liga mídia pra ele', /if\(!PAR\.has\(porteiro\)\)\{[\s\S]{0,80}caixaVideo\(porteiro[\s\S]{0,120}PEER\.call\(porteiro,STREAM\)/.test(html));
t('FIX 3: caixaVideo dedupe (fallback não duplica tile)', /const ex=document\.getElementById\('v-'\+id\); if\(ex\) ex\.remove\(\);/.test(html));
t('fallback: convidado vira host após timeout (auto-organização)', /entrar\(sala,true\)\.then\(resolve\)/.test(html));
t('unavailable-id: vira convidado (sala já tem dono)', /unavailable-id'&&criando/.test(html));

/* privacidade e identidade */
t('P2P: sem servidor de mídia próprio (só sinalização PeerJS)', /Mídia e chat vão DIRETO entre navegadores/.test(html));
t('nome salvo só no navegador (localStorage)', /store\.set\('cc_nome'/.test(html));
t('prefers-reduced-motion respeitado', /prefers-reduced-motion/.test(html));
t('sem segredo no código', !/ghp_[A-Za-z0-9]{20,}|sk-or-v1-|sk-ant-|vcp_[A-Za-z0-9]{20,}/.test(html));

/* ═══ v1.4 — identidade CABINE + fixes de compartilhamento ═══ */
t('zero roxo de IA (8b5cf6/c084fc/a855f7)', !/8b5cf6|c084fc|a855f7/i.test(html));
t('sem texto com gradiente (background-clip)', !html.includes('background-clip:text'));
t('sem vidro fosco (backdrop-filter)', !html.includes('backdrop-filter'));
t('sem glow radial de fundo', !html.includes('radial-gradient'));
t('fonte própria: Space Grotesk', html.includes('Space+Grotesk'));
t('números em mono: IBM Plex Mono', html.includes('IBM+Plex+Mono'));
t('--bad definida (dot offline visível)', /--bad:#/.test(html));
t('parar de compartilhar NÃO recarrega a página', html.includes('voltarCamera') && !html.includes('location.reload'));
t('guarda honesta pra participante só-áudio', html.includes('só-áudio'));

/* ═══ v1.5 — IA local de legendas, estado, mão, cfg, badge ═══ */
t('legendas com IA local: transformers.js no navegador', html.includes('@xenova/transformers'));
t('modelo Whisper local (tiny/base)', html.includes('Xenova/whisper-tiny') && html.includes('Xenova/whisper-base'));
t('captura de áudio pra IA (onaudioprocess → PCM)', html.includes('onaudioprocess') && html.includes('transcribe'));
t('idioma pt nas legendas IA', html.includes("language:'portuguese'"));
t('fallback Web Speech preservado', html.includes('webkitSpeechRecognition'));
t('badge de mic mudo no tile', html.includes('🔇 mudo'));
t('badge de cam off no tile', html.includes('📷 off'));
t('estado de mic/cam broadcast na rede', /t:'estado'/.test(html));
t('botão próprio de ✋ na barra', html.includes('id="c-mao"'));
t('✋ fora do seletor de emoji', !html.includes('data-e="✋"'));
t('badge de mensagens não lidas', html.includes('id="badge-chat"') && html.includes('zeraNaoLidas'));
t('cfg: transcrição coletiva definida pelo anfitrião', /t:'cfg'/.test(html) && html.includes('EU_SOU_HOST'));
t('transcrição respeita CFG.tr (local e recebida)', html.includes('if(CFG.tr) trAdd'));
t('cfg persistida no navegador', html.includes("store.get('cc_cfg')"));
t('painel de configurações na barra', html.includes('id="c-cfg"') && html.includes('id="cfg-tr"'));
t('v1.5 visível no header (anti-cache)', html.includes('v1.5'));
t('"anfitrião" não é mais label de tile', !/caixaVideo\([^)]*'anfitrião'/.test(html));

/* ═══ craft floor — piso de acabamento (auditoria 03/10) ═══ */
t('feedback do enviar do chat na tinta escura da casa (--letra)', html.includes('color:var(--letra)'));
t('zero lavanda fora da paleta (#cfc8e8 extinta)', !html.includes('#cfc8e8'));
t('letterbox do vídeo no neutro da casa (sem roxo #0d0a1c)', !html.includes('#0d0a1c'));
t('zero gradiente decorativo (sair e enviar sólidos)', !html.includes('linear-gradient'));
t('seleção de texto tematizada (âmbar)', html.includes('::selection{background:rgba(255,176,32'));
t('foco visível por teclado (:focus-visible âmbar)', html.includes(':focus-visible{outline:2px solid var(--brand)'));
t('scrollbar temático (Firefox + WebKit)', html.includes('scrollbar-color') && html.includes('::-webkit-scrollbar-thumb'));
t('placeholders com contraste suficiente', html.includes('::placeholder{color:rgba(233,236,231,.45)}'));
t('meta description presente', html.includes('<meta name="description"'));

console.log('\n══════════════════════════');
console.log(`RESULTADO: ${ok} ✓ / ${fail} ✗ ${fail === 0 ? '— CALLCHAT ÍNTEGRO 📞' : '— HÁ REGRESSÕES!'}`);
process.exit(fail === 0 ? 0 : 1);
