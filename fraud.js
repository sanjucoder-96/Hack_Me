async function fraud(mount) {
  mount.innerHTML = '<div class="loading-center"><div class="spin"></div><span>Running fraud detection algorithms…</span></div>';
  try {
    const [rings, circGst, phantom, cancelled] = await Promise.all([
      _get('/fraud/circular'),
      _get('/fraud/circular-gst').catch(() => null),
      _get('/fraud/phantom-ewb'),
      _get('/fraud/cancelled-gstin'),
    ]);

    mount.innerHTML = `
      <div class="sec-hdr fade-up">
        <div><p>Graph cycle detection · Circular GST fraud · Phantom shipments · Cancelled GSTIN abuse</p></div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          ${rings.rings_detected>0?`<span class="badge b-red" style="font-size:12px;padding:5px 12px">🔴 ${rings.rings_detected} Ring${rings.rings_detected>1?'s':''}</span>`:''}
          ${circGst?.ring_size>0?`<span class="badge b-pink" style="font-size:12px;padding:5px 12px">💸 GST Merry-Go-Round</span>`:''}
          ${phantom.count>0?`<span class="badge b-orange" style="font-size:12px;padding:5px 12px">⚠ ${phantom.count} Phantom EWB${phantom.count>1?'s':''}</span>`:''}
        </div>
      </div>

      <!-- SC9: Circular GST Credit Fraud -->
      ${circGst ? circGstSection(circGst) : ''}

      <!-- Circular Trading (classic) -->
      <div class="card mb16 fade-up-2">
        <div class="card-shine"></div>
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
          <div style="width:36px;height:36px;border-radius:50%;background:rgba(239,68,68,.12);border:1px solid rgba(239,68,68,.3);display:flex;align-items:center;justify-content:center;font-size:16px">🔄</div>
          <div>
            <div style="font-size:14px;font-weight:600">Circular Trading Detection</div>
            <div style="font-size:11px;color:var(--muted)">Cypher cycle detection: MATCH (a:GSTIN)-[:ISSUED_INVOICE*2..5]->(a)</div>
          </div>
          <div style="margin-left:auto">${riskBadge('CRITICAL')}</div>
        </div>
        ${rings.rings.length === 0
          ? '<div style="text-align:center;padding:20px;color:var(--green);font-size:13px">✅ No circular trading rings detected</div>'
          : rings.rings.map((ring,i) => ringCard(ring,i)).join('')}
      </div>

      <!-- Phantom Shipments -->
      <div class="card mb16 fade-up-3">
        <div class="card-shine"></div>
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
          <div style="width:36px;height:36px;border-radius:50%;background:rgba(249,115,22,.12);border:1px solid rgba(249,115,22,.3);display:flex;align-items:center;justify-content:center;font-size:16px">🚛</div>
          <div>
            <div style="font-size:14px;font-weight:600">Phantom Shipments</div>
            <div style="font-size:11px;color:var(--muted)">Same vehicle used for multiple simultaneous routes</div>
          </div>
        </div>
        ${phantom.phantom_shipments.length === 0
          ? '<div style="text-align:center;padding:20px;color:var(--green);font-size:13px">✅ No phantom shipments detected</div>'
          : `<div class="tbl-wrap"><table>
              <thead><tr><th>Vehicle</th><th>EWB 1</th><th>Route 1</th><th>EWB 2</th><th>Route 2</th><th>Date</th></tr></thead>
              <tbody>${phantom.phantom_shipments.map(p=>`<tr>
                <td><span class="badge b-red">${p.vehicle}</span></td>
                <td class="mono" style="font-size:11px">${p.ewb1}</td>
                <td style="font-size:11px">${p.from1} → ${p.to1}</td>
                <td class="mono" style="font-size:11px">${p.ewb2}</td>
                <td style="font-size:11px">${p.from2} → ${p.to2}</td>
                <td style="font-size:11px;color:var(--muted)">${p.date}</td>
              </tr>`).join('')}</tbody>
            </table></div>`}
      </div>

      <!-- Cancelled GSTIN -->
      <div class="card fade-up-4">
        <div class="card-shine"></div>
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
          <div style="width:36px;height:36px;border-radius:50%;background:rgba(239,68,68,.12);border:1px solid rgba(239,68,68,.3);display:flex;align-items:center;justify-content:center;font-size:16px">⛔</div>
          <div>
            <div style="font-size:14px;font-weight:600">Invoices from Cancelled GSTINs</div>
            <div style="font-size:11px;color:var(--muted)">Invoices issued after GSTIN cancellation date</div>
          </div>
          <div style="margin-left:auto">${riskBadge('CRITICAL')}</div>
        </div>
        ${cancelled.invoices.length === 0
          ? '<div style="text-align:center;padding:20px;color:var(--green);font-size:13px">✅ No cancelled GSTIN violations found</div>'
          : `<div class="tbl-wrap"><table>
              <thead><tr><th>Supplier</th><th>Cancelled On</th><th>Invoice</th><th>Invoice Date</th><th>GST at Risk</th><th>Buyer</th></tr></thead>
              <tbody>${cancelled.invoices.map(c=>`<tr>
                <td><div style="font-size:12px">${c.supplier_name}</div><div class="mono" style="font-size:9px;color:var(--muted)">${c.supplier_gstin}</div></td>
                <td><span class="badge b-red">${c.cancelled_on||'N/A'}</span></td>
                <td class="mono" style="font-size:11px">${c.invoice_id}</td>
                <td style="font-size:11px;color:var(--orange)">${c.invoice_date}</td>
                <td class="mono" style="color:var(--red)">${fmt(c.gst_at_risk)}</td>
                <td style="font-size:12px">${c.buyer_name}</td>
              </tr>`).join('')}</tbody>
            </table></div>`}
      </div>
    `;
  } catch(e) {
    mount.innerHTML = '<div style="color:var(--red);text-align:center;padding:40px">Fraud detection failed</div>';
  }
}

/* ── SC9: Circular GST Credit Fraud card ──────────────────────────── */
function circGstSection(data) {
  const entities = data.entities || [];
  const invoices  = data.invoices  || [];
  const n = entities.length || 5;

  // ── Build SVG cycle diagram ─────────────────────────────────────────────
  const W = 320, H = 320, CX = 160, CY = 160, R = 110, nodeR = 28;
  const nodeAngles = Array.from({length: n}, (_, i) => -Math.PI/2 + (2*Math.PI*i)/n);
  const nodePos = nodeAngles.map(a => ({ x: CX + R * Math.cos(a), y: CY + R * Math.sin(a) }));
  const arrowColor = '#ec4899';
  const glowId = 'rg' + Math.random().toString(36).slice(2,6);

  let svgArrows = '';
  for (let i = 0; i < n; i++) {
    const from = nodePos[i], to = nodePos[(i+1) % n];
    const inv = invoices[i];
    const inflation = inv ? ((inv.inflation || 1) * 100 - 100).toFixed(0) : '15';
    const midX = (from.x + to.x) / 2, midY = (from.y + to.y) / 2;
    const dx = to.x - from.x, dy = to.y - from.y;
    const perp = { x: -dy * 0.22, y: dx * 0.22 };
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    const fx = from.x + nodeR * Math.cos(angle), fy = from.y + nodeR * Math.sin(angle);
    const tx = to.x - nodeR * Math.cos(angle),   ty = to.y - nodeR * Math.sin(angle);
    const cpx = midX + perp.x, cpy = midY + perp.y;
    const lx = (0.25*fx + 0.5*cpx + 0.25*tx).toFixed(1);
    const ly = (0.25*fy + 0.5*cpy + 0.25*ty - 5).toFixed(1);
    svgArrows += `<path d="M${fx.toFixed(1)},${fy.toFixed(1)} Q${cpx.toFixed(1)},${cpy.toFixed(1)} ${tx.toFixed(1)},${ty.toFixed(1)}"
      stroke="${arrowColor}" stroke-width="1.8" fill="none" opacity="0.85" marker-end="url(#ah-${glowId})" filter="url(#gf-${glowId})"/>
    ${inv ? `<text x="${lx}" y="${ly}" text-anchor="middle" fill="${arrowColor}" font-size="8" font-family="JetBrains Mono,monospace" opacity="0.9">+${inflation}%</text>` : ''}`;
  }

  let svgNodes = '';
  for (let i = 0; i < n; i++) {
    const {x, y} = nodePos[i];
    const name = (entities[i]?.name || `E${i+1}`).split(' ')[0];
    const gst  = invoices[i] ? `₹${((invoices[i].gst||0)/1000).toFixed(0)}K` : '';
    const stroke = i === 0 ? '#f43f5e' : '#ec4899';
    const fill   = i === 0 ? 'rgba(244,63,94,.25)' : 'rgba(236,72,153,.15)';
    svgNodes += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${nodeR}" fill="${fill}" stroke="${stroke}" stroke-width="1.8"/>
    <text x="${x.toFixed(1)}" y="${(y+4).toFixed(1)}" text-anchor="middle" fill="${stroke}" font-size="9" font-weight="700" font-family="JetBrains Mono,monospace">${name}</text>
    ${gst ? `<text x="${x.toFixed(1)}" y="${(y+15).toFixed(1)}" text-anchor="middle" fill="rgba(236,72,153,.65)" font-size="7" font-family="JetBrains Mono,monospace">${gst}</text>` : ''}`;
  }

  const totalFraud = data.total_itc_fraud || 0;
  const svgContent = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <marker id="ah-${glowId}" markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto">
        <polygon points="0 0,7 2.5,0 5" fill="${arrowColor}" opacity=".9"/>
      </marker>
      <filter id="gf-${glowId}" x="-25%" y="-25%" width="150%" height="150%">
        <feGaussianBlur stdDeviation="1.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
    <circle cx="${CX}" cy="${CY}" r="${R}" fill="none" stroke="rgba(236,72,153,.12)" stroke-width="1" stroke-dasharray="4 4"/>
    ${svgArrows}${svgNodes}
    <text x="${CX}" y="${CY-7}" text-anchor="middle" fill="rgba(236,72,153,.9)" font-size="9" font-weight="700" font-family="JetBrains Mono,monospace">₹${(totalFraud/100000).toFixed(2)}L</text>
    <text x="${CX}" y="${CY+5}" text-anchor="middle" fill="rgba(236,72,153,.5)" font-size="7" font-family="sans-serif">ITC Fraud</text>
    <text x="${CX}" y="${CY+17}" text-anchor="middle" fill="rgba(236,72,153,.4)" font-size="7" font-family="sans-serif">${n}-Entity Ring</text>
  </svg>`;

  return `<div class="card mb16 fade-up-1" style="border-color:rgba(236,72,153,.4);background:rgba(236,72,153,.03);animation:ringPulse 3s ease infinite">
    <div class="card-shine"></div>
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:18px">
      <div style="width:40px;height:40px;border-radius:50%;background:rgba(236,72,153,.15);border:1px solid rgba(236,72,153,.4);display:flex;align-items:center;justify-content:center;font-size:18px">💸</div>
      <div>
        <div style="font-size:14px;font-weight:700;color:var(--pink)">SC9 — Circular GST Credit Fraud (Merry-Go-Round)</div>
        <div style="font-size:11px;color:var(--muted)">${data.description}</div>
      </div>
      <div style="margin-left:auto;text-align:right">
        <div style="font-family:'JetBrains Mono',monospace;font-size:20px;font-weight:700;color:var(--pink)">${fmt(data.total_itc_fraud)}</div>
        <div style="font-size:10px;color:var(--muted)">Total ITC Fraud</div>
      </div>
    </div>

    <!-- Cycle SVG visualization + entity legend -->
    <div style="display:flex;gap:20px;align-items:flex-start;flex-wrap:wrap;margin-bottom:16px;padding:16px;border-radius:10px;background:rgba(0,0,0,.2);border:1px solid rgba(236,72,153,.15)">
      <div style="flex-shrink:0">
        <div style="font-size:10px;color:var(--muted);margin-bottom:8px;text-transform:uppercase;letter-spacing:1px">${n}-Entity Closed Loop · Arrows = invoice direction</div>
        <div style="display:flex;justify-content:center">${svgContent}</div>
        <div style="font-size:9px;color:rgba(236,72,153,.4);text-align:center;margin-top:4px">% = ITC inflation per hop · first node highlighted as ring starter</div>
      </div>
      <div style="flex:1;min-width:160px">
        <div style="font-size:10px;color:var(--muted);margin-bottom:8px;text-transform:uppercase;letter-spacing:1px">Ring Members</div>
        <div style="display:flex;flex-direction:column;gap:5px">
          ${entities.map((e,i) => {
            const inv = invoices[i];
            const gst = inv ? `₹${(inv.gst||0).toLocaleString('en-IN')}` : '—';
            const inflation = inv ? `+${((inv.inflation||1)*100-100).toFixed(0)}%` : '';
            return `<div style="display:flex;align-items:center;gap:6px;padding:5px 8px;border-radius:6px;background:rgba(236,72,153,.05);border:1px solid rgba(236,72,153,.12)">
              <div style="width:18px;height:18px;border-radius:50%;background:rgba(236,72,153,.2);border:1px solid rgba(236,72,153,.5);display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:700;color:var(--pink);flex-shrink:0">${i+1}</div>
              <div style="flex:1;min-width:0">
                <div style="font-size:10px;font-weight:600;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${e.name||e.gstin_id}</div>
                <div style="font-size:9px;color:var(--muted)">${e.gstin_id||''}</div>
              </div>
              <div style="text-align:right;flex-shrink:0">
                <div style="font-size:10px;color:var(--pink)">${gst}</div>
                ${inflation ? `<div style="font-size:8px;color:rgba(244,63,94,.7)">${inflation}</div>` : ''}
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>
    </div>

    <!-- Stats row -->
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:14px">
      ${[
        ['Ring Size', `${n} entities`, '#ec4899'],
        ['Common Vehicle', data.ewb_flags?.[0]?.vehicle || 'KA01MM0001', '#f97316'],
        ['Avg Inflation', `+${((invoices.reduce((s,inv)=>(inv?.inflation||1)+s,0)/Math.max(invoices.length,1)-1)*100).toFixed(0)}%/hop`, '#ef4444'],
        ['Detection', 'Graph cycle algo', '#a78bfa'],
      ].map(([l,v,c])=>`<div style="padding:8px 10px;border-radius:8px;background:rgba(255,255,255,.02);border:1px solid var(--border)">
        <div style="font-size:9px;color:var(--muted);margin-bottom:3px">${l}</div>
        <div style="font-size:11px;font-weight:600;color:${c}">${v}</div>
      </div>`).join('')}
    </div>

    <!-- EWB flags -->
    ${data.ewb_flags?.length ? `<div style="margin-bottom:14px">
      <div style="font-size:10px;color:var(--muted);margin-bottom:6px;text-transform:uppercase;letter-spacing:1px">E-Way Bill Anomaly Flags</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px">
        ${data.ewb_flags.map(e => `<span class="badge b-orange" title="${e.ewb_id} · ${e.date}">${e.vehicle} — ${e.flag?.replace(/_/g,' ')||'PHANTOM'} (${e.distance}km)</span>`).join('')}
      </div>
    </div>` : ''}

    <!-- Legal action bar -->
    <div style="padding:10px 14px;border-radius:8px;background:rgba(239,68,68,.06);border:1px solid rgba(239,68,68,.2);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">
      <div>
        <div style="font-size:11px;font-weight:600;color:var(--red)">⚖️ Legal Action Threshold Exceeded</div>
        <div style="font-size:10px;color:var(--muted);margin-top:2px">Section 132(1)(b) CGST Act — Criminal prosecution applies (ITC fraud > ₹5 crore threshold met collectively)</div>
      </div>
      <button class="btn btn-ghost" style="font-size:11px;border-color:rgba(167,139,250,.4);color:var(--purple)" onclick="nav('agent');setTimeout(()=>{document.getElementById('agent-query').value='Draft SCN notice for circular GST fraud ring 29CGST0001R1ZA';runAgentQuery()},300)">
        🤖 Generate SCN via Copilot →
      </button>
    </div>
  </div>`;
}


/* ── Classic ring card ──────────────────────────────────────────── */
function ringCard(ring, i) {
  const names = ring.node_names.slice(0,4);
  return `<div class="card fraud-ring-card mb8" style="border-color:rgba(239,68,68,.35);background:rgba(239,68,68,.03)">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
      <div style="font-size:13px;font-weight:600;color:var(--red)">⚠ Fraud Ring ${i+1} — ${ring.hops} hop${ring.hops>1?'s':''}</div>
      <span class="badge b-red">CRITICAL</span>
    </div>
    <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:10px">
      ${names.map((n,j)=>`
        <span style="padding:4px 10px;border-radius:99px;font-size:11px;font-weight:600;background:rgba(239,68,68,.12);border:1px solid rgba(239,68,68,.3);color:var(--red)">${n||ring.node_ids[j]}</span>
        ${j<names.length-1?'<span style="color:var(--red);font-size:14px">→</span>':''}
      `).join('')}
      <span style="color:var(--red);font-size:14px">↩</span>
    </div>
    <div style="font-size:10px;color:var(--muted)">Ring initiator: <span style="color:var(--red)">${ring.ring_starter_name} (${ring.ring_starter})</span></div>
    <div style="font-size:11px;color:var(--muted);margin-top:6px">Pattern: Goods sold in a closed loop with minimal value addition — ITC fraud detected via graph cycle algorithm</div>
  </div>`;
}
