import axios from "axios";

// Base API instance
const api = axios.create({
  baseURL: "http://localhost:8000", // FastAPI backend
});

/*
  MOCK DATA fallback
  Helps frontend run even without backend
*/

export const getDashboardSummary = async () => {
  try {
    const res = await api.get("/dashboard/summary");
    return res.data;
  } catch {
    return {
      total_itc: 12000000,
      blocked_itc: 3200000,
      high_risk_vendors: 42,
      fraud_rings: 5,
    };
  }
};

export const getChartsData = async () => {
  try {
    const res = await api.get("/dashboard/charts");
    return res.data;
  } catch {
    return {
      risk_distribution: [
        { name: "Low", value: 120 },
        { name: "Medium", value: 60 },
        { name: "High", value: 25 },
      ],
      itc_status: [
        { name: "Claimed", value: 9000000 },
        { name: "Blocked", value: 3000000 },
      ],
      compliance_trend: [
        { month: "Jan", value: 80 },
        { month: "Feb", value: 85 },
        { month: "Mar", value: 70 },
        { month: "Apr", value: 90 },
      ],
    };
  }
};

export const getGraphData = async () => {
  try {
    const res = await api.get("/graph/network");
    return res.data;
  } catch {
    return {
      nodes: [
        { data: { id: "A", label: "GSTIN-A", risk: "normal" } },
        { data: { id: "B", label: "GSTIN-B", risk: "high" } },
        { data: { id: "C", label: "GSTIN-C", risk: "fraud" } },
      ],
      edges: [
        { data: { source: "A", target: "B" } },
        { data: { source: "B", target: "C" } },
        { data: { source: "C", target: "A" } },
      ],
    };
  }
};