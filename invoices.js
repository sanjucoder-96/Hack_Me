async function invoices(mount) {
  mount.innerHTML = '<div class="loading-center"><div class="spin"></div><span>Loading invoice ledger…</span></div>';
  try {
    const data = await _get('/invoices');
    mount.innerHTML = `
      <div class="sec-hdr fade-up">
        <div><p>${data.length} invoices · Graph-enhanced with filing status</p></div>
      </div>
      <div class="card fade-up-1" style="padding:0">
        <div class="tbl-wrap">
          <table>
            <thead><tr>
              <th>Invoice ID</th><th>Supplier</th><th>Buyer</th><th>Amount</th><th>GST</th>
              <th>Date</th><th>GSTR-1</th><th>GSTR-3B</th><th>Tax Payment</th><th>e-Way Bill</th><th>Status</th>
            </tr></thead>
            <tbody>${data.map(inv=>`<tr>
              <td class="mono" style="font-size:11px;white-space:nowrap">${inv.invoice_id}</td>
              <td><div style="font-size:12px;max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${inv.supplier_name||'—'}</div>
                <div class="mono" style="font-size:9px;color:var(--muted)">${inv.supplier_gstin||''}</div></td>
              <td style="font-size:12px;max-width:100px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${inv.buyer_name||'—'}</td>
              <td class="mono" style="font-size:12px">${fmt(inv.amount)}</td>
              <td class="mono" style="font-size:12px;color:var(--blue)">${fmt(inv.total_gst)}</td>
              <td style="font-size:11px;color:var(--muted);white-space:nowrap">${inv.date||'—'}</td>
              <td>${inv.gstr1_filed?'<span class="badge b-green">✓ Filed</span>':'<span class="badge b-red">✗ Missing</span>'}</td>
              <td>${inv.gstr3b_filed?'<span class="badge b-green">✓ Filed</span>':'<span class="badge b-red">✗ Missing</span>'}</td>
              <td>${inv.tax_payment ? `<span class="badge ${inv.payment_status==='CLEARED'?'b-green':'b-yellow'}">💳 ${inv.payment_status||'?'}</span>` : '<span class="badge b-muted">None</span>'}</td>
              <td>${inv.ewb_id?'<span class="badge b-cyan">✓ EWB</span>':'<span class="badge b-muted">—</span>'}</td>
              <td>${statusBadge(inv.status)}</td>
            </tr>`).join('')}</tbody>
          </table>
        </div>
      </div>
    `;
  } catch(e) { mount.innerHTML = '<div style="color:var(--red);text-align:center;padding:40px">Failed to load invoices</div>'; }
}
