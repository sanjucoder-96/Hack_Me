import CytoscapeComponent from "react-cytoscapejs";

const GraphView = ({ graphData }) => {
  const elements = [...graphData.nodes, ...graphData.edges];

  const stylesheet = [
    {
      selector: "node",
      style: {
        label: "data(label)",
        color: "#fff",
        "text-valign": "center",
        "text-halign": "center",
        "font-size": "10px",
      },
    },
    {
      selector: 'node[risk="normal"]',
      style: { "background-color": "#3b82f6" },
    },
    {
      selector: 'node[risk="high"]',
      style: { "background-color": "#f59e0b" },
    },
    {
      selector: 'node[risk="fraud"]',
      style: { "background-color": "#ef4444" },
    },
    {
      selector: "edge",
      style: {
        width: 2,
        "line-color": "#ccc",
        "target-arrow-color": "#ccc",
        "target-arrow-shape": "triangle",
        "curve-style": "bezier",
      },
    },
  ];

  return (
    <div
      style={{
        marginTop: 30,
        background: "white",
        padding: 20,
        borderRadius: 10,
      }}
    >
      <h3>GST Knowledge Graph</h3>

      <CytoscapeComponent
        elements={elements}
        style={{ width: "100%", height: "500px" }}
        layout={{ name: "cose" }}
        stylesheet={stylesheet}
      />
    </div>
  );
};

export default GraphView;