async function dashboard(mount) {
  mount.innerHTML = '<div class="loading-center"><div class="spin"></div><span>Fetching graph metrics…</span></div>';
  let data;
  try { data = await _get('/dashboard/summary'); }
  catch(e) {
    mount.innerHTML = `<div style="text-align:center;padding:60px;color:var(--muted)">
      <div style="font-size:40px;margin-bottom:16px">⚠️</div>
      <p style="font-size:16px;margin-bottom:12px">Neo4j not connected</p>
      <p style="font-size:13px;margin-bottom:20px">Configure your .env and restart the server</p>
    </div>`; return;
  }
  if (!data.node_counts?.invoices) {
    mount.innerHTML = `<div style="text-align:center;padding:80px;color:var(--muted)">
      <div style="font-size:48px;margin-bottom:20px">🌱</div>
      <h2 style="font-family:'Syne',sans-serif;font-size:22px;margin-bottom:8px;color:var(--text)">Graph is empty</h2>
      <p style="margin-bottom:24px;font-size:13px">Seed all 9 GST scenarios into Neo4j Aura to get started</p>
      <button class="btn btn-primary" onclick="seedData()" id="seed-btn">🌱 Seed 9 Scenarios Now</button>
    </div>`; return;
  }

  const nc = data.node_counts; const itc = data.itc; const vr = data.vendor_risk; const tp = data.tax_payments;
  const itcPct = itc.total_gst > 0 ? Math.round((itc.eligible/itc.total_gst)*100) : 0;
  const tpPct  = itc.total_gst > 0 ? Math.round((tp.total_remitted/itc.total_gst)*100) : 0;
  const totalVendors = (vr.high||0) + (vr.medium||0) + (vr.low||0);

  // Only show data-management controls — no "Re-seed" button if data already exists
  const dataControls = _hasData
    ? `<button class="btn btn-ghost" style="padding:5px 11px;font-size:11px;border-color:rgba(239,68,68,.3);color:var(--red)" onclick="clearGraph()">🗑 Clear Graph</button>`
    : `<button class="btn btn-primary" onclick="seedData()" id="seed-btn">🌱 Seed 9 Scenarios</button>
       <button class="btn btn-ghost" style="font-size:11px;border-color:rgba(239,68,68,.3);color:var(--red)" onclick="clearGraph()">🗑 Clear</button>`;

  mount.innerHTML = `
    <div class="sec-hdr fade-up">
      <div>
        <h2>ITC Command Center</h2>
        <p>Live graph intelligence from Neo4j Aura · ${fmtN(nc.gstins)} GSTINs tracked · 9 fraud scenarios</p>
      </div>
      <div class="sec-hdr-actions">${dataControls}</div>
    </div>

    <div class="kpi-grid fade-up-1">
      ${kpi('📄','Total Invoices',nc.invoices,'#3b82f6',`${nc.gstr1} GSTR-1 returns filed`)}
      ${kpi('🏢','GSTIN Nodes',nc.gstins,'#06b6d4',`${vr.cancelled||0} cancelled`)}
      ${kpi('💳','Tax Payments',nc.tax_payments,'#22c55e',`${tp.cleared} cleared challans`)}
      ${kpi('⛓','Relationships',_health?.relationship_count||'—','#a78bfa','Graph edges')}
    </div>

    <div class="g3 mb24 fade-up-2">
      <!-- ITC Breakdown -->
      <div class="card" style="grid-column:span 2">
        <div class="card-shine"></div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px">
          <div>
            <div style="font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Total GST Value</div>
            <div id="itc-total" style="font-family:'JetBrains Mono',monospace;font-size:32px;font-weight:700;background:linear-gradient(135deg,#fff,#38bdf8);-webkit-background-clip:text;-webkit-text-fill-color:transparent">₹0</div>
          </div>
          <div style="text-align:right">
            <div class="badge b-green" style="font-size:12px;padding:4px 12px">${itcPct}% Eligible</div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:16px">
          ${miniStat('Eligible ITC','#22c55e',itc.eligible,'itc-elig')}
          ${miniStat('Blocked ITC','#ef4444',itc.blocked,'itc-block')}
          ${miniStat('Tax Remitted','#a78bfa',tp.total_remitted,'itc-tp')}
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <div>
            <div style="font-size:10px;color:var(--muted);margin-bottom:5px">ITC Eligible Ratio</div>
            <div class="pbar"><div class="pfill" id="bar-elig" style="width:0;background:linear-gradient(90deg,var(--green),#4ade80)"></div></div>
          </div>
          <div>
            <div style="font-size:10px;color:var(--muted);margin-bottom:5px">Tax Payment Rate</div>
            <div class="pbar"><div class="pfill" id="bar-tp" style="width:0;background:linear-gradient(90deg,var(--purple),var(--blue))"></div></div>
          </div>
        </div>
      </div>

      <!-- Vendor Risk Donut -->
      <div class="card">
        <div class="card-shine"></div>
        <div style="font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:16px">Vendor Risk Distribution</div>
        <div style="display:flex;align-items:center;gap:16px">
          ${donutChart(vr.high||0, vr.medium||0, vr.low||0, totalVendors)}
          <div style="flex:1">
            ${riskLegend('HIGH',vr.high||0,'#ef4444',totalVendors)}
            ${riskLegend('MEDIUM',vr.medium||0,'#f59e0b',totalVendors)}
            ${riskLegend('LOW',vr.low||0,'#22c55e',totalVendors)}
          </div>
        </div>
      </div>
    </div>

    <!-- Scenario Breakdown -->
    <div class="card fade-up-3 mb24">
      <div class="card-shine"></div>
      <div style="font-size:12px;font-weight:600;margin-bottom:16px;display:flex;align-items:center;gap:8px">
        <span>📊</span> Scenario Breakdown
        <span class="badge b-blue">${(data.scenarios||[]).length} types</span>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px">
        ${(data.scenarios||[]).map(sc=>scenCard(sc)).join('')}
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="g3 fade-up-4">
      <div class="card" style="cursor:pointer" onclick="nav('fraud')">
        <div class="card-shine"></div>
        <div style="font-size:28px;margin-bottom:10px">🔴</div>
        <div style="font-weight:600;margin-bottom:4px">Fraud Detection</div>
        <div style="font-size:11px;color:var(--muted)">Circular rings, GST merry-go-round, phantom EWBs, cancelled GSTIN abuse</div>
      </div>
      <div class="card" style="cursor:pointer" onclick="nav('agent')">
        <div class="card-shine"></div>
        <div style="font-size:28px;margin-bottom:10px">🤖</div>
        <div style="font-weight:600;margin-bottom:4px">Audit Copilot</div>
        <div style="font-size:11px;color:var(--muted)">GraphRAG agent · Hindi/English queries · Draft SCN notices · Counterfactuals</div>
        <div style="margin-top:10px"><span class="badge b-purple">NEW</span></div>
      </div>
      <div class="card" style="cursor:pointer" onclick="nav('audit')">
        <div class="card-shine"></div>
        <div style="font-size:28px;margin-bottom:10px">⊞</div>
        <div style="font-weight:600;margin-bottom:4px">Audit Trail</div>
        <div style="font-size:11px;color:var(--muted)">Court-defensible XAI narratives · Counterfactual remediation</div>
      </div>
    </div>
  `;

  // Animate numbers
  setTimeout(()=>{
    animateNum(document.getElementById('itc-total'), itc.total_gst, 1200, '₹');
    animateNum(document.getElementById('itc-elig'), itc.eligible, 1200, '₹');
    animateNum(document.getElementById('itc-block'), itc.blocked, 1200, '₹');
    animateNum(document.getElementById('itc-tp'), tp.total_remitted, 1200, '₹');
    document.querySelectorAll('[data-kpi]').forEach(el => animateNum(el, parseFloat(el.dataset.kpi), 1000));
    setTimeout(()=>{
      document.getElementById('bar-elig').style.width = itcPct+'%';
      document.getElementById('bar-tp').style.width   = tpPct+'%';
    }, 200);
  }, 100);
}

function kpi(icon, label, value, color, sub) {
  return `<div class="kpi-card">
    <div class="kpi-accent" style="background:${color}"></div>
    <span class="kpi-icon">${icon}</span>
    <div class="kpi-label">${label}</div>
    <div class="kpi-value" data-kpi="${typeof value==='number'?value:0}" style="color:${color}">${typeof value==='number'?'0':value}</div>
    <div class="kpi-sub text-muted text-sm">${sub}</div>
  </div>`;
}
function miniStat(label, color, val, id) {
  return `<div style="padding:12px;background:rgba(255,255,255,.025);border-radius:10px;border:1px solid rgba(255,255,255,.05)">
    <div style="font-size:10px;color:var(--muted);margin-bottom:4px">${label}</div>
    <div id="${id}" style="font-family:'JetBrains Mono',monospace;font-size:18px;font-weight:700;color:${color}">₹0</div>
  </div>`;
}
function donutChart(high, med, low, total) {
  if (total === 0) return '<div style="width:120px;height:120px;border-radius:50%;border:2px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:11px;color:var(--muted)">No data</div>';
  const r = 48, circ = 2*Math.PI*r;
  const hp = high/total, mp = med/total, lp = low/total;
  const hd = hp*circ, md = mp*circ, ld = lp*circ;
  return `<div class="donut-wrap">
    <svg viewBox="0 0 112 112" width="120" height="120">
      <circle cx="56" cy="56" r="${r}" fill="none" stroke="rgba(255,255,255,.05)" stroke-width="12"/>
      <circle cx="56" cy="56" r="${r}" fill="none" stroke="#ef4444" stroke-width="12"
        stroke-dasharray="${hd} ${circ-hd}" stroke-dashoffset="0" style="transition:stroke-dasharray 1s ease"/>
      <circle cx="56" cy="56" r="${r}" fill="none" stroke="#f59e0b" stroke-width="12"
        stroke-dasharray="${md} ${circ-md}" stroke-dashoffset="${-hd}" style="transition:stroke-dasharray 1s ease"/>
      <circle cx="56" cy="56" r="${r}" fill="none" stroke="#22c55e" stroke-width="12"
        stroke-dasharray="${ld} ${circ-ld}" stroke-dashoffset="${-(hd+md)}" style="transition:stroke-dasharray 1s ease"/>
    </svg>
    <div class="donut-center">
      <div class="donut-total">${total}</div>
      <div class="donut-lbl">vendors</div>
    </div>
  </div>`;
}
function riskLegend(label, count, color, total) {
  const pct = total > 0 ? Math.round((count/total)*100) : 0;
  return `<div style="margin-bottom:10px">
    <div style="display:flex;justify-content:space-between;margin-bottom:4px">
      <span style="font-size:11px;font-weight:600;color:${color}">${label}</span>
      <span style="font-family:'JetBrains Mono',monospace;font-size:11px">${count}</span>
    </div>
    <div class="pbar"><div class="pfill" style="width:${pct}%;background:${color}"></div></div>
  </div>`;
}
function scenCard(sc) {
  const colors = {VALID:'#22c55e',MISSING_GSTR1:'#f97316',MISSING_GSTR3B:'#ef4444',
    CIRCULAR_TRADING:'#ec4899',CIRCULAR_GST_FRAUD:'#ec4899',AMOUNT_MISMATCH:'#f59e0b',
    MISSING_EWB:'#f97316',CANCELLED_GSTIN:'#ef4444',MULTI_HOP_DEFAULT:'#a78bfa',USER_INPUT:'#06b6d4'};
  const c = colors[sc.scenario] || '#64748b';
  return `<div style="padding:12px;border-radius:10px;border:1px solid ${c}22;background:${c}08">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
      ${scenBadge(sc.scenario)}
      <span style="font-family:'JetBrains Mono',monospace;font-size:11px;color:${c}">${sc.count} inv</span>
    </div>
    <div style="font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:700;color:${c}">${fmt(sc.gst_at_risk)}</div>
    <div style="font-size:10px;color:var(--muted);margin-top:2px">GST at risk</div>
  </div>`;
}

async function seedData() {
  const btn = document.getElementById('seed-btn'); if (btn) { btn.disabled=true; btn.textContent='🌱 Seeding...'; }
  toast('Seeding 9 scenarios into Neo4j…', 'info', 8000);
  try {
    const r = await _post('/seed?force=true', {});
    const ok = (r.results||[]).filter(x=>x.status==='success').length;
    toast(`✅ Seeded ${ok}/${(r.results||[]).length} scenarios`, 'ok');
    _health = await _get('/health'); _hasData = true;
    renderSidebar();
    await dashboard(document.getElementById('page'));
  } catch(e) { toast('Seeding failed — check backend', 'err'); }
  finally { if (btn) { btn.disabled=false; btn.textContent='🌱 Seed 9 Scenarios'; } }
}
async function clearGraph() {
  if (!confirm('Clear all graph data?')) return;
  await _del('/seed');
  _hasData = false;
  toast('Graph cleared', 'info');
  _health = await _get('/health'); renderSidebar();
  await dashboard(document.getElementById('page'));
}
