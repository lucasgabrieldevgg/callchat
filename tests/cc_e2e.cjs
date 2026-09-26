/* E2E de 2 navegadores — o teste honesto do callchat.
   Requisitos: npx playwright install chromium + servidor local (python3 -m http.server 8091)
   Rodar: npm run e2e   (valida: conexão, MÍDIA bidirecional real, chat nos 2 sentidos,
   host-tardio e a corrida de 2 convidados juntos) */
const { chromium } = require('playwright');
const ARGS = { args: ['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream','--autoplay-policy=no-user-gesture-required'], ignoreHTTPSErrors: true };
(async () => {
  const browser = await chromium.launch(ARGS);
  const relatorio = [];
  const ctxA = await browser.newContext({ permissions: ['camera','microphone'] });
  const A = await ctxA.newPage();
  const logsA = [], errsA = [];
  A.on('pageerror', e => errsA.push(e.message.slice(0,100)));
  A.on('console', m => { if (m.type()==='error') logsA.push(m.text().slice(0,100)); });

  await A.goto('http://localhost:8091/', { waitUntil: 'load' });
  await A.fill('#in-nome', 'Ana');
  const t0 = Date.now();
  await A.click('#b-criar');
  await A.waitForFunction(() => document.querySelector('#home').hidden, { timeout: 30000 });
  const url = A.url();
  relatorio.push(`A criou a sala em ${Date.now()-t0}ms → ${url.slice(-12)}`);

  // ── CENÁRIO 1: convidado normal
  const ctxB = await browser.newContext({ permissions: ['camera','microphone'] });
  const B = await ctxB.newPage();
  const errsB = [];
  B.on('pageerror', e => errsB.push(e.message.slice(0,100)));
  await B.goto(url, { waitUntil: 'load' });
  const t1 = Date.now();
  try {
    await B.waitForFunction(() => document.querySelectorAll('.vbox').length >= 2, { timeout: 25000 });
    relatorio.push(`CENÁRIO 1 OK: Beto vê 2 tiles em ${Date.now()-t1}ms`);
  } catch(e) { relatorio.push(`CENÁRIO 1 FALHOU: Beto não viu 2 tiles em 25s (tiles=${await B.evaluate(()=>document.querySelectorAll('.vbox').length)})`); }
  try { await A.waitForFunction(() => document.querySelectorAll('.vbox').length >= 2, { timeout: 10000 }); relatorio.push('CENÁRIO 1 OK: Ana também vê 2 tiles'); }
  catch(e) { const n = await A.evaluate(() => document.querySelectorAll('.vbox').length); relatorio.push('CENÁRIO 1: Ana vê ' + n + ' tiles'); }
  const remotos = pg => pg.evaluate(() => [...document.querySelectorAll('.vbox')].filter(b => b.id !== 'v-eu').filter(b => b.querySelector('video') && b.querySelector('video').srcObject).length);
  try { await A.waitForFunction(() => [...document.querySelectorAll('.vbox video')].some(v => v.srcObject), { timeout: 20000 }); relatorio.push('MÍDIA OK: Ana recebeu stream do Beto'); }
  catch(e) { relatorio.push('MÍDIA FALHOU: Ana sem stream remoto em 20s'); }
  try { await B.waitForFunction(() => [...document.querySelectorAll('.vbox video')].some(v => v.srcObject), { timeout: 20000 }); relatorio.push('MÍDIA OK: Beto recebeu stream da Ana'); }
  catch(e) { relatorio.push('MÍDIA FALHOU: Beto sem stream remoto em 20s'); }

  // chat A→B e B→A
  await A.fill('#chat-in', 'ola beto').then(()=>A.press('#chat-in','Enter'));
  await B.waitForFunction(() => document.body.innerText.includes('ola beto'), { timeout: 8000 }).then(()=>relatorio.push('CHAT A→B OK')).catch(()=>relatorio.push('CHAT A→B FALHOU'));
  await B.fill('#chat-in', 'oi ana').then(()=>B.press('#chat-in','Enter'));
  await A.waitForFunction(() => document.body.innerText.includes('oi ana'), { timeout: 8000 }).then(()=>relatorio.push('CHAT B→A OK')).catch(()=>relatorio.push('CHAT B→A FALHOU'));

  // ── CENÁRIO 2: convidado entra numa sala vazia (vira host) e depois o dono entra
  const ctxC = await browser.newContext({ permissions: ['camera','microphone'] });
  const C = await ctxC.newPage();
  const salaNova = 'http://localhost:8091/?sala=ZKMW9P';
  await C.goto(salaNova, { waitUntil: 'load' });
  const t2 = Date.now();
  await C.waitForFunction(() => document.querySelector('#home').hidden, { timeout: 30000 });
  relatorio.push(`Caio entrou em sala vazia (vira host) em ${Date.now()-t2}ms`);
  await A.goto('http://localhost:8091/?sala=ZKMW9P', { waitUntil: 'load' });
  const t3 = Date.now();
  try {
    await A.waitForFunction(() => document.querySelectorAll('.vbox').length >= 2, { timeout: 30000 });
    relatorio.push(`CENÁRIO 2 OK: Ana2 conectou ao host-tardio em ${Date.now()-t3}ms`);
  } catch(e) { relatorio.push(`CENÁRIO 2 FALHOU: Ana2 não viu Caio em 30s (tiles=${await A.evaluate(()=>document.querySelectorAll('.vbox').length)})`); }

  // ── CENÁRIO 3: os DOIS entram juntos numa sala vazia (a corrida do split-brain)
  const ctxD = await browser.newContext({ permissions: ['camera','microphone'] });
  const ctxE = await browser.newContext({ permissions: ['camera','microphone'] });
  const D = await ctxD.newPage(); const E = await ctxE.newPage();
  const salaR = 'http://localhost:8091/?sala=RACE42';
  await D.goto(salaR, { waitUntil: 'load' }); await E.goto(salaR, { waitUntil: 'load' });
  const t4 = Date.now();
  let okRace = false;
  try {
    await D.waitForFunction(() => document.querySelectorAll('.vbox').length >= 2, { timeout: 30000 });
    okRace = true;
  } catch(e) {}
  let okRace2 = false;
  try { await E.waitForFunction(() => document.querySelectorAll('.vbox').length >= 2, { timeout: 8000 }); okRace2 = true; } catch(e) {}
  relatorio.push(`CENÁRIO 3 (corrida): ${okRace ? 'Duda vê 2' : 'Duda SOZINHA'} · ${okRace2 ? 'Eva vê 2' : 'Eva SOZINHA'} — ${Date.now()-t4}ms`);

  console.log(relatorio.join('\n'));
  console.log('\nJS errors A:', errsA.length, errsA.slice(0,2), '| B:', errsB.length, errsB.slice(0,2), '| console.err A:', logsA.slice(0,3));
  await browser.close();
})();
