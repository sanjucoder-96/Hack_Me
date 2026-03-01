🕸️ GraphGST: Intelligent GST Reconciliation
Replacing vulnerable flat-table tax databases with an intelligent Knowledge Graph engine.

GraphGST physically traverses the supply chain to instantly expose multi-hop ITC fraud, score vendor risk using unsupervised AI, and auto-generate explainable, legally sound audit notices via a GraphRAG Copilot.

🛑 The Problem
Flat SQL databases fail at GST reconciliation because circular trading is a multi-hop network problem, not a row-matching task. Fraudsters exploit this by hiding fake invoices across complex supply chains. Therefore, stopping ITC leakage affecting 1.4 crore taxpayers requires an interconnected Knowledge Graph, not isolated 2D tables.

💡 Our Solution Approach
GraphGST transforms flat tax data into a Neo4j Knowledge Graph. We deploy multi-hop Cypher algorithms to validate end-to-end ITC compliance and uncover circular fraud. An Isolation Forest model predicts vendor risk, while our GraphRAG Copilot translates complex network mathematics into explainable, legally sound audit narratives.

🚀 Key Features & Deliverables Achieved:


✅ 1. GST Knowledge Graph Schema: Meticulously modeled entities (GSTIN, Invoice, IRN, e-Way Bill, GSTR-1, GSTR-3B, TaxPayment) connected via factual supply-chain edges. Includes a robust mock-data seeder simulating 9 complex fraud and compliance scenarios.

✅ 2. Multi-Hop Reconciliation Engine: Uses native Cypher traversal (MATCH (s)-[:ISSUED_INVOICE]->(i)-[:DECLARED_IN]->(:GSTR1)) to mathematically validate the ITC chain and classify mismatches (e.g., MISSING_GSTR3B, AMOUNT_MISMATCH).

✅ 3. Interactive Cytoscape Dashboard: A React-based physics engine visualizing the entire GST network. Features 1-click filters for identifying High-Risk vendors and Circular Fraud rings.

✅ 4. GraphRAG Audit Copilot (XAI): Translates complex graph mathematics into plain-English (and Hindi) audit trails. Automatically drafts legally sound "Show Cause Notices u/s 74" for tax evasion.

✅ 5. Predictive Vendor Risk ML: Extracts structural network topology (PageRank, Betweenness Centrality) and feeds it into an Isolation Forest (Unsupervised ML) to predict and score vendor compliance risk, flagging isolated shell syndicates.

🔬 R&D Roadmap (V5): A separate research pipeline utilizing Graph Neural Networks (GraphSAGE) and Reinforcement Learning (PPO Agent) to autonomously adapt to evolving fraud topologies.

🛠️ Tech Stack
Graph Database: Neo4j (AuraDB)

Backend: Python, FastAPI, Neo4j Python Driver

Frontend: React, Cytoscape.js, HTML5/CSS3

AI & Machine Learning: Scikit-Learn (Isolation Forest), NetworkX, PyTorch (R&D)

Domain: Indian FinTech, GST Law (Section 16, Section 74)

🏗️ System Architecture


Client Layer: React Dashboard visualizing graph physics via Cytoscape.js.

API Layer: FastAPI routing REST endpoints (/api/graph/full, /api/fraud, /api/agent/query).

Core Service Engine: - Multi-Hop Traversal Algorithms (Cycle Detection)

ML Risk Engine (Isolation Forest)

GraphRAG Copilot

Data Layer: Neo4j Graph Database executing native Cypher logic.

⚙️ Local Setup & Installation
Prerequisites
Python 3.9+

Node.js & npm

A Neo4j AuraDB instance (or local Neo4j Desktop)

1. Clone the Repository
Bash
git clone https://github.com/Adarsh-engu/GraphGST.git
cd GraphGST
2. Backend Setup
Bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install fastapi uvicorn neo4j networkx scikit-learn numpy pydantic

# Set your Neo4j Environment Variables
export NEO4J_URI="neo4j+s://<your-db-id>.databases.neo4j.io"
export NEO4J_USERNAME="neo4j"
export NEO4J_PASSWORD="your-password"

# Run the FastAPI server
uvicorn main:app --reload --port 8000
3. Frontend Setup
Bash
# Navigate to frontend directory
cd ../frontend

# (If using standard HTML/JS, simply serve the directory)
# Or if using a React build:
npm install
npm start
4. Seed the Database
Once the backend is running, hit the seed endpoint to inject the 9 complex fraud scenarios into your Neo4j database:

Bash
curl -X POST http://localhost:8000/api/seed
🏆 Hackathon Track Details
Theme: Intelligent GST Reconciliation Using Knowledge Graphs

Focus: Data Modeling, AI/ML, FinTech, Graph Traversal

Built with ❤️ for the 2026 Hackathon and Won 2nd Prize.
