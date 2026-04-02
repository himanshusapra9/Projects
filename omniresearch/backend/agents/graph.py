from __future__ import annotations

import asyncio
import operator
from typing import Annotated, Any, Optional, TypedDict

try:
    from langgraph.graph import END, StateGraph
except ImportError:  # pragma: no cover
    END = None  # type: ignore[assignment,misc]
    StateGraph = None  # type: ignore[assignment,misc]


class ResearchState(TypedDict):
    query: str
    depth: str
    sources: list[str]
    plan: dict[str, Any]
    raw_documents: Annotated[list[Any], operator.add]
    processed_documents: Annotated[list[Any], operator.add]
    retrieved_chunks: list[Any]
    synthesis: str
    exports: dict[str, Any]
    error: Optional[str]


def build_research_graph() -> Any:
    if StateGraph is None or END is None:
        return None
    graph = StateGraph(ResearchState)
    graph.add_node("query_planner", query_planner_node)
    graph.add_node("source_fetcher", source_fetcher_node)
    graph.add_node("content_processor", content_processor_node)
    graph.add_node("semantic_retriever", semantic_retriever_node)
    graph.add_node("synthesis_agent", synthesis_agent_node)
    graph.add_node("export_generator", export_generator_node)

    graph.set_entry_point("query_planner")
    graph.add_edge("query_planner", "source_fetcher")
    graph.add_edge("source_fetcher", "content_processor")
    graph.add_edge("content_processor", "semantic_retriever")
    graph.add_edge("semantic_retriever", "synthesis_agent")
    graph.add_edge("synthesis_agent", "export_generator")
    graph.add_edge("export_generator", END)
    return graph.compile()


def query_planner_node(state: ResearchState) -> dict[str, Any]:
    from agents.query_planner import plan_query

    plan = plan_query(state["query"], state.get("depth", "standard"))
    return {"plan": plan}


def source_fetcher_node(state: ResearchState) -> dict[str, Any]:
    from agents.source_fetcher import fetch_all_sources

    async def _run() -> list[dict[str, Any]]:
        return await fetch_all_sources(
            state["plan"], state.get("sources", []) or []
        )

    try:
        try:
            loop = asyncio.get_running_loop()
        except RuntimeError:
            docs = asyncio.run(_run())
        else:
            # Nested event loop (e.g. async test): run in a dedicated loop via thread
            import concurrent.futures

            with concurrent.futures.ThreadPoolExecutor(
                max_workers=1
            ) as executor:
                future = executor.submit(asyncio.run, _run())
                docs = future.result()
    except Exception as e:
        return {"raw_documents": [], "error": str(e)}
    return {"raw_documents": docs}


def content_processor_node(state: ResearchState) -> dict[str, Any]:
    from agents.content_processor import process_documents

    processed = process_documents(state["raw_documents"])
    return {"processed_documents": processed}


def semantic_retriever_node(state: ResearchState) -> dict[str, Any]:
    from agents.semantic_retriever import retrieve_relevant

    chunks = retrieve_relevant(state["query"], state["processed_documents"])
    return {"retrieved_chunks": chunks}


def synthesis_agent_node(state: ResearchState) -> dict[str, Any]:
    from agents.synthesis_agent import synthesize

    synthesis = synthesize(state["query"], state["retrieved_chunks"])
    return {"synthesis": synthesis}


def export_generator_node(state: ResearchState) -> dict[str, Any]:
    from agents.export_generator import generate_exports

    exports = generate_exports(
        state["synthesis"], state["query"], state["processed_documents"]
    )
    return {"exports": exports}
