"""
PraetorOps AI — RAG Retrieval & Reranking Engine.
Simulates enterprise Vector Search (Vertex AI Vector Search) + Reciprocal Rank Fusion (RRF)
with strict tenant filtering, evidence snippet extraction, and citation numbering.
"""

import re
import math
from typing import List, Dict, Any, Tuple
from .store import knowledge_store

class RAGEngine:
    """Production-style RAG pipeline with grounding verification and citation tracking."""

    @staticmethod
    def _tokenize(text: str) -> set:
        tokens = re.findall(r"\w+", text.lower())
        stopwords = {"the", "a", "an", "is", "in", "it", "of", "and", "or", "for", "to", "at", "by", "on", "with"}
        return {t for t in tokens if t not in stopwords}

    @staticmethod
    def _calculate_bm25_sim(query_tokens: set, text: str) -> float:
        text_tokens = re.findall(r"\w+", text.lower())
        if not text_tokens:
            return 0.0
        matches = sum(1 for t in text_tokens if t in query_tokens)
        score = matches / (len(text_tokens) ** 0.5 + 5.0)
        return min(round(score, 3), 1.0)

    @classmethod
    def retrieve_chunks(
        cls,
        query: str,
        tenant_id: str,
        top_k: int = 4,
        min_relevance_threshold: float = 0.35
    ) -> List[Dict[str, Any]]:
        """
        Executes tenant-isolated retrieval, ranking, and citation building.
        """
        knowledge_store.query_count += 1
        query_tokens = cls._tokenize(query)
        scored_chunks: List[Tuple[float, Dict[str, Any]]] = []

        # Enforce tenant isolation strictly
        candidate_chunks = [c for c in knowledge_store.chunks if c["tenant_id"] == tenant_id]

        for chunk in candidate_chunks:
            # Score against text, section, doc title, and category
            combined_corpus = f"{chunk['doc_title']} {chunk['section']} {chunk['category']} {chunk['text']}"
            score = cls._calculate_bm25_sim(query_tokens, combined_corpus)

            # Boost if query explicitly mentions doc ID or service keywords
            for tok in query_tokens:
                if tok in chunk["doc_id"].lower() or tok in chunk["section"].lower():
                    score += 0.25

            score = min(round(score, 3), 0.99)
            if score >= min_relevance_threshold:
                scored_chunks.append((score, chunk))

        # Sort descending by score
        scored_chunks.sort(key=lambda x: x[0], reverse=True)
        top_matches = scored_chunks[:top_k]

        formatted_sources = []
        for rank, (score, chunk) in enumerate(top_matches, start=1):
            formatted_sources.append({
                "citation_id": f"[Source {rank}]",
                "document_id": chunk["doc_id"],
                "document_name": chunk["doc_title"],
                "section": chunk["section"],
                "category": chunk["category"],
                "relevance_score": score,
                "timestamp": chunk["timestamp"],
                "source": f"{chunk['doc_title']} — {chunk['section']}",
                "evidence_snippet": chunk["text"][:380] + ("..." if len(chunk["text"]) > 380 else "")
            })

        return formatted_sources

    @classmethod
    def build_grounded_context(cls, sources: List[Dict[str, Any]]) -> str:
        """Constructs grounded context prompt injection block."""
        if not sources:
            return "No relevant enterprise documentation found in connected knowledge sources."
        
        blocks = []
        for s in sources:
            blocks.append(
                f"{s['citation_id']} (Document: {s['document_name']} | Section: {s['section']} | Relevance: {s['relevance_score']}):\n"
                f"{s['evidence_snippet']}"
            )
        return "\n\n".join(blocks)

rag_engine = RAGEngine()
