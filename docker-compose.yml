async function vendors(mount) {
  mount.innerHTML = '<div class="loading-center"><div class="spin"></div><span>Computing risk scores via NetworkX…</span></div>';
  try {
    const data = await _get('/vendors/risk');
    const s = data.summary;
    mount.innerHTML = `
      <div class="sec-hdr fade-up">
        <div><h2>Vendor Risk Heatmap</h2><p>PageRank · Betweenness Centrality · Rule-based flags · ${s.total} vendors</p></div>
        <div style="display:flex;gap:8px;align-items:center">
          <span class="badge b-red">${s.high_risk} HIGH</span>
          <span class="badge b-yellow">${s.medium_risk} MEDIUM</span>
          <span class="badge b-green">${s.low_risk} LOW</span>
          <div style="display:flex;gap:4px;margin-left:8px">
            <button class="btn btn-ghost" style="font-size:10px;padding:3px 10px" onclick="filterVendors('all')">All</button>
            <button class="btn btn-ghost" style="font-size:10px;padding:3px 10px;border-color:rgba(239,68,68,.4);color:var(--red)" onclick="filterVendors('HIGH')">High</button>
            <button class="btn btn-ghost" style="font-size:10px;padding:3px 10px;border-color:rgba(245,158,11,.4);color:var(--yellow)" onclick="filterVendors('MEDIUM')">Med</button>
            <button class="btn btn-ghost" style="font-size:10px;padding:3px 10px;border-color:rgba(34,197,94,.4);color:var(--green)" onclick="filterVendors('LOW')">Low</button>
          </div>
        </div>
      </div>

      <!-- Intensity Heatmap -->
      <div class="card mb16 fade-up-1">
        <div class="card-shine"></div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
          <div style="font-size:12px;font-weight:600">Risk Intensity Heatmap</div>
          <div style="display:flex;align-items:center;gap:6px;font-size:10px;color:var(--muted)">
            <div style="width:60px;height:6px;border-radius:3px;background:linear-gradient(90deg,#22c55e,#f59e0b,#ef4444)"></div>
            Low → High
          </div>
        </div>
        <div class="heatmap-intensity-grid" id="heatmap-grid">
          ${data.vendors.map((v,i) => heatCell(v, i)).join('')}
        </div>
        <!-- Scale legend -->
        <div style="display:flex;justify-content:space-between;margin-top:10px;padding:0 2px;font-size:9px;color:var(--muted)">
          <span>0 — Low Risk</span><span>25</span><span>50 — Medium</span><span>75</span><span>100 — Critical</span>
        </div>
      </div>

      <!-- Risk Distribution Bar -->
      <div class="card mb16 fade-up-2">
        <div class="card-shine"></div>
        <div style="font-size:11px;font-weight:600;margin-bottom:12px">Portfolio Risk Distribution</div>
        <div style="height:24px;border-radius:12px;overflow:hidden;display:flex;gap:2px" id="risk-bar">
          <div style="width:${(s.high_risk/s.total*100).toFixed(1)}%;background:linear-gradient(90deg,#ef4444,#dc2626);border-radius:12px 0 0 12px;min-width:2px;transition:width 1s ease;display:flex;align-items:center;justify-content:center">
            ${s.high_risk>0?`<span style="font-size:9px;color:white;font-weight:700">${s.high_risk}</span>`:''}
          </div>
          <div style="width:${(s.medium_risk/s.total*100).toFixed(1)}%;background:linear-gradient(90deg,#f59e0b,#d97706);min-width:2px;transition:width 1s ease;display:flex;align-items:center;justify-content:center">
            ${s.medium_risk>0?`<span style="font-size:9px;color:white;font-weight:700">${s.medium_risk}</span>`:''}
          </div>
          <div style="flex:1;background:linear-gradient(90deg,#22c55e,#16a34a);border-radius:0 12px 12px 0;transition:width 1s ease;display:flex;align-items:center;justify-content:center">
            ${s.low_risk>0?`<span style="font-size:9px;color:white;font-weight:700">${s.low_risk}</span>`:''}
          </div>
        </div>
        <div style="display:flex;gap:16px;margin-top:8px">
          <span style="font-size:10px;color:var(--red)">■ HIGH ${s.high_risk>0?((s.high_risk/s.total*100).toFixed(0)+'%'):''}</span>
          <span style="font-size:10px;color:var(--yellow)">■ MEDIUM ${s.medium_risk>0?((s.medium_risk/s.total*100).toFixed(0)+'%'):''}</span>
          <span style="font-size:10px;color:var(--green)">■ LOW ${s.low_risk>0?((s.low_risk/s.total*100).toFixed(0)+'%'):''}</span>
        </div>
      </div>

      <!-- Vendor Cards -->
      <div class="vendor-grid fade-up-3" id="vendor-cards">
        ${data.vendors.map((v,i) => vendorCard(v,i)).join('')}
      </div>
    `;

    // Store vendor data globally for filtering
    window._vendorData = data.vendors;

    // Animate heatmap cells entry with stagger
    setTimeout(() => {
      document.querySelectorAll('.heat-cell-v2').forEach((el, i) => {
        setTimeout(() => {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0) scale(1)';
        }, i * 30);
      });
    }, 100);

  } catch(e) { mount.innerHTML = '<div style="color:var(--red);text-align:center;padding:40px">Vendor risk computation failed</div>'; }
}

/* ── Intensity-based heat cell ──────────────────────────────────── */
function heatCell(v, idx) {
  const score = v.risk_score;
  // HSL: 120=green → 60=yellow → 0=red, mapped from score 0–100
  const hue = Math.round(120 - (score / 100) * 120);
  const sat = 65 + (score / 100) * 25;          // 65–90%
  const lit = 18 + (1 - score / 100) * 10;      // 18–28% (dark bg)
  const borderAlpha = 0.15 + (score / 100) * 0.5;
  const textColor = score >= 60 ? '#fca5a5' : score >= 30 ? '#fde68a' : '#86efac';
  const glowColor = score >= 60 ? 'rgba(239,68,68,' : score >= 30 ? 'rgba(245,158,11,' : 'rgba(34,197,94,';
  const pulse = score >= 71 ? 'animation:ringPulse 2s ease-in-out infinite' : '';

  return `<div class="heat-cell-v2" data-level="${v.risk_level}" style="
      background:hsl(${hue},${sat}%,${lit}%);
      border:1px solid hsl(${hue},${sat}%,${lit+15}%,${borderAlpha});
      box-shadow:0 0 ${Math.round(score/5)}px ${glowColor}${(score/300).toFixed(2)});
      opacity:0;transform:translateY(8px) scale(0.92);
      transition:opacity .3s ease,transform .3s ease,box-shadow .2s;
      padding:10px 8px;border-radius:10px;text-align:center;cursor:pointer;${pulse}"
    onclick="scrollToVendor('${v.gstin_id}')"
    title="${v.name}\n${v.gstin_id}\nScore: ${score}\nFlags: ${v.flags.join(', ')||'None'}">
      <div style="font-size:9px;font-weight:600;margin-bottom:4px;color:${textColor};word-break:break-word;line-height:1.2">${v.name.split(' ').slice(0,2).join(' ')}</div>
      <div style="font-family:'JetBrains Mono',monospace;font-size:18px;font-weight:800;color:${textColor};line-height:1">${score}</div>
      <div style="font-size:8px;margin-top:3px;color:${textColor};opacity:.8">${v.risk_level}</div>
      ${v.in_fraud_cycle?'<div style="font-size:10px;margin-top:3px">🔴</div>':''}
      ${v.flags.length>0?`<div style="font-size:8px;margin-top:2px;color:${textColor};opacity:.7">${v.flags.length} flag${v.flags.length>1?'s':''}</div>`:''}
  </div>`;
}

/* ── Vendor card ────────────────────────────────────────────────── */
const FLAG_COLORS = {MISSING_GSTR1:'b-orange',MISSING_GSTR3B:'b-red',TAX_NOT_REMITTED:'b-red',
  CIRCULAR_TRADING:'b-pink',CANCELLED_GSTIN:'b-red',HIGH_PAGERANK:'b-purple',HIGH_BETWEENNESS:'b-blue'};

function vendorCard(v, idx) {
  const score = v.risk_score;
  const barColor = score>=71 ? '#ef4444' : score>=31 ? '#f59e0b' : '#22c55e';
  const borderColor = score>=71 ? 'rgba(239,68,68,.3)' : score>=31 ? 'rgba(245,158,11,.2)' : 'var(--border)';
  const glowIntensity = score>=71 ? '0 0 20px rgba(239,68,68,.08)' : 'none';

  return `<div class="vendor-card risk-${v.risk_level.toLowerCase()}" id="vc-${v.gstin_id}"
    style="border-color:${borderColor};box-shadow:${glowIntensity};
           animation:fadeUp .4s ease ${(idx*0.04).toFixed(2)}s both">
    <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:4px">
      <div class="vendor-card-name">${v.name}</div>
      ${riskBadge(v.risk_level, v.risk_score)}
    </div>
    <div class="vendor-card-gstin">${v.gstin_id} · ${v.status||'Active'}</div>
    <div style="margin-bottom:12px">
      <div class="pbar" style="height:6px;border-radius:3px">
        <div class="pfill" style="width:0%;background:${barColor};border-radius:3px;transition:width 1s ease ${(0.3+idx*0.04).toFixed(2)}s"
          data-target="${score}"></div>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:9px;color:var(--muted);margin-top:3px">
        <span>Risk Score</span><span style="font-family:'JetBrains Mono',monospace;color:${barColor}">${score}/100</span>
      </div>
    </div>
    <div class="vendor-metrics">
      <div class="vm">
        <div class="vm-v" style="color:${barColor}">${v.risk_score}</div>
        <div class="vm-l">Risk</div>
      </div>
      <div class="vm">
        <div class="vm-v" style="color:var(--purple)">${v.pagerank.toFixed(3)}</div>
        <div class="vm-l">PageRank</div>
      </div>
      <div class="vm">
        <div class="vm-v">${v.invoice_count||0}</div>
        <div class="vm-l">Invoices</div>
      </div>
    </div>
    ${v.flags.length ? `<div class="vendor-flags">${v.flags.map(f=>`<span class="badge ${FLAG_COLORS[f]||'b-blue'}">${f.replace(/_/g,' ')}</span>`).join('')}</div>` : ''}
    ${v.in_fraud_cycle?'<div style="margin-top:8px;padding:6px 10px;border-radius:8px;background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.2);font-size:11px;color:var(--red);animation:ringPulse 2.5s ease infinite">⚠ In circular trading ring</div>':''}
    ${v.status==='CANCELLED'?'<div style="margin-top:8px;padding:6px 10px;border-radius:8px;background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.2);font-size:11px;color:var(--red)">⛔ GSTIN Cancelled</div>':''}
    <div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--border);display:flex;gap:6px">
      <button class="btn btn-ghost" style="font-size:10px;padding:3px 10px;flex:1" onclick="nav('audit');setTimeout(()=>loadAuditTrailForVendor('${v.gstin_id}'),300)">View Audit Trail →</button>
    </div>
  </div>`;
}

/* ── Filter vendors ─────────────────────────────────────────────── */
function filterVendors(level) {
  const allCells = document.querySelectorAll('.heat-cell-v2');
  const allCards = document.querySelectorAll('.vendor-card');
  allCells.forEach(el => {
    const show = level === 'all' || el.dataset.level === level;
    el.style.opacity = show ? '1' : '0.15';
    el.style.transform = show ? 'scale(1)' : 'scale(0.85)';
  });
  allCards.forEach(el => {
    const cardLevel = el.classList.contains('risk-high') ? 'HIGH'
                    : el.classList.contains('risk-medium') ? 'MEDIUM' : 'LOW';
    const show = level === 'all' || cardLevel === level;
    el.style.opacity = show ? '1' : '0';
    el.style.transform = show ? 'translateY(0)' : 'translateY(8px)';
    el.style.pointerEvents = show ? 'auto' : 'none';
  });
  // Animate progress bars that are now visible
  animateBars();
}

function animateBars() {
  document.querySelectorAll('.pfill[data-target]').forEach(bar => {
    const target = parseFloat(bar.dataset.target);
    setTimeout(() => { bar.style.width = target + '%'; }, 50);
  });
}

function scrollToVendor(id) {
  const el = document.getElementById('vc-'+id);
  if (el) {
    el.scrollIntoView({behavior:'smooth',block:'center'});
    el.style.outline = '2px solid var(--accent)';
    el.style.outlineOffset = '2px';
    setTimeout(()=>{ el.style.outline=''; el.style.outlineOffset=''; }, 2000);
  }
}

// Animate bars after render
setTimeout(animateBars, 500);
