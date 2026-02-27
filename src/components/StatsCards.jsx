const Card = ({ title, value }) => (
  <div
    style={{
      background: "white",
      padding: "20px",
      borderRadius: "10px",
      flex: 1,
      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    }}
  >
    <h4>{title}</h4>
    <h2>₹ {value.toLocaleString()}</h2>
  </div>
);

const StatsCards = ({ data }) => {
  return (
    <div
      style={{
        display: "flex",
        gap: "20px",
        marginBottom: "30px",
        flexWrap: "wrap",
      }}
    >
      <Card title="Total ITC Amount" value={data.total_itc} />
      <Card title="Blocked ITC Amount" value={data.blocked_itc} />
      <Card title="High-Risk Vendors" value={data.high_risk_vendors} />
      <Card title="Fraud Rings Detected" value={data.fraud_rings} />
    </div>
  );
};

export default StatsCards;