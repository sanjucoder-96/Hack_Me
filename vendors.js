async function addInvoice(mount) {
  mount.innerHTML = `
    <div class="sec-hdr fade-up">
      <div><h2>Add Invoice</h2><p>Live Neo4j insertion with real-time multi-hop chain simulation</p></div>
    </div>
    <div class="g2 fade-up-1">
      <div class="card">
        <div class="card-shine"></div>
        <div style="font-size:12px;font-weight:600;margin-bottom:16px">Invoice Details</div>
        <div class="g2"><div class="inp-group"><label class="inp-lbl">Supplier GSTIN *</label><input class="inp" id="sup-gstin" placeholder="27XXXXX1234F1ZV"/></div>
        <div class="inp-group"><label class="inp-lbl">Supplier Name *</label><input class="inp" id="sup-name" placeholder="ABC Pvt Ltd"/></div></div>
        <div class="g2"><div class="inp-group"><label class="inp-lbl">Buyer GSTIN *</label><input class="inp" id="buy-gstin" placeholder="29XXXXX5678G1ZU"/></div>
        <div class="inp-group"><label class="inp-lbl">Buyer Name *</label><input class="inp" id="buy-name" placeholder="XYZ Ltd"/></div></div>
        <div class="g2"><div class="inp-group"><label class="inp-lbl">Invoice ID *</label><input class="inp" id="inv-id" placeholder="INV-2024-NEW"/></div>
        <div class="inp-group"><label class="inp-lbl">Invoice Date *</label><input class="inp" type="date" id="inv-date" value="${new Date().toISOString().split('T')[0]}"/></div></div>
        <div class="g2"><div class="inp-group"><label class="inp-lbl">Taxable Amount (₹) *</label><input class="inp" id="inv-amount" type="number" placeholder="100000" oninput="calcGst()"/></div>
        <div class="inp-group"><label class="inp-lbl">GST Rate</label>
          <select class="inp" id="inv-rate" onchange="calcGst()">
            <option value="0.05">5%</option><option value="0.12">12%</option>
            <option value="0.18" selected>18%</option><option value="0.28">28%</option>
          </select>
        </div></div>
        <div class="inp-group"><label class="inp-lbl">GST Amount (auto)</label>
          <div style="padding:9px 13px;background:rgba(56,189,248,.04);border:1px solid var(--border2);border-radius:9px;font-family:'JetBrains Mono',monospace;font-size:13px;color:var(--cyan)" id="gst-calc">₹0</div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px">
          ${toggle('ewb-chk','e-Way Bill Generated','has_ewb')}
          ${toggle('gstr1-chk','Supplier Filed GSTR-1','gstr1')}
          ${toggle('gstr3b-chk','Supplier Filed GSTR-3B','gstr3b')}
          ${toggle('tp-chk','Tax Payment Cleared','tp')}
        </div>
        <button class="btn btn-primary" style="width:100%" onclick="submitInvoice()">⊕ Add to Knowledge Graph</button>
      </div>
      <div class="card" id="add-result" style="background:rgba(56,189,248,.02)">
        <div style="text-align:center;padding:40px;color:var(--muted)">
          <div style="font-size:36px;margin-bottom:12px">⬡</div>
          <div style="font-size:13px">Fill in the form and submit</div>
          <div style="font-size:11px;margin-top:6px">Invoice will be inserted into Neo4j Aura in real time</div>
        </div>
      </div>
    </div>
  `;
}
function toggle(id, label, key) {
  return `<label style="display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:8px;border:1px solid var(--border);cursor:pointer;transition:border-color .2s"
    onmouseover="this.style.borderColor='var(--border2)'" onmouseout="this.style.borderColor='var(--border)'">
    <input type="checkbox" id="${id}" checked style="width:14px;height:14px;accent-color:var(--blue)"/>
    <span style="font-size:12px">${label}</span>
  </label>`;
}
function calcGst() {
  const a = parseFloat(document.getElementById('inv-amount')?.value)||0;
  const r = parseFloat(document.getElementById('inv-rate')?.value)||0.18;
  const el = document.getElementById('gst-calc');
  if (el) el.textContent = '₹' + (a*r).toLocaleString('en-IN',{maximumFractionDigits:2});
}
async function submitInvoice() {
  const g = id => document.getElementById(id);
  const payload = {
    supplier_gstin: g('sup-gstin').value.trim(), supplier_name: g('sup-name').value.trim(),
    buyer_gstin:    g('buy-gstin').value.trim(), buyer_name: g('buy-name').value.trim(),
    invoice_id:     g('inv-id').value.trim(),   invoice_date: g('inv-date').value,
    amount:         parseFloat(g('inv-amount').value)||0,
    tax_rate:       parseFloat(g('inv-rate').value)||0.18,
    has_ewb:        g('ewb-chk').checked, supplier_filed_gstr1: g('gstr1-chk').checked,
    supplier_filed_gstr3b: g('gstr3b-chk').checked, tax_payment_cleared: g('tp-chk').checked,
  };
  if (!payload.supplier_gstin||!payload.invoice_id||!payload.amount) { toast('Fill all required fields','warn'); return; }
  const result = document.getElementById('add-result');
  result.innerHTML = '<div class="loading-center"><div class="spin"></div><span>Writing to Neo4j…</span></div>';
  try {
    const r = await _post('/invoices', payload);
    const isOk = r.status === 'MATCHED';
    result.innerHTML = `
      <div style="padding:20px;border-radius:12px;border:1px solid ${isOk?'rgba(34,197,94,.3)':'rgba(245,158,11,.3)'};background:${isOk?'rgba(34,197,94,.04)':'rgba(245,158,11,.04)'};margin-bottom:16px">
        <div style="font-size:18px;margin-bottom:6px">${isOk?'✅':'⚠️'}</div>
        <div style="font-size:14px;font-weight:600;margin-bottom:4px">${r.message}</div>
        <div style="font-size:12px;opacity:.8">Invoice: ${r.invoice_id} · GST: ${fmt(r.gst_amount)}</div>
        ${statusBadge(r.status)}
      </div>
      <div style="font-size:11px;font-weight:600;margin-bottom:10px;color:var(--muted)">Chain Status</div>
      ${chainRow('GSTR-1 Filed', payload.supplier_filed_gstr1)}
      ${chainRow('GSTR-3B Filed', payload.supplier_filed_gstr3b)}
      ${chainRow('Tax Payment Cleared', payload.tax_payment_cleared)}
      ${chainRow('e-Way Bill Generated', payload.has_ewb)}
      <div style="margin-top:16px;padding:12px;border-radius:8px;background:rgba(56,189,248,.04);border:1px solid var(--border);font-size:10px;color:var(--muted);font-family:'JetBrains Mono',monospace;line-height:1.8">
        MERGE (s:GSTIN {gstin_id:'${payload.supplier_gstin}'})<br>
        MERGE (b:GSTIN {gstin_id:'${payload.buyer_gstin}'})<br>
        MERGE (i:Invoice {invoice_id:'${payload.invoice_id}'})<br>
        SET i.total_gst=${r.gst_amount}, i.status='${r.status}'<br>
        MERGE (s)-[:ISSUED_INVOICE]->(i)-[:BILLED_TO]->(b)${payload.supplier_filed_gstr1?'\nMERGE (i)-[:DECLARED_IN]->(:GSTR1)':''}${payload.tax_payment_cleared?'\nMERGE (:GSTR3B)-[:SETTLED_BY]->(:TaxPayment)':''}
      </div>
    `;
    toast(`Invoice ${r.invoice_id} added to Neo4j`, 'ok');
  } catch(e) { result.innerHTML='<div style="color:var(--red);padding:20px">Failed to add invoice</div>'; toast('Failed to add invoice','err'); }
}
function chainRow(label, ok) {
  return `<div style="display:flex;align-items:center;justify-content:space-between;padding:7px 10px;border-radius:7px;background:rgba(255,255,255,.02);margin-bottom:4px">
    <span style="font-size:12px">${label}</span>
    ${yesNo(ok)}
  </div>`;
}
