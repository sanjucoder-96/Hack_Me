import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const Charts = ({ data }) => {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      {/* Bar Chart */}
      <div style={{ background: "white", padding: 20, borderRadius: 10 }}>
        <h3>Vendor Risk Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.risk_distribution}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart */}
      <div style={{ background: "white", padding: 20, borderRadius: 10 }}>
        <h3>ITC Status</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={data.itc_status} dataKey="value" nameKey="name" />
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Line Chart */}
      <div
        style={{
          background: "white",
          padding: 20,
          borderRadius: 10,
          gridColumn: "span 2",
        }}
      >
        <h3>Filing Compliance Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.compliance_trend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#10b981" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Charts;