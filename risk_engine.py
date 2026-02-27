"""risk_engine.py V4 — Full multi-hop ITC validation + IsolationForest anomaly detection + natural-language audit narratives"""
import os
import numpy as np
import networkx as nx
import logging
from datetime import datetime
from db import run_query

logger = logging.getLogger(__name__)

_MODEL_PATH = os.path.join(os.path.dirname(__file__), "isolation_forest_model.pkl")
_IF_MODEL = None  


def _get_isolation_forest():
    """Load saved model from disk, or return None (will trigger training)."""
    global _IF_MODEL
    if _IF_MODEL is not None:
        return _IF_MODEL
    try:
        import joblib
        if os.path.exists(_MODEL_PATH):
            _IF_MODEL = joblib.load(_MODEL_PATH)
            logger.info(f"IsolationForest model loaded from {_MODEL_PATH}")
            return _IF_MODEL
    except Exception as e:
        logger.warning(f"Could not load IsolationForest model: {e}")
    return None


def _train_and_save_isolation_forest(feature_matrix: np.ndarray):
    """Train IsolationForest on feature_matrix, save to disk, cache in memory."""
    global _IF_MODEL
    try:
        from sklearn.ensemble import IsolationForest
        import joblib
        model = IsolationForest(
            n_estimators=200,
            max_samples="auto",
            contamination=0.12,   # expect ~12 % anomalies in GST fraud dataset
            random_state=42,
            n_jobs=-1,
        )
        model.fit(feature_matrix)
        joblib.dump(model, _MODEL_PATH)
        _IF_MODEL = model
        logger.info(f"IsolationForest trained on {len(feature_matrix)} samples and saved to {_MODEL_PATH}")
        return model
    except Exception as e:
        logger.error(f"IsolationForest training failed: {e}")
        return None


def _anomaly_scores(results: list) -> list:
    """
    Attach anomaly_score (0-100, higher = more anomalous) and is_anomaly flag
    to each vendor result dict using IsolationForest.
    Features: risk_score, pagerank, betweenness_centrality, degree_centrality,
              invoice_count, in_fraud_cycle (0/1).
    """
    if not results:
        return results

    try:
        feature_matrix = np.array([
            [
                r.get("risk_score", 0),
                r.get("pagerank", 0) * 1000,          # scale up small floats
                r.get("betweenness_centrality", 0) * 1000,
                r.get("degree_centrality", 0) * 100,
                r.get("invoice_count", 0),
                1.0 if r.get("in_fraud_cycle") else 0.0,
            ]
            for r in results
        ], dtype=np.float32)

        model = _get_isolation_forest()

        if model is None:
            # First run — train and save
            logger.info("No saved IsolationForest found. Training now…")
            model = _train_and_save_isolation_forest(feature_matrix)

        if model is None:
            # sklearn not available — skip silently
            return results

        raw_scores = model.decision_function(feature_matrix)   # negative = more anomalous
        # Normalise to 0-100: anomaly_score 100 = most anomalous
        min_s, max_s = raw_scores.min(), raw_scores.max()
        spread = (max_s - min_s) if (max_s - min_s) > 0 else 1.0
        predictions = model.predict(feature_matrix)            # -1 = anomaly, +1 = normal

        for i, r in enumerate(results):
            normalised = float(100 * (1 - (raw_scores[i] - min_s) / spread))
            r["anomaly_score"] = round(min(100, max(0, normalised)), 1)
            r["is_anomaly"] = bool(predictions[i] == -1)

    except Exception as e:
        logger.warning(f"Anomaly scoring skipped: {e}")

    return results


def build_networkx_graph():
    G = nx.DiGraph()
    for n in run_query("MATCH (g:GSTIN) RETURN g.gstin_id AS id, g.name AS name, g.status AS status, g.scenario AS scenario, g.risk_score AS base_score"):
        G.add_node(n["id"], name=n["name"], status=n["status"], scenario=n["scenario"], base_score=n.get("base_score",0) or 0)
    for e in run_query("MATCH (s:GSTIN)-[:ISSUED_INVOICE]->(i:Invoice)-[:BILLED_TO]->(b:GSTIN) RETURN s.gstin_id AS source, b.gstin_id AS target, i.invoice_id AS invoice_id, i.total_gst AS gst_value, i.status AS inv_status"):
        G.add_edge(e["source"], e["target"], invoice_id=e["invoice_id"], gst_value=e.get("gst_value",0) or 0, inv_status=e["inv_status"])
    for e in run_query("MATCH (a:GSTIN)-[:SUPPLIES_TO]->(b:GSTIN) RETURN a.gstin_id AS source, b.gstin_id AS target"):
        if not G.has_edge(e["source"], e["target"]):
            G.add_edge(e["source"], e["target"], relationship="supply_chain")
    return G


def compute_risk_scores():
    G = build_networkx_graph()
    if G.number_of_nodes() == 0:
        return []
    try: pagerank = nx.pagerank(G, alpha=0.85, max_iter=100)
    except: pagerank = {n: 1.0/G.number_of_nodes() for n in G.nodes()}
    try: betweenness = nx.betweenness_centrality(G, normalized=True)
    except: betweenness = {n: 0.0 for n in G.nodes()}
    degree_cent = nx.degree_centrality(G)
    try: cycles = list(nx.simple_cycles(G))
    except: cycles = []
    nodes_in_cycles = {node for cycle in cycles for node in cycle}

    scenario_data = run_query("""
        MATCH (g:GSTIN) OPTIONAL MATCH (g)-[:ISSUED_INVOICE]->(i:Invoice)
        WITH g, collect(i) AS invoices
        RETURN g.gstin_id AS gstin_id, g.name AS name, g.status AS status,
               g.scenario AS scenario, g.base_score AS base_score,
               size(invoices) AS invoice_count""")
    missing_gstr1    = {r["gstin_id"] for r in run_query("MATCH (g:GSTIN)-[:ISSUED_INVOICE]->(i:Invoice) WHERE NOT (i)-[:DECLARED_IN]->(:GSTR1) RETURN DISTINCT g.gstin_id AS gstin_id")}
    missing_gstr3b   = {r["gstin_id"] for r in run_query("MATCH (g:GSTIN)-[:ISSUED_INVOICE]->(i:Invoice)-[:DECLARED_IN]->(:GSTR1) WHERE NOT (g)-[:FILED]->(:GSTR3B) RETURN DISTINCT g.gstin_id AS gstin_id")}
    missing_taxpay   = {r["gstin_id"] for r in run_query("MATCH (g:GSTIN)-[:FILED]->(r:GSTR3B) WHERE NOT (r)-[:SETTLED_BY]->(:TaxPayment) AND r.tax_paid_status='PENDING' RETURN DISTINCT g.gstin_id AS gstin_id")}
    cancelled_set    = {r["gstin_id"] for r in run_query("MATCH (g:GSTIN {status:'CANCELLED'}) RETURN g.gstin_id AS gstin_id")}

    pr_max = max(pagerank.values()) if pagerank else 1.0
    bt_max = max(betweenness.values()) if betweenness else 1.0
    info_map = {r["gstin_id"]: r for r in scenario_data}
    results = []
    for gstin_id in G.nodes():
        info  = info_map.get(gstin_id, {})
        score = float(info.get("base_score") or 0)
        flags = []
        if gstin_id in missing_gstr1:    score += 30; flags.append("MISSING_GSTR1")
        if gstin_id in missing_gstr3b:   score += 40; flags.append("MISSING_GSTR3B")
        if gstin_id in missing_taxpay:   score += 35; flags.append("TAX_NOT_REMITTED")
        if gstin_id in nodes_in_cycles:  score += 50; flags.append("CIRCULAR_TRADING")
        if info.get("status") == "CANCELLED": score += 60; flags.append("CANCELLED_GSTIN")
        pr_n = pagerank.get(gstin_id,0)/pr_max if pr_max>0 else 0
        bt_n = betweenness.get(gstin_id,0)/bt_max if bt_max>0 else 0
        if pr_n > 0.5: score += 20; flags.append("HIGH_PAGERANK")
        if bt_n > 0.5: score += 15; flags.append("HIGH_BETWEENNESS")
        score = min(int(score), 100)
        risk_level = "HIGH" if score >= 71 else "MEDIUM" if score >= 31 else "LOW"
        results.append({"gstin_id":gstin_id,"name":info.get("name",gstin_id),"status":info.get("status","Unknown"),
            "scenario":info.get("scenario",""),"risk_score":score,"risk_level":risk_level,"flags":flags,
            "pagerank":round(pagerank.get(gstin_id,0),4),"betweenness_centrality":round(betweenness.get(gstin_id,0),4),
            "degree_centrality":round(degree_cent.get(gstin_id,0),4),"invoice_count":info.get("invoice_count",0),
            "in_fraud_cycle":gstin_id in nodes_in_cycles})
    results.sort(key=lambda x: x["risk_score"], reverse=True)

    # ── Isolation Forest anomaly scoring ─────────────────────────────────────
    results = _anomaly_scores(results)

    return results


def detect_circular_trading():
    cycles = run_query("""
        MATCH path=(a:GSTIN)-[:ISSUED_INVOICE*2..4]->(a)
        WITH a, path, length(path) AS hops
        RETURN a.gstin_id AS ring_starter, a.name AS ring_starter_name, hops,
               [n IN nodes(path) | CASE WHEN n:GSTIN THEN n.gstin_id ELSE null END] AS node_ids,
               [n IN nodes(path) | CASE WHEN n:GSTIN THEN n.name ELSE null END] AS node_names
        LIMIT 10""")
    return [{"ring_starter":c["ring_starter"],"ring_starter_name":c["ring_starter_name"],"hops":c["hops"],
             "node_ids":[x for x in (c.get("node_ids") or []) if x],
             "node_names":[x for x in (c.get("node_names") or []) if x],"risk":"CRITICAL"} for c in cycles]


def get_itc_validation_results():
    """Full multi-hop: GSTIN → Invoice → GSTR1 → GSTR3B → TaxPayment"""
    def _q(cypher): return run_query(cypher)
    missing_gstr1 = _q("MATCH (s:GSTIN)-[:ISSUED_INVOICE]->(i:Invoice)-[:BILLED_TO]->(b:GSTIN) WHERE NOT (i)-[:DECLARED_IN]->(:GSTR1) RETURN i.invoice_id AS invoice_id, s.gstin_id AS supplier, s.name AS supplier_name, b.gstin_id AS buyer, b.name AS buyer_name, i.total_gst AS gst_amount, 'MISSING_GSTR1' AS mismatch_type, 'ITC Blocked: Supplier GSTR-1 not filed — invoice absent from GSTR-2B' AS reason")
    missing_gstr3b= _q("MATCH (s:GSTIN)-[:ISSUED_INVOICE]->(i:Invoice)-[:DECLARED_IN]->(:GSTR1) WHERE NOT (s)-[:FILED]->(:GSTR3B) MATCH (i)-[:BILLED_TO]->(b:GSTIN) RETURN i.invoice_id AS invoice_id, s.gstin_id AS supplier, s.name AS supplier_name, b.gstin_id AS buyer, b.name AS buyer_name, i.total_gst AS gst_amount, 'MISSING_GSTR3B' AS mismatch_type, 'ITC At Risk: Supplier tax not remitted under Sec 16(2)(c)' AS reason")
    missing_tp    = _q("MATCH (s:GSTIN)-[:FILED]->(r:GSTR3B) WHERE NOT (r)-[:SETTLED_BY]->(:TaxPayment) AND r.tax_paid_status='PENDING' MATCH (s)-[:ISSUED_INVOICE]->(i:Invoice)-[:BILLED_TO]->(b:GSTIN) RETURN i.invoice_id AS invoice_id, s.gstin_id AS supplier, s.name AS supplier_name, b.gstin_id AS buyer, b.name AS buyer_name, i.total_gst AS gst_amount, 'MISSING_TAX_PAYMENT' AS mismatch_type, 'CRITICAL: GSTR-3B filed but challan payment not cleared — Sec 74 risk' AS reason")
    amt_mismatch  = _q("MATCH (s:GSTIN)-[:ISSUED_INVOICE]->(i:Invoice)-[:BILLED_TO]->(b:GSTIN) WHERE i.gstr2b_gst IS NOT NULL AND i.gstr2b_gst <> i.total_gst RETURN i.invoice_id AS invoice_id, s.gstin_id AS supplier, s.name AS supplier_name, b.gstin_id AS buyer, b.name AS buyer_name, i.total_gst AS gst_amount, i.gstr2b_gst AS gstr2b_amount, (i.total_gst - i.gstr2b_gst) AS discrepancy, 'AMOUNT_MISMATCH' AS mismatch_type, 'ITC Partial: ERP amount differs from GSTR-2B auto-population' AS reason")
    missing_ewb   = _q("MATCH (s:GSTIN)-[:ISSUED_INVOICE]->(i:Invoice {ewb_required:true})-[:BILLED_TO]->(b:GSTIN) WHERE NOT (i)-[:TRANSPORTED_VIA]->(:EWayBill) RETURN i.invoice_id AS invoice_id, s.gstin_id AS supplier, s.name AS supplier_name, b.gstin_id AS buyer, b.name AS buyer_name, i.total_gst AS gst_amount, 'MISSING_EWB' AS mismatch_type, 'Audit Risk: e-Way Bill mandatory but absent' AS reason")
    cancelled_inv = _q("MATCH (s:GSTIN {status:'CANCELLED'})-[:ISSUED_INVOICE]->(i:Invoice)-[:BILLED_TO]->(b:GSTIN) RETURN i.invoice_id AS invoice_id, s.gstin_id AS supplier, s.name AS supplier_name, b.gstin_id AS buyer, b.name AS buyer_name, i.total_gst AS gst_amount, 'CANCELLED_GSTIN' AS mismatch_type, 'CRITICAL: Invoice issued after GSTIN cancellation — ITC ineligible' AS reason")
    all_issues = []
    for item in missing_gstr1:  item["risk_level"]="HIGH";     all_issues.append(item)
    for item in missing_gstr3b: item["risk_level"]="HIGH";     all_issues.append(item)
    for item in missing_tp:     item["risk_level"]="CRITICAL"; all_issues.append(item)
    for item in amt_mismatch:   item["risk_level"]="MEDIUM";   all_issues.append(item)
    for item in missing_ewb:    item["risk_level"]="MEDIUM";   all_issues.append(item)
    for item in cancelled_inv:  item["risk_level"]="CRITICAL"; all_issues.append(item)
    valid = _q("MATCH (s:GSTIN)-[:ISSUED_INVOICE]->(i:Invoice)-[:BILLED_TO]->(b:GSTIN) WHERE i.status='MATCHED' AND (i)-[:DECLARED_IN]->(:GSTR1) AND (s)-[:FILED]->(:GSTR3B)-[:SETTLED_BY]->(:TaxPayment) RETURN i.invoice_id AS invoice_id, s.name AS supplier_name, b.name AS buyer_name, i.total_gst AS gst_amount, 'VALID' AS mismatch_type, 'Full 5-hop ITC chain validated — eligible' AS reason, 'LOW' AS risk_level")
    return {"issues":all_issues,"valid_chains":valid,"summary":{"total_issues":len(all_issues),"missing_gstr1":len(missing_gstr1),"missing_gstr3b":len(missing_gstr3b),"missing_tax_payment":len(missing_tp),"amount_mismatch":len(amt_mismatch),"missing_ewb":len(missing_ewb),"cancelled_gstin":len(cancelled_inv),"valid_chains":len(valid)}}


def generate_audit_narrative(invoice_id: str) -> dict:
    """Full 5-hop traversal with natural-language audit_summary (XAI)."""
    rows = run_query("""
        MATCH (s:GSTIN)-[:ISSUED_INVOICE]->(i:Invoice {invoice_id:$id})-[:BILLED_TO]->(b:GSTIN)
        OPTIONAL MATCH (i)-[:AUTHENTICATED_BY]->(irn:IRN)
        OPTIONAL MATCH (i)-[:TRANSPORTED_VIA]->(ewb:EWayBill)
        OPTIONAL MATCH (i)-[:DECLARED_IN]->(g1:GSTR1)
        OPTIONAL MATCH (s)-[:FILED]->(g3b:GSTR3B)
        OPTIONAL MATCH (g3b)-[:SETTLED_BY]->(tp:TaxPayment)
        OPTIONAL MATCH (b)-[:FILED]->(g3b_buyer:GSTR3B)-[:CLAIMS_ITC_FOR]->(i)
        RETURN s, i, b, irn, ewb, g1, g3b, tp, g3b_buyer""", {"id": invoice_id})
    if not rows:
        return {"error": f"Invoice {invoice_id} not found"}

    r = rows[0]
    s = r.get("s") or {}; inv = r.get("i") or {}; b = r.get("b") or {}
    irn = r.get("irn"); ewb = r.get("ewb"); g1 = r.get("g1")
    g3b = r.get("g3b"); tp = r.get("tp"); g3b_buyer = r.get("g3b_buyer")

    amount = inv.get("amount", 0) or 0
    gst    = inv.get("total_gst", 0) or 0
    sname  = s.get("name", "Unknown Supplier")
    bname  = b.get("name", "Unknown Buyer")
    inv_date = inv.get("date", "N/A")

    steps = []

    # HOP 1 — Supplier GSTIN
    h1_ok = s.get("status") == "Active"
    steps.append({"hop":1,"node_type":"GSTIN (Supplier)","node_id":s.get("gstin_id","?"),
        "label":sname,"ok":h1_ok,
        "status":"ACTIVE" if h1_ok else f"CANCELLED",
        "detail":f"State: {s.get('state','N/A')} | Type: {s.get('taxpayer_type','Regular')}",
        "narrative":f"{sname} is {'an active registered' if h1_ok else 'a CANCELLED'} taxpayer in {s.get('state','N/A')}. "
            + ("GSTIN verification PASSED." if h1_ok else f"CRITICAL: GSTIN was cancelled on {s.get('cancellation_date','N/A')}. Any ITC claimed is immediately ineligible.")})

    # HOP 2 — Invoice
    steps.append({"hop":2,"node_type":"Invoice","node_id":inv.get("invoice_id","?"),
        "label":f"₹{amount:,.0f} + GST ₹{gst:,.0f}","ok":True,
        "status":inv.get("status","UNKNOWN"),
        "detail":f"HSN: {inv.get('hsn','N/A')} | {inv.get('description','')} | {inv_date}",
        "narrative":f"{sname} raised invoice {inv.get('invoice_id')} dated {inv_date} to {bname} for taxable value ₹{amount:,.0f} with GST ₹{gst:,.0f} (HSN {inv.get('hsn','N/A')})."})

    # HOP 3 — IRN
    h3_ok = irn is not None
    steps.append({"hop":3,"node_type":"IRN / e-Invoice","node_id":(irn.get("irn","")[:18]+"..." if irn else "MISSING"),
        "label":"IRN Generated" if irn else "IRN Missing","ok":h3_ok,
        "status":irn.get("portal_status","NOT_GENERATED") if irn else "MISSING",
        "detail":f"IRP Validation: {'✓ Passed' if irn else '✗ Not generated'}",
        "narrative":"Invoice Reference Number (IRN) successfully generated and digitally authenticated by the IRP portal." if h3_ok
            else "⚠ No IRN found. e-Invoice generation may have been bypassed — compliance gap for eligible taxpayers."})

    # HOP 4 — e-Way Bill
    ewb_req = inv.get("ewb_required", amount > 50000)
    h4_ok   = (ewb is not None) or (not ewb_req)
    steps.append({"hop":4,"node_type":"e-Way Bill","node_id":ewb.get("ewb_id","N/A") if ewb else "ABSENT",
        "label":f"Vehicle: {ewb.get('vehicle_number','N/A')}" if ewb else "e-Way Bill Absent",
        "ok":h4_ok,
        "status":"VALID" if ewb else ("NOT_REQUIRED" if not ewb_req else "MISSING"),
        "detail":f"{ewb.get('distance_km',0)} km · {ewb.get('transporter','N/A')}" if ewb else "No logistics record",
        "narrative":(f"e-Way Bill {ewb.get('ewb_id')} for vehicle {ewb.get('vehicle_number')} covering {ewb.get('distance_km',0)} km via {ewb.get('transporter','N/A')}. Physical movement validated." if ewb
            else ("e-Way Bill not required for this transaction." if not ewb_req
            else f"⚠ AUDIT RISK: Invoice ₹{amount:,.0f} exceeds ₹50,000 threshold — mandatory e-Way Bill absent. Physical audit will flag this."))})

    # HOP 5 — GSTR-1
    h5_ok = g1 is not None and g1.get("filed_status") == "FILED"
    steps.append({"hop":5,"node_type":"GSTR-1 (Outward Supply)","node_id":g1.get("return_id","MISSING") if g1 else "NOT_FILED",
        "label":f"Filed: {g1.get('filed_date','N/A')}" if g1 else "GSTR-1 Not Filed","ok":h5_ok,
        "status":g1.get("filed_status","NOT_FILED") if g1 else "NOT_FILED",
        "detail":f"Period: {g1.get('period','N/A')}" if g1 else "Invoice absent from buyer's GSTR-2B",
        "narrative":(f"Supplier filed GSTR-1 for period {g1.get('period','N/A')} on {g1.get('filed_date','N/A')}. Invoice reflected in {bname}'s auto-populated GSTR-2B." if h5_ok
            else f"⛔ ITC BLOCKED: {sname} did not file GSTR-1. Under Section 16(2)(aa) CGST Act, {bname} cannot claim ITC of ₹{gst:,.0f} — invoice absent from GSTR-2B.")})

    # HOP 6 — GSTR-3B
    h6_ok = g3b is not None and g3b.get("tax_paid_status") == "PAID"
    steps.append({"hop":6,"node_type":"GSTR-3B (Tax Summary)","node_id":g3b.get("return_id","MISSING") if g3b else "NOT_FILED",
        "label":f"Tax Paid: ₹{g3b.get('tax_paid',0):,.0f}" if g3b else "GSTR-3B Not Filed","ok":h6_ok,
        "status":g3b.get("tax_paid_status","NOT_FILED") if g3b else "NOT_FILED",
        "detail":f"Period: {g3b.get('period','N/A')}" if g3b else "No tax liability declared",
        "narrative":(f"GSTR-3B filed for {g3b.get('period','N/A')} declaring tax liability of ₹{g3b.get('tax_paid',0):,.0f}. Supplier acknowledged tax obligation to government." if g3b
            else f"⛔ HIGH RISK: {sname} has not filed GSTR-3B. Under Section 16(2)(c) CGST Act, ITC is only available if the supplier has paid the tax. ₹{gst:,.0f} ITC at risk.")})

    # HOP 7 — TaxPayment (the critical missing piece — now complete)
    h7_ok = tp is not None and tp.get("status") == "CLEARED"
    steps.append({"hop":7,"node_type":"TaxPayment (Challan)","node_id":tp.get("challan_no","MISSING") if tp else "NO_PAYMENT",
        "label":f"₹{tp.get('amount_paid',0):,.0f} via {tp.get('bank','N/A')}" if tp else "Payment Not Cleared",
        "ok":h7_ok,
        "status":tp.get("status","NOT_PAID") if tp else "NOT_PAID",
        "detail":f"UTR: {tp.get('utr','N/A')} · Date: {tp.get('payment_date','N/A')}" if tp else "Challan not generated or bounced",
        "narrative":(f"Tax payment of ₹{tp.get('amount_paid',0):,.0f} remitted to government exchequer on {tp.get('payment_date','N/A')} via {tp.get('bank','N/A')} (UTR: {tp.get('utr','N/A')}). Tax fully deposited — ITC chain validated end-to-end." if h7_ok
            else f"⛔ CRITICAL: No cleared challan found for {sname}. Tax collected from {bname} has NOT reached the exchequer. ITC of ₹{gst:,.0f} may be recovered under Section 74 with 18% interest + 100% penalty.")})

    # HOP 8 — Buyer ITC Claim
    itc = g3b_buyer.get("itc_claimed", 0) if g3b_buyer else 0
    h8_ok = g3b_buyer is not None
    steps.append({"hop":8,"node_type":"Buyer GSTR-3B (ITC Claim)","node_id":g3b_buyer.get("return_id","PENDING") if g3b_buyer else "PENDING",
        "label":f"ITC Claimed: ₹{itc:,.0f}" if g3b_buyer else "ITC Not Yet Claimed","ok":h8_ok,
        "status":"ITC_CLAIMED" if h8_ok else "PENDING",
        "detail":bname,
        "narrative":(f"{bname} has claimed ITC of ₹{itc:,.0f} in GSTR-3B. {'Claim is fully supported by upstream chain.' if all(st['ok'] for st in steps[:7]) else 'Claim may be challenged — upstream compliance failures detected.'}" if h8_ok
            else f"{bname} has not yet claimed ITC for this invoice.")})

    hops_passed = sum(1 for st in steps if st["ok"])
    all_ok = all(st["ok"] for st in steps)
    failed = [st for st in steps if not st["ok"]]

    if all_ok:
        audit_summary = (
            f"✅ AUDIT VERDICT — FULLY COMPLIANT: Invoice {invoice_id} passes all 8 validation checkpoints. "
            f"{sname} (GSTIN: {s.get('gstin_id')}) raised a ₹{amount:,.0f} + GST ₹{gst:,.0f} invoice to {bname} on {inv_date}. "
            f"The complete ITC chain is validated: IRN authenticated ✓ · e-Way Bill present ✓ · "
            f"GSTR-1 filed ✓ · GSTR-3B submitted ✓ · Tax payment challan CLEARED ✓ · Buyer ITC claimed ✓. "
            f"ITC of ₹{gst:,.0f} is ELIGIBLE and fully protected from future audit scrutiny."
        )
        itc_status = "ELIGIBLE"
    else:
        broken = ", ".join(st["node_type"] for st in failed)
        audit_summary = (
            f"⛔ AUDIT VERDICT — NON-COMPLIANT: Invoice {invoice_id} FAILS {len(failed)} of 8 validation checkpoints. "
            f"Compliance chain broken at: {broken}. "
            f"ITC of ₹{gst:,.0f} claimed by {bname} is AT RISK. "
            f"Key findings: " + " | ".join(st["narrative"][:120] for st in failed[:3]) + ". "
            f"Immediate corrective action required to avoid demand notice under CGST Act."
        )
        itc_status = "AT_RISK"

    return {
        "audit_id": f"AT-{invoice_id}-{datetime.now().strftime('%Y%m%d%H%M%S')}",
        "invoice_id": invoice_id,
        "generated_at": datetime.now().isoformat(),
        "overall_status": "FULLY_COMPLIANT" if all_ok else "NON_COMPLIANT",
        "hops_validated": hops_passed,
        "total_hops": len(steps),
        "traversal_steps": steps,
        "audit_summary": audit_summary,
        "itc_amount": gst,
        "itc_status": itc_status,
        "action_required": not all_ok,
        "failed_checkpoints": [{"hop":st["hop"],"type":st["node_type"],"narrative":st["narrative"]} for st in failed],
        "graph_path": "GSTIN(Supplier)→[ISSUED_INVOICE]→Invoice→[AUTHENTICATED_BY]→IRN→[TRANSPORTED_VIA]→EWayBill→[DECLARED_IN]→GSTR1→[FILED]→GSTR3B→[SETTLED_BY]→TaxPayment | Invoice→[BILLED_TO]→GSTIN(Buyer)→[FILED]→GSTR3B(Buyer)→[CLAIMS_ITC_FOR]→Invoice",
    }
