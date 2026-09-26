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
t('FIX 2: host responde "ola" com o nome (guarda anti ping-pong)', /!p\|\|!p\.nome\)\{ try\{ conn\.send\(\{t:'ola'/.test(html));
t('FIX 2b: convidado registra o host no PAR e liga mídia pra ele', /if\(!PAR\.has\(porteiro\)\)\{[\s\S]{0,80}caixaVideo\(porteiro[\s\S]{0,120}PEER\.call\(porteiro,STREAM\)/.test(html));
t('FIX 3: caixaVideo dedupe (fallback não duplica tile)', /const ex=document\.getElementById\('v-'\+id\); if\(ex\) ex\.remove\(\);/.test(html));
t('fallback: convidado vira host após timeout (auto-organização)', /entrar\(sala,true\)\.then\(resolve\)/.test(html));
t('unavailable-id: vira convidado (sala já tem dono)', /unavailable-id'&&criando/.test(html));

/* privacidade e identidade */
t('P2P: sem servidor de mídia próprio (só sinalização PeerJS)', /Mídia e chat vão DIRETO entre navegadores/.test(html));
t('nome salvo só no navegador (localStorage)', /store\.set\('cc_nome'/.test(html));
t('prefers-reduced-motion respeitado', /prefers-reduced-motion/.test(html));
t('sem segredo no código', !/ghp_[A-Za-z0-9]{20,}|sk-or-v1-|sk-ant-|vcp_[A-Za-z0-9]{20,}/.test(html));

console.log('\n══════════════════════════');
console.log(`RESULTADO: ${ok} ✓ / ${fail} ✗ ${fail === 0 ? '— CALLCHAT ÍNTEGRO 📞' : '— HÁ REGRESSÕES!'}`);
process.exit(fail === 0 ? 0 : 1);
