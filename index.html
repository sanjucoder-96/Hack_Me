"""db.py — Neo4j driver singleton. Configure via environment variables."""
from neo4j import GraphDatabase
import os

_driver = None

def get_driver():
    global _driver
    if _driver is None:
        uri  = os.getenv("NEO4J_URI", "bolt://localhost:7687")
        user = os.getenv("NEO4J_USERNAME", "neo4j")
        pw   = os.getenv("NEO4J_PASSWORD", "password")
        _driver = GraphDatabase.driver(uri, auth=(user, pw))
    return _driver

def close_driver():
    global _driver
    if _driver:
        _driver.close()
        _driver = None

def run_query(cypher, params=None):
    with get_driver().session() as s:
        return [dict(r) for r in s.run(cypher, params or {})]

def run_write(cypher, params=None):
    with get_driver().session() as s:
        return s.execute_write(lambda tx: list(tx.run(cypher, params or {})))
