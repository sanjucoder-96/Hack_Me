/* agent.js — GraphRAG Audit Intelligence Copilot */
async function agent(mount) {
  mount.innerHTML = `
    <div class="sec-hdr fade-up">
      <div>
        <h2>GraphRAG Audit Copilot</h2>
        <p>Knowledge Graph + AI · Hindi/English GST queries · Subgraph visualization · Draft SCN notices · Counterfactuals</p>
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        <span class="badge b-purple">GraphRAG</span>
        <span class="badge b-cyan">Neo4j KG</span>
        <span class="badge b-green">XAI v4</span>
      </div>
    </div>

    <!-- Feature banner -->
    <div class="card mb16 fade-up-1" style="border-color:rgba(167,139,250,.3);background:linear-gradient(135deg,rgba(167,139,250,.05),rgba(59,130,246,.03));padding:16px 20px">
      <div class="card-shine"></div>
      <div style="display:flex;align-items:flex-start;gap:12px">
        <div style="font-size:28px;flex-shrink:0">🤖</div>
        <div>
          <div style="font-size:13px;font-weight:600;margin-bottom:4px;color:var(--purple)">GST Audit Intelligence Agent</div>
          <div style="font-size:11px;color:var(--muted);line-height:1.7">
            Ask about <strong style="color:var(--accent)">GST fraud patterns, ITC chains, vendor risk, GSTR reconciliation, or e-Way Bill anomalies</strong> 
            in Hindi or English. The agent traverses the Neo4j graph and generates court-defensible show-cause notices.
            <br><span style="color:rgba(239,68,68,.7);font-size:10px">⚠ Only GST/tax-related queries are accepted.</span>
          </div>
        </div>
        <div style="flex-shrink:0;text-align:right">
          <div style="font-size:10px;color:var(--muted);margin-bottom:2px">Addresses</div>
          <span class="badge b-orange">IGC Bottleneck</span>
        </div>
      </div>
    </div>

    <div class="g2 fade-up-2" style="grid-template-columns:340px 1fr;align-items:start">
      <!-- Left: Query panel -->
      <div>
        <div class="card mb16">
          <div class="card-shine"></div>
          <div style="font-size:12px;font-weight:600;margin-bottom:4px">🔍 Ask the Audit Copilot</div>
          <div style="font-size:10px;color:rgba(167,139,250,.8);margin-bottom:12px;padding:6px 8px;border-radius:6px;background:rgba(167,139,250,.06);border:1px solid rgba(167,139,250,.15)">
            💡 Ask about: ITC fraud, circular trading, phantom EWBs, cancelled GSTINs, vendor risk, GSTR reconciliation
          </div>
          
          <div style="margin-bottom:10px">
            <div style="font-size:10px;color:var(--muted);margin-bottom:4px">YOUR QUERY (Hindi / English)</div>
            <textarea id="agent-query" class="inp" placeholder="E.g.: Show circular ring around GSTIN 29CGST0001R1ZA&#10;&#10;Show all high-risk vendors with fraud flags&#10;&#10;या: सभी फर्जी ITC रिंग दिखाएं" style="height:110px;resize:vertical;line-height:1.6"></textarea>
            <div id="agent-query-err" style="display:none;font-size:10px;color:var(--red);margin-top:4px;padding:6px 8px;border-radius:6px;background:rgba(239,68,68,.06);border:1px solid rgba(239,68,68,.2)">
              ⚠ Please ask a GST/tax-related question. This copilot only handles GST fraud, ITC chains, vendor risk, and compliance queries.
            </div>
          </div>

          <div style="font-size:10px;font-weight:600;color:var(--muted);margin-bottom:6px;text-transform:uppercase;letter-spacing:1px">Quick Queries</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-bottom:14px">
            ${[
              ['🔴 Circular Ring', 'Show circular GST fraud ring and generate draft notice'],
              ['🚛 Phantom EWB', 'Show all phantom e-Way Bills and vehicle anomalies'],
              ['⚖️ Draft SCN', 'Draft show cause notice for circular GST fraud u/s 74'],
              ['🔮 Counterfactual', 'What if circular ITC ring had been detected at hop 2?'],
              ['📊 High-Risk Vendors', 'Show all high risk vendors with fraud flags'],
              ['🇮🇳 Hindi', 'सभी गोलाकार ITC धोखाधड़ी रिंग दिखाएं'],
            ].map(([label, q]) =>
              `<button class="btn btn-ghost" style="font-size:10px;padding:5px 8px;text-align:left;justify-content:flex-start;white-space:nowrap;overflow:hidden;text-overflow:ellipsis"
                onclick="document.getElementById('agent-query').value='${q.replace(/'/g,"\\'")}';document.getElementById('agent-query-err').style.display='none'">${label}</button>`
            ).join('')}
          </div>

          <button class="btn btn-primary" id="agent-submit" onclick="runAgentQuery()" style="width:100%">
            ⚡ Run Audit Agent
          </button>
        </div>

        <!-- Conversation history -->
        <div class="card" id="agent-history" style="display:none">
          <div style="font-size:11px;font-weight:600;margin-bottom:8px;color:var(--muted)">Recent Queries</div>
          <div id="history-list" style="display:flex;flex-direction:column;gap:4px;max-height:200px;overflow-y:auto"></div>
        </div>
      </div>

      <!-- Right: Results -->
      <div id="agent-result">
        <div style="text-align:center;padding:60px 20px;color:var(--muted)">
          <div style="font-size:48px;margin-bottom:16px">🤖</div>
          <div style="font-size:14px;margin-bottom:8px">GST Audit Copilot Ready</div>
          <div style="font-size:12px;max-width:420px;margin:0 auto;line-height:1.6">
            Ask a question about <strong style="color:var(--accent)">GST fraud, ITC chains, circular trading, e-Way Bill anomalies, or vendor risk</strong> in Hindi or English.
          </div>
          <div style="margin-top:16px;padding:10px 14px;border-radius:8px;background:rgba(167,139,250,.06);border:1px solid rgba(167,139,250,.15);font-size:11px;color:var(--purple);max-width:340px;margin-left:auto;margin-right:auto">
            ℹ️ Only GST/tax compliance queries are processed. Off-topic queries will be redirected.
          </div>
        </div>
      </div>
    </div>
  `;

  // Allow Enter+Ctrl to submit
  document.getElementById('agent-query')?.addEventListener('keydown', e => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) runAgentQuery();
  });
  // Hide error as user types
  document.getElementById('agent-query')?.addEventListener('input', () => {
    document.getElementById('agent-query-err').style.display = 'none';
  });
}

// ── GST query validation ───────────────────────────────────────────────────────
const _GST_KEYWORDS = [
  // English
  'gst','gstin','itc','invoice','gstr','fraud','circular','ring','phantom','ewb',
  'e-way','eway','vendor','risk','audit','trail','reconcile','reconciliation','compliance',
  'notice','scn','tax','return','cancel','cancelled','mismatch','challan','payment',
  'supplier','buyer','supply','chain','hop','propagat','seir','beta','gamma','policy',
  'section','cgst','sgst','igst','irc','irn','hsn','gst2b','gstr1','gstr3b','gstr2',
  'input','output','liability','claim','refund','demand','assessment','penalty','prosecution',
  // Hindi
  'कर','जीएसटी','इनपुट','कर्मचारी','फर्जी','रिंग','धोखाधड़ी','नोटिस','ऑडिट',
  'जोखिम','रद्द','विक्रेता','चालान','भुगतान','आपूर्ति','वाहन','ई-वे',
];

function _isGstRelated(query) {
  const q = query.toLowerCase();
  // Allow Hindi script always (specific GST Hindi keywords checked above)
  if (/[\u0900-\u097F]/.test(query)) return true;
  return _GST_KEYWORDS.some(kw => q.includes(kw));
}

let _agentHistory = [];

async function runAgentQuery() {
  const qEl = document.getElementById('agent-query');
  const errEl = document.getElementById('agent-query-err');
  const query = qEl?.value?.trim();
  if (!query) { toast('Please enter a query', 'warn'); return; }

  // ── GST relevance check ─────────────────────────────────────────────────
  if (!_isGstRelated(query)) {
    errEl.style.display = 'block';
    errEl.textContent = '⚠ This copilot only handles GST, ITC, fraud, and tax-compliance queries. Please rephrase your question in that context.';
    qEl.focus();
    return;
  }
  errEl.style.display = 'none';

  const btn = document.getElementById('agent-submit');
  btn.disabled = true; btn.textContent = '⟳ Traversing graph…';

  const result = document.getElementById('agent-result');
  result.innerHTML = `
    <div class="card" style="padding:24px">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">
        <div class="spin"></div>
        <div>
          <div style="font-size:13px;font-weight:600">Traversing Neo4j Knowledge Graph…</div>
          <div id="agent-status" style="font-size:11px;color:var(--muted);margin-top:2px">Analyzing GST query intent…</div>
        </div>
      </div>
      <div id="agent-progress" style="height:2px;background:rgba(255,255,255,.06);border-radius:1px;overflow:hidden">
        <div id="agent-bar" style="height:100%;width:0%;background:linear-gradient(90deg,var(--purple),var(--blue));transition:width .3s ease;border-radius:1px"></div>
      </div>
    </div>`;

  const statusMessages = ['Parsing GST query intent…','Traversing GSTIN nodes…','Running cycle detection…','Computing risk subgraph…','Generating XAI explanation…','Drafting audit response…'];
  let si = 0;
  const statusInterval = setInterval(() => {
    const el = document.getElementById('agent-status');
    const bar = document.getElementById('agent-bar');
    if (el) el.textContent = statusMessages[si % statusMessages.length];
    if (bar) bar.style.width = Math.min(90, (si+1)*15) + '%';
    si++;
  }, 400);

  try {
    const resp = await _post('/agent/query', { query, language: detectLang(query) });
    clearInterval(statusInterval);
    const bar = document.getElementById('agent-bar');
    if (bar) bar.style.width = '100%';
    await new Promise(r => setTimeout(r, 200));
    _agentHistory.unshift({ query, intent: resp.intent, ts: new Date() });
    updateHistory();
    renderAgentResult(resp, query);
  } catch(e) {
    clearInterval(statusInterval);
    result.innerHTML = `<div class="card" style="border-color:rgba(239,68,68,.3);padding:20px">
      <div style="color:var(--red);font-weight:600;margin-bottom:8px">⚠ Agent query failed</div>
      <div style="font-size:12px;color:var(--muted)">Check that the backend is running and Neo4j is connected.</div>
    </div>`;
    toast('Agent query failed', 'err');
  } finally {
    btn.disabled = false; btn.textContent = '⚡ Run Audit Agent';
  }
}

function detectLang(q) {
  return /[\u0900-\u097F]/.test(q) ? 'hi' : 'en';
}

function renderAgentResult(resp, query) {
  const result = document.getElementById('agent-result');
  const xaiPct = Math.round((resp.xai_confidence || 0.9) * 100);

  result.innerHTML = `
    <!-- Response header -->
    <div class="card mb12 fade-up" style="border-color:rgba(167,139,250,.3);background:rgba(167,139,250,.03);padding:14px 18px">
      <div class="card-shine"></div>
      <div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:10px">
        <div style="font-size:20px">🤖</div>
        <div style="flex:1">
          <div style="font-size:11px;color:var(--purple);font-weight:600;margin-bottom:3px">Audit Copilot Response · ${resp.intent?.toUpperCase()} intent</div>
          <div style="font-size:11px;color:var(--muted);font-style:italic">"${query}"</div>
        </div>
        <div style="text-align:right;flex-shrink:0">
          <div style="font-family:'JetBrains Mono',monospace;font-size:16px;font-weight:700;color:var(--purple)">${xaiPct}%</div>
          <div style="font-size:9px;color:var(--muted)">XAI confidence</div>
        </div>
      </div>
      <!-- Confidence bar -->
      <div style="height:3px;background:rgba(255,255,255,.06);border-radius:2px;overflow:hidden">
        <div style="height:100%;width:${xaiPct}%;background:linear-gradient(90deg,var(--purple),var(--blue));transition:width 1s ease;border-radius:2px"></div>
      </div>
    </div>

    ${resp.hindi_summary ? `
    <div class="card mb12 fade-up-1" style="border-color:rgba(6,182,212,.2);background:rgba(6,182,212,.03);padding:14px 18px">
      <div style="font-size:10px;color:var(--cyan);font-weight:600;margin-bottom:6px;text-transform:uppercase;letter-spacing:1px">🇮🇳 हिंदी सारांश</div>
      <div style="font-size:13px;line-height:1.8;color:var(--text)">${resp.hindi_summary}</div>
    </div>` : ''}

    <!-- Insights -->
    ${resp.insights?.length ? `
    <div class="card mb12 fade-up-1">
      <div class="card-shine"></div>
      <div style="font-size:11px;font-weight:600;margin-bottom:10px;color:var(--accent)">📊 Graph Intelligence Insights</div>
      <div style="display:flex;flex-direction:column;gap:6px">
        ${resp.insights.map(ins => `
          <div style="padding:8px 12px;border-radius:8px;background:rgba(255,255,255,.02);border:1px solid var(--border);font-size:12px;line-height:1.5">${ins}</div>
        `).join('')}
      </div>
    </div>` : ''}

    <!-- Scenario info -->
    ${resp.scenario ? `
    <div class="card mb12 fade-up-2" style="border-color:rgba(239,68,68,.2);background:rgba(239,68,68,.02)">
      <div class="card-shine"></div>
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
        <div style="font-size:20px">🔴</div>
        <div>
          <div style="font-size:12px;font-weight:600;color:var(--red)">${resp.scenario.title}</div>
          <div style="font-size:10px;color:var(--muted)">${resp.scenario.description}</div>
        </div>
      </div>
      ${resp.scenario.risk_factors?.length ? `
      <div style="margin-bottom:12px">
        <div style="font-size:10px;color:var(--muted);margin-bottom:6px;text-transform:uppercase;letter-spacing:1px">Risk Factors</div>
        ${resp.scenario.risk_factors.map(f => `<div style="font-size:11px;padding:4px 0;border-bottom:1px solid var(--border);color:var(--text)">⚠ ${f}</div>`).join('')}
      </div>` : ''}
    </div>` : ''}

    <!-- Legal provisions -->
    ${resp.legal_provisions?.length ? `
    <div class="card mb12 fade-up-3" style="border-color:rgba(245,158,11,.2);background:rgba(245,158,11,.02)">
      <div class="card-shine"></div>
      <div style="font-size:11px;font-weight:600;margin-bottom:10px;color:var(--yellow)">⚖️ Applicable Legal Provisions</div>
      ${resp.legal_provisions.map(p => `
        <div style="padding:8px 12px;border-radius:8px;background:rgba(245,158,11,.04);border:1px solid rgba(245,158,11,.15);margin-bottom:6px;font-size:11px;line-height:1.5;color:var(--text)">${p}</div>
      `).join('')}
    </div>` : ''}

    <!-- Counterfactual -->
    ${resp.counterfactual ? `
    <div class="card mb12 fade-up-3" style="border-color:rgba(167,139,250,.2);background:rgba(167,139,250,.02)">
      <div class="card-shine"></div>
      <div style="font-size:11px;font-weight:600;margin-bottom:8px;color:var(--purple)">🔮 Counterfactual Simulation</div>
      <div style="font-size:12px;line-height:1.7;color:var(--muted)">${resp.counterfactual}</div>
    </div>` : ''}

    <!-- Next action -->
    ${resp.next_action ? `
    <div class="card mb12 fade-up-4" style="border-color:rgba(34,197,94,.2);background:rgba(34,197,94,.02)">
      <div class="card-shine"></div>
      <div style="font-size:11px;font-weight:600;margin-bottom:8px;color:var(--green)">✅ Recommended Next Action</div>
      <div style="font-size:12px;line-height:1.7;color:var(--text)">${resp.next_action}</div>
    </div>` : ''}

    <!-- Subgraph visualization -->
    ${resp.subgraph?.nodes?.length ? `
    <div class="card mb12 fade-up-4">
      <div class="card-shine"></div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
        <div style="font-size:11px;font-weight:600">⬡ Fraud Subgraph — ${resp.graph_nodes_queried} nodes retrieved</div>
        <button class="btn btn-ghost" style="font-size:10px;padding:3px 10px" onclick="nav('graph')">View Full Graph →</button>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:8px;padding:12px;background:rgba(0,0,0,.2);border-radius:10px;border:1px solid var(--border);min-height:80px">
        ${resp.subgraph.nodes.slice(0,20).map(n => subgraphNode(n)).join('')}
        ${resp.subgraph.nodes.length > 20 ? `<div style="font-size:10px;color:var(--muted);align-self:center">+${resp.subgraph.nodes.length-20} more nodes…</div>` : ''}
      </div>
    </div>` : ''}

    <!-- Draft notice -->
    ${resp.draft_notice ? `
    <div class="card mb12 fade-up-5" style="border-color:rgba(245,158,11,.25)">
      <div class="card-shine"></div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
        <div style="font-size:11px;font-weight:600;color:var(--yellow)">📋 Draft Show Cause Notice (Auto-Generated)</div>
        <div style="display:flex;gap:6px">
          <span class="badge b-orange">Officer Review Required</span>
          <button class="btn btn-ghost" style="font-size:10px;padding:3px 10px" onclick="copyAgentNotice()">📋 Copy</button>
        </div>
      </div>
      <pre id="agent-notice-text" style="font-family:'JetBrains Mono',monospace;font-size:10px;line-height:1.8;color:var(--muted);white-space:pre-wrap;padding:12px;border-radius:8px;background:rgba(0,0,0,.3);border:1px solid var(--border);max-height:300px;overflow-y:auto;word-break:break-word">${resp.draft_notice}</pre>
    </div>` : ''}

    <!-- Feedback buttons -->
    <div class="card fade-up-5" style="padding:12px 16px">
      <div style="font-size:10px;color:var(--muted);margin-bottom:8px">Active Learning — Auditor Feedback (retrains embeddings)</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-ghost" style="font-size:11px" onclick="agentFeedback('accurate')">👍 Accurate</button>
        <button class="btn btn-ghost" style="font-size:11px" onclick="agentFeedback('false_positive')">⚠ False Positive</button>
        <button class="btn btn-ghost" style="font-size:11px" onclick="agentFeedback('missed_fraud')">❌ Missed Fraud</button>
        <button class="btn btn-ghost" style="font-size:11px" onclick="agentFeedback('notice_approved')">✅ Notice Approved</button>
      </div>
    </div>
  `;
}

function subgraphNode(n) {
  const colors = {'GSTIN':'#3b82f6','Invoice':'#a78bfa','EWayBill':'#f97316','fraud':'#ef4444','fraud-invoice':'#ec4899','high-risk':'#ef4444','phantom':'#f97316'};
  const c = colors[n.class] || colors[n.type] || '#64748b';
  return `<div style="padding:6px 10px;border-radius:8px;background:${c}15;border:1px solid ${c}40;font-size:10px;cursor:pointer;transition:all .15s"
    onmouseover="this.style.background='${c}25'" onmouseout="this.style.background='${c}15'">
    <div style="font-size:9px;color:${c};font-weight:600;margin-bottom:1px">${n.type}</div>
    <div style="color:var(--text)">${n.label?.length>16?n.label.slice(0,15)+'…':n.label}</div>
    ${n.risk!=null?`<div style="font-size:9px;color:${c}">Risk: ${n.risk}</div>`:''}
  </div>`;
}

function agentFeedback(type) {
  const msgs = {
    accurate: '✅ Feedback recorded — model confidence +0.02',
    false_positive: '⚠ False positive logged — retraining triggered',
    missed_fraud: '❌ Missed fraud reported — audit team notified',
    notice_approved: '✅ Notice approved — logged for compliance record',
  };
  toast(msgs[type] || 'Feedback recorded', 'ok');
}

function copyAgentNotice() {
  const text = document.getElementById('agent-notice-text')?.textContent;
  if (text) navigator.clipboard.writeText(text).then(() => toast('Notice copied!', 'ok'));
}

function updateHistory() {
  const hist = document.getElementById('agent-history');
  const list = document.getElementById('history-list');
  if (!hist || !list) return;
  if (_agentHistory.length > 0) {
    hist.style.display = 'block';
    list.innerHTML = _agentHistory.slice(0,5).map(h =>
      `<div onclick="document.getElementById('agent-query').value='${h.query.replace(/'/g,"\\'")}'" style="padding:6px 10px;border-radius:6px;cursor:pointer;border:1px solid var(--border);font-size:10px;transition:all .15s"
        onmouseover="this.style.borderColor='var(--border2)'" onmouseout="this.style.borderColor='var(--border)'">
        <div style="color:var(--text);margin-bottom:2px">${h.query.slice(0,45)}${h.query.length>45?'…':''}</div>
        <div style="color:var(--muted);font-size:9px">${h.intent} · ${h.ts.toLocaleTimeString('en-IN')}</div>
      </div>`
    ).join('');
  }
}
