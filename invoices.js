/* ═══════════════════════════════════════════════════════════════
   graphGST — Master Stylesheet V3
   ═══════════════════════════════════════════════════════════════ */
*{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#020810;--bg2:#060f1e;--bg3:#0c1a32;--bg4:#142240;
  --border:rgba(56,189,248,.08);--border2:rgba(56,189,248,.22);
  --blue:#3b82f6;--cyan:#06b6d4;--violet:#7c3aed;--purple:#a78bfa;
  --green:#22c55e;--yellow:#f59e0b;--orange:#f97316;--red:#ef4444;--pink:#ec4899;
  --text:#eef4ff;--muted:#4a6785;--accent:#38bdf8;
}
html,body{height:100%;overflow:hidden}
body{background:var(--bg);color:var(--text);font-family:'Inter',sans-serif;font-size:14px}

/* ─── SPLASH ─────────────────────────────────────────────────── */
#splash{
  position:fixed;inset:0;z-index:9999;
  background:var(--bg);
  display:flex;align-items:center;justify-content:center;
  transition:opacity .7s ease,transform .7s ease;
}
#splash.out{opacity:0;transform:scale(1.03);pointer-events:none}
#splash-canvas{position:absolute;inset:0;width:100%;height:100%}
.splash-content{
  position:relative;z-index:2;
  display:flex;flex-direction:column;align-items:center;gap:28px;
  text-align:center;
}
.splash-nodes-row{display:flex;align-items:center;gap:0}
.snode{
  width:56px;height:56px;border-radius:50%;font-size:22px;
  display:flex;align-items:center;justify-content:center;
  background:rgba(255,255,255,.04);border:1.5px solid rgba(255,255,255,.12);
  animation:snodePop .5s cubic-bezier(.34,1.56,.64,1) both;
  box-shadow:0 0 24px color-mix(in srgb,var(--c),transparent 60%);
}
@keyframes snodePop{from{opacity:0;transform:scale(0.3)}to{opacity:1;transform:scale(1)}}
.snode:nth-child(1){animation-delay:.1s}.snode:nth-child(3){animation-delay:.25s}
.snode:nth-child(5){animation-delay:.4s}.snode:nth-child(7){animation-delay:.55s}
.snode:nth-child(9){animation-delay:.7s}
.snode-line{
  width:36px;height:1px;background:linear-gradient(90deg,rgba(56,189,248,.15),rgba(56,189,248,.4),rgba(56,189,248,.15));
  animation:lineDraw .4s ease both;position:relative;overflow:visible;
}
.snode-line::after{
  content:'▶';position:absolute;right:-6px;top:-7px;font-size:9px;color:rgba(56,189,248,.4);
}
@keyframes lineDraw{from{width:0;opacity:0}to{width:36px;opacity:1}}
.snode-line:nth-child(2){animation-delay:.2s}.snode-line:nth-child(4){animation-delay:.35s}
.snode-line:nth-child(6){animation-delay:.5s}.snode-line:nth-child(8){animation-delay:.65s}

.splash-title{
  font-family:'Syne',sans-serif;font-size:80px;font-weight:800;letter-spacing:-4px;line-height:1;
  background:linear-gradient(140deg,#fff 0%,#38bdf8 45%,#a78bfa 85%);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
  animation:titleIn .8s cubic-bezier(.16,1,.3,1) .4s both;
}
.splash-title span{-webkit-text-fill-color:#3b82f6}
@keyframes titleIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
.splash-sub{
  font-size:14px;color:var(--muted);letter-spacing:.8px;
  animation:titleIn .8s ease .6s both;
}
.splash-progress-wrap{
  width:320px;animation:titleIn .8s ease .8s both;
}
.splash-bar{height:2px;background:rgba(255,255,255,.07);border-radius:1px;overflow:hidden}
.splash-fill{height:100%;width:0;border-radius:1px;background:linear-gradient(90deg,var(--blue),var(--cyan),var(--purple));transition:width .15s ease}
.splash-status{font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--muted);margin-top:8px}
.splash-tech{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;animation:titleIn .8s ease 1s both}
.tech-pill{
  padding:3px 12px;border-radius:99px;font-size:11px;font-weight:600;
  background:rgba(56,189,248,.06);border:1px solid rgba(56,189,248,.2);color:var(--accent);
}

/* ─── APP SHELL ───────────────────────────────────────────────── */
.app-hidden{opacity:0;pointer-events:none}
.app-ready{
  display:flex;width:100vw;height:100vh;overflow:hidden;
  opacity:1!important;pointer-events:auto!important;
  animation:appFade .5s ease both;
}
@keyframes appFade{from{opacity:0}to{opacity:1}}

/* ─── SIDEBAR ─────────────────────────────────────────────────── */
aside{
  width:252px;flex-shrink:0;height:100vh;
  background:linear-gradient(180deg,var(--bg2) 0%,var(--bg) 100%);
  border-right:1px solid var(--border);
  display:flex;flex-direction:column;position:relative;overflow:hidden;
}
aside::before{
  content:'';position:absolute;top:0;left:0;right:0;height:1px;
  background:linear-gradient(90deg,transparent,var(--cyan),transparent);
}
.sb-glow{
  position:absolute;width:220px;height:220px;border-radius:50%;
  background:radial-gradient(circle,rgba(59,130,246,.07),transparent);
  top:60px;left:-60px;pointer-events:none;
}

.sb-logo{padding:26px 20px 20px;border-bottom:1px solid var(--border)}
.neo-pill{
  display:inline-flex;align-items:center;gap:6px;margin-bottom:12px;
  padding:3px 10px;border-radius:20px;font-size:10px;font-family:'JetBrains Mono',monospace;
  background:rgba(34,197,94,.08);border:1px solid rgba(34,197,94,.25);color:var(--green);
}
.neo-pill.err{background:rgba(239,68,68,.08);border-color:rgba(239,68,68,.25);color:var(--red)}
.neo-dot{width:6px;height:6px;border-radius:50%;background:currentColor;animation:blink 2s infinite}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}
.sb-title{font-family:'Syne',sans-serif;font-size:24px;font-weight:800;letter-spacing:-1px;
  background:linear-gradient(135deg,#fff,var(--cyan));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.sb-title em{-webkit-text-fill-color:var(--blue);font-style:normal}
.sb-sub{font-size:9px;color:var(--muted);margin-top:3px;letter-spacing:1.5px;text-transform:uppercase}

.sb-nav{flex:1;padding:12px 10px;overflow-y:auto;scrollbar-width:none}
.sb-nav::-webkit-scrollbar{display:none}
.sb-section{font-size:9px;color:var(--muted);letter-spacing:2.5px;text-transform:uppercase;padding:0 10px;margin:16px 0 5px}
.nav-item{
  display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:10px;cursor:pointer;
  color:var(--muted);font-size:13px;font-weight:500;transition:all .2s;
  border:1px solid transparent;position:relative;overflow:hidden;margin-bottom:1px;
}
.nav-item::before{
  content:'';position:absolute;left:0;top:0;bottom:0;width:3px;border-radius:0 3px 3px 0;
  background:var(--blue);transform:scaleY(0);transition:transform .2s;
}
.nav-item:hover{background:rgba(56,189,248,.06);color:var(--text);border-color:rgba(56,189,248,.1)}
.nav-item.active{
  background:linear-gradient(135deg,rgba(59,130,246,.18),rgba(124,58,237,.1));
  color:var(--accent);border-color:rgba(56,189,248,.25);
}
.nav-item.active::before{transform:scaleY(1)}
.nav-ico{font-size:15px;width:20px;text-align:center;flex-shrink:0}
.nav-lbl{flex:1}
.nav-badge{font-size:9px;font-weight:700;padding:1px 6px;border-radius:99px;background:var(--red);color:#fff}
.nav-badge.g{background:var(--green)}

.sb-footer{padding:12px 16px;border-top:1px solid var(--border)}
.sb-stat{display:flex;justify-content:space-between;margin-bottom:4px}
.sb-stat-l{font-size:10px;color:var(--muted)}
.sb-stat-v{font-size:10px;font-family:'JetBrains Mono',monospace;color:var(--text)}

/* ─── TOPBAR ──────────────────────────────────────────────────── */
.main-wrap{flex:1;display:flex;flex-direction:column;overflow:hidden}
header{
  display:flex;align-items:center;justify-content:space-between;
  padding:14px 28px;border-bottom:1px solid var(--border);
  background:rgba(6,12,24,.85);backdrop-filter:blur(16px);flex-shrink:0;
}
.tb-left h1{font-family:'Syne',sans-serif;font-size:19px;font-weight:700}
.tb-left p{font-size:11px;color:var(--muted);margin-top:1px}
.tb-right{display:flex;gap:8px;align-items:center}
.date-chip{
  font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--muted);
  padding:4px 10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;
}

/* ─── PAGE AREA ───────────────────────────────────────────────── */
.page-area{flex:1;overflow-y:auto;padding:28px 32px;scrollbar-width:thin;scrollbar-color:var(--bg3) transparent}
.page-area::-webkit-scrollbar{width:3px}
.page-area::-webkit-scrollbar-thumb{background:var(--bg3);border-radius:2px}
.page-enter{animation:pageIn .35s cubic-bezier(.16,1,.3,1) both}
@keyframes pageIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}

/* ─── BUTTONS ─────────────────────────────────────────────────── */
.btn{
  display:inline-flex;align-items:center;gap:7px;padding:8px 18px;border-radius:9px;
  border:none;cursor:pointer;font-family:'Inter',sans-serif;font-size:13px;font-weight:600;
  transition:all .2s;position:relative;overflow:hidden;
}
.btn::after{content:'';position:absolute;inset:0;background:linear-gradient(rgba(255,255,255,.08),transparent);opacity:0;transition:opacity .2s}
.btn:hover::after{opacity:1}
.btn-primary{background:linear-gradient(135deg,var(--blue),#6366f1);color:#fff;box-shadow:0 0 20px rgba(59,130,246,.3)}
.btn-primary:hover{transform:translateY(-1px);box-shadow:0 4px 24px rgba(59,130,246,.5)}
.btn-ghost{background:transparent;color:var(--muted);border:1px solid var(--border)}
.btn-ghost:hover{border-color:var(--border2);color:var(--text)}
.btn-danger{background:rgba(239,68,68,.1);color:var(--red);border:1px solid rgba(239,68,68,.3)}
.btn-success{background:rgba(34,197,94,.1);color:var(--green);border:1px solid rgba(34,197,94,.3)}
.btn:disabled{opacity:.4;cursor:not-allowed;transform:none!important}

/* ─── CARDS ───────────────────────────────────────────────────── */
.card{
  background:var(--bg2);border:1px solid var(--border);border-radius:16px;padding:20px 24px;
  position:relative;overflow:hidden;transition:border-color .2s,box-shadow .2s;
}
.card:hover{border-color:var(--border2);box-shadow:0 0 28px rgba(56,189,248,.04)}
.card-shine{position:absolute;top:-1px;left:12%;right:12%;height:1px;background:linear-gradient(90deg,transparent,rgba(56,189,248,.35),transparent)}

/* ─── STAT CARDS ─────────────────────────────────────────────── */
.kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:22px}
@media(max-width:1100px){.kpi-grid{grid-template-columns:repeat(2,1fr)}}
.kpi-card{
  background:var(--bg2);border:1px solid var(--border);border-radius:14px;padding:18px 20px;
  position:relative;overflow:hidden;transition:transform .2s,border-color .2s,box-shadow .2s;
}
.kpi-card:hover{transform:translateY(-2px);border-color:var(--border2);box-shadow:0 8px 30px rgba(0,0,0,.3)}
.kpi-accent{position:absolute;top:0;left:0;right:0;height:2px}
.kpi-icon{font-size:20px;margin-bottom:8px;display:block}
.kpi-label{font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:5px}
.kpi-value{font-family:'JetBrains Mono',monospace;font-size:26px;font-weight:700;letter-spacing:-1px;line-height:1}
.kpi-sub{font-size:11px;margin-top:5px}

/* ─── BADGES ──────────────────────────────────────────────────── */
.badge{display:inline-flex;align-items:center;gap:3px;padding:2px 9px;border-radius:6px;font-size:10px;font-weight:700;letter-spacing:.4px;white-space:nowrap}
.b-red{background:rgba(239,68,68,.1);color:var(--red);border:1px solid rgba(239,68,68,.25)}
.b-yellow{background:rgba(245,158,11,.1);color:var(--yellow);border:1px solid rgba(245,158,11,.25)}
.b-green{background:rgba(34,197,94,.1);color:var(--green);border:1px solid rgba(34,197,94,.25)}
.b-blue{background:rgba(59,130,246,.1);color:#93c5fd;border:1px solid rgba(59,130,246,.25)}
.b-purple{background:rgba(167,139,250,.1);color:var(--purple);border:1px solid rgba(167,139,250,.25)}
.b-orange{background:rgba(249,115,22,.1);color:var(--orange);border:1px solid rgba(249,115,22,.25)}
.b-pink{background:rgba(236,72,153,.1);color:var(--pink);border:1px solid rgba(236,72,153,.25)}
.b-cyan{background:rgba(6,182,212,.1);color:var(--cyan);border:1px solid rgba(6,182,212,.25)}
.b-muted{background:rgba(74,103,133,.12);color:var(--muted);border:1px solid rgba(74,103,133,.2)}

/* ─── TABLE ───────────────────────────────────────────────────── */
.tbl-wrap{overflow-x:auto;border-radius:12px;border:1px solid var(--border)}
table{width:100%;border-collapse:collapse}
thead tr{background:rgba(10,18,32,.9);border-bottom:1px solid var(--border)}
th{padding:10px 14px;font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:1.5px;white-space:nowrap;font-weight:600;text-align:left}
tbody tr{border-bottom:1px solid rgba(56,189,248,.03);transition:background .1s}
tbody tr:hover{background:rgba(56,189,248,.02)}
tbody tr:last-child{border-bottom:none}
td{padding:10px 14px;font-size:12px;vertical-align:middle}

/* ─── INPUTS ──────────────────────────────────────────────────── */
.inp{width:100%;padding:9px 13px;background:rgba(10,18,32,.85);border:1px solid var(--border);border-radius:9px;color:var(--text);font-family:'JetBrains Mono',monospace;font-size:12px;outline:none;transition:all .2s}
.inp:focus{border-color:rgba(56,189,248,.5);box-shadow:0 0 0 3px rgba(56,189,248,.07)}
.inp::placeholder{color:var(--muted)}
select.inp option{background:var(--bg2);color:var(--text)}
.inp-group{display:flex;flex-direction:column;gap:4px;margin-bottom:12px}
.inp-lbl{font-size:10px;color:var(--muted);letter-spacing:.5px}

/* ─── SPINNER ─────────────────────────────────────────────────── */
.spin{width:26px;height:26px;border:2px solid rgba(56,189,248,.12);border-top-color:var(--cyan);border-radius:50%;animation:spin .7s linear infinite}
.spin.sm{width:12px;height:12px}
@keyframes spin{to{transform:rotate(360deg)}}
.loading-center{display:flex;align-items:center;justify-content:center;height:160px;gap:12px;color:var(--muted);font-size:13px}

/* ─── TOAST ───────────────────────────────────────────────────── */
#toasts{position:fixed;bottom:24px;right:24px;z-index:10000;display:flex;flex-direction:column;gap:8px}
.toast{
  padding:11px 18px;border-radius:12px;font-size:13px;font-weight:500;
  max-width:340px;display:flex;align-items:center;gap:10px;
  box-shadow:0 8px 32px rgba(0,0,0,.5);
  animation:toastIn .3s cubic-bezier(.16,1,.3,1) both;
}
@keyframes toastIn{from{opacity:0;transform:translateX(16px)}to{opacity:1;transform:translateX(0)}}
.toast.ok{background:rgba(3,42,18,.96);border:1px solid rgba(34,197,94,.4);color:var(--green)}
.toast.err{background:rgba(60,8,8,.96);border:1px solid rgba(239,68,68,.4);color:var(--red)}
.toast.info{background:rgba(8,30,75,.96);border:1px solid rgba(59,130,246,.4);color:#93c5fd}
.toast.warn{background:rgba(60,36,4,.96);border:1px solid rgba(245,158,11,.4);color:var(--yellow)}

/* ─── PROGRESS ────────────────────────────────────────────────── */
.pbar{height:4px;background:rgba(255,255,255,.06);border-radius:2px;overflow:hidden}
.pfill{height:100%;border-radius:2px;transition:width 1s ease}

/* ─── SECTION HEADER ─────────────────────────────────────────── */
.sec-hdr{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:22px;padding-bottom:16px;border-bottom:1px solid var(--border)}
.sec-hdr h2{font-family:'Syne',sans-serif;font-size:21px;font-weight:700}
.sec-hdr p{font-size:12px;color:var(--muted);margin-top:3px}
.sec-hdr-actions{display:flex;gap:8px;align-items:center;flex-shrink:0}

/* ─── GRID HELPERS ────────────────────────────────────────────── */
.g2{display:grid;grid-template-columns:1fr 1fr;gap:18px}
.g3{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
@media(max-width:900px){.g2,.g3{grid-template-columns:1fr}}

/* ─── FRAUD RING CARD ─────────────────────────────────────────── */
@keyframes ringPulse{0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,.2)}50%{box-shadow:0 0 0 6px rgba(239,68,68,0)}}
.fraud-ring-card{animation:ringPulse 2.5s ease-in-out infinite}

/* ─── HOP CHAIN ───────────────────────────────────────────────── */
.hop-chain{display:flex;align-items:center;gap:0;overflow-x:auto;padding:18px 0;scrollbar-width:none}
.hop-chain::-webkit-scrollbar{display:none}
.hop-node{display:flex;flex-direction:column;align-items:center;gap:6px;flex-shrink:0}
.hop-circle{
  width:50px;height:50px;border-radius:50%;display:flex;align-items:center;justify-content:center;
  font-size:19px;border:2px solid;position:relative;transition:all .3s;
}
.hop-circle.ok{border-color:var(--green);background:rgba(34,197,94,.1);color:var(--green)}
.hop-circle.fail{border-color:var(--red);background:rgba(239,68,68,.1);color:var(--red)}
.hop-circle.skip{border-color:var(--muted);background:rgba(74,103,133,.1);color:var(--muted)}
.hop-circle.ok::after{content:'';position:absolute;inset:-6px;border-radius:50%;border:1px solid rgba(34,197,94,.25);animation:hopRing 2s ease-in-out infinite}
@keyframes hopRing{0%,100%{opacity:.6;transform:scale(1)}50%{opacity:0;transform:scale(1.3)}}
.hop-label{font-size:9px;color:var(--muted);text-align:center;max-width:68px;word-break:break-word}
.hop-arrow{width:44px;height:2px;flex-shrink:0;margin-bottom:22px;position:relative}
.hop-arrow::after{content:'▶';position:absolute;right:-5px;top:-7px;font-size:8px}
.hop-arrow.ok-arr{background:linear-gradient(90deg,rgba(34,197,94,.5),rgba(34,197,94,.1));color:rgba(34,197,94,.5)}
.hop-arrow.fail-arr{background:linear-gradient(90deg,rgba(239,68,68,.5),rgba(239,68,68,.1));color:rgba(239,68,68,.5)}
.hop-arrow.skip-arr{background:rgba(74,103,133,.2);color:var(--muted)}

/* ─── RISK HEATMAP ────────────────────────────────────────────── */
.heatmap-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:8px}
.heat-cell{
  padding:10px;border-radius:10px;text-align:center;cursor:pointer;
  border:1px solid transparent;transition:all .2s;
}
.heat-cell:hover{transform:scale(1.05);z-index:2}
.heat-high{background:rgba(239,68,68,.15);border-color:rgba(239,68,68,.3);color:var(--red)}
.heat-medium{background:rgba(245,158,11,.15);border-color:rgba(245,158,11,.3);color:var(--yellow)}
.heat-low{background:rgba(34,197,94,.15);border-color:rgba(34,197,94,.3);color:var(--green)}
.heat-name{font-size:10px;font-weight:600;margin-bottom:4px;word-break:break-word}
.heat-score{font-family:'JetBrains Mono',monospace;font-size:20px;font-weight:700;line-height:1}

/* ─── DONUT CHART (pure CSS) ─────────────────────────────────── */
.donut-wrap{position:relative;width:140px;height:140px;flex-shrink:0}
.donut-wrap svg{transform:rotate(-90deg)}
.donut-center{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}
.donut-total{font-family:'JetBrains Mono',monospace;font-size:24px;font-weight:700;line-height:1}
.donut-lbl{font-size:9px;color:var(--muted);margin-top:2px}

/* ─── ANIMATED ENTRIES ────────────────────────────────────────── */
.fade-up{animation:fadeUp .4s ease both}
.fade-up-1{animation:fadeUp .4s ease .08s both}
.fade-up-2{animation:fadeUp .4s ease .16s both}
.fade-up-3{animation:fadeUp .4s ease .24s both}
.fade-up-4{animation:fadeUp .4s ease .32s both}
.fade-up-5{animation:fadeUp .4s ease .40s both}
@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}

/* ─── AUDIT STEP CARDS ────────────────────────────────────────── */
.audit-step{
  display:flex;gap:16px;padding:14px 18px;border-radius:12px;
  border:1px solid var(--border);background:var(--bg2);margin-bottom:8px;
  position:relative;overflow:hidden;
  animation:fadeUp .35s ease both;
}
.audit-step.ok-step{border-color:rgba(34,197,94,.2);background:rgba(34,197,94,.02)}
.audit-step.fail-step{border-color:rgba(239,68,68,.2);background:rgba(239,68,68,.02)}
.audit-step-num{
  width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;
  font-size:13px;font-weight:700;flex-shrink:0;font-family:'JetBrains Mono',monospace;
}
.audit-step-num.ok-num{background:rgba(34,197,94,.15);color:var(--green);border:1px solid rgba(34,197,94,.3)}
.audit-step-num.fail-num{background:rgba(239,68,68,.15);color:var(--red);border:1px solid rgba(239,68,68,.3)}
.audit-step-body{flex:1;min-width:0}
.audit-step-title{font-size:12px;font-weight:600;margin-bottom:3px;display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.audit-step-detail{font-size:11px;color:var(--muted);margin-bottom:6px}
.audit-narrative{font-size:12px;line-height:1.7;color:#9ab}
.audit-narrative.fail-narr{color:#fca5a5}

/* ─── AUDIT SUMMARY BOX ───────────────────────────────────────── */
.audit-summary-box{
  padding:20px 24px;border-radius:14px;margin-bottom:24px;
  border:1px solid;font-size:13px;line-height:1.8;
}
.audit-summary-box.compliant{border-color:rgba(34,197,94,.3);background:rgba(34,197,94,.04);color:#86efac}
.audit-summary-box.noncompliant{border-color:rgba(239,68,68,.3);background:rgba(239,68,68,.04);color:#fca5a5}

/* ─── VENDOR CARD ─────────────────────────────────────────────── */
.vendor-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px}
.vendor-card{
  background:var(--bg2);border:1px solid var(--border);border-radius:14px;padding:18px 20px;
  transition:transform .2s,border-color .2s;cursor:pointer;
}
.vendor-card:hover{transform:translateY(-2px);border-color:var(--border2)}
.vendor-card.risk-high{border-color:rgba(239,68,68,.25);background:rgba(239,68,68,.02)}
.vendor-card.risk-medium{border-color:rgba(245,158,11,.2);background:rgba(245,158,11,.01)}
.vendor-card-name{font-weight:600;font-size:14px;margin-bottom:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.vendor-card-gstin{font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--muted);margin-bottom:12px}
.vendor-metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px}
.vm{text-align:center;padding:8px 4px;background:rgba(255,255,255,.02);border-radius:8px;border:1px solid rgba(255,255,255,.04)}
.vm-v{font-family:'JetBrains Mono',monospace;font-size:16px;font-weight:700}
.vm-l{font-size:9px;color:var(--muted);margin-top:2px}
.vendor-flags{display:flex;flex-wrap:wrap;gap:4px}

/* ─── MISC ────────────────────────────────────────────────────── */
::-webkit-scrollbar{width:3px;height:3px}
::-webkit-scrollbar-thumb{background:var(--bg3);border-radius:2px}
.mono{font-family:'JetBrains Mono',monospace}
.text-muted{color:var(--muted)}
.text-sm{font-size:11px}
.mt8{margin-top:8px}.mt16{margin-top:16px}.mt24{margin-top:24px}
.mb8{margin-bottom:8px}.mb16{margin-bottom:16px}.mb24{margin-bottom:24px}
.flex{display:flex}.flex-col{flex-direction:column}.items-center{align-items:center}
.justify-between{justify-content:space-between}.gap8{gap:8px}.gap16{gap:16px}

/* ══════════════════════════════════════════════════════
   graphGST V4 Additions — Heatmap, Agent, Animations
   ══════════════════════════════════════════════════════ */

/* ─── INTENSITY HEATMAP ───────────────────────────────────────── */
.heatmap-intensity-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
  gap: 6px;
}
.heat-cell-v2 {
  padding: 10px 8px;
  border-radius: 10px;
  text-align: center;
  cursor: pointer;
  transition: opacity .35s ease, transform .35s cubic-bezier(.34,1.56,.64,1), box-shadow .2s;
}
.heat-cell-v2:hover {
  transform: translateY(-4px) scale(1.08) !important;
  z-index: 2;
  filter: brightness(1.15);
}

/* ─── AGENT PAGE ──────────────────────────────────────────────── */
.agent-bubble {
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--bg3);
  font-size: 12px;
  line-height: 1.7;
  margin-bottom: 6px;
  animation: fadeUp .3s ease both;
}
.agent-bubble.user {
  border-color: rgba(167,139,250,.3);
  background: rgba(167,139,250,.05);
  text-align: right;
}
.agent-bubble.ai {
  border-color: rgba(56,189,248,.2);
  background: rgba(56,189,248,.03);
}

/* ─── SUBGRAPH NODE VIZ ───────────────────────────────────────── */
.sg-node {
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 10px;
  cursor: pointer;
  transition: all .15s;
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
}

/* ─── ENHANCED VENDOR CARD ────────────────────────────────────── */
.vendor-card {
  transition: transform .2s cubic-bezier(.34,1.2,.64,1), border-color .2s, box-shadow .2s;
}
.vendor-card:hover {
  transform: translateY(-3px) scale(1.01);
  box-shadow: 0 12px 40px rgba(0,0,0,.4);
}
.vendor-card.risk-high:hover {
  box-shadow: 0 12px 40px rgba(239,68,68,.12);
}

/* ─── FRAUD RING GLOW (enhanced) ──────────────────────────────── */
@keyframes circGstPulse {
  0%,100% { box-shadow: 0 0 0 0 rgba(236,72,153,.2), inset 0 0 30px rgba(236,72,153,.03); }
  50%      { box-shadow: 0 0 20px 4px rgba(236,72,153,.12), inset 0 0 60px rgba(236,72,153,.06); }
}

/* ─── AUDIT STEP ENHANCED ─────────────────────────────────────── */
.audit-step {
  transition: border-color .2s, transform .15s;
}
.audit-step:hover {
  transform: translateX(3px);
  border-color: rgba(56,189,248,.2);
}
.audit-step.fail-step:hover {
  border-color: rgba(239,68,68,.35);
}

/* ─── INVOICE PICKER ITEM ─────────────────────────────────────── */
.invoice-pick-item {
  transition: border-color .15s, background .15s, transform .15s;
}
.invoice-pick-item:hover {
  transform: translateX(2px);
}

/* ─── NAV ITEM NEW BADGE ──────────────────────────────────────── */
.nav-item { display: flex; align-items: center; }

/* ─── PAGE ENTER ANIMATION ────────────────────────────────────── */
@keyframes pageSlide {
  from { opacity: 0; transform: translateX(8px); }
  to   { opacity: 1; transform: translateX(0); }
}
.page-enter { animation: pageSlide .25s ease both; }

/* ─── SMOOTH PROGRESS BAR ─────────────────────────────────────── */
.pfill { transition: width 1.2s cubic-bezier(.4,0,.2,1); }

/* ─── STAGGER FADE FOR VENDOR CARDS ──────────────────────────── */
.vendor-card {
  opacity: 0;
  animation: fadeUp .4s ease both;
}

/* ─── SCROLLBAR POLISH ────────────────────────────────────────── */
#audit-result { 
  max-height: calc(100vh - 180px); 
  overflow-y: auto; 
  padding-right: 4px;
}
#invoice-picker::-webkit-scrollbar-thumb { background: var(--bg4); }

/* ─── RISK DISTRIBUTION BAR ───────────────────────────────────── */
#risk-bar > div { transition: width 1.2s cubic-bezier(.4,0,.2,1); }

