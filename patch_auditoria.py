import io

P = '/home/user/sweep/callchat/index.html'
r = io.open(P, encoding='utf-8').read()
orig = r

def rep(old, new):
    global r
    assert old in r, 'NAO ACHOU: ' + old[:80]
    r = r.replace(old, new, 1)

# ── tokens: tom neutro da casa p/ texto suave (substitui a lavanda #cfc8e8) + tinta escura nomeada ──
rep("""--ok:#3ecf7a;--bad:#ef4444;--line:rgba(255,255,255,.09)}""",
    """--ok:#3ecf7a;--bad:#ef4444;--line:rgba(255,255,255,.09);--tx-suave:#c9d2c9;--letra:#231703}""")

# ── browser surfaces (tell nº1): seleção, foco visível, scrollbar, placeholder ──
rep("""[hidden]{display:none!important}   /* hidden vence display:flex — barra da chamada/emojis NUNCA vazam pra homepage */""",
    """[hidden]{display:none!important}   /* hidden vence display:flex — barra da chamada/emojis NUNCA vazam pra homepage */
::selection{background:rgba(255,176,32,.38);color:#f6f2e8}
:focus-visible{outline:2px solid var(--brand);outline-offset:2px;border-radius:10px}
html{scrollbar-color:rgba(255,255,255,.22) transparent;scrollbar-width:thin}
::-webkit-scrollbar{width:10px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:rgba(255,255,255,.18);border-radius:99px;border:2px solid var(--bg)}
input[type=text]::placeholder{color:rgba(233,236,231,.45)}""")

# ── P1 contraste: enviar do chat SÓLIDO com a mesma tinta escura de todo botão âmbar (era gradiente+branco ~1.9:1) ──
rep("""#chat .c_form button{background:linear-gradient(135deg,var(--brand),var(--brand2));color:#fff;border-radius:12px;padding:0 16px;font-weight:800}""",
    """#chat .c_form button{background:var(--brand);color:var(--letra);border-radius:12px;padding:0 16px;font-weight:800}""")

# ── tells de roxo fora da paleta CABINE → tom neutro da casa ──
rep("""label{display:block;font-size:13px;font-weight:700;margin:12px 0 5px;color:#cfc8e8}""",
    """label{display:block;font-size:13px;font-weight:700;margin:12px 0 5px;color:var(--tx-suave)}""")
rep(""".passos div{background:rgba(255,255,255,.04);border:1px solid var(--line);border-radius:14px;padding:12px;font-size:12.5px;color:#cfc8e8;line-height:1.45}""",
    """.passos div{background:rgba(255,255,255,.04);border:1px solid var(--line);border-radius:14px;padding:12px;font-size:12.5px;color:var(--tx-suave);line-height:1.45}""")
rep(""".vbox{position:relative;background:#0d0a1c;""",
    """.vbox{position:relative;background:#14161a;""")

# ── tell gradiente: sair vira vermelho sólido (o gradiente não significava nada) ──
rep(""".ctl.sair{background:linear-gradient(135deg,#e11d48,#f43f5e);color:#fff}""",
    """.ctl.sair{background:#e11d48;color:#fff}""")

# ── harden: meta description ──
rep("""<title>CallChat — chamadas no navegador, sem login</title>""",
    """<title>CallChat — chamadas no navegador, sem login</title>
<meta name="description" content="Chamadas de voz e vídeo direto no navegador, sem login e sem instalar nada — P2P, com chat, emojis, tela compartilhada e legendas ao vivo com IA local e grátis.">""")

# ── guards: lavanda extinta, ZERO gradiente decorativo restante ──
assert '#cfc8e8' not in r
assert r.count('linear-gradient') == 0, 'gradientes restantes: %d' % r.count('linear-gradient')
assert '#0d0a1c' not in r
io.open(P, 'w', encoding='utf-8').write(r)
print('patch callchat aplicado ✓ (%d bytes, era %d) — zero gradientes, zero lavanda' % (len(r), len(orig)))
