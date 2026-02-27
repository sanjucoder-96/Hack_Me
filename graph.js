let _cy = null;
async function graph(mount) {
  mount.innerHTML = `
    <div class="sec-hdr fade-up">
      <div><p>Labeled Property Graph — every node and relationship from Neo4j Aura</p></div>
      <div class="sec-hdr-actions" id="graph-actions">
        <button class="btn btn-ghost" onclick="fitGraph()" style="padding:6px 12px;font-size:12px">⊡ Fit</button>
        <button class="btn btn-primary" onclick="loadGraph()" id="graph-load-btn">⟳ Load Graph</button>
      </div>
    </div>
    <div class="g2 mb16 fade-up-1" id="graph-filters" style="grid-template-columns:auto 1fr"></div>
    <div class="card fade-up-2" style="padding:0;overflow:hidden;position:relative">
      <div id="cy" style="width:100%;height:580px;background:var(--bg)"></div>
      <div id="cy-overlay" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(2,8,16,.75)">
        <div style="text-align:center;color:var(--muted)">
          <div style="font-size:40px;margin-bottom:12px">⬡</div>
          <div style="font-size:15px;margin-bottom:8px">Knowledge Graph</div>
          <div style="font-size:12px;margin-bottom:20px">Click Load Graph to visualize all Neo4j nodes</div>
          <button class="btn btn-primary" onclick="loadGraph()">Load Graph</button>
        </div>
      </div>
    </div>
    <div class="g2 mt16 fade-up-3">
      <div class="card" id="node-detail" style="min-height:100px">
        <div style="color:var(--muted);font-size:12px;text-align:center;padding:20px">Click a node to see details</div>
      </div>
      <div class="card">
        <div style="font-size:11px;font-weight:600;margin-bottom:12px">Legend</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:11px">
          ${['GSTIN (Active):#4ade80','GSTIN (Fraud):#ef4444','GSTIN (High-risk):#f97316','Invoice (Matched):#3b82f6','Invoice (Issue):#f59e0b','GSTR-1:#8b5cf6','GSTR-3B:#a78bfa','TaxPayment:#22c55e','e-Way Bill:#06b6d4','IRN:#64748b'].map(l=>{
            const [lbl,c]=l.split(':');
            return `<div style="display:flex;align-items:center;gap:6px"><div style="width:10px;height:10px;border-radius:50%;background:${c};flex-shrink:0"></div>${lbl}</div>`;
          }).join('')}
        </div>
        <div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border);font-size:11px" id="graph-stats">—</div>
      </div>
    </div>
  `;
}

async function loadGraph() {
  const btn = document.getElementById('graph-load-btn');
  const overlay = document.getElementById('cy-overlay');
  if (btn) btn.disabled = true;
  overlay.innerHTML = '<div class="spin"></div>';
  try {
    const data = await _get('/graph/full');
    overlay.style.display = 'none';
    buildCytoscape(data);
    document.getElementById('graph-stats').textContent = `${data.stats.nodes} nodes · ${data.stats.edges} edges`;
    buildFilters(data.nodes);
  } catch(e) {
    overlay.innerHTML = '<div style="color:var(--red);padding:20px">Failed to load graph — check Neo4j connection</div>';
    toast('Graph load failed', 'err');
  } finally { if (btn) { btn.disabled=false; btn.textContent='⟳ Reload'; } }
}

function buildCytoscape(data) {
  const nodeColors = {
    'gstin-active':'#4ade80','gstin-fraud':'#ef4444','gstin-highrisk':'#f97316','gstin-cancelled':'#ef4444',
    'invoice-matched':'#3b82f6','invoice-fraud':'#ec4899','invoice-mismatch':'#f59e0b',
    'gstr1':'#8b5cf6','gstr3b':'#a78bfa','taxpayment-cleared':'#22c55e','taxpayment-pending':'#f59e0b',
    'ewb-normal':'#06b6d4','ewb-phantom':'#ef4444','irn':'#64748b',
  };
  const nodeSizes = {GSTIN:40,Invoice:28,GSTR1:20,GSTR3B:20,TaxPayment:22,EWayBill:18,IRN:16};

  if (_cy) { _cy.destroy(); _cy = null; }
  _cy = cytoscape({
    container: document.getElementById('cy'),
    elements: [...data.nodes, ...data.edges],
    style: [
      { selector:'node', style:{'background-color': ele => nodeColors[ele.data('class')] || '#64748b',
        'width': ele => nodeSizes[ele.data('type')] || 24,
        'height': ele => nodeSizes[ele.data('type')] || 24,
        'label': ele => (ele.data('label')||'').substring(0,18),
        'font-size':'8px','color':'#94a3b8','text-valign':'bottom','text-margin-y':4,
        'font-family':'JetBrains Mono','border-width':0,
        'transition-property':'background-color width height border-width','transition-duration':'0.2s',
      }},
      { selector:'node:selected', style:{'border-width':3,'border-color':'#38bdf8','width':52,'height':52}},
      { selector:'node.fraud-node', style:{'background-color':'#ef4444','border-width':2,'border-color':'#fca5a5'}},
      { selector:'edge', style:{
        'line-color': ele => ele.data('class')==='edge-fraud'?'#ef4444':ele.data('class')==='edge-taxpayment'?'#22c55e':ele.data('class')==='edge-supply'?'#a78bfa':'rgba(56,189,248,.25)',
        'width':1.5,'target-arrow-shape':'triangle',
        'target-arrow-color': ele => ele.data('class')==='edge-fraud'?'#ef4444':'rgba(56,189,248,.4)',
        'curve-style':'bezier','font-size':'7px','color':'#475569',
        'line-style': ele => ele.data('class')==='edge-fraud'?'dashed':'solid',
        'opacity':.8,
      }},
      { selector:'edge:selected', style:{'line-color':'#38bdf8','width':2.5,'opacity':1}},
    ],
    layout:{name:'cose',idealEdgeLength:90,nodeRepulsion:40000,gravity:70,numIter:800,animate:true,animationDuration:600,randomize:true},
    wheelSensitivity:0.3,
  });
  _cy.on('tap','node', e => showNodeDetail(e.target));
  _cy.on('tap', e => { if (e.target === _cy) document.getElementById('node-detail').innerHTML='<div style="color:var(--muted);font-size:12px;text-align:center;padding:20px">Click a node to see details</div>'; });
}

function showNodeDetail(node) {
  const d = node.data();
  const rows = Object.entries(d).filter(([k])=>!['id','class'].includes(k))
    .map(([k,v])=>`<tr><td style="padding:4px 10px;color:var(--muted);font-size:10px;text-transform:uppercase;letter-spacing:.5px">${k}</td><td style="padding:4px 10px;font-family:'JetBrains Mono',monospace;font-size:11px;word-break:break-all">${v}</td></tr>`).join('');
  document.getElementById('node-detail').innerHTML = `
    <div style="font-size:11px;font-weight:600;margin-bottom:8px;display:flex;align-items:center;gap:8px">
      <span>${d.type||'Node'}</span>
      ${d.class?`<span class="badge b-blue">${d.class}</span>`:''}
    </div>
    <table style="width:100%;border-collapse:collapse">${rows}</table>
  `;
}
function buildFilters(nodes) {
  const types = [...new Set(nodes.map(n=>n.data?.type).filter(Boolean))];
  const div = document.getElementById('graph-filters');
  if (!div) return;
  div.innerHTML = `<div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center">
    <span style="font-size:10px;color:var(--muted);margin-right:4px">Filter:</span>
    <button class="btn btn-primary" style="padding:4px 10px;font-size:11px" onclick="filterGraph('all')">All</button>
    ${types.map(t=>`<button class="btn btn-ghost" style="padding:4px 10px;font-size:11px" onclick="filterGraph('${t}')">${t}</button>`).join('')}
  </div><div></div>`;
}
function filterGraph(type) {
  if (!_cy) return;
  if (type === 'all') { _cy.elements().show(); return; }
  _cy.elements().hide();
  _cy.nodes(`[type="${type}"]`).show();
  _cy.nodes(`[type="${type}"]`).connectedEdges().show();
}
function fitGraph() { if (_cy) _cy.fit(undefined, 30); }
