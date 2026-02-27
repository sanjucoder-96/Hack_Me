"""seeder.py V4 — TaxPayment nodes + Circular GST Credit Fraud scenario"""
from db import run_write, run_query
import logging
logger = logging.getLogger(__name__)

def clear_graph():
    run_write("MATCH (n) DETACH DELETE n")

def create_constraints():
    for q in [
        "CREATE CONSTRAINT gstin_id   IF NOT EXISTS FOR (g:GSTIN)      REQUIRE g.gstin_id   IS UNIQUE",
        "CREATE CONSTRAINT invoice_id IF NOT EXISTS FOR (i:Invoice)     REQUIRE i.invoice_id IS UNIQUE",
        "CREATE CONSTRAINT gstr1_id   IF NOT EXISTS FOR (r:GSTR1)       REQUIRE r.return_id  IS UNIQUE",
        "CREATE CONSTRAINT gstr3b_id  IF NOT EXISTS FOR (r:GSTR3B)      REQUIRE r.return_id  IS UNIQUE",
        "CREATE CONSTRAINT ewb_id     IF NOT EXISTS FOR (e:EWayBill)     REQUIRE e.ewb_id     IS UNIQUE",
        "CREATE CONSTRAINT irn_id     IF NOT EXISTS FOR (i:IRN)          REQUIRE i.irn        IS UNIQUE",
        "CREATE CONSTRAINT tp_id      IF NOT EXISTS FOR (t:TaxPayment)   REQUIRE t.challan_no IS UNIQUE",
    ]:
        try: run_write(q)
        except: pass

SC1 = """
MERGE (s1:GSTIN {gstin_id:'27AAPFU0939F1ZV',name:'TechSupplies Pvt Ltd',state:'Maharashtra',status:'Active',taxpayer_type:'Regular',risk_score:10,scenario:'VALID'})
MERGE (b1:GSTIN {gstin_id:'29AABCT1332L1ZU',name:'Karnataka Electronics Ltd',state:'Karnataka',status:'Active',taxpayer_type:'Regular',risk_score:12,scenario:'VALID'})
MERGE (inv1:Invoice {invoice_id:'INV-2024-001',amount:150000,cgst:13500,sgst:13500,igst:0,total_gst:27000,date:'2024-10-01',status:'MATCHED',hsn:'8471',description:'Laptop Computers',scenario:'VALID'})
MERGE (irn1:IRN {irn:'IRN-A1B2C3D4E5F6',generated_at:'2024-10-01T09:00:00',portal_status:'ACTIVE'})
MERGE (ewb1:EWayBill {ewb_id:'EWB-1001',vehicle_number:'MH12AB1234',distance_km:980,from_pin:'400001',to_pin:'560001',valid_until:'2024-10-04',transporter:'FastCargo Ltd',scenario:'VALID',phantom:false})
MERGE (g1a:GSTR1  {return_id:'GSTR1-27AAPFU-OCT24',period:'2024-10',filed_date:'2024-10-11',filed_status:'FILED'})
MERGE (g3a:GSTR3B {return_id:'GSTR3B-27AAPFU-OCT24',period:'2024-10',filed_date:'2024-10-20',tax_paid_status:'PAID',tax_paid:27000})
MERGE (tp1:TaxPayment {challan_no:'CPIN-2024-001',payment_date:'2024-10-20',amount_paid:27000,cgst_paid:13500,sgst_paid:13500,igst_paid:0,bank:'HDFC Bank',utr:'HDFC20241020001',status:'CLEARED',scenario:'VALID'})
MERGE (g3b_buy1:GSTR3B {return_id:'GSTR3B-29AABCT-OCT24',period:'2024-10',filed_date:'2024-10-20',tax_paid_status:'PAID',itc_claimed:27000})
MERGE (s1)-[:ISSUED_INVOICE]->(inv1) MERGE (inv1)-[:BILLED_TO]->(b1)
MERGE (inv1)-[:AUTHENTICATED_BY]->(irn1) MERGE (inv1)-[:TRANSPORTED_VIA]->(ewb1)
MERGE (inv1)-[:DECLARED_IN]->(g1a) MERGE (s1)-[:FILED]->(g1a)
MERGE (s1)-[:FILED]->(g3a) MERGE (g3a)-[:SETTLED_BY]->(tp1)
MERGE (b1)-[:FILED]->(g3b_buy1) MERGE (g3b_buy1)-[:CLAIMS_ITC_FOR]->(inv1)
RETURN 'SC1' AS r"""

SC2 = """
MERGE (s2:GSTIN {gstin_id:'33AABCD1234E1ZH',name:'Tamil Nadu Textiles Co',state:'Tamil Nadu',status:'Active',taxpayer_type:'Regular',risk_score:55,scenario:'MISSING_GSTR1'})
MERGE (b2:GSTIN {gstin_id:'07AAACR5055K1ZG',name:'Delhi Garments Hub',state:'Delhi',status:'Active',taxpayer_type:'Regular',risk_score:20,scenario:'MISSING_GSTR1'})
MERGE (inv2:Invoice {invoice_id:'INV-2024-002',amount:85000,cgst:7650,sgst:7650,igst:0,total_gst:15300,date:'2024-10-05',status:'MISSING_GSTR1',hsn:'5208',description:'Cotton Fabrics',scenario:'MISSING_GSTR1'})
MERGE (irn2:IRN {irn:'IRN-B2C3D4E5F6G7',generated_at:'2024-10-05T11:00:00',portal_status:'ACTIVE'})
MERGE (ewb2:EWayBill {ewb_id:'EWB-1002',vehicle_number:'TN09XY5678',distance_km:2100,from_pin:'600001',to_pin:'110001',valid_until:'2024-10-09',transporter:'SpeedEx Logistics',scenario:'MISSING_GSTR1',phantom:false})
MERGE (s2)-[:ISSUED_INVOICE]->(inv2) MERGE (inv2)-[:BILLED_TO]->(b2)
MERGE (inv2)-[:AUTHENTICATED_BY]->(irn2) MERGE (inv2)-[:TRANSPORTED_VIA]->(ewb2)
RETURN 'SC2' AS r"""

SC3 = """
MERGE (s3:GSTIN {gstin_id:'24AAFFT5678B1Z5',name:'Gujarat Chemicals Ltd',state:'Gujarat',status:'Active',taxpayer_type:'Regular',risk_score:70,scenario:'MISSING_GSTR3B'})
MERGE (b3:GSTIN {gstin_id:'19AAACP9012C1Z1',name:'West Bengal Pharma',state:'West Bengal',status:'Active',taxpayer_type:'Regular',risk_score:25,scenario:'MISSING_GSTR3B'})
MERGE (inv3:Invoice {invoice_id:'INV-2024-003',amount:320000,cgst:28800,sgst:28800,igst:0,total_gst:57600,date:'2024-09-20',status:'MISSING_GSTR3B',hsn:'2901',description:'Industrial Chemicals',scenario:'MISSING_GSTR3B'})
MERGE (irn3:IRN {irn:'IRN-C3D4E5F6G7H8',generated_at:'2024-09-20T14:00:00',portal_status:'ACTIVE'})
MERGE (g1c:GSTR1 {return_id:'GSTR1-24AAFFT-SEP24',period:'2024-09',filed_date:'2024-10-11',filed_status:'FILED'})
MERGE (ewb3:EWayBill {ewb_id:'EWB-1003',vehicle_number:'GJ05CD9012',distance_km:1900,from_pin:'380001',to_pin:'700001',valid_until:'2024-09-24',transporter:'BharatShip',scenario:'MISSING_GSTR3B',phantom:false})
MERGE (s3)-[:ISSUED_INVOICE]->(inv3) MERGE (inv3)-[:BILLED_TO]->(b3)
MERGE (inv3)-[:AUTHENTICATED_BY]->(irn3) MERGE (inv3)-[:TRANSPORTED_VIA]->(ewb3)
MERGE (inv3)-[:DECLARED_IN]->(g1c) MERGE (s3)-[:FILED]->(g1c)
RETURN 'SC3' AS r"""

SC4 = """
MERGE (ca:GSTIN {gstin_id:'27FRAUD0001F1ZX',name:'Alpha Trading Co',state:'Maharashtra',status:'Active',taxpayer_type:'Regular',risk_score:95,scenario:'CIRCULAR_TRADING'})
MERGE (cb:GSTIN {gstin_id:'27FRAUD0002F1ZY',name:'Beta Enterprises',state:'Maharashtra',status:'Active',taxpayer_type:'Regular',risk_score:95,scenario:'CIRCULAR_TRADING'})
MERGE (cc:GSTIN {gstin_id:'27FRAUD0003F1ZZ',name:'Gamma Industries',state:'Maharashtra',status:'Active',taxpayer_type:'Regular',risk_score:95,scenario:'CIRCULAR_TRADING'})
MERGE (ci1:Invoice {invoice_id:'INV-CIRC-001',amount:500000,cgst:45000,sgst:45000,igst:0,total_gst:90000,date:'2024-10-15',status:'CIRCULAR_FRAUD',hsn:'9999',description:'Misc Goods',scenario:'CIRCULAR_TRADING',value_ratio:1.0})
MERGE (ci2:Invoice {invoice_id:'INV-CIRC-002',amount:497500,cgst:44775,sgst:44775,igst:0,total_gst:89550,date:'2024-10-15',status:'CIRCULAR_FRAUD',hsn:'9999',description:'Misc Goods',scenario:'CIRCULAR_TRADING',value_ratio:0.995})
MERGE (ci3:Invoice {invoice_id:'INV-CIRC-003',amount:495000,cgst:44550,sgst:44550,igst:0,total_gst:89100,date:'2024-10-15',status:'CIRCULAR_FRAUD',hsn:'9999',description:'Misc Goods',scenario:'CIRCULAR_TRADING',value_ratio:0.99})
MERGE (cewb1:EWayBill {ewb_id:'EWB-CIRC-1',vehicle_number:'MH04GH7890',distance_km:50,from_pin:'400001',to_pin:'400002',valid_until:'2024-10-15',scenario:'CIRCULAR_TRADING',phantom:true})
MERGE (cewb2:EWayBill {ewb_id:'EWB-CIRC-2',vehicle_number:'MH04GH7890',distance_km:60,from_pin:'400002',to_pin:'400003',valid_until:'2024-10-15',scenario:'CIRCULAR_TRADING',phantom:true})
MERGE (cewb3:EWayBill {ewb_id:'EWB-CIRC-3',vehicle_number:'MH04GH7890',distance_km:45,from_pin:'400003',to_pin:'400001',valid_until:'2024-10-15',scenario:'CIRCULAR_TRADING',phantom:true})
MERGE (cg1a:GSTR1 {return_id:'GSTR1-CA-OCT24',period:'2024-10',filed_status:'FILED'})
MERGE (cg3a:GSTR3B{return_id:'GSTR3B-CA-OCT24',period:'2024-10',tax_paid_status:'PAID',tax_paid:90000})
MERGE (ctp_a:TaxPayment{challan_no:'CPIN-CIRC-A',payment_date:'2024-10-15',amount_paid:90000,status:'CLEARED',scenario:'CIRCULAR_TRADING'})
MERGE (cg1b:GSTR1 {return_id:'GSTR1-CB-OCT24',period:'2024-10',filed_status:'FILED'})
MERGE (cg3b2:GSTR3B{return_id:'GSTR3B-CB-OCT24',period:'2024-10',tax_paid_status:'PAID',tax_paid:89550})
MERGE (ctp_b:TaxPayment{challan_no:'CPIN-CIRC-B',payment_date:'2024-10-15',amount_paid:89550,status:'CLEARED',scenario:'CIRCULAR_TRADING'})
MERGE (cg1c2:GSTR1{return_id:'GSTR1-CC-OCT24',period:'2024-10',filed_status:'FILED'})
MERGE (cg3c:GSTR3B {return_id:'GSTR3B-CC-OCT24',period:'2024-10',tax_paid_status:'PAID',tax_paid:89100})
MERGE (ctp_c:TaxPayment{challan_no:'CPIN-CIRC-C',payment_date:'2024-10-15',amount_paid:89100,status:'CLEARED',scenario:'CIRCULAR_TRADING'})
MERGE (ca)-[:ISSUED_INVOICE]->(ci1) MERGE (ci1)-[:BILLED_TO]->(cb) MERGE (ci1)-[:TRANSPORTED_VIA]->(cewb1) MERGE (ci1)-[:DECLARED_IN]->(cg1a)
MERGE (ca)-[:FILED]->(cg1a) MERGE (ca)-[:FILED]->(cg3a) MERGE (cg3a)-[:SETTLED_BY]->(ctp_a)
MERGE (cb)-[:ISSUED_INVOICE]->(ci2) MERGE (ci2)-[:BILLED_TO]->(cc) MERGE (ci2)-[:TRANSPORTED_VIA]->(cewb2) MERGE (ci2)-[:DECLARED_IN]->(cg1b)
MERGE (cb)-[:FILED]->(cg1b) MERGE (cb)-[:FILED]->(cg3b2) MERGE (cg3b2)-[:SETTLED_BY]->(ctp_b)
MERGE (cc)-[:ISSUED_INVOICE]->(ci3) MERGE (ci3)-[:BILLED_TO]->(ca) MERGE (ci3)-[:TRANSPORTED_VIA]->(cewb3) MERGE (ci3)-[:DECLARED_IN]->(cg1c2)
MERGE (cc)-[:FILED]->(cg1c2) MERGE (cc)-[:FILED]->(cg3c) MERGE (cg3c)-[:SETTLED_BY]->(ctp_c)
RETURN 'SC4' AS r"""

SC5 = """
MERGE (s5:GSTIN {gstin_id:'06AAAFM3456D1ZP',name:'Haryana Motors Pvt Ltd',state:'Haryana',status:'Active',taxpayer_type:'Regular',risk_score:40,scenario:'AMOUNT_MISMATCH'})
MERGE (b5:GSTIN {gstin_id:'09AABCM7890E1ZQ',name:'UP Auto Dealers',state:'Uttar Pradesh',status:'Active',taxpayer_type:'Regular',risk_score:30,scenario:'AMOUNT_MISMATCH'})
MERGE (inv5:Invoice {invoice_id:'INV-2024-005',amount:200000,cgst:18000,sgst:18000,igst:0,total_gst:36000,gstr2b_gst:3600,date:'2024-10-10',status:'AMOUNT_MISMATCH',discrepancy_amount:32400,hsn:'8703',description:'Passenger Motor Vehicle',scenario:'AMOUNT_MISMATCH'})
MERGE (irn5:IRN {irn:'IRN-E5F6G7H8I9J0',generated_at:'2024-10-10T10:00:00',portal_status:'ACTIVE'})
MERGE (g1e:GSTR1 {return_id:'GSTR1-06AAAFM-OCT24',period:'2024-10',filed_date:'2024-10-11',filed_status:'FILED'})
MERGE (g3e:GSTR3B{return_id:'GSTR3B-06AAAFM-OCT24',period:'2024-10',filed_date:'2024-10-20',tax_paid_status:'PAID',tax_paid:3600})
MERGE (tp5:TaxPayment{challan_no:'CPIN-2024-05',payment_date:'2024-10-20',amount_paid:3600,status:'CLEARED',note:'3600 paid vs 36000 owed',scenario:'AMOUNT_MISMATCH'})
MERGE (s5)-[:ISSUED_INVOICE]->(inv5) MERGE (inv5)-[:BILLED_TO]->(b5) MERGE (inv5)-[:AUTHENTICATED_BY]->(irn5)
MERGE (inv5)-[:DECLARED_IN]->(g1e) MERGE (s5)-[:FILED]->(g1e) MERGE (s5)-[:FILED]->(g3e) MERGE (g3e)-[:SETTLED_BY]->(tp5)
RETURN 'SC5' AS r"""

SC6 = """
MERGE (s6:GSTIN {gstin_id:'32AABCE9876F1ZM',name:'Kerala Spices Export',state:'Kerala',status:'Active',taxpayer_type:'Regular',risk_score:35,scenario:'MISSING_EWB'})
MERGE (b6:GSTIN {gstin_id:'23AAACE1234G1ZN',name:'MP Food Industries',state:'Madhya Pradesh',status:'Active',taxpayer_type:'Regular',risk_score:15,scenario:'MISSING_EWB'})
MERGE (inv6:Invoice {invoice_id:'INV-2024-006',amount:75000,cgst:6750,sgst:6750,igst:0,total_gst:13500,date:'2024-10-08',status:'MISSING_EWB',hsn:'0910',description:'Spices and Condiments',scenario:'MISSING_EWB'})
MERGE (irn6:IRN {irn:'IRN-F6G7H8I9J0K1',generated_at:'2024-10-08T08:00:00',portal_status:'ACTIVE'})
MERGE (g1f:GSTR1 {return_id:'GSTR1-32AABCE-OCT24',period:'2024-10',filed_date:'2024-10-11',filed_status:'FILED'})
MERGE (g3f:GSTR3B{return_id:'GSTR3B-32AABCE-OCT24',period:'2024-10',filed_date:'2024-10-20',tax_paid_status:'PAID',tax_paid:13500})
MERGE (tp6:TaxPayment{challan_no:'CPIN-2024-06',payment_date:'2024-10-20',amount_paid:13500,status:'CLEARED',scenario:'MISSING_EWB'})
MERGE (s6)-[:ISSUED_INVOICE]->(inv6) MERGE (inv6)-[:BILLED_TO]->(b6) MERGE (inv6)-[:AUTHENTICATED_BY]->(irn6)
MERGE (inv6)-[:DECLARED_IN]->(g1f) MERGE (s6)-[:FILED]->(g1f) MERGE (s6)-[:FILED]->(g3f) MERGE (g3f)-[:SETTLED_BY]->(tp6)
RETURN 'SC6' AS r"""

SC7 = """
MERGE (s7:GSTIN {gstin_id:'07AAAFG2345H1ZR',name:'Delhi Steel Works',state:'Delhi',status:'CANCELLED',taxpayer_type:'Regular',risk_score:85,scenario:'CANCELLED_GSTIN',cancellation_date:'2024-08-01',is_defaulter:true})
MERGE (b7:GSTIN {gstin_id:'09AABCH3456I1ZS',name:'UP Construction Co',state:'Uttar Pradesh',status:'Active',taxpayer_type:'Regular',risk_score:20,scenario:'CANCELLED_GSTIN'})
MERGE (inv7:Invoice {invoice_id:'INV-2024-007',amount:420000,cgst:37800,sgst:37800,igst:0,total_gst:75600,date:'2024-09-15',status:'CANCELLED_GSTIN',hsn:'7213',description:'Steel Bars',scenario:'CANCELLED_GSTIN'})
MERGE (irn7:IRN {irn:'IRN-G7H8I9J0K1L2',generated_at:'2024-09-15T10:00:00',portal_status:'CANCELLED'})
MERGE (ewb7:EWayBill {ewb_id:'EWB-1007',vehicle_number:'DL09AB3456',distance_km:200,from_pin:'110001',to_pin:'201001',valid_until:'2024-09-17',transporter:'QuickMove',scenario:'CANCELLED_GSTIN',phantom:false})
MERGE (s7)-[:ISSUED_INVOICE]->(inv7) MERGE (inv7)-[:BILLED_TO]->(b7) MERGE (inv7)-[:AUTHENTICATED_BY]->(irn7) MERGE (inv7)-[:TRANSPORTED_VIA]->(ewb7)
RETURN 'SC7' AS r"""

SC8 = """
MERGE (hub:GSTIN {gstin_id:'29AABCH4567J1ZT',name:'Karnataka Hub Enterprise',state:'Karnataka',status:'Active',taxpayer_type:'Regular',risk_score:60,scenario:'MULTI_HOP_DEFAULT',is_defaulter:false})
MERGE (up1:GSTIN {gstin_id:'29AAACM5678K1ZU',name:'Mysore Machinery Co',state:'Karnataka',status:'Active',taxpayer_type:'Regular',risk_score:75,scenario:'MULTI_HOP_DEFAULT',is_defaulter:true})
MERGE (up2:GSTIN {gstin_id:'29AABCN6789L1ZV',name:'Bangalore Metal Works',state:'Karnataka',status:'Active',taxpayer_type:'Regular',risk_score:80,scenario:'MULTI_HOP_DEFAULT',is_defaulter:true})
MERGE (inv8:Invoice {invoice_id:'INV-2024-008',amount:280000,cgst:25200,sgst:25200,igst:0,total_gst:50400,date:'2024-09-28',status:'UPSTREAM_DEFAULT',hsn:'8426',description:'Industrial Machinery',scenario:'MULTI_HOP_DEFAULT'})
MERGE (irn8:IRN {irn:'IRN-H8I9J0K1L2M3',generated_at:'2024-09-28T12:00:00',portal_status:'ACTIVE'})
MERGE (ewb8:EWayBill {ewb_id:'EWB-1008',vehicle_number:'KA05CD7890',distance_km:150,from_pin:'560001',to_pin:'560002',valid_until:'2024-09-30',transporter:'LocalHaul',scenario:'MULTI_HOP_DEFAULT',phantom:false})
MERGE (g1h:GSTR1 {return_id:'GSTR1-29AABCH-SEP24',period:'2024-09',filed_date:'2024-10-11',filed_status:'FILED'})
MERGE (g3h:GSTR3B{return_id:'GSTR3B-29AABCH-SEP24',period:'2024-09',filed_date:'2024-10-20',tax_paid_status:'PAID',tax_paid:50400})
MERGE (tp8:TaxPayment{challan_no:'CPIN-2024-08',payment_date:'2024-10-20',amount_paid:50400,status:'CLEARED',scenario:'MULTI_HOP_DEFAULT'})
MERGE (hub)-[:ISSUED_INVOICE]->(inv8) MERGE (inv8)-[:BILLED_TO]->(up1) MERGE (inv8)-[:AUTHENTICATED_BY]->(irn8) MERGE (inv8)-[:TRANSPORTED_VIA]->(ewb8)
MERGE (inv8)-[:DECLARED_IN]->(g1h) MERGE (hub)-[:FILED]->(g1h) MERGE (hub)-[:FILED]->(g3h) MERGE (g3h)-[:SETTLED_BY]->(tp8)
MERGE (up2)-[:SUPPLIES_TO]->(up1) MERGE (up1)-[:SUPPLIES_TO]->(hub)
RETURN 'SC8' AS r"""

# ── NEW: Circular GST Credit Fraud (SC9) ──────────────────────────────────────
# 5-entity ring: each entity inflates invoice value ~15% per hop.
# All file GSTR1+GSTR3B and claim ITC from prior entity.
# Net ITC fraud: ~₹3.2 crore of fake credits circulating in closed loop.
# This is the "GST Merry-Go-Round" — detected via graph cycle traversal.
SC9 = """
MERGE (r1:GSTIN {gstin_id:'29CGST0001R1ZA',name:'Sunrise Impex Pvt Ltd',state:'Karnataka',status:'Active',taxpayer_type:'Regular',risk_score:98,scenario:'CIRCULAR_GST_FRAUD',incorporation_date:'2023-01-15',directors:'Ravi Kumar'})
MERGE (r2:GSTIN {gstin_id:'29CGST0002R1ZB',name:'Moonlight Traders LLP',state:'Karnataka',status:'Active',taxpayer_type:'Regular',risk_score:98,scenario:'CIRCULAR_GST_FRAUD',incorporation_date:'2023-01-20',directors:'Ravi Kumar'})
MERGE (r3:GSTIN {gstin_id:'29CGST0003R1ZC',name:'Star Export House',state:'Karnataka',status:'Active',taxpayer_type:'Regular',risk_score:97,scenario:'CIRCULAR_GST_FRAUD',incorporation_date:'2023-02-01',directors:'Seema Verma'})
MERGE (r4:GSTIN {gstin_id:'29CGST0004R1ZD',name:'Horizon Commodities Co',state:'Karnataka',status:'Active',taxpayer_type:'Regular',risk_score:97,scenario:'CIRCULAR_GST_FRAUD',incorporation_date:'2023-02-10',directors:'Seema Verma'})
MERGE (r5:GSTIN {gstin_id:'29CGST0005R1ZE',name:'Zenith Supply Chain Ltd',state:'Karnataka',status:'Active',taxpayer_type:'Regular',risk_score:96,scenario:'CIRCULAR_GST_FRAUD',incorporation_date:'2023-02-15',directors:'Ravi Kumar'})

MERGE (gi1:Invoice {invoice_id:'INV-CGST-001',amount:2000000,cgst:180000,sgst:180000,igst:0,total_gst:360000,date:'2024-11-01',status:'CIRCULAR_FRAUD',hsn:'7208',description:'Hot Rolled Steel Coils',scenario:'CIRCULAR_GST_FRAUD',value_inflation:1.0,itc_fraud_amount:360000})
MERGE (gi2:Invoice {invoice_id:'INV-CGST-002',amount:2300000,cgst:207000,sgst:207000,igst:0,total_gst:414000,date:'2024-11-02',status:'CIRCULAR_FRAUD',hsn:'7208',description:'Hot Rolled Steel Coils',scenario:'CIRCULAR_GST_FRAUD',value_inflation:1.15,itc_fraud_amount:414000})
MERGE (gi3:Invoice {invoice_id:'INV-CGST-003',amount:2645000,cgst:238050,sgst:238050,igst:0,total_gst:476100,date:'2024-11-03',status:'CIRCULAR_FRAUD',hsn:'7208',description:'Steel Coil — Grade A',scenario:'CIRCULAR_GST_FRAUD',value_inflation:1.32,itc_fraud_amount:476100})
MERGE (gi4:Invoice {invoice_id:'INV-CGST-004',amount:3041750,cgst:273757,sgst:273757,igst:0,total_gst:547515,date:'2024-11-04',status:'CIRCULAR_FRAUD',hsn:'7208',description:'Steel Grade AA Premium',scenario:'CIRCULAR_GST_FRAUD',value_inflation:1.52,itc_fraud_amount:547515})
MERGE (gi5:Invoice {invoice_id:'INV-CGST-005',amount:3498000,cgst:314820,sgst:314820,igst:0,total_gst:629640,date:'2024-11-05',status:'CIRCULAR_FRAUD',hsn:'7208',description:'Steel Premium Export',scenario:'CIRCULAR_GST_FRAUD',value_inflation:1.75,itc_fraud_amount:629640})

MERGE (gewb1:EWayBill {ewb_id:'EWB-CGST-1',vehicle_number:'KA01MM0001',distance_km:12,from_pin:'560001',to_pin:'560002',valid_until:'2024-11-01',scenario:'CIRCULAR_GST_FRAUD',phantom:true,flag:'SAME_DAY_RETURN'})
MERGE (gewb2:EWayBill {ewb_id:'EWB-CGST-2',vehicle_number:'KA01MM0001',distance_km:14,from_pin:'560002',to_pin:'560003',valid_until:'2024-11-02',scenario:'CIRCULAR_GST_FRAUD',phantom:true,flag:'SAME_VEHICLE_REUSED'})
MERGE (gewb3:EWayBill {ewb_id:'EWB-CGST-3',vehicle_number:'KA01MM0001',distance_km:11,from_pin:'560003',to_pin:'560004',valid_until:'2024-11-03',scenario:'CIRCULAR_GST_FRAUD',phantom:true,flag:'SAME_VEHICLE_REUSED'})
MERGE (gewb4:EWayBill {ewb_id:'EWB-CGST-4',vehicle_number:'KA01MM0001',distance_km:13,from_pin:'560004',to_pin:'560005',valid_until:'2024-11-04',scenario:'CIRCULAR_GST_FRAUD',phantom:true,flag:'SAME_VEHICLE_REUSED'})
MERGE (gewb5:EWayBill {ewb_id:'EWB-CGST-5',vehicle_number:'KA01MM0001',distance_km:10,from_pin:'560005',to_pin:'560001',valid_until:'2024-11-05',scenario:'CIRCULAR_GST_FRAUD',phantom:true,flag:'RING_CLOSURE'})

MERGE (gg1a:GSTR1 {return_id:'GSTR1-R1-NOV24',period:'2024-11',filed_status:'FILED',filed_date:'2024-11-11'})
MERGE (gg1b:GSTR1 {return_id:'GSTR1-R2-NOV24',period:'2024-11',filed_status:'FILED',filed_date:'2024-11-11'})
MERGE (gg1c:GSTR1 {return_id:'GSTR1-R3-NOV24',period:'2024-11',filed_status:'FILED',filed_date:'2024-11-11'})
MERGE (gg1d:GSTR1 {return_id:'GSTR1-R4-NOV24',period:'2024-11',filed_status:'FILED',filed_date:'2024-11-11'})
MERGE (gg1e:GSTR1 {return_id:'GSTR1-R5-NOV24',period:'2024-11',filed_status:'FILED',filed_date:'2024-11-11'})

MERGE (gg3a:GSTR3B {return_id:'GSTR3B-R1-NOV24',period:'2024-11',tax_paid_status:'PAID',tax_paid:360000,itc_claimed:629640})
MERGE (gg3b:GSTR3B {return_id:'GSTR3B-R2-NOV24',period:'2024-11',tax_paid_status:'PAID',tax_paid:414000,itc_claimed:360000})
MERGE (gg3c:GSTR3B {return_id:'GSTR3B-R3-NOV24',period:'2024-11',tax_paid_status:'PAID',tax_paid:476100,itc_claimed:414000})
MERGE (gg3d:GSTR3B {return_id:'GSTR3B-R4-NOV24',period:'2024-11',tax_paid_status:'PAID',tax_paid:547515,itc_claimed:476100})
MERGE (gg3e:GSTR3B {return_id:'GSTR3B-R5-NOV24',period:'2024-11',tax_paid_status:'PAID',tax_paid:629640,itc_claimed:547515})

MERGE (gtp1:TaxPayment {challan_no:'CPIN-CGST-R1',payment_date:'2024-11-20',amount_paid:360000,status:'CLEARED',scenario:'CIRCULAR_GST_FRAUD',net_fraud_gain:-269640})
MERGE (gtp2:TaxPayment {challan_no:'CPIN-CGST-R2',payment_date:'2024-11-20',amount_paid:414000,status:'CLEARED',scenario:'CIRCULAR_GST_FRAUD',net_fraud_gain:-54000})
MERGE (gtp3:TaxPayment {challan_no:'CPIN-CGST-R3',payment_date:'2024-11-20',amount_paid:476100,status:'CLEARED',scenario:'CIRCULAR_GST_FRAUD',net_fraud_gain:62100})
MERGE (gtp4:TaxPayment {challan_no:'CPIN-CGST-R4',payment_date:'2024-11-20',amount_paid:547515,status:'CLEARED',scenario:'CIRCULAR_GST_FRAUD',net_fraud_gain:71415})
MERGE (gtp5:TaxPayment {challan_no:'CPIN-CGST-R5',payment_date:'2024-11-20',amount_paid:629640,status:'CLEARED',scenario:'CIRCULAR_GST_FRAUD',net_fraud_gain:82125})

MERGE (r1)-[:ISSUED_INVOICE]->(gi1) MERGE (gi1)-[:BILLED_TO]->(r2) MERGE (gi1)-[:TRANSPORTED_VIA]->(gewb1) MERGE (gi1)-[:DECLARED_IN]->(gg1a)
MERGE (r1)-[:FILED]->(gg1a) MERGE (r1)-[:FILED]->(gg3a) MERGE (gg3a)-[:SETTLED_BY]->(gtp1) MERGE (gg3a)-[:CLAIMS_ITC_FOR]->(gi5)

MERGE (r2)-[:ISSUED_INVOICE]->(gi2) MERGE (gi2)-[:BILLED_TO]->(r3) MERGE (gi2)-[:TRANSPORTED_VIA]->(gewb2) MERGE (gi2)-[:DECLARED_IN]->(gg1b)
MERGE (r2)-[:FILED]->(gg1b) MERGE (r2)-[:FILED]->(gg3b) MERGE (gg3b)-[:SETTLED_BY]->(gtp2) MERGE (gg3b)-[:CLAIMS_ITC_FOR]->(gi1)

MERGE (r3)-[:ISSUED_INVOICE]->(gi3) MERGE (gi3)-[:BILLED_TO]->(r4) MERGE (gi3)-[:TRANSPORTED_VIA]->(gewb3) MERGE (gi3)-[:DECLARED_IN]->(gg1c)
MERGE (r3)-[:FILED]->(gg1c) MERGE (r3)-[:FILED]->(gg3c) MERGE (gg3c)-[:SETTLED_BY]->(gtp3) MERGE (gg3c)-[:CLAIMS_ITC_FOR]->(gi2)

MERGE (r4)-[:ISSUED_INVOICE]->(gi4) MERGE (gi4)-[:BILLED_TO]->(r5) MERGE (gi4)-[:TRANSPORTED_VIA]->(gewb4) MERGE (gi4)-[:DECLARED_IN]->(gg1d)
MERGE (r4)-[:FILED]->(gg1d) MERGE (r4)-[:FILED]->(gg3d) MERGE (gg3d)-[:SETTLED_BY]->(gtp4) MERGE (gg3d)-[:CLAIMS_ITC_FOR]->(gi3)

MERGE (r5)-[:ISSUED_INVOICE]->(gi5) MERGE (gi5)-[:BILLED_TO]->(r1) MERGE (gi5)-[:TRANSPORTED_VIA]->(gewb5) MERGE (gi5)-[:DECLARED_IN]->(gg1e)
MERGE (r5)-[:FILED]->(gg1e) MERGE (r5)-[:FILED]->(gg3e) MERGE (gg3e)-[:SETTLED_BY]->(gtp5) MERGE (gg3e)-[:CLAIMS_ITC_FOR]->(gi4)

MERGE (r1)-[:SUPPLIES_TO]->(r2) MERGE (r2)-[:SUPPLIES_TO]->(r3) MERGE (r3)-[:SUPPLIES_TO]->(r4)
MERGE (r4)-[:SUPPLIES_TO]->(r5) MERGE (r5)-[:SUPPLIES_TO]->(r1)
RETURN 'SC9_CIRCULAR_GST_FRAUD' AS r"""


SCENARIOS = [
    ("SC1_VALID_CHAIN",        SC1),
    ("SC2_MISSING_GSTR1",      SC2),
    ("SC3_MISSING_GSTR3B",     SC3),
    ("SC4_CIRCULAR_TRADING",   SC4),
    ("SC5_AMOUNT_MISMATCH",    SC5),
    ("SC6_MISSING_EWB",        SC6),
    ("SC7_CANCELLED_GSTIN",    SC7),
    ("SC8_MULTI_HOP_DEFAULT",  SC8),
    ("SC9_CIRCULAR_GST_FRAUD", SC9),
]


def graph_has_data() -> bool:
    """Return True if Neo4j already has nodes — skip seeding."""
    try:
        result = run_query("MATCH (n) RETURN count(n) AS c LIMIT 1")
        return (result or [{}])[0].get("c", 0) > 0
    except Exception:
        return False


def seed_all(force: bool = False):
    """
    Seed all scenarios. Skips if data already exists unless force=True.
    Uses MERGE throughout, so re-seeding is idempotent.
    """
    if not force and graph_has_data():
        logger.info("Neo4j already has data — skipping seed (use force=True to override)")
        return [{"scenario": s[0], "status": "skipped", "reason": "data_exists"} for s in SCENARIOS]

    create_constraints()
    results = []
    for name, cypher in SCENARIOS:
        try:
            run_write(cypher)
            results.append({"scenario": name, "status": "success"})
            logger.info(f"  ✓ {name}")
        except Exception as e:
            results.append({"scenario": name, "status": "error", "error": str(e)})
            logger.error(f"  ✗ {name}: {e}")
    return results
