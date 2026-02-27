import { useEffect, useState } from "react";
import StatsCards from "./StatsCards";
import Charts from "./Charts";
import GraphView from "./GraphView";
import {
  getDashboardSummary,
  getChartsData,
  getGraphData,
} from "../services/api";

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [charts, setCharts] = useState(null);
  const [graph, setGraph] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      const [summaryData, chartsData, graphData] = await Promise.all([
        getDashboardSummary(),
        getChartsData(),
        getGraphData(),
      ]);

      setSummary(summaryData);
      setCharts(chartsData);
      setGraph(graphData);

      setLoading(false);
    }

    fetchData();
  }, []);

  if (loading) return <h2 style={{ padding: 20 }}>Loading Dashboard...</h2>;

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ marginBottom: "20px" }}>
        GST Graph Intelligence Dashboard
      </h1>

      <StatsCards data={summary} />

      <Charts data={charts} />

      <GraphView graphData={graph} />
    </div>
  );
};

export default Dashboard;