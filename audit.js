async function reconcile(mount) {
  mount.innerHTML = `
    <div class="sec-hdr fade-up">
      <div><h2>ITC Reconciliation Engine</h2>
        <p>Full multi-hop chain: GSTIN → Invoice → GSTR1 → GSTR3B → TaxPayment</p>
      </div>
      <div class="sec-hdr-actions">
        <button class="btn btn-primary" onclick="runReconcile()" id="recon-btn">▶ Run Validation</button>
      </div>
    </div>
    <div class="card fade-up-1 mb16" style="background:linear-gradient(135deg,rgba(59,130,246,.06),rgba(124,58,237,.04))">
      <div style="font-size:12px;font-weight:600;margin-bottom:10px;color:var(--accent)">5-hop ITC validation chain</div>
      <div class="hop-chain" id="chain-visual">
        ${makeChainNode('🏢','Supplier GSTIN','ok')}${makeChainArrow('ok')}
        ${makeChainNode('📄','Invoice','ok')}${makeChainArrow('ok')}
        ${makeChainNode('📋','GSTR-1','ok')}${makeChainArrow('ok')}
        ${makeChainNode('📑','GSTR-3B','ok')}${makeChainArrow('ok')}
        ${makeChainNode('💳','TaxPayment','ok')}${makeChainArrow('skip')}
        ${makeChainNode('🏦','Buyer ITC','ok')}
      </div>
    </div>
    <div id="recon-results">
      <div style="text-align:center;padding:60px;color:var(--muted)">
        <div style="font-size:36px;margin-bottom:12px">⧖</div>
        <p>Click "Run Validation" to validate all invoice ITC chains</p>
      </div>
    </div>
  `;
}
function makeChainNode(icon, label, status) {
  return `<div class="hop-node"><div class="hop-circle ${status}">${icon}</div><div class="hop-label">${label}</div></div>`;
}
function makeChainArrow(status) {
  return `<div class="hop-arrow ${status}-arr"></div>`;
}

async function runReconcile() {
  const btn = document.getElementById('recon-btn');
  btn.disabled = true; btn.textContent = '⟳ Validating…';
  const res = document.getElementById('recon-results');
  res.innerHTML = '<div class="loading-center"><div class="spin"></div><span>Running multi-hop validation…</span></div>';
  try {
    const data = await _get('/reconcile');
    const s = data.summary;
    res.innerHTML = `
      <div class="kpi-grid mb16">
        ${miniKpi('Total Issues', s.total_issues, '#ef4444')}
        ${miniKpi('Missing GSTR-1', s.missing_gstr1, '#f97316')}
        ${miniKpi('Missing GSTR-3B', s.missing_gstr3b, '#ef4444')}
        ${miniKpi('Missing Tax Payment', s.missing_tax_payment||0, '#ef4444')}
      </div>
      <div class="kpi-grid mb24" style="grid-template-columns:repeat(4,1fr)">
        ${miniKpi('Amount Mismatch', s.amount_mismatch, '#f59e0b')}
        ${miniKpi('Missing EWB', s.missing_ewb, '#f97316')}
        ${miniKpi('Cancelled GSTIN', s.cancelled_gstin, '#ef4444')}
        ${miniKpi('Valid Chains ✓', s.valid_chains, '#22c55e')}
      </div>
      ${data.issues.length ? `
        <div class="card mb16">
          <div class="card-shine"></div>
          <div style="font-size:12px;font-weight:600;margin-bottom:14px;display:flex;align-items:center;gap:8px">
            ⚠ Issues Found <span class="badge b-red">${data.issues.length}</span>
          </div>
          <div class="tbl-wrap">
            <table>
              <thead><tr>
                <th>Invoice</th><th>Supplier</th><th>Buyer</th><th>GST at Risk</th><th>Type</th><th>Risk</th><th>Reason</th>
              </tr></thead>
              <tbody>${data.issues.map(issue=>`<tr>
                <td><span class="mono" style="font-size:11px">${issue.invoice_id}</span></td>
                <td><div style="font-size:12px">${issue.supplier_name||'—'}</div><div class="mono" style="font-size:9px;color:var(--muted)">${issue.supplier||''}</div></td>
                <td style="font-size:12px">${issue.buyer_name||'—'}</td>
                <td><span class="mono" style="font-size:12px;color:var(--red)">${fmt(issue.gst_amount)}</span></td>
                <td>${scenBadge(issue.mismatch_type)}</td>
                <td>${riskBadge(issue.risk_level)}</td>
                <td style="font-size:11px;color:var(--muted);max-width:200px">${issue.reason||'—'}</td>
              </tr>`).join('')}</tbody>
            </table>
          </div>
        </div>
      ` : ''}
      ${data.valid_chains.length ? `
        <div class="card">
          <div class="card-shine"></div>
          <div style="font-size:12px;font-weight:600;margin-bottom:14px;display:flex;align-items:center;gap:8px">
            ✅ Valid ITC Chains <span class="badge b-green">${data.valid_chains.length}</span>
          </div>
          <div class="tbl-wrap">
            <table>
              <thead><tr><th>Invoice</th><th>Supplier</th><th>Buyer</th><th>ITC Amount</th><th>Status</th></tr></thead>
              <tbody>${data.valid_chains.map(v=>`<tr>
                <td class="mono" style="font-size:11px">${v.invoice_id}</td>
                <td style="font-size:12px">${v.supplier_name||'—'}</td>
                <td style="font-size:12px">${v.buyer_name||'—'}</td>
                <td class="mono" style="color:var(--green)">${fmt(v.gst_amount)}</td>
                <td><span class="badge b-green">ELIGIBLE</span></td>
              </tr>`).join('')}</tbody>
            </table>
          </div>
        </div>
      ` : ''}
    `;
    toast(`Validation complete: ${s.total_issues} issues, ${s.valid_chains} valid chains`, s.total_issues>0?'warn':'ok');
  } catch(e) { res.innerHTML = '<div style="color:var(--red);padding:20px;text-align:center">Reconciliation failed</div>'; toast('Reconciliation failed','err'); }
  finally { btn.disabled=false; btn.textContent='▶ Re-Run'; }
}
function miniKpi(label, value, color) {
  return `<div class="kpi-card"><div class="kpi-accent" style="background:${color}"></div>
    <div class="kpi-label">${label}</div>
    <div class="kpi-value" style="color:${color}">${value}</div>
  </div>`;
}
